const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const router = express.Router();

// Dashboard stats
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalRevenue = await Order.aggregate([
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);

        res.json({
            totalProducts,
            totalOrders,
            totalUsers,
            totalRevenue: totalRevenue[0]?.total || 0
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all orders (admin)
router.get('/orders', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const orders = await Order.find().populate('user').populate('items.product');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all users (admin)
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
