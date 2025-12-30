const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const authMiddleware = require('../middleware/auth');

// @route   GET /api/events
// @desc    Get all events (with optional filter)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { status, upcoming } = req.query;
        let query = {};

        if (status) {
            query.status = status;
        }

        if (upcoming === 'true') {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            query.date = { $gte: startOfDay };
            query.status = { $ne: 'past' };
        }

        const events = await Event.find(query).sort({ date: 1 });
        res.json(events);
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// @route   GET /api/events/:id
// @desc    Get single event
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Événement non trouvé' });
        }

        res.json(event);
    } catch (error) {
        console.error('Get event error:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// @route   POST /api/events
// @desc    Create event
// @access  Private (Admin)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const event = new Event(req.body);
        await event.save();
        res.status(201).json(event);
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Private (Admin)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!event) {
            return res.status(404).json({ message: 'Événement non trouvé' });
        }

        res.json(event);
    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Private (Admin)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Événement non trouvé' });
        }

        res.json({ message: 'Événement supprimé' });
    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router;
