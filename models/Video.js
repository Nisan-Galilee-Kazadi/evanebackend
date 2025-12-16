const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String
    },
    youtubeId: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String
    },
    views: {
        type: String,
        default: '0 vues'
    },
    category: {
        type: String,
        enum: ['performance', 'backstage', 'video', 'events', 'other'],
        default: 'video'
    },
    sourceEvent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    },
    isManual: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient queries
videoSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Video', videoSchema);
