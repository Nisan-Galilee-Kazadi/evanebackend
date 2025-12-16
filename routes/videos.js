const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const authMiddleware = require('../middleware/auth');

// @route   GET /api/videos
// @desc    Get all videos
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;
        let query = {};

        if (category) query.category = category;

        const videos = await Video.find(query)
            .populate('sourceEvent', 'title date')
            .sort({ createdAt: -1 });
        res.json(videos);
    } catch (error) {
        console.error('Get videos error:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// @route   POST /api/videos
// @desc    Create video
// @access  Private (Admin)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const video = new Video(req.body);
        await video.save();
        res.status(201).json(video);
    } catch (error) {
        console.error('Create video error:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// @route   PUT /api/videos/:id
// @desc    Update video
// @access  Private (Admin)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const video = await Video.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!video) {
            return res.status(404).json({ message: 'Vidéo non trouvée' });
        }

        res.json(video);
    } catch (error) {
        console.error('Update video error:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// @route   DELETE /api/videos/:id
// @desc    Delete video
// @access  Private (Admin)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const video = await Video.findByIdAndDelete(req.params.id);

        if (!video) {
            return res.status(404).json({ message: 'Vidéo non trouvée' });
        }

        res.json({ message: 'Vidéo supprimée' });
    } catch (error) {
        console.error('Delete video error:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router;
