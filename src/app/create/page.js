"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function CreatePost() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useState(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getUser();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title || !content) return alert("Fill all fields!");

    setLoading(true);
    const { error } = await supabase.from('posts').insert([
      { title, content, user_id: user.id }
    ]);
    
    if (error) alert(error.message);
    else router.push('/');
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center pt-20">
        <h1 className="text-3xl font-bold mb-4">Authentication Required</h1>
        <p className="text-gray-600 mb-6">You must be logged in to create posts.</p>
        <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/create' } })} className="bg-black text-white px-6 py-3 rounded-lg">
          Sign In with Google
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <button onClick={() => router.push('/')} className="mb-6 text-blue-600 hover:underline">← Cancel</button>
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100">
        <h1 className="text-4xl font-bold mb-8">✏️ Write New Post</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-3xl font-bold p-4 border-b-2 border-transparent focus:border-black outline-none placeholder:text-gray-300"
          />
          <textarea
            placeholder="Start writing your story..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="w-full p-4 text-lg text-gray-700 leading-relaxed focus:outline-none placeholder:text-gray-300"
          ></textarea>
          
          <div className="flex justify-between items-center pt-6 border-t">
            <span className="text-sm text-gray-400">Draft saved locally</span>
            <button 
              type="submit" 
              disabled={loading || !title || !content}
              className={`px-8 py-3 rounded-xl font-bold text-white ${loading || !title || !content ? 'bg-gray-300 cursor-not-allowed' : 'bg-black hover:bg-gray-800'} transition-all`}
            >
              {loading ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}