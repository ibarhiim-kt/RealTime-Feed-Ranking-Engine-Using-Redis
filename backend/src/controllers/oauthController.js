import { OAuth2Client } from "google-auth-library";
import { supabase } from "../config/supabase.js";
import { generateAccessToken, generateRefreshToken } from "../services/tokenService.js";

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export const googleLogin = (req, res) => {
  const url = client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["profile", "email"],
  });

  res.redirect(url);
};

export const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    // Get tokens from Google
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    // Get Google user info
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;

    // 1️⃣ Check if account exists in accounts table
    let { data: account } = await supabase
      .from("accounts")
      .select("*")
      .eq("provider", "google")
      .eq("provider_account_id", googleId)
      .single();

    let userId;

    if (account) {
      // Already linked
      userId = account.user_id;
    } else {
      // Check if user exists by email
      let { data: user } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (!user) {
        // Create new user
        const { data: newUser,error: insertError } = await supabase
          .from("users")
          .insert([{ email }])
          .select()
          .single();
        if (insertError || !newUser) {
    console.error("Error creating user:", insertError);
    return res.status(500).send("Failed to create user");
  }
        user = newUser;
      }

      userId = user.id;

      // Link Google → user
      await supabase.from("accounts").insert([
        {
          user_id: userId,
          provider: "google",
          provider_account_id: googleId,
          email,
        },
      ]);
    }

    // 3️⃣ Create session
    const accessToken = generateAccessToken(userId);
    const refreshToken = await generateRefreshToken(userId);

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      sameSite: "strict",
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
    });

    // Redirect back to frontend
    res.redirect(`${process.env.FRONTEND_URL}/`);
  } catch (error) {
    console.error(error);
    res.status(500).send("OAuth login failed");
  }
};
