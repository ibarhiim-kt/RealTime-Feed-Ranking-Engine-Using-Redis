import { supabase } from '../config/supabase.js';
import { generateAccessToken, generateRefreshToken } from '../services/tokenService.js';

export const refreshSession = async (req, res) => {
  try {
    const oldToken = req.cookies['refresh_token'];
    if (!oldToken) return res.status(401).json({ error: 'No refresh token' });

    const { data: session } = await supabase
      .from('sessions')
      .select('*')
      .eq('refresh_token', oldToken)
      .single();

    if (!session) return res.status(401).json({ error: 'Invalid refresh token' });

    // Rotate refresh token
    const newRefreshToken = await generateRefreshToken(session.user_id, req.ip, req.headers['user-agent']);

    // Delete old token
    await supabase.from('sessions').delete().eq('id', session.id);

    const accessToken = generateAccessToken(session.user_id);

    res.cookie('access_token', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 15 * 60 * 1000 });
    res.cookie('refresh_token', newRefreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.json({ message: 'Session refreshed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
