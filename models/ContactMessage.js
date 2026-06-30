const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 100 },
        email: { type: String, required: true, trim: true, maxlength: 255, lowercase: true },
        subject: {
            type: String,
            required: true,
            enum: ['Bridal Consultation', 'Custom Commission', 'General Enquiry'],
        },
        message: { type: String, required: true, trim: true, minlength: 10, maxlength: 1000 },
    },
    { timestamps: true }
);

module.exports = mongoose.model('ContactMessage', contactMessageSchema);

