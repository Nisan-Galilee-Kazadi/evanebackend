require('dotenv').config();
const { sendEmail } = require('../services/emailService');

const testEmail = async () => {
    console.log('🚀 Démarrage du test d\'envoi d\'email...');

    // Vérification de la clé API
    if (!process.env.RESEND_API_KEY) {
        console.error('❌ ERREUR : RESEND_API_KEY est manquante dans le fichier .env');
        process.exit(1);
    }

    const testOptions = {
        to: process.env.ADMIN_EMAIL || 'votre-email@exemple.com',
        subject: '🧪 Test Service Email - Evan Lesnar',
        html: `
            <h1>Test de connexion réussi !</h1>
            <p>Cet email confirme que le service <strong>Resend</strong> est correctement configuré sur votre serveur.</p>
            <ul>
                <li><strong>Date :</strong> ${new Date().toLocaleString()}</li>
                <li><strong>Expéditeur :</strong> ${process.env.EMAIL_FROM || 'onboarding@resend.dev'}</li>
            </ul>
        `
    };

    console.log(`📡 Tentative d'envoi vers : ${testOptions.to}...`);

    try {
        const result = await sendEmail(testOptions);
        if (result.success) {
            console.log('✅ TEST RÉUSSI : L\'email a été envoyé !');
            console.log('ID Resend :', result.id);
        } else {
            console.error('❌ ÉCHEC DU TEST :', result.error);
            if (result.details) {
                console.error('Détails :', JSON.stringify(result.details, null, 2));
            }
        }
    } catch (error) {
        console.error('❌ ERREUR FATALE :', error.message);
    }
};

testEmail();
