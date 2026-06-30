const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// Add to cart
router.post('/add', authMiddleware, (req, res) => {
    try {
        res.json({ message: 'Item added to cart' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get cart
router.get('/', authMiddleware, (req, res) => {
    try {
        res.json({ items: [] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Remove from cart
router.delete('/:id', authMiddleware, (req, res) => {
    try {
        res.json({ message: 'Item removed from cart' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
