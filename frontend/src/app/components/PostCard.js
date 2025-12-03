"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Repeat, Bookmark } from "lucide-react";

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60) return `${Math.round(diff)}s`;
  if (diff < 3600) return `${Math.round(diff / 60)}m`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h`;
  return `${Math.round(diff / 86400)}d`;
}

export default function PostCard({ post, user, savedPosts, setSavedPosts }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // FIXED: Check if post is saved by looking at post_id in the savedPosts array
  const isSaved = savedPosts?.some(saved => saved.post_id === post.id);

  const toggleSave = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    setLoading(true);

    try {
      if (!isSaved) {
        // Save post
        const response = await fetch("/backend/save-post", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            postId: post.id,
            text: post.text,
            image: post.images,
            author: {
              name: post.author.name,
              handle: post.author.handle,
              avatar: post.author.avatar,
            },
            stats: post.stats,
            createdAt: post.createdAt,
          }),
        });

        if (response.ok) {
          // FIXED: Add the complete saved post object
          const newSavedPost = {
            post_id: post.id,
            text: post.text,
            image: post.images,
            author_name: post.author.name,
            author_handle: post.author.handle,
            author_avatar: post.author.avatar,
            likes: post.stats.likes,
            replies: post.stats.replies,
            reposts: post.stats.reposts,
            post_created_at: post.createdAt,
          };
          setSavedPosts(prev => [...prev, newSavedPost]);
        }
      } else {
        // Unsave post
        const response = await fetch("/backend/delete-saved-post", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ userId: user.id, postId: post.id }),
});


        if (response.ok) {
          // FIXED: Filter by post_id correctly
          setSavedPosts(prev => prev.filter(saved => saved.post_id !== post.id));
        }
      }
    } catch (err) {
      console.error("Error toggling save:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex gap-4">
        <img 
          src={post.author.avatar} 
          alt={post.author.name}
          className="w-12 h-12 rounded-full" 
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-900">{post.author.name}</div>
              <div className="text-xs text-gray-500">
                @{post.author.handle} · {timeAgo(post.createdAt)}
              </div>
            </div>
          </div>

          {post.text && (
            <p className="mt-3 text-gray-800 text-[15px] leading-relaxed">{post.text}</p>
          )}

          {post.images && (
            <img
              src={post.images}
              alt="Post content"
              className="mt-3 rounded-xl border border-gray-200 max-h-[400px] w-full object-cover"
            />
          )}

          {/* Action Buttons */}
          <div className="mt-4 flex items-center justify-between text-gray-500">
            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-1">
                <Heart size={18} /> {post.stats.likes}
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle size={18} /> {post.stats.replies}
              </div>
              <div className="flex items-center gap-1">
                <Repeat size={18} /> {post.stats.reposts}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={toggleSave}
                disabled={loading}
                className={`transition-colors ${
                  isSaved ? "text-yellow-600" : "hover:text-gray-600"
                } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                title={isSaved ? "Unsave Post" : "Save Post"}
              >
                <Bookmark size={20} fill={isSaved ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}