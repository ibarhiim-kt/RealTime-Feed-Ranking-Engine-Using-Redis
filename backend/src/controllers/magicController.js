import { supabase } from '../config/supabase.js';
import { generateMagicLinkToken } from '../services/tokenService.js';
import { sendMagicLink } from '../services/emailService.js';
import { generateAccessToken, generateRefreshToken } from '../services/tokenService.js';

export const requestMagicLink = async (req, res) => {
    try {
        const { email } = req.body;

        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (!user) return res.status(400).json({ error: 'User not found' });

        const token = await generateMagicLinkToken(user.id);

        const link = `http://localhost:3000/auth/magic/login?token=${token}`;
        await sendMagicLink(email, link);

        res.json({ message: 'Magic link sent' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const loginWithMagicLink = async (req, res) => {
    try {
        const { token } = req.query;
        console.log("Received magic link token:", token);

        if (!token) {
            console.log("No token provided in query");
            return res.status(400).json({ error: "Token missing" });
        }

        const { data: tokenRow, error } = await supabase
            .from('verification_tokens')
            .select('*')
            .eq('token', token)
            .eq('type', 'magic_link')
            .single();

        if (error) {
            console.log("Supabase error:", error);
            return res.status(500).json({ error: "Database error" });
        }

        if (!tokenRow) {
            console.log("No token found in DB");
            return res.status(400).json({ error: "Token not found" });
        }

        if (tokenRow.used) {
            console.log("Token already used:", tokenRow);
            return res.status(400).json({ error: "Token already used" });
        }

        const now = Date.now();
        if (tokenRow.expires_at < now) {
            return res.status(400).json({ error: "Token expired" });
        }


        // Mark token as used
        await supabase.from('verification_tokens').update({ used: true }).eq('id', tokenRow.id);

        // Create session
        const accessToken = generateAccessToken(tokenRow.user_id);
        const refreshToken = await generateRefreshToken(tokenRow.user_id);

        res.cookie('access_token', accessToken, { httpOnly: true, sameSite: 'strict' });
        res.cookie('refresh_token', refreshToken, { httpOnly: true, sameSite: 'strict' });

        console.log("Magic login successful for user_id:", tokenRow.user_id);
        res.status(200).json({ message: "Logged in successfully" });

    } catch (err) {
        console.error("Unexpected error in magic login:", err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
