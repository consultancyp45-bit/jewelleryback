const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
});

const uploadImageToCloudinary = async (file) => {
    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    return await cloudinary.uploader.upload(dataUri, {
        folder: 'jewellery_products',
        use_filename: true,
        unique_filename: true,
        resource_type: 'image',
    });
};

router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }

    if (!req.file) {
        return res.status(400).json({ message: 'Image file is required' });
    }

    try {
        const result = await uploadImageToCloudinary(req.file);
        res.json({ url: result.secure_url, public_id: result.public_id });
    } catch (err) {
        console.error('Cloudinary upload error:', err);
        res.status(500).json({ message: 'Image upload failed', error: err.message });
    }
});

module.exports = router;
