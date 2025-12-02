import { supabase } from '../config/supabase.js';
import jwt from "jsonwebtoken";
import argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { generateEmailVerificationToken } from '../services/tokenService.js';
import { sendVerificationEmail } from '../services/emailService.js';
import { generateAccessToken, generateRefreshToken } from '../services/tokenService.js';
// Signup
export const signup = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (existingUser) return res.status(400).json({ error: 'User already exists' });

        // Hash password
        const password_hash = await argon2.hash(password);

        // Insert user
        const { data: newUser, error } = await supabase
            .from('users')
            .insert([{ id: uuidv4(), email, password_hash }])
            .select()
            .single();

        if (error) throw error;

        const token = await generateEmailVerificationToken(newUser.id);

        await sendVerificationEmail(email, token);

        res.status(201).json({ message: 'User created', user: { id: newUser.id, email: newUser.email } });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
export const verifyEmail = async (req, res) => {
    const { token } = req.query;

    if (!token) return res.status(400).json({ error: "Token missing" });

    // find token in DB
    const { data: storedToken, error } = await supabase
        .from("verification_tokens")
        .select("*")
        .eq("token", token)
        .eq("type", "email_verification")
        .single();

    if (error || !storedToken) {
        return res.status(400).json({ error: "Invalid token" });
    }

    if (storedToken.used) {
        return res.status(400).json({ error: "Token already used" });
    }

    if (new Date(storedToken.expires_at) < new Date()) {
        return res.status(400).json({ error: "Token expired" });
    }

    // mark user as verified
    await supabase
        .from("users")
        .update({ is_verified: true })
        .eq("id", storedToken.user_id);

    // mark token as used
    await supabase
        .from("verification_tokens")
        .update({ used: true })
        .eq("id", storedToken.id);

    return res.json({ message: "Email verified successfully" });
};


// Login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) return res.status(400).json({ error: 'Invalid credentials' });

        // Verify password
        const validPassword = await argon2.verify(user.password_hash, password);
        if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

        if (!user.is_verified) {
            return res.status(403).json({
                error: "Please verify your email first. Check your inbox."
            });
        }

        //  Create session 
        const accessToken = generateAccessToken(user.id);
        const refreshToken = await generateRefreshToken(user.id, req.ip, req.headers['user-agent']);

        // Set HTTP-only cookies
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(200).json({ message: 'Login successful', user: { id: user.id, email: user.email } });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: err.message });
    }
};
export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies['refresh_token'];
        if (refreshToken) {
            // Delete the session from DB
            await supabase
                .from('sessions')
                .delete()
                .eq('refresh_token', refreshToken);
        }

        // Clear cookies
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
export const getProfile = async (req, res) => {
    try {
        // Read access token from Authorization header
        const token = req.cookies['access_token'];
        if (!token) return res.status(401).json({ error: 'Unauthorized' });
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const { data: user, error } = await supabase
            .from('users')
            .select('id,email,created_at')
            .eq('id', decoded.userId)
            .single();

        if (error || !user) return res.status(401).json({ error: 'Unauthorized' });

        res.status(200).json({ user });
    } catch (err) {
        console.error(err);
        res.status(401).json({ error: 'Unauthorized' });
    }
};
