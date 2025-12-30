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

const { storage } = require('../config/cloudinary');
const upload = multer({ storage });

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

// New multer instance with memory storage for processing
const memoryStorage = multer.memoryStorage();
const uploadMemory = multer({ storage: memoryStorage });

const { cloudinary } = require('../config/cloudinary');
const { convertToWebP } = require('../utils/imageProcessor');

// @route   POST /api/media/upload
// @desc    Upload a media file (image/video) and return public URL
// @access  Private (Admin)
router.post('/upload', authMiddleware, uploadMemory.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier reçu' });
    }

    let fileBuffer = req.file.buffer;
    let fileName = req.file.originalname;
    let folder = 'evan-lesnar';

    // If it's an image, convert to WebP
    if (req.file.mimetype.startsWith('image/')) {
      fileBuffer = await convertToWebP(fileBuffer);
      fileName = fileName.replace(/\.[^/.]+$/, "") + ".webp";
    }

    // Upload to Cloudinary using stream
    const uploadFromBuffer = (buffer) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
          {
            folder: folder,
            resource_type: "auto",
            public_id: path.parse(fileName).name
          },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
        stream.end(buffer);
      });
    };

    const result = await uploadFromBuffer(fileBuffer);
    res.json({ url: result.secure_url });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Erreur lors de l\'upload ou de la conversion' });
  }
});

module.exports = router;
