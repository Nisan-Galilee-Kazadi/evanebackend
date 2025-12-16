const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String
    },
    date: {
        type: Date
    },
    image: {
        type: String
    },
    type: {
        type: String,
        enum: ['event', 'award', 'milestone', 'other'],
        default: 'other'
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
achievementSchema.index({ date: -1 });

module.exports = mongoose.model('Achievement', achievementSchema);
