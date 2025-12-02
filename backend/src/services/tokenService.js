import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { supabase } from '../config/supabase.js';


// Generate magic link token and store in DB
export const generateMagicLinkToken = async (userId) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 min
const id = uuidv4()

  const { data, error } = await supabase
    .from('verification_tokens')
    .insert([{
      id,
      user_id: userId,
      token,
      type: 'magic_link',
      expires_at: expiresAt,
      used: false
    }]);

  if (error) {
    console.error('Error inserting magic link token:', error);
    throw error;
  }

  return token;
};

// Generate access token (short-lived)
export const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

// Generate refresh token and store in DB
export const generateRefreshToken = async (userId, ip = null, userAgent = null) => {
  const token = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  const { data, error } = await supabase.from('sessions').insert([{
    id: uuidv4(),
    user_id: userId,
    refresh_token: token,
    ip,
    user_agent: userAgent,
    created_at: new Date(),
    expires_at: expiresAt
  }]);
  
  if (error) {
    console.error('Failed to insert session:', error);
    throw new Error('Could not create refresh token');
  }
  return token;
};

export const generateEmailVerificationToken = async (userId) => {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // valid for 24 hrs

  const { error } = await supabase.from("verification_tokens").insert([
    {
      id: crypto.randomUUID(),
      user_id: userId,
      token,
      type: "email_verification",
      expires_at: expiresAt,
      used: false,
    },
  ]);

  if (error) {
    console.error("Could not create verification token:", error);
    throw new Error("Could not create verification token");
  }

  return token;
};
