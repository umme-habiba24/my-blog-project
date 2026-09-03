"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(username)')
      .order('created_at', { ascending: false });
    
    setPosts(data || []);
    setLoading(false);
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      {/* NAVIGATION BAR */}
      <nav className="flex justify-between items-center mb-12 bg-white p-4 rounded-xl shadow-sm border">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">BlogPlatform</h1>
        <div className="flex gap-4">
          <Link href="/" className="hover:text-blue-600 font-medium">Home</Link>
          <Link href="/create" className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 text-sm font-medium">Write Post</Link>
        </div>
      </nav>

      {/* POSTS LIST */}
      {loading ? (
        <p className="text-center text-gray-500 mt-10">Loading extraordinary content...</p>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link href={`/blog/${post.id}`} key={post.id} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100">
              <h2 className="text-xl font-bold mb-3 text-gray-800 line-clamp-2">{post.title}</h2>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.content.replace(/<[^>]*>?/gm, '')}</p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="font-medium text-blue-600">{post.profiles?.username || 'Anonymous'}</span>
                <span>•</span>
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
      
      {!loading && posts.length === 0 && (
        <div className="text-center mt-20">
          <p className="text-4xl mb-4">📝</p>
          <p className="text-gray-500 text-lg">No posts yet. Be the first to write!</p>
        </div>
      )}
    </div>
  );
}