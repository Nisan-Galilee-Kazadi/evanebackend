const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// @route   POST /api/auth/login
// @desc    Admin login
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find admin
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Check password
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Generate token
        const token = jwt.sign(
            { id: admin._id, email: admin.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            admin: {
                id: admin._id,
                email: admin.email,
                name: admin.name
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// @route   POST /api/auth/verify
// @desc    Verify JWT token
// @access  Public
router.post('/verify', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(401).json({ message: 'Token manquant' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.id).select('-password');

        if (!admin) {
            return res.status(401).json({ message: 'Admin non trouvé' });
        }

        res.json({ admin });
    } catch (error) {
        res.status(401).json({ message: 'Token invalide' });
    }
});
// @route   PUT /api/auth/profile
// @desc    Update admin profile
// @access  Private
router.put('/profile', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ message: 'Non autorisé' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.id);

        if (!admin) return res.status(404).json({ message: 'Admin non trouvé' });

        const { name, email, photo, currentPassword, newPassword } = req.body;

        if (name) admin.name = name;
        if (email) admin.email = email;
        if (photo) admin.photo = photo;

        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: 'Mot de passe actuel requis' });
            }
            const isMatch = await admin.comparePassword(currentPassword);
            if (!isMatch) {
                return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
            }
            admin.password = newPassword;
        }

        await admin.save();

        res.json({
            message: 'Profil mis à jour',
            admin: {
                id: admin._id,
                email: admin.email,
                name: admin.name,
                photo: admin.photo
            }
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router;
