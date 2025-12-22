const express = require('express');
const router = express.Router();
const Media = require('../models/Media');
const authMiddleware = require('../middleware/auth');

// @route   GET /api/media
// @desc    Get all media
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { type, category, destination } = req.query;
        const query = {};

        if (type) query.type = type;
        if (category) query.category = category;
        if (destination) query.destination = destination;

        const media = await Media.find(query)
            .populate('sourceEvent', 'title date time venue city')
            .sort({ createdAt: -1 });

        res.json(media);
    } catch (error) {
        console.error('Get media error:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// @route   POST /api/media
// @desc    Create media
// @access  Private (Admin)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const media = new Media(req.body);
        await media.save();
        res.status(201).json(media);
    } catch (error) {
        console.error('Create media error:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// @route   DELETE /api/media/:id
// @desc    Delete media
// @access  Private (Admin)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const media = await Media.findByIdAndDelete(req.params.id);

        if (!media) {
            return res.status(404).json({ message: 'Média non trouvé' });
        }

        res.json({ message: 'Média supprimé' });
    } catch (error) {
        console.error('Delete media error:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router;
