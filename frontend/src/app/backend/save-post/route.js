import { NextResponse } from "next/server";
import { supabase } from "../../config/supabase"; 

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, postId, text, image, author, stats, createdAt } = body;

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Insert into saved_posts table
    const { error } = await supabase.from("saved_posts").insert([
      {
        user_id: userId,
        post_id: postId,
        text,
        image,
        author_name: author?.name || null,
        author_handle: author?.handle || null,
        author_avatar: author?.avatar || null,
        likes: stats?.likes || 0,
        replies: stats?.replies || 0,
        reposts: stats?.reposts || 0,
        post_created_at: createdAt || new Date(),
      },
    ]);

    if (error) {
      console.error("Error inserting saved post:", error);
      return NextResponse.json({ error: "Database insert failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Server error in save-post:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
