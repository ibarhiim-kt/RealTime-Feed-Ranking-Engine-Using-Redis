"use client"
import PostCard from './PostCard'

export default function SavedPosts({ user, savedPosts, setSavedPosts }) {
  
  if (!savedPosts || savedPosts.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
        <p className="text-gray-500">No saved posts yet.</p>
        <p className="text-sm text-gray-400 mt-2">
          Click the bookmark icon on posts to save them here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {savedPosts.map((savedPost, index) => {
        // Use a combination of post_id and index as fallback for key
        const uniqueKey = savedPost.post_id || `saved-post-${index}`;
        
        return (
          <PostCard
            key={uniqueKey}
            post={{
              id: savedPost.post_id,
              text: savedPost.text,
              images: savedPost.image,
              author: {
                name: savedPost.author_name,
                handle: savedPost.author_handle,
                avatar: savedPost.author_avatar
              },
              stats: {
                likes: savedPost.likes,
                replies: savedPost.replies,
                reposts: savedPost.reposts
              },
              createdAt: savedPost.post_created_at
            }}
            user={user}
            savedPosts={savedPosts}
            setSavedPosts={setSavedPosts}
          />
        );
      })}
    </div>
  )
}