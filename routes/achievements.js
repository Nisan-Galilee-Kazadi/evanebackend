const express = require('express');
const router = express.Router();
const Achievement = require('../models/Achievement');
const authMiddleware = require('../middleware/auth');

// @route   GET /api/achievements
// @desc    Get all achievements
// @access  Public
router.get('/', async (req, res) => {
    try {
        const achievements = await Achievement.find()
            .populate('sourceEvent', 'title date')
            .sort({ date: -1 });
        res.json(achievements);
    } catch (error) {
        console.error('Get achievements error:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// @route   POST /api/achievements
// @desc    Create achievement
// @access  Private (Admin)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const achievement = new Achievement(req.body);
        await achievement.save();
        res.status(201).json(achievement);
    } catch (error) {
        console.error('Create achievement error:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// @route   PUT /api/achievements/:id
// @desc    Update achievement
// @access  Private (Admin)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const achievement = await Achievement.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!achievement) {
            return res.status(404).json({ message: 'Réalisation non trouvée' });
        }

        res.json(achievement);
    } catch (error) {
        console.error('Update achievement error:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// @route   DELETE /api/achievements/:id
// @desc    Delete achievement
// @access  Private (Admin)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const achievement = await Achievement.findByIdAndDelete(req.params.id);

        if (!achievement) {
            return res.status(404).json({ message: 'Réalisation non trouvée' });
        }

        res.json({ message: 'Réalisation supprimée' });
    } catch (error) {
        console.error('Delete achievement error:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router;
