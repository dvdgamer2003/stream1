const express = require('express');
const { supabase } = require('../config/supabase');
const router = express.Router();

// Signup route
router.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${process.env.NODE_ENV === 'production' 
                    ? process.env.PRODUCTION_URL 
                    : 'http://localhost:3000'}/auth/callback`
            }
        });

        if (error) throw error;

        return res.status(201).json({
            message: process.env.NODE_ENV === 'development' 
                ? 'Signup successful' 
                : 'Please check your email to confirm your account',
            user: data.user
        });

    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({ error: error.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        return res.status(200).json({
            message: 'Login successful',
            session: data.session,
            user: data.user
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(401).json({ error: error.message });
    }
});

// Logout route
router.post('/logout', async (req, res) => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        return res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({ error: error.message });
    }
});

// Get current user
router.get('/me', async (req, res) => {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (!session) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        return res.status(200).json({
            user: session.user
        });

    } catch (error) {
        console.error('Get user error:', error);
        return res.status(500).json({ error: error.message });
    }
});

// Password reset request
router.post('/reset-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.NODE_ENV === 'production' 
                ? process.env.PRODUCTION_URL 
                : 'http://localhost:3000'}/auth/reset-password`
        });

        if (error) throw error;

        return res.status(200).json({
            message: 'Password reset instructions sent to email'
        });

    } catch (error) {
        console.error('Password reset error:', error);
        return res.status(500).json({ error: error.message });
    }
});

// Update password
router.post('/update-password', async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ error: 'New password is required' });
        }

        const { error } = await supabase.auth.updateUser({
            password
        });

        if (error) throw error;

        return res.status(200).json({
            message: 'Password updated successfully'
        });

    } catch (error) {
        console.error('Update password error:', error);
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;
