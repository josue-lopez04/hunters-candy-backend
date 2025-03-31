// hunters-candy-backend/src/services/emailService.js
import nodemailer from 'nodemailer';

// Configuración del transporter de nodemailer
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // True para usar SSL
  auth: {
    user: 'josuelopezhernandez112@gmail.com',
    pass: 'zawh elwn olpv vdoi'
  },
  tls: {
    rejectUnauthorized: false  
  }
});

/**
 * Obtiene la URL base para los enlaces en emails
 * @returns {string} URL base (frontend)
 */
const getBaseUrl = () => {
  // Priorizar variable de entorno
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL;
  }
  
  // Si estamos en producción, usar la URL de Vercel
  if (process.env.NODE_ENV === 'production') {
    return 'https://dwp-hunters-candy.vercel.app';
  }
  
  // En desarrollo, usar localhost
  return 'http://localhost:3000';
};

/**
 * Envía un correo de recuperación de contraseña
 * @param {string} to - Email del destinatario
 * @param {string} token - Token de recuperación
 * @param {string} username - Nombre de usuario
 * @returns {Promise} Resultado del envío
 */
export const sendPasswordResetEmail = async (to, token, username) => {
  try {
    // Obtener la URL base correcta según entorno
    const baseUrl = getBaseUrl();
    
    // Construir URL de reset
    const resetUrl = `${baseUrl}/reset-password/${token}`;
    
    console.log(`Enviando correo de recuperación con URL: ${resetUrl}`);
    
    // Template del correo
    const mailOptions = {
      from: '"Hunter\'s Candy" <josuelopezhernandez112@gmail.com>',
      to,
      subject: 'Recuperación de contraseña - Hunter\'s Candy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #111827; margin-bottom: 20px;">Recuperación de contraseña</h2>
          
          <p style="color: #4b5563; margin-bottom: 20px;">Hola ${username || 'Usuario'},</p>
          
          <p style="color: #4b5563; margin-bottom: 20px;">Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Restablecer contraseña</a>
          </div>
          
          <p style="color: #4b5563; margin-bottom: 20px;">Si no solicitaste restablecer tu contraseña, puedes ignorar este correo. El enlace expirará en 1 hora por seguridad.</p>
          
          <p style="color: #4b5563; margin-bottom: 5px;">Si tienes problemas con el botón, puedes copiar y pegar el siguiente enlace en tu navegador:</p>
          <p style="color: #4b5563; margin-bottom: 20px; word-break: break-all; font-size: 14px;">
            <a href="${resetUrl}" style="color: #4f46e5;">${resetUrl}</a>
          </p>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px; font-size: 14px; color: #6b7280; text-align: center;">
            <p>&copy; ${new Date().getFullYear()} Hunter's Candy. Todos los derechos reservados.</p>
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
          </div>
        </div>
      `
    };
    
    // Enviar correo
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error al enviar correo de recuperación:', error);
    throw error;
  }
};

/**
 * Envía una notificación de cambio de contraseña exitoso
 * @param {string} to - Email del destinatario
 * @param {string} username - Nombre de usuario
 * @returns {Promise} Resultado del envío
 */
export const sendPasswordChangedEmail = async (to, username) => {
  try {
    const baseUrl = getBaseUrl();
    const loginUrl = `${baseUrl}/login`;
    
    const mailOptions = {
      from: '"Hunter\'s Candy" <josuelopezhernandez112@gmail.com>',
      to,
      subject: 'Tu contraseña ha sido cambiada - Hunter\'s Candy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #111827; margin-bottom: 20px;">Contraseña actualizada correctamente</h2>
          
          <p style="color: #4b5563; margin-bottom: 20px;">Hola ${username || 'Usuario'},</p>
          
          <p style="color: #4b5563; margin-bottom: 20px;">Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Iniciar sesión</a>
          </div>
          
          <p style="color: #4b5563; margin-bottom: 20px;">Si no realizaste este cambio, por favor contacta inmediatamente con nuestro equipo de soporte.</p>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px; font-size: 14px; color: #6b7280; text-align: center;">
            <p>&copy; ${new Date().getFullYear()} Hunter's Candy. Todos los derechos reservados.</p>
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
          </div>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo de confirmación enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error al enviar correo de confirmación:', error);
    throw error;
  }
};

export default {
  sendPasswordResetEmail,
  sendPasswordChangedEmail
};