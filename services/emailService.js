const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send token email
const sendTokenEmail = async (to, token, orderDetails) => {
    const mailOptions = {
        from: `"Evan Lesnar - Billeterie" <${process.env.EMAIL_USER}>`,
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

    try {
        await transporter.sendMail(mailOptions);
        console.log('✅ Email sent to:', to);
        return { success: true };
    } catch (error) {
        console.error('❌ Email error:', error);
        return { success: false, error: error.message };
    }
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (to, orderDetails, paymentInstructions) => {
    const mailOptions = {
        from: `"Evan Lesnar - Billeterie" <${process.env.EMAIL_USER}>`,
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

    try {
        await transporter.sendMail(mailOptions);
        console.log('✅ Order confirmation email sent to:', to);
        return { success: true };
    } catch (error) {
        console.error('❌ Email error:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendTokenEmail,
    sendOrderConfirmationEmail
};
