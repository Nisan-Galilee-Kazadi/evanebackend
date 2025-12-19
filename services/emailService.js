const nodemailer = require('nodemailer');

// Configuration du transporteur SMTP
const transporter = nodemailer.createTransport(
    process.env.EMAIL_SERVICE === 'gmail'
        ? {
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            debug: process.env.EMAIL_DEBUG === 'true',
            logger: process.env.EMAIL_DEBUG === 'true'
        }
        : {
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT || '587'),
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            debug: process.env.EMAIL_DEBUG === 'true',
            logger: process.env.EMAIL_DEBUG === 'true'
        }
);

const sendEmail = async (mailOptions) => {
    try {
        const emailPromise = transporter.sendMail({
            ...mailOptions,
            from: process.env.EMAIL_FROM || mailOptions.from
        });

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout: Le serveur SMTP n\'a pas répondu dans les délais')), 10000)
        );

        await Promise.race([emailPromise, timeoutPromise]);

        console.log('✅ Email envoyé avec succès à:', mailOptions.to);
        return { success: true };
    } catch (error) {
        console.error('❌ Erreur d\'envoi d\'email:', {
            to: mailOptions.to,
            error: error.message,
            stack: error.stack
        });

        if (error.response) {
            console.error('Détails de l\'erreur SMTP:', {
                code: error.responseCode,
                response: error.response
            });
        }

        return {
            success: false,
            error: error.message,
            details: error.response || 'Aucun détail supplémentaire disponible'
        };
    }
};

// Modèle d'email de confirmation de commande
const orderConfirmationTemplate = (orderDetails) => ({
    from: `"Evan Lesnar - Billeterie" <${process.env.EMAIL_FROM || 'no-reply@evanlesnar.com'}>`,
    to: orderDetails.customerEmail,
    subject: '🎫 Confirmation de votre commande - Evan Lesnar',
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
            <div style="background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🎭 Evan Lesnar</h1>
                <p style="color: white; margin: 10px 0 0 0; font-size: 14px;">Confirmation de commande</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #1e293b; margin-top: 0;">Merci pour votre commande, ${orderDetails.customerName} !</h2>
                
                <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                    Votre commande a bien été enregistrée sous la référence :
                    <strong>${orderDetails.orderId}</strong>
                </p>
                
                <div style="margin: 25px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
                    <h3 style="color: #1e293b; margin-top: 0;">Détails de la commande</h3>
                    <p style="margin: 5px 0;">
                        <span style="display: inline-block; width: 120px; color: #64748b;">Événement :</span>
                        <strong>${orderDetails.eventTitle}</strong>
                    </p>
                    <p style="margin: 5px 0;">
                        <span style="display: inline-block; width: 120px; color: #64748b;">Date :</span>
                        <strong>${new Date(orderDetails.eventDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                    </p>
                    <p style="margin: 5px 0;">
                        <span style="display: inline-block; width: 120px; color: #64748b;">Lieu :</span>
                        <strong>${orderDetails.eventVenue}</strong>
                    </p>
                    <p style="margin: 5px 0;">
                        <span style="display: inline-block; width: 120px; color: #64748b;">Billets :</span>
                        <strong>${orderDetails.ticketCount} x ${orderDetails.ticketType}</strong>
                    </p>
                    <p style="margin: 5px 0;">
                        <span style="display: inline-block; width: 120px; color: #64748b;">Total :</span>
                        <strong>${orderDetails.totalAmount} ${orderDetails.currency || 'USD'}</strong>
                    </p>
                </div>
                
                <p style="color: #475569; font-size: 14px; line-height: 1.6;">
                    Vous recevrez prochainement un email avec votre billet électronique après validation du paiement.
                </p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
                    <p style="color: #64748b; font-size: 12px; margin: 0;">
                        Pour toute question, contactez-nous à <a href="mailto:support@evanlesnar.com" style="color: #3b82f6; text-decoration: none;">support@evanlesnar.com</a>
                    </p>
                    <p style="color: #94a3b8; font-size: 12px; margin: 5px 0 0 0;">
                        ${new Date().getFullYear()} Evan Lesnar. Tous droits réservés.
                    </p>
                </div>
            </div>
        </div>
    `
});

// Modèle d'email de notification admin
const adminNotificationTemplate = (orderDetails) => ({
    from: `"Système de Billeterie" <${process.env.EMAIL_FROM || 'no-reply@evanlesnar.com'}>`,
    to: process.env.ADMIN_EMAIL || 'admin@evanlesnar.com',
    subject: `Nouvelle commande #${orderDetails.orderId}`,
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
            <div style="background: #1e293b; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Nouvelle commande reçue</h1>
            </div>
            
            <div style="background: white; padding: 25px; border-radius: 0 0 10px 10px;">
                <p style="margin-top: 0;">Une nouvelle commande a été passée sur la billetterie :</p>
                
                <div style="margin: 20px 0; padding: 15px; background-color: #f8fafc; border-radius: 6px; border-left: 4px solid #3b82f6;">
                    <p style="margin: 5px 0;"><strong>Référence :</strong> ${orderDetails.orderId}</p>
                    <p style="margin: 5px 0;"><strong>Client :</strong> ${orderDetails.customerName}</p>
                    <p style="margin: 5px 0;"><strong>Email :</strong> ${orderDetails.customerEmail}</p>
                    <p style="margin: 5px 0;"><strong>Événement :</strong> ${orderDetails.eventTitle}</p>
                    <p style="margin: 5px 0;"><strong>Montant :</strong> ${orderDetails.totalAmount} ${orderDetails.currency || 'USD'}</p>
                </div>
                
                <div style="margin-top: 25px; text-align: center;">
                    <a href="${process.env.ADMIN_URL || 'http://localhost:3000/admin/orders'}" style="display: inline-block; background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: 500;">
                        Voir la commande dans l'admin
                    </a>
                </div>
            </div>
        </div>
    `
});

// Vérification de la connexion au serveur SMTP
const checkSMTPConnection = async () => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn('⚠️ SMTP non vérifié: EMAIL_USER/EMAIL_PASS manquants');
            return false;
        }
        await transporter.verify();
        console.log('✅ Serveur SMTP connecté avec succès');
        return true;
    } catch (error) {
        console.error('❌ Erreur de connexion SMTP:', {
            error: error.message,
            code: error.code,
            stack: error.stack
        });
        return false;
    }
};

// Vérification au démarrage
checkSMTPConnection();

const sendAdminNotificationEmail = async (orderDetails) => {
    const mailOptions = adminNotificationTemplate(orderDetails);
    return sendEmail(mailOptions);
};

// Send token email
const sendTokenEmail = async (to, token, orderDetails) => {
    const mailOptions = {
        from: `"Evan Lesnar - Billeterie" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: to,
        subject: 'Votre token de validation - Evan Lesnar',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
                <div style="background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">🎭 Evan Lesnar</h1>
                    <p style="color: white; margin: 10px 0 0 0; font-size: 14px;">Billeterie en ligne</p>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #1e293b; margin-top: 0;">Votre demande de billet a été validée !</h2>
                    
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
                            Rendez-vous sur notre site et entrez ce token dans la section "Valider mon token"
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

// Send order confirmation email
const sendOrderConfirmationEmail = async (to, orderDetails, paymentInstructions) => {
    const mailOptions = {
        from: `"Evan Lesnar - Billeterie" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: to,
        subject: 'Demande de billet enregistrée - Evan Lesnar',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
                <div style="background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">🎭 Evan Lesnar</h1>
                    <p style="color: white; margin: 10px 0 0 0; font-size: 14px;">Billeterie en ligne</p>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #1e293b; margin-top: 0;">Demande enregistrée !</h2>
                    
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
    sendTokenEmail,
    sendOrderConfirmationEmail,
    sendAdminNotificationEmail
};
