import { supabase } from "../../config/supabase";
export async function POST(req) {
  const data = await req.json();
  const { userId, postId } = data;

  const { error } = await supabase
    .from("saved_posts")
    .delete()
    .eq("user_id", userId)
    .eq("post_id", postId);

  if (error) {
    return new Response(JSON.stringify({ success: false, error }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true, message: "Removed" }), { status: 200 });
}
