const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Event = require('../models/Event');
const authMiddleware = require('../middleware/auth');
const { generateToken } = require('../utils/tokenGenerator');
const { sendTokenEmail, sendOrderConfirmationEmail, sendAdminNotificationEmail } = require('../services/emailService');

// Payment instructions mapping
const paymentInstructions = {
    mpesa: {
        ussd: '*150#',
        steps: 'Option 1 → Option 3 → Entrez le montant → Confirmez',
        recipient: 'Evan Lesnar'
    },
    orange: {
        ussd: '*144#',
        steps: 'Option 1 → Option 2 → Entrez le montant → Confirmez',
        recipient: 'Evan Lesnar'
    },
    airtel: {
        ussd: '*501#',
        steps: 'Option 1 → Option 4 → Entrez le montant → Confirmez',
        recipient: 'Evan Lesnar'
    },
    africell: {
        ussd: '*555#',
        steps: 'Option 1 → Option 3 → Entrez le montant → Confirmez',
        recipient: 'Evan Lesnar'
    }
};

// @route   GET /api/orders
// @desc    Get all orders (admin)
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { status, eventId } = req.query;
        let query = {};

        if (status) query.paymentStatus = status;
        if (eventId) query.event = eventId;

        const orders = await Order.find(query)
            .populate('event', 'title date venue city')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('event');

        if (!order) {
            return res.status(404).json({ message: 'Commande non trouvée' });
        }

        res.json(order);
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// @route   POST /api/orders
// @desc    Create order (public)
// @access  Public
router.post('/', async (req, res) => {
    try {
        const { eventId, customerName, customerEmail, customerPhone, tickets, totalAmount, paymentMethod } = req.body;

        // Verify event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Événement non trouvé' });
        }

        // Create order
        const order = new Order({
            event: eventId,
            customerName,
            customerEmail,
            customerPhone,
            tickets,
            totalAmount,
            paymentMethod,
            paymentStatus: 'pending'
        });

        await order.save();

        // Get payment instructions
        const instructions = paymentInstructions[paymentMethod];
        const instructionsText = `
            <strong>1.</strong> Composez ${instructions.ussd}<br>
            <strong>2.</strong> ${instructions.steps}<br>
            <strong>3.</strong> Bénéficiaire : <strong>${instructions.recipient}</strong><br>
            <strong>4.</strong> Montant : <strong>${totalAmount} CDF</strong>
        `;

        const baseOrderDetails = {
            customerName,
            customerEmail,
            orderId: order._id.toString(),
            eventTitle: event.title,
            eventDate: new Date(event.date).toLocaleDateString('fr-FR'),
            eventVenue: `${event.venue}, ${event.city}`,
            totalAmount,
            currency: 'CDF'
        };

        // Send confirmation email if email provided
        if (customerEmail) {
            await sendOrderConfirmationEmail(customerEmail, baseOrderDetails, instructionsText);
        }

        // Notify admin (best-effort). Do not block order creation if email fails.
        try {
            await sendAdminNotificationEmail(baseOrderDetails);
        } catch (emailError) {
            console.error('Admin notification email error:', emailError);
        }

        res.status(201).json({
            order,
            paymentInstructions: instructions
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// @route   PUT /api/orders/:id/validate
// @desc    Validate payment and send token (admin)
// @access  Private
router.put('/:id/validate', authMiddleware, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('event');

        if (!order) {
            return res.status(404).json({ message: 'Commande non trouvée' });
        }

        if (order.paymentStatus === 'validated') {
            return res.status(400).json({ message: 'Commande déjà validée' });
        }

        // Generate token
        const token = generateToken();

        // Update order
        order.paymentStatus = 'validated';
        order.token = token;
        order.validatedAt = new Date();
        await order.save();

        // Send token email
        if (order.customerEmail) {
            const orderDetails = {
                customerName: order.customerName,
                eventTitle: order.event.title,
                eventDate: new Date(order.event.date).toLocaleDateString('fr-FR'),
                eventVenue: `${order.event.venue}, ${order.event.city}`,
                totalAmount: order.totalAmount
            };

            await sendTokenEmail(order.customerEmail, token, orderDetails);
        }

        res.json({
            message: 'Paiement validé et token envoyé',
            order
        });
    } catch (error) {
        console.error('Validate order error:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel/revoke order access (admin)
// @access  Private
router.put('/:id/cancel', authMiddleware, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Commande non trouvée' });
        }

        order.paymentStatus = 'cancelled';
        order.token = undefined;
        order.tokenUsed = false;
        order.tokenUsedAt = undefined;
        order.validatedAt = undefined;

        await order.save();

        res.json({
            message: 'Commande annulée',
            order
        });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// @route   POST /api/orders/verify-token
// @desc    Verify token and get ticket (public)
// @access  Public
router.post('/verify-token', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: 'Token requis' });
        }

        const order = await Order.findOne({ token }).populate('event');

        if (!order) {
            return res.status(404).json({ message: 'Token invalide' });
        }

        if (order.paymentStatus !== 'validated') {
            return res.status(400).json({ message: 'Paiement non validé' });
        }

        if (order.tokenUsed) {
            return res.status(400).json({ message: 'Token déjà utilisé' });
        }

        // Mark token as used
        order.tokenUsed = true;
        order.tokenUsedAt = new Date();
        await order.save();

        res.json({
            message: 'Token valide',
            order
        });
    } catch (error) {
        console.error('Verify token error:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router;
