const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Media = require('../models/Media');
const authMiddleware = require('../middleware/auth');

// Ensure public/media directory exists
const uploadDir = path.join(__dirname, '..', 'public', 'media');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config for media uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|webm|ogg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seules les images et vidéos sont autorisées'));
    }
  },
});

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

// @route   POST /api/media/upload
// @desc    Upload a media file (image/video) and return public URL
// @access  Private (Admin)
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Aucun fichier reçu' });
        }
        const publicUrl = `${req.protocol}://${req.get('host')}/media/${req.file.filename}`;
        res.json({ url: publicUrl });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ error: 'Erreur lors de l\'upload' });
    }
});

module.exports = router;
