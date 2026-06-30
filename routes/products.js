const express = require('express');
const Product = require('../models/Product');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().populate('category');
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category');
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create product (admin only)
router.post('/', authMiddleware, (req, res, next) => {
    if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    return next();
}, async (req, res) => {
    const product = new Product(req.body);
    try {
        const savedProduct = await product.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update product (admin only)
router.put('/:id', authMiddleware, (req, res, next) => {
    if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    return next();
}, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(product);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete product (admin only)
router.delete('/:id', authMiddleware, (req, res, next) => {
    if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    return next();
}, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
