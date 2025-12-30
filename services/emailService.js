const { Resend } = require('resend');

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (mailOptions) => {
    try {
        console.log('📤 Tentative d\'envoi d\'email via Resend...');
        console.log('📍 Destinataire:', mailOptions.to);
        console.log('📝 Sujet:', mailOptions.subject);

        if (!process.env.RESEND_API_KEY) {
            console.error('❌ ERREUR CRITIQUE : RESEND_API_KEY est manquante');
            return { success: false, error: 'Configuration email manquante (RESEND_API_KEY)' };
        }

        const payload = {
            from: mailOptions.from || process.env.EMAIL_FROM || 'Evan Lesnar <onboarding@resend.dev>',
            to: Array.isArray(mailOptions.to) ? mailOptions.to : [mailOptions.to],
            subject: mailOptions.subject,
            html: mailOptions.html
        };

        console.log('📡 Envoi de la requête à Resend avec l\'expéditeur:', payload.from);

        const result = await resend.emails.send(payload);

        if (result.error) {
            console.error('❌ Erreur renvoyée par Resend API:', result.error);
            return { success: false, error: result.error.message, details: result.error };
        }

        console.log('✅ Email envoyé avec succès !');
        console.log('📧 Resend ID:', result.data?.id);
        return { success: true, id: result.data?.id };
    } catch (error) {
        console.error('❌ Erreur EXCEPTIONNELLE d\'envoi d\'email:', {
            to: mailOptions.to,
            errorMessage: error.message,
            errorObject: error
        });

        return {
            success: false,
            error: error.message,
            stack: error.stack
        };
    }
};

// Vérification de la configuration au démarrage
const checkEmailConfig = () => {
    if (!process.env.RESEND_API_KEY) {
        console.warn('⚠️ RESEND_API_KEY manquant - Les emails ne seront pas envoyés');
        return false;
    }
    console.log('✅ Service email Resend configuré');
    return true;
};

checkEmailConfig();

const sendAdminNotificationEmail = async (orderDetails) => {
    const mailOptions = {
        from: `"Système de Billeterie" <${process.env.EMAIL_FROM || 'onboarding@resend.dev'}>`,
        to: process.env.ADMIN_EMAIL || 'admin@evanelesnar.com',
        subject: `🎫 Nouvelle commande #${orderDetails.orderId.slice(-8)}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #000000;">
                <div style="background: #000000; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; border-bottom: 2px solid #dc2626;">
                    <h1 style="color: #dc2626; margin: 0; font-size: 24px;">🎭 Nouvelle commande reçue</h1>
                </div>
                
                <div style="background: #0a0a0a; padding: 25px; border-radius: 0 0 10px 10px; border: 1px solid #1a1a1a;">
                    <p style="margin-top: 0; color: #e5e5e5;">Une nouvelle commande a été passée sur la billetterie :</p>
                    
                    <div style="margin: 20px 0; padding: 15px; background-color: #1a1a1a; border-radius: 6px; border-left: 4px solid #dc2626;">
                        <p style="margin: 5px 0; color: #e5e5e5;"><strong style="color: #dc2626;">Référence :</strong> ${orderDetails.orderId}</p>
                        <p style="margin: 5px 0; color: #e5e5e5;"><strong style="color: #dc2626;">Client :</strong> ${orderDetails.customerName}</p>
                        <p style="margin: 5px 0; color: #e5e5e5;"><strong style="color: #dc2626;">Email :</strong> ${orderDetails.customerEmail || 'Non fourni'}</p>
                        <p style="margin: 5px 0; color: #e5e5e5;"><strong style="color: #dc2626;">Téléphone :</strong> ${orderDetails.customerPhone || 'Non fourni'}</p>
                        <p style="margin: 5px 0; color: #e5e5e5;"><strong style="color: #dc2626;">Événement :</strong> ${orderDetails.eventTitle}</p>
                        <p style="margin: 5px 0; color: #e5e5e5;"><strong style="color: #dc2626;">Montant :</strong> ${orderDetails.totalAmount} ${orderDetails.currency || 'CDF'}</p>
                    </div>
                    
                    <div style="margin-top: 25px; text-align: center;">
                        <a href="${process.env.FRONTEND_URL || 'https://evanlesnar.netlify.app'}/admin/orders" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: 500;">
                            Voir la commande dans l'admin
                        </a>
                    </div>
                </div>
            </div>
        `
    };
    return sendEmail(mailOptions);
};

const sendTokenEmail = async (to, token, orderDetails) => {
    const mailOptions = {
        from: `"Evan Lesnar - Billeterie" <${process.env.EMAIL_FROM || 'onboarding@resend.dev'}>`,
        to: to,
        subject: '🎫 Votre token de validation - Evan Lesnar',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #000000;">
                <div style="background: #000000; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; border-bottom: 2px solid #dc2626;">
                    <h1 style="color: #dc2626; margin: 0; font-size: 28px;">🎭 Evan Lesnar</h1>
                    <p style="color: #e5e5e5; margin: 10px 0 0 0; font-size: 14px;">Billeterie en ligne</p>
                </div>
                
                <div style="background: #0a0a0a; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #1a1a1a;">
                    <h2 style="color: #dc2626; margin-top: 0;">Votre paiement a été validé ! 🎉</h2>
                    
                    <p style="color: #e5e5e5; font-size: 16px; line-height: 1.6;">
                        Bonjour <strong style="color: #dc2626;">${orderDetails.customerName}</strong>,
                    </p>
                    
                    <p style="color: #e5e5e5; font-size: 16px; line-height: 1.6;">
                        Votre paiement a été confirmé. Voici votre token de validation :
                    </p>
                    
                    <div style="background: #1a1a1a; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 5px;">
                        <p style="margin: 0; color: #999; font-size: 14px; font-weight: bold;">VOTRE TOKEN</p>
                        <p style="margin: 10px 0 0 0; color: #fff; font-size: 32px; font-weight: bold; letter-spacing: 2px; font-family: monospace;">
                            ${token}
                        </p>
                    </div>
                    
                    <div style="background: #1a1a1a; border: 1px solid #dc2626; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 0; color: #e5e5e5; font-size: 14px;">
                            <strong style="color: #dc2626;">📱 Pour télécharger votre billet :</strong><br>
                            Rendez-vous sur <a href="${process.env.FRONTEND_URL || 'https://evanlesnar.netlify.app'}" style="color: #dc2626;">notre site</a> et entrez ce token dans la section "Valider mon token"
                        </p>
                    </div>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #1a1a1a;">
                        <p style="color: #999; font-size: 14px; margin: 5px 0;"><strong style="color: #dc2626;">Événement :</strong> ${orderDetails.eventTitle}</p>
                        <p style="color: #999; font-size: 14px; margin: 5px 0;"><strong style="color: #dc2626;">Date :</strong> ${orderDetails.eventDate}</p>
                        <p style="color: #999; font-size: 14px; margin: 5px 0;"><strong style="color: #dc2626;">Lieu :</strong> ${orderDetails.eventVenue}</p>
                        <p style="color: #999; font-size: 14px; margin: 5px 0;"><strong style="color: #dc2626;">Total :</strong> ${orderDetails.totalAmount} CDF</p>
                    </div>
                    
                    <p style="color: #e5e5e5; font-size: 14px; margin-top: 30px;">
                        À bientôt pour un moment inoubliable ! 🎉
                    </p>
                    
                    <p style="color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #1a1a1a;">
                        Cet email a été envoyé automatiquement, merci de ne pas y répondre.
                    </p>
                </div>
            </div>
        `
    };

    return sendEmail(mailOptions);
};

const sendOrderConfirmationEmail = async (to, orderDetails, paymentInstructions) => {
    const mailOptions = {
        from: `"Evan Lesnar - Billeterie" <${process.env.EMAIL_FROM || 'onboarding@resend.dev'}>`,
        to: to,
        subject: '🎫 Demande de billet enregistrée - Evan Lesnar',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #000000;">
                <div style="background: #000000; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; border-bottom: 2px solid #dc2626;">
                    <h1 style="color: #dc2626; margin: 0; font-size: 28px;">🎭 Evan Lesnar</h1>
                    <p style="color: #e5e5e5; margin: 10px 0 0 0; font-size: 14px;">Billeterie en ligne</p>
                </div>
                
                <div style="background: #0a0a0a; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #1a1a1a;">
                    <h2 style="color: #dc2626; margin-top: 0;">Demande enregistrée ! ✅</h2>
                    
                    <p style="color: #e5e5e5; font-size: 16px; line-height: 1.6;">
                        Bonjour <strong style="color: #dc2626;">${orderDetails.customerName}</strong>,
                    </p>
                    
                    <p style="color: #e5e5e5; font-size: 16px; line-height: 1.6;">
                        Votre demande de billet a bien été enregistrée. Pour finaliser votre achat, veuillez effectuer le paiement :
                    </p>
                    
                    <div style="background: #1a1a1a; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 5px;">
                        <p style="margin: 0; color: #999; font-size: 14px; font-weight: bold;">INSTRUCTIONS DE PAIEMENT</p>
                        <p style="margin: 10px 0 0 0; color: #fff; font-size: 16px; line-height: 1.8;">
                            ${paymentInstructions}
                        </p>
                    </div>
                    
                    <div style="background: #1a1a1a; border: 1px solid #dc2626; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 0; color: #e5e5e5; font-size: 14px;">
                            <strong style="color: #dc2626;">⏰ Important :</strong><br>
                            Une fois le paiement effectué, vous recevrez votre token unique dans les 12h qui suivent pour télécharger votre billet.
                        </p>
                    </div>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #1a1a1a;">
                        <p style="color: #999; font-size: 14px; margin: 5px 0;"><strong style="color: #dc2626;">Événement :</strong> ${orderDetails.eventTitle}</p>
                        <p style="color: #999; font-size: 14px; margin: 5px 0;"><strong style="color: #dc2626;">Date :</strong> ${orderDetails.eventDate}</p>
                        <p style="color: #999; font-size: 14px; margin: 5px 0;"><strong style="color: #dc2626;">Lieu :</strong> ${orderDetails.eventVenue}</p>
                        <p style="color: #999; font-size: 14px; margin: 5px 0;"><strong style="color: #dc2626;">Total :</strong> ${orderDetails.totalAmount} CDF</p>
                    </div>
                    
                    <p style="color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #1a1a1a;">
                        Cet email a été envoyé automatiquement, merci de ne pas y répondre.
                    </p>
                </div>
            </div>
        `
    };

    const result = await sendEmail(mailOptions);
    if (result?.success) {
        console.log('✅ Order confirmation email sent to:', to);
    }
    return result;
};

const sendContactEmail = async (contactData) => {
    const { name, email, phone, subject, message } = contactData;

    const subjectLabels = {
        'booking': 'Demande de booking',
        'collaboration': 'Collaboration',
        'media': 'Demande média',
        'support': 'Support billetterie',
        'other': 'Autre'
    };

    const mailOptions = {
        from: `"Formulaire de Contact" <${process.env.EMAIL_FROM || 'onboarding@resend.dev'}>`,
        to: process.env.ADMIN_EMAIL || 'evanebukasa@gmail.com',
        subject: `📩 Nouveau message: ${subjectLabels[subject] || subject}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #000000;">
                <div style="background: #000000; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; border-bottom: 2px solid #dc2626;">
                    <h1 style="color: #dc2626; margin: 0; font-size: 24px;">📩 Nouveau message de contact</h1>
                </div>
                
                <div style="background: #0a0a0a; padding: 25px; border-radius: 0 0 10px 10px; border: 1px solid #1a1a1a;">
                    <p style="margin-top: 0; color: #e5e5e5;">Vous avez reçu un nouveau message depuis le formulaire de contact :</p>
                    
                    <div style="margin: 20px 0; padding: 15px; background-color: #1a1a1a; border-radius: 6px; border-left: 4px solid #dc2626;">
                        <p style="margin: 5px 0; color: #e5e5e5;"><strong style="color: #dc2626;">Nom :</strong> ${name}</p>
                        <p style="margin: 5px 0; color: #e5e5e5;"><strong style="color: #dc2626;">Email :</strong> ${email}</p>
                        ${phone ? `<p style="margin: 5px 0; color: #e5e5e5;"><strong style="color: #dc2626;">Téléphone :</strong> ${phone}</p>` : ''}
                        <p style="margin: 5px 0; color: #e5e5e5;"><strong style="color: #dc2626;">Sujet :</strong> ${subjectLabels[subject] || subject}</p>
                    </div>
                    
                    <div style="margin: 20px 0; padding: 15px; background-color: #1a1a1a; border-radius: 6px;">
                        <p style="margin: 0 0 10px 0; color: #dc2626; font-weight: bold;">Message :</p>
                        <p style="margin: 0; color: #e5e5e5; white-space: pre-wrap;">${message}</p>
                    </div>
                    
                    <div style="margin-top: 25px; text-align: center;">
                        <a href="mailto:${email}" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: 500;">
                            Répondre à ${name}
                        </a>
                    </div>
                </div>
            </div>
        `
    };

    return sendEmail(mailOptions);
};

module.exports = {
    sendEmail,
    sendTokenEmail,
    sendOrderConfirmationEmail,
    sendAdminNotificationEmail,
    sendContactEmail
};
