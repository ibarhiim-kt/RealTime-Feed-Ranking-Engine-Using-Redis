import { supabase } from "../config/supabase.js";
import { v4 as uuidv4 } from "uuid";
import argon2 from "argon2";
import { sendMagicLink } from "../services/emailService.js"; // reuse email service

// 1️⃣ Request password reset
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (!user) return res.status(400).json({ error: "User not found" });

    // Generate token
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minutes

    await supabase.from("verification_tokens").insert([
      {
        user_id: user.id,
        token,
        type: "password_reset",
        expires_at: expiresAt,
        used: false,
      },
    ]);

    const link = `${process.env.FRONTEND_URL}/auth/password/reset?token=${token}`;
    await sendMagicLink(email, link); // reuse email service

    res.json({ message: "Password reset email sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 2️⃣ Reset password
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const { data: tokenRow, error } = await supabase
      .from("verification_tokens")
      .select("*")
      .eq("token", token)
      .eq("type", "password_reset")
      .single();

    if (error) {
      console.log("Supabase error:", error);
      return res.status(500).json({ error: "Database error" });
    }
    if (!tokenRow) {
  console.log("-> No token found in DB for:", token);
  return res.status(400).json({ error: "Invalid token" });
}

if (tokenRow.used) {
  console.log("-> Token has already been used");
  return res.status(400).json({ error: "Token already used" });
}

const expiresAt = new Date(tokenRow.expires_at + 'Z'); // force UTC
const now = new Date();

console.log("Token expires at (UTC):", expiresAt);
console.log("Current time      (UTC):", now);

if (expiresAt < now) {
  console.log("-> Token has expired");
  return res.status(400).json({ error: "Token expired" });
}

// ✅ Token is valid, continue with password reset
console.log("-> Token is valid, proceeding with reset");


    // Hash new password
    const password_hash = await argon2.hash(password);

    // Update user password
    await supabase
      .from("users")
      .update({ password_hash })
      .eq("id", tokenRow.user_id);

    // Mark token as used
    await supabase.from("verification_tokens").update({ used: true }).eq("id", tokenRow.id);

    // Optional: invalidate all existing sessions
    await supabase.from("sessions").delete().eq("user_id", tokenRow.user_id);

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
