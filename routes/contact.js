const express = require('express');
const router = express.Router();
const { sendContactEmail } = require('../services/emailService');

// @route   POST /api/contact
// @desc    Send contact form message
// @access  Public
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        // Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                message: 'Veuillez remplir tous les champs obligatoires'
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: 'Veuillez fournir une adresse email valide'
            });
        }

        console.log(`📧 Nouveau message de contact de: ${name} (${email})`);

        // Send email
        const result = await sendContactEmail({
            name,
            email,
            phone: phone || '',
            subject,
            message
        });

        if (result?.success) {
            console.log('✅ Email de contact envoyé avec succès');
            res.status(200).json({
                message: 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.'
            });
        } else {
            console.error('❌ Échec de l\'envoi de l\'email de contact:', result?.error);
            res.status(500).json({
                message: 'Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer.'
            });
        }
    } catch (error) {
        console.error('❌ Erreur dans la route contact:', error);
        res.status(500).json({
            message: 'Une erreur serveur est survenue. Veuillez réessayer plus tard.'
        });
    }
});

module.exports = router;
