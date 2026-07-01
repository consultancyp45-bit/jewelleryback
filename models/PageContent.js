const mongoose = require('mongoose');

const PageContentSchema = new mongoose.Schema({
    page: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    title: {
        type: String,
        default: '',
    },
    subtitle: {
        type: String,
        default: '',
    },
    description: {
        type: String,
        default: '',
    },
    heroImage: {
        type: String,
        default: '',
    },
    heroVideo: {
        type: String,
        default: '',
    },
    media: {
        type: [
            {
                type: { type: String, default: 'image' },
                url: { type: String, required: true },
                caption: { type: String, default: '' },
            }
        ],
        default: [],
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('PageContent', PageContentSchema);
