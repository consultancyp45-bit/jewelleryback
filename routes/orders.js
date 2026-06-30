const express = require('express');
const Order = require('../models/Order');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// Create order
router.post('/', authMiddleware, async (req, res) => {
    try {
        const order = new Order({
            ...req.body,
            user: req.user.id
        });
        const savedOrder = await order.save();
        res.status(201).json(savedOrder);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get user orders
router.get('/user/:id', authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.params.id }).populate('items.product');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get single order
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('items.product');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update order
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
