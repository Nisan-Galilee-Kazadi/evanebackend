const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    customerName: {
        type: String,
        required: true,
        trim: true
    },
    customerEmail: {
        type: String,
        trim: true,
        lowercase: true
    },
    customerPhone: {
        type: String,
        required: true,
        trim: true
    },
    tickets: [{
        type: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['mpesa', 'orange', 'airtel', 'africell']
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'validated', 'cancelled'],
        default: 'pending'
    },
    token: {
        type: String,
        unique: true,
        sparse: true
    },
    tokenUsed: {
        type: Boolean,
        default: false
    },
    tokenUsedAt: {
        type: Date
    },
    validatedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient queries
orderSchema.index({ token: 1 });
orderSchema.index({ paymentStatus: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
