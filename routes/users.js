const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        user = new User({ name, email, password });
        await user.save();

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        res.status(201).json({ token, user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const payload = req.body && typeof req.body === 'object' ? req.body : {};
        const email = payload.email ?? payload.username ?? payload.user?.email ?? payload.credentials?.email;
        const password = payload.password ?? payload.credentials?.password;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) return res.status(400).json({ message: 'User not found' });

        if (!user.password) {
            // If the stored user record has no password hash, bcrypt.compare will throw.
            return res.status(500).json({ message: 'Stored password hash missing for this user' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid password' });


        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        res.json({ token, user });
    } catch (err) {
        console.error('Login error:', {
            message: err?.message,
            stack: err?.stack,
            name: err?.name,
            // include request body (redact password)
            requestBody: {
                ...req?.body,
                password: req?.body?.password ? '***redacted***' : req?.body?.password,
            },
        });
        res.status(500).json({ message: err?.message || 'Server error' });
    }
});



// Get profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update profile
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
