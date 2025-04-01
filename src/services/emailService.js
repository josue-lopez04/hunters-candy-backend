// src/services/emailService.js
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
  // Siempre devolver la URL de producción para correos electrónicos
  return 'https://dwp-hunters-candy.vercel.app';
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
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://dwp-hunters-candy.vercel.app/logo.jpeg" alt="Hunter's Candy Logo" style="max-width: 150px;">
          </div>
          
          <h2 style="color: #111827; margin-bottom: 20px; font-family: Arial, Helvetica, sans-serif;">Recuperación de contraseña</h2>
          
          <p style="color: #4b5563; margin-bottom: 20px; font-family: Arial, Helvetica, sans-serif;">Hola ${username || 'Usuario'},</p>
          
          <p style="color: #4b5563; margin-bottom: 20px; font-family: Arial, Helvetica, sans-serif;">Has solicitado restablecer tu contraseña. Haz clic en el siguiente botón para crear una nueva contraseña:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-family: Arial, Helvetica, sans-serif;">Restablecer contraseña</a>
          </div>
          
          <p style="color: #4b5563; margin-bottom: 20px; font-family: Arial, Helvetica, sans-serif;">Si no solicitaste restablecer tu contraseña, puedes ignorar este correo. El enlace expirará en 1 hora por seguridad.</p>
          
          <p style="color: #4b5563; margin-bottom: 5px; font-family: Arial, Helvetica, sans-serif;">Si tienes problemas con el botón, puedes copiar y pegar el siguiente enlace en tu navegador:</p>
          <p style="color: #4b5563; margin-bottom: 20px; word-break: break-all; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">
            <a href="${resetUrl}" style="color: #4f46e5;">${resetUrl}</a>
          </p>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px; font-size: 14px; color: #6b7280; text-align: center; font-family: Arial, Helvetica, sans-serif;">
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
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://dwp-hunters-candy.vercel.app/logo.jpeg" alt="Hunter's Candy Logo" style="max-width: 150px;">
          </div>
          
          <h2 style="color: #111827; margin-bottom: 20px; font-family: Arial, Helvetica, sans-serif;">Contraseña actualizada correctamente</h2>
          
          <p style="color: #4b5563; margin-bottom: 20px; font-family: Arial, Helvetica, sans-serif;">Hola ${username || 'Usuario'},</p>
          
          <p style="color: #4b5563; margin-bottom: 20px; font-family: Arial, Helvetica, sans-serif;">Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-family: Arial, Helvetica, sans-serif;">Iniciar sesión</a>
          </div>
          
          <p style="color: #4b5563; margin-bottom: 20px; font-family: Arial, Helvetica, sans-serif;">Si no realizaste este cambio, por favor contacta inmediatamente con nuestro equipo de soporte.</p>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px; font-size: 14px; color: #6b7280; text-align: center; font-family: Arial, Helvetica, sans-serif;">
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

/**
 * Envía una notificación de nueva orden
 * @param {string} to - Email del destinatario
 * @param {Object} order - Datos de la orden
 * @returns {Promise} Resultado del envío
 */
export const sendOrderConfirmationEmail = async (to, order) => {
  try {
    const baseUrl = getBaseUrl();
    const orderUrl = `${baseUrl}/order-success/${order._id}`;
    
    // Construir el HTML para los items de la orden
    let orderItemsHtml = '';
    order.orderItems.forEach(item => {
      orderItemsHtml += `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 10px; text-align: left;">
            <div style="display: flex; align-items: center;">
              <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px;">
              <span>${item.name}</span>
            </div>
          </td>
          <td style="padding: 10px; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; text-align: right;">$${item.price.toFixed(2)}</td>
          <td style="padding: 10px; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `;
    });
    
    const mailOptions = {
      from: '"Hunter\'s Candy" <josuelopezhernandez112@gmail.com>',
      to,
      subject: `Confirmación de Pedido #${order._id} - Hunter's Candy`,
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://dwp-hunters-candy.vercel.app/logo.jpeg" alt="Hunter's Candy Logo" style="max-width: 150px;">
          </div>
          
          <h2 style="color: #111827; margin-bottom: 20px; font-family: Arial, Helvetica, sans-serif;">Confirmación de Pedido</h2>
          
          <p style="color: #4b5563; margin-bottom: 20px; font-family: Arial, Helvetica, sans-serif;">Hola ${order.user?.firstName || 'Usuario'},</p>
          
          <p style="color: #4b5563; margin-bottom: 20px; font-family: Arial, Helvetica, sans-serif;">¡Gracias por tu compra! Hemos recibido tu pedido y lo estamos procesando.</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; margin-bottom: 10px; font-family: Arial, Helvetica, sans-serif;">Detalles del Pedido</h3>
            <p style="margin: 5px 0; font-family: Arial, Helvetica, sans-serif;"><strong>Número de Pedido:</strong> ${order._id}</p>
            <p style="margin: 5px 0; font-family: Arial, Helvetica, sans-serif;"><strong>Fecha:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p style="margin: 5px 0; font-family: Arial, Helvetica, sans-serif;"><strong>Estado:</strong> ${order.status}</p>
            <p style="margin: 5px 0; font-family: Arial, Helvetica, sans-serif;"><strong>Método de Pago:</strong> ${
              order.paymentMethod === 'card' ? 'Tarjeta de Crédito/Débito' :
              order.paymentMethod === 'paypal' ? 'PayPal' :
              'Pago contra entrega'
            }</p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-family: Arial, Helvetica, sans-serif;">
            <thead>
              <tr style="background-color: #f3f4f6; text-align: left;">
                <th style="padding: 10px;">Producto</th>
                <th style="padding: 10px; text-align: center;">Cantidad</th>
                <th style="padding: 10px; text-align: right;">Precio</th>
                <th style="padding: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${orderItemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right;"><strong>Subtotal:</strong></td>
                <td style="padding: 10px; text-align: right;">$${order.itemsPrice.toFixed(2)}</td>
              </tr>
              ${order.discountAmount > 0 ? `
                <tr>
                  <td colspan="3" style="padding: 10px; text-align: right;"><strong>Descuento:</strong></td>
                  <td style="padding: 10px; text-align: right; color: #ef4444;">-$${order.discountAmount.toFixed(2)}</td>
                </tr>
              ` : ''}
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right;"><strong>Impuestos:</strong></td>
                <td style="padding: 10px; text-align: right;">$${order.taxPrice.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right;"><strong>Envío:</strong></td>
                <td style="padding: 10px; text-align: right;">$${order.shippingPrice.toFixed(2)}</td>
              </tr>
              <tr style="font-weight: bold; font-size: 1.1em;">
                <td colspan="3" style="padding: 10px; text-align: right;"><strong>Total:</strong></td>
                <td style="padding: 10px; text-align: right;">$${order.totalPrice.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; margin-bottom: 10px; font-family: Arial, Helvetica, sans-serif;">Dirección de Envío</h3>
            <p style="margin: 0; font-family: Arial, Helvetica, sans-serif;">
              ${order.shippingAddress.street}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
              ${order.shippingAddress.country}
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${orderUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-family: Arial, Helvetica, sans-serif;">Ver detalles del pedido</a>
          </div>
          
          <p style="color: #4b5563; margin-bottom: 20px; font-family: Arial, Helvetica, sans-serif;">Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos a través de nuestro <a href="${baseUrl}/contact" style="color: #4f46e5; text-decoration: none;">formulario de contacto</a>.</p>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px; font-size: 14px; color: #6b7280; text-align: center; font-family: Arial, Helvetica, sans-serif;">
            <p>&copy; ${new Date().getFullYear()} Hunter's Candy. Todos los derechos reservados.</p>
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
          </div>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo de confirmación de orden enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error al enviar correo de confirmación de orden:', error);
    throw error;
  }
};

/**
 * Envía una notificación de cambio de estado de orden
 * @param {string} to - Email del destinatario
 * @param {Object} orderData - Datos de la orden con su nuevo estado
 * @returns {Promise} Resultado del envío
 */
export const sendOrderStatusUpdate = async (to, orderData) => {
  try {
    const baseUrl = getBaseUrl();
    const orderUrl = `${baseUrl}/order-success/${orderData.orderId}`;
    
    let statusText = '';
    let statusColor = '';
    
    switch (orderData.status) {
      case 'Procesado':
        statusText = 'Tu pedido ha sido procesado y está siendo preparado.';
        statusColor = '#3b82f6'; // Azul
        break;
      case 'Enviado':
        statusText = 'Tu pedido ha sido enviado y está en camino.';
        statusColor = '#10b981'; // Verde
        break;
      case 'Entregado':
        statusText = '¡Tu pedido ha sido entregado!';
        statusColor = '#16a34a'; // Verde oscuro
        break;
      case 'Cancelado':
        statusText = 'Tu pedido ha sido cancelado.';
        statusColor = '#ef4444'; // Rojo
        break;
      default:
        statusText = `El estado de tu pedido ha sido actualizado a: ${orderData.status}`;
        statusColor = '#3b82f6'; // Azul por defecto
    }
    
    const mailOptions = {
      from: '"Hunter\'s Candy" <josuelopezhernandez112@gmail.com>',
      to,
      subject: `Actualización de Pedido #${orderData.orderId} - Hunter's Candy`,
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://dwp-hunters-candy.vercel.app/logo.jpeg" alt="Hunter's Candy Logo" style="max-width: 150px;">
          </div>
          
          <h2 style="color: #111827; margin-bottom: 20px; font-family: Arial, Helvetica, sans-serif;">Actualización de Pedido</h2>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
            <h3 style="color: ${statusColor}; margin-top: 0; font-family: Arial, Helvetica, sans-serif;">Estado: ${orderData.status}</h3>
            <p style="margin-bottom: 0; font-family: Arial, Helvetica, sans-serif;">${statusText}</p>
          </div>
          
          <p style="color: #4b5563; margin-bottom: 20px; font-family: Arial, Helvetica, sans-serif;">Pedido #${orderData.orderId}</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${orderUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-family: Arial, Helvetica, sans-serif;">Ver detalles del pedido</a>
          </div>
          
          <p style="color: #4b5563; margin-bottom: 20px; font-family: Arial, Helvetica, sans-serif;">Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos a través de nuestro <a href="${baseUrl}/contact" style="color: #4f46e5; text-decoration: none;">formulario de contacto</a>.</p>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px; font-size: 14px; color: #6b7280; text-align: center; font-family: Arial, Helvetica, sans-serif;">
            <p>&copy; ${new Date().getFullYear()} Hunter's Candy. Todos los derechos reservados.</p>
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
          </div>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo de actualización de orden enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error al enviar correo de actualización de orden:', error);
    throw error;
  }
};

// Exportar todas las funciones
export default {
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusUpdate
};