const express = require('express');
const ContactMessage = require('../models/ContactMessage');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body || {};

        // Basic server-side validation
        if (!name || typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 100) {
            return res.status(400).json({ message: 'Name required (1-100 chars).' });
        }

        if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            return res.status(400).json({ message: 'Valid email required.' });
        }

        const allowedSubjects = ['Bridal Consultation', 'Custom Commission', 'General Enquiry'];
        if (!subject || typeof subject !== 'string' || !allowedSubjects.includes(subject)) {
            return res.status(400).json({ message: 'Invalid subject.' });
        }

        if (
            !message ||
            typeof message !== 'string' ||
            message.trim().length < 10 ||
            message.trim().length > 1000
        ) {
            return res.status(400).json({ message: 'Message must be at least 10 characters (max 1000).' });
        }

        const saved = await ContactMessage.create({
            name: name.trim(),
            email: email.trim(),
            subject,
            message: message.trim(),
        });

        return res.status(201).json({ ok: true, id: saved._id });
    } catch (err) {
        return res.status(500).json({ message: err.message || 'Server Error' });
    }
});

module.exports = router;

