const { Resend } = require('resend');

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (mailOptions) => {
    try {
        if (!process.env.RESEND_API_KEY) {
            console.error('❌ RESEND_API_KEY manquant dans les variables d\'environnement');
            return { success: false, error: 'Configuration email manquante' };
        }

        const result = await resend.emails.send({
            from: mailOptions.from || process.env.EMAIL_FROM || 'Evan Lesnar <onboarding@resend.dev>',
            to: mailOptions.to,
            subject: mailOptions.subject,
            html: mailOptions.html
        });

        console.log('✅ Email envoyé avec succès à:', mailOptions.to);
        console.log('📧 Resend ID:', result.data?.id);
        return { success: true, id: result.data?.id };
    } catch (error) {
        console.error('❌ Erreur d\'envoi d\'email:', {
            to: mailOptions.to,
            error: error.message,
            stack: error.stack
        });

        return {
            success: false,
            error: error.message,
            details: error.response || 'Aucun détail supplémentaire disponible'
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
        to: process.env.ADMIN_EMAIL || 'admin@evanlesnar.com',
        subject: `🎫 Nouvelle commande #${orderDetails.orderId.slice(-8)}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
                <div style="background: #1e293b; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">🎭 Nouvelle commande reçue</h1>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 0 0 10px 10px;">
                    <p style="margin-top: 0;">Une nouvelle commande a été passée sur la billetterie :</p>
                    
                    <div style="margin: 20px 0; padding: 15px; background-color: #f8fafc; border-radius: 6px; border-left: 4px solid #3b82f6;">
                        <p style="margin: 5px 0;"><strong>Référence :</strong> ${orderDetails.orderId}</p>
                        <p style="margin: 5px 0;"><strong>Client :</strong> ${orderDetails.customerName}</p>
                        <p style="margin: 5px 0;"><strong>Email :</strong> ${orderDetails.customerEmail || 'Non fourni'}</p>
                        <p style="margin: 5px 0;"><strong>Téléphone :</strong> ${orderDetails.customerPhone || 'Non fourni'}</p>
                        <p style="margin: 5px 0;"><strong>Événement :</strong> ${orderDetails.eventTitle}</p>
                        <p style="margin: 5px 0;"><strong>Montant :</strong> ${orderDetails.totalAmount} ${orderDetails.currency || 'CDF'}</p>
                    </div>
                    
                    <div style="margin-top: 25px; text-align: center;">
                        <a href="${process.env.FRONTEND_URL || 'https://evanlesnar.netlify.app'}/admin/orders" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: 500;">
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
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
                <div style="background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">🎭 Evan Lesnar</h1>
                    <p style="color: white; margin: 10px 0 0 0; font-size: 14px;">Billeterie en ligne</p>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #1e293b; margin-top: 0;">Votre paiement a été validé ! 🎉</h2>
                    
                    <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                        Bonjour <strong>${orderDetails.customerName}</strong>,
                    </p>
                    
                    <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                        Votre paiement a été confirmé. Voici votre token de validation :
                    </p>
                    
                    <div style="background: #f1f5f9; border-left: 4px solid #f97316; padding: 20px; margin: 20px 0; border-radius: 5px;">
                        <p style="margin: 0; color: #64748b; font-size: 14px; font-weight: bold;">VOTRE TOKEN</p>
                        <p style="margin: 10px 0 0 0; color: #1e293b; font-size: 32px; font-weight: bold; letter-spacing: 2px; font-family: monospace;">
                            ${token}
                        </p>
                    </div>
                    
                    <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 0; color: #92400e; font-size: 14px;">
                            <strong>📱 Pour télécharger votre billet :</strong><br>
                            Rendez-vous sur <a href="${process.env.FRONTEND_URL || 'https://evanlesnar.netlify.app'}" style="color: #dc2626;">notre site</a> et entrez ce token dans la section "Valider mon token"
                        </p>
                    </div>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                        <p style="color: #64748b; font-size: 14px; margin: 5px 0;"><strong>Événement :</strong> ${orderDetails.eventTitle}</p>
                        <p style="color: #64748b; font-size: 14px; margin: 5px 0;"><strong>Date :</strong> ${orderDetails.eventDate}</p>
                        <p style="color: #64748b; font-size: 14px; margin: 5px 0;"><strong>Lieu :</strong> ${orderDetails.eventVenue}</p>
                        <p style="color: #64748b; font-size: 14px; margin: 5px 0;"><strong>Total :</strong> ${orderDetails.totalAmount} CDF</p>
                    </div>
                    
                    <p style="color: #475569; font-size: 14px; margin-top: 30px;">
                        À bientôt pour un moment inoubliable ! 🎉
                    </p>
                    
                    <p style="color: #94a3b8; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
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
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
                <div style="background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">🎭 Evan Lesnar</h1>
                    <p style="color: white; margin: 10px 0 0 0; font-size: 14px;">Billeterie en ligne</p>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #1e293b; margin-top: 0;">Demande enregistrée ! ✅</h2>
                    
                    <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                        Bonjour <strong>${orderDetails.customerName}</strong>,
                    </p>
                    
                    <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                        Votre demande de billet a bien été enregistrée. Pour finaliser votre achat, veuillez effectuer le paiement :
                    </p>
                    
                    <div style="background: #fef3c7; border-left: 4px solid #f97316; padding: 20px; margin: 20px 0; border-radius: 5px;">
                        <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: bold;">INSTRUCTIONS DE PAIEMENT</p>
                        <p style="margin: 10px 0 0 0; color: #1e293b; font-size: 16px; line-height: 1.8;">
                            ${paymentInstructions}
                        </p>
                    </div>
                    
                    <div style="background: #dbeafe; border: 1px solid #3b82f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 0; color: #1e40af; font-size: 14px;">
                            <strong>⏰ Important :</strong><br>
                            Une fois le paiement effectué, vous recevrez votre token unique dans les 12h qui suivent pour télécharger votre billet.
                        </p>
                    </div>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                        <p style="color: #64748b; font-size: 14px; margin: 5px 0;"><strong>Événement :</strong> ${orderDetails.eventTitle}</p>
                        <p style="color: #64748b; font-size: 14px; margin: 5px 0;"><strong>Date :</strong> ${orderDetails.eventDate}</p>
                        <p style="color: #64748b; font-size: 14px; margin: 5px 0;"><strong>Lieu :</strong> ${orderDetails.eventVenue}</p>
                        <p style="color: #64748b; font-size: 14px; margin: 5px 0;"><strong>Total :</strong> ${orderDetails.totalAmount} CDF</p>
                    </div>
                    
                    <p style="color: #94a3b8; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
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

module.exports = {
    sendEmail,
    sendTokenEmail,
    sendOrderConfirmationEmail,
    sendAdminNotificationEmail
};
