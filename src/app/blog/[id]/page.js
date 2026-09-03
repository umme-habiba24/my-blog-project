"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function BlogDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();
    fetchData();
    
    // Real-time subscription for comments
    const channel = supabase.channel(`comments:${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => fetchData())
      .subscribe();

    return () => { supabase.removeChannel(channel) };
  }, [id]);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  }

  async function fetchData() {
    const [postData, commentData] = await Promise.all([
      supabase.from('posts').select('*, profiles(username)').eq('id', id).single(),
      supabase.from('comments').select('*, profiles(username)').eq('post_id', id).order('created_at', { ascending: true })
    ]);
    setPost(postData.data);
    setComments(commentData.data || []);
  }

  async function handleComment(e) {
    e.preventDefault();
    if (!user) {
      alert("Please login first!");
      return;
    }
    if (!newComment.trim()) return;

    await supabase.from('comments').insert([{
      post_id: id,
      user_id: user.id,
      content: newComment,
      username: user.user_metadata?.username || 'Anonymous'
    }]);
    setNewComment("");
  }

  if (!post) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div></div>;

  return (
    <div className="max-w-3xl mx-auto p-8 animate-fade-in">
      <Link href="/" className="inline-block mb-6 text-blue-600 hover:underline">← Back to Home</Link>
      
      <article className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">{post.title}</h1>
        <div className="flex items-center gap-3 mb-8 pb-8 border-b border-gray-100">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
            {(post.profiles?.username || 'A')[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{post.profiles?.username || 'Anonymous'}</p>
            <p className="text-xs text-gray-400">{new Date(post.created_at).toDateString()}</p>
          </div>
        </div>
        
        <div 
          className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-8"
          dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }}
        />
      </article>

      {/* COMMENTS SECTION */}
      <section className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          💬 Discussion ({comments.length})
        </h3>
        
        <form onSubmit={handleComment} className="mb-8 relative">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={user ? "Share your thoughts..." : "Login to join discussion..."}
            disabled={!user}
            rows={3}
            className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:outline-none resize-none transition-colors disabled:opacity-50"
          ></textarea>
          <button 
            type="submit" 
            disabled={!user || !newComment.trim()}
            className={`mt-2 px-6 py-2 rounded-xl font-medium transition-all ${user && newComment.trim() ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            Post Comment
          </button>
        </form>

        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No comments yet. Start the conversation!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-4 group hover:bg-gray-50 p-4 rounded-xl transition-colors">
                <div className="w-9 h-9 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center text-gray-500 font-bold text-sm">
                  {(comment.profiles?.username || comment.username || 'U')[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-gray-800">{comment.profiles?.username || comment.username || 'Anonymous'}</span>
                    <span className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-gray-600">{comment.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}