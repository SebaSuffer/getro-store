// Utilidad para enviar emails
// Nota: Esta implementación usa un servicio de email genérico
// Puedes usar servicios como Resend, SendGrid, Nodemailer, etc.

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    // Opción 1: Usar Resend (recomendado)
    // Necesitas instalar: npm install resend
    // Y configurar RESEND_API_KEY en tus variables de entorno
    
    const resendApiKey = import.meta.env.RESEND_API_KEY;
    const fromEmail = import.meta.env.EMAIL_FROM || 'noreply@gotrachile.com';
    
    if (resendApiKey) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text || options.html.replace(/<[^>]*>/g, ''),
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Error sending email via Resend:', error);
        return false;
      }

      return true;
    }

    // Opción 2: Usar SendGrid
    // Necesitas instalar: npm install @sendgrid/mail
    // Y configurar SENDGRID_API_KEY en tus variables de entorno
    
    const sendgridApiKey = import.meta.env.SENDGRID_API_KEY;
    
    if (sendgridApiKey) {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sendgridApiKey}`,
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: options.to }],
          }],
          from: { email: fromEmail },
          subject: options.subject,
          content: [
            {
              type: 'text/html',
              value: options.html,
            },
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Error sending email via SendGrid:', error);
        return false;
      }

      return true;
    }

    // Si no hay servicio de email configurado, solo loguear
    console.log('Email service not configured. Email would be sent to:', options.to);
    console.log('Subject:', options.subject);
    console.log('Body:', options.html);
    
    return false;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export const sendOrderConfirmationEmail = async (
  customerEmail: string,
  customerName: string,
  orderId: string,
  orderItems: any[],
  totalAmount: number
): Promise<boolean> => {
  const itemsHtml = orderItems.map((item: any) => {
    const itemPrice = item.product.price + (item.variation?.price_modifier || 0);
    const totalItemPrice = itemPrice * item.quantity;
    const variationInfo = item.variation 
      ? `<p style="color: #666; font-size: 12px; margin-top: 4px;">${[item.variation.brand, item.variation.thickness, item.variation.length].filter(Boolean).join(', ')}</p>`
      : '';
    
    return `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
          <p style="margin: 0; font-weight: 500; color: #000;">${item.product.name}</p>
          ${variationInfo}
          <p style="margin: 4px 0 0 0; color: #999; font-size: 12px;">Cantidad: ${item.quantity}</p>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right;">
          <p style="margin: 0; font-weight: 500; color: #000;">$${totalItemPrice.toLocaleString('es-CL')} CLP</p>
        </td>
      </tr>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmación de Orden - GOTRA</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #000; font-size: 24px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase;">GOTRA</h1>
        </div>
        
        <div style="background-color: #fff; border: 1px solid #ddd; padding: 30px;">
          <h2 style="color: #000; font-size: 20px; font-weight: 300; margin-bottom: 20px;">
            ¡Gracias por tu compra, ${customerName}!
          </h2>
          
          <p style="color: #666; margin-bottom: 20px;">
            Hemos recibido tu orden y tu pago fue procesado exitosamente.
          </p>
          
          <div style="background-color: #f9f9f9; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #999;">
              Número de Orden
            </p>
            <p style="margin: 0; font-size: 18px; font-weight: 300; color: #000;">
              ${orderId}
            </p>
          </div>
          
          <h3 style="color: #000; font-size: 16px; font-weight: 500; margin: 30px 0 15px 0;">
            Resumen de Compra
          </h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            ${itemsHtml}
            <tr>
              <td style="padding: 20px 0 0 0; border-top: 2px solid #000;">
                <p style="margin: 0; font-weight: 600; color: #000;">Total</p>
              </td>
              <td style="padding: 20px 0 0 0; border-top: 2px solid #000; text-align: right;">
                <p style="margin: 0; font-size: 20px; font-weight: 700; color: #000;">
                  $${totalAmount.toLocaleString('es-CL')} CLP
                </p>
              </td>
            </tr>
          </table>
          
          <p style="color: #666; margin-top: 30px; font-size: 14px;">
            Te notificaremos cuando tu pedido sea enviado. Si tienes alguna pregunta, no dudes en contactarnos.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} GOTRA. Todos los derechos reservados.
          </p>
        </div>
      </body>
    </html>
  `;

  return await sendEmail({
    to: customerEmail,
    subject: `Confirmación de Orden #${orderId} - GOTRA`,
    html,
  });
};

