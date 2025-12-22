const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['image', 'video']
    },
    destination: {
        type: String,
        required: true,
        enum: ['home', 'gallery'],
        default: 'gallery'
    },
    url: {
        type: String,
        required: true,
        trim: true
    },
    thumbnail: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        enum: ['performance', 'backstage', 'events', 'video', 'other'],
        default: 'other'
    },
    sourceEvent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

mediaSchema.index({ createdAt: -1 });
mediaSchema.index({ destination: 1, type: 1, category: 1, createdAt: -1 });

module.exports = mongoose.model('Media', mediaSchema);
