const express = require('express');
const mongoose = require('mongoose');
const PageContent = require('../models/PageContent');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const router = express.Router();

const FALLBACK_CONTENT = {
    'home': {
        page: 'home',
        title: 'Timeless Jewellery, Thoughtfully Crafted',
        subtitle: 'Signature Collections',
        description: 'Discover handcrafted pieces designed to celebrate every moment with elegance and meaning.',
        heroImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1400&q=80',
        media: [],
    },
    'about-us': {
        page: 'about-us',
        title: 'About Our Studio',
        subtitle: 'Craftsmanship & Care',
        description: 'We blend traditional artistry with contemporary design to create meaningful jewellery.',
        heroImage: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1400&q=80',
        media: [],
    },
    'contact-us': {
        page: 'contact-us',
        title: 'Let Us Help You',
        subtitle: 'Visit or Reach Out',
        description: 'Speak with our team for bespoke consultations, gifting guidance, or order support.',
        heroImage: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1400&q=80',
        media: [],
    },
    'services': {
        page: 'services',
        title: 'Personalised Jewellery Services',
        subtitle: 'Your Story, Set in Metal',
        description: 'From design consultations to custom engraving, we make every detail feel personal.',
        heroImage: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1400&q=80',
        media: [],
    },
    'products': {
        page: 'products',
        title: 'Explore the Collection',
        subtitle: 'Curated For Every Style',
        description: 'Browse statement pieces, delicate staples, and modern heirlooms in one place.',
        heroImage: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1400&q=80',
        media: [],
    },
    'product-detail': {
        page: 'product-detail',
        title: 'Featured Piece',
        subtitle: 'Details That Matter',
        description: 'Explore the craftsmanship, materials, and story behind the piece you love.',
        heroImage: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1400&q=80',
        media: [],
    },
    'cart': {
        page: 'cart',
        title: 'Your Bag',
        subtitle: 'Ready to Checkout',
        description: 'Review your selections and continue to secure checkout when you are ready.',
        heroImage: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1400&q=80',
        media: [],
    },
    'wishlist': {
        page: 'wishlist',
        title: 'Your Wishlist',
        subtitle: 'Saved For Later',
        description: 'Keep the pieces you love close until the moment feels right.',
        heroImage: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1400&q=80',
        media: [],
    },
    'profile': {
        page: 'profile',
        title: 'Your Account',
        subtitle: 'Manage Your Details',
        description: 'View your orders, update personal information, and keep your account current.',
        heroImage: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1400&q=80',
        media: [],
    },
};

const isDatabaseReady = () => mongoose.connection.readyState === 1;

const normalizePage = (page = '') => page.toString().trim().toLowerCase();

const getDefaultContent = (page) => {
    const normalized = normalizePage(page);
    return FALLBACK_CONTENT[normalized] || {
        page: normalized,
        title: 'Jewellery Store',
        subtitle: 'Discover Our Collection',
        description: 'A curated experience for timeless pieces and meaningful gifting.',
        heroImage: '',
        media: [],
    };
};

router.get('/', async (req, res) => {
    try {
        if (!isDatabaseReady()) {
            return res.json([]);
        }

        const content = await PageContent.find().sort({ createdAt: -1 });
        return res.json(content);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

router.get('/:page', async (req, res) => {
    try {
        const page = normalizePage(req.params.page);

        if (!isDatabaseReady()) {
            return res.json(getDefaultContent(page));
        }

        const content = await PageContent.findOne({ page });
        if (!content) {
            return res.json(getDefaultContent(page));
        }

        return res.json(content);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const payload = {
            ...req.body,
            page: normalizePage(req.body.page),
        };

        const existing = await PageContent.findOne({ page: payload.page });
        if (existing) {
            const updated = await PageContent.findByIdAndUpdate(existing._id, payload, { new: true });
            return res.json(updated);
        }

        const created = await PageContent.create(payload);
        return res.status(201).json(created);
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
});

router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const payload = {
            ...req.body,
            page: req.body.page ? normalizePage(req.body.page) : undefined,
        };

        const updated = await PageContent.findByIdAndUpdate(req.params.id, payload, { new: true });
        if (!updated) {
            return res.status(404).json({ message: 'Page content not found' });
        }

        return res.json(updated);
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
});

router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const deleted = await PageContent.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Page content not found' });
        }

        return res.json({ message: 'Page content deleted' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

module.exports = router;
