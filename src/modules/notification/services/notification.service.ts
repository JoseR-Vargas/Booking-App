import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get('email.user'),
        pass: this.configService.get('email.password'),
      },
    });
  }

  async sendBookingConfirmation(booking: any) {
    const appointmentDate = new Date(booking.appointmentDate).toLocaleDateString('es-CO');
    
    const mailOptions = {
      from: this.configService.get('email.user'),
      to: booking.email,
      subject: `✅ Reserva Confirmada - ${booking.serviceName}`,
      html: this.generateBookingConfirmationTemplate(booking, appointmentDate),
    };

    await this.transporter.sendMail(mailOptions);
    
    // Enviar SMS de confirmación
    await this.sendSMS(booking.phone, 
      `¡Hola ${booking.clientName}! Tu reserva para ${booking.serviceName} el ${appointmentDate} a las ${booking.appointmentTime} ha sido confirmada. Código: ${booking.reservationCode}`
    );
  }

  async sendPaymentConfirmation(booking: any, paymentDetails: any) {
    const appointmentDate = new Date(booking.appointmentDate).toLocaleDateString('es-CO');
    
    const mailOptions = {
      from: this.configService.get('email.user'),
      to: booking.email,
      subject: `💳 Pago Confirmado - Beauty Center`,
      html: this.generatePaymentConfirmationTemplate(booking, paymentDetails, appointmentDate),
      attachments: [
        {
          filename: `comprobante-${booking.reservationCode}.pdf`,
          content: await this.generatePaymentReceipt(booking, paymentDetails),
        },
      ],
    };

    await this.transporter.sendMail(mailOptions);
    
    // SMS de agradecimiento por el pago
    await this.sendSMS(booking.phone, 
      `¡Gracias ${booking.clientName}! Tu pago de $${paymentDetails.transaction_amount.toLocaleString()} ha sido procesado. Te esperamos el ${appointmentDate} a las ${booking.appointmentTime}. Beauty Center 💅✨`
    );
  }

  async sendCancellationNotification(booking: any) {
    const appointmentDate = new Date(booking.appointmentDate).toLocaleDateString('es-CO');
    
    const mailOptions = {
      from: this.configService.get('email.user'),
      to: booking.email,
      subject: `❌ Reserva Cancelada - Beauty Center`,
      html: this.generateCancellationTemplate(booking, appointmentDate),
    };

    await this.transporter.sendMail(mailOptions);
    
    await this.sendSMS(booking.phone, 
      `Hola ${booking.clientName}, tu reserva para ${booking.serviceName} del ${appointmentDate} ha sido cancelada. ¡Esperamos verte pronto! Beauty Center`
    );
  }

  async sendAppointmentReminder(booking: any) {
    const appointmentDate = new Date(booking.appointmentDate).toLocaleDateString('es-CO');
    
    const mailOptions = {
      from: this.configService.get('email.user'),
      to: booking.email,
      subject: `⏰ Recordatorio de Cita - Mañana`,
      html: this.generateReminderTemplate(booking, appointmentDate),
    };

    await this.transporter.sendMail(mailOptions);
    
    await this.sendSMS(booking.phone, 
      `¡Hola ${booking.clientName}! Te recordamos tu cita mañana ${appointmentDate} a las ${booking.appointmentTime} para ${booking.serviceName}. ¡Te esperamos! Beauty Center 💄`
    );
  }

  private async sendSMS(phone: string, message: string) {
    try {
      // Integración con proveedores SMS (Twilio, AWS SNS, etc.)
      // Por ahora simulamos el envío
      console.log(`📱 SMS enviado a ${phone}: ${message}`);
      
      // Aquí puedes integrar con Twilio u otro proveedor:
      /*
      const client = twilio(accountSid, authToken);
      await client.messages.create({
        body: message,
        from: '+1234567890',
        to: phone
      });
      */
    } catch (error) {
      console.error('Error enviando SMS:', error);
    }
  }

  private generateBookingConfirmationTemplate(booking: any, appointmentDate: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .highlight { background: #fff3cd; padding: 10px; border-radius: 5px; border: 1px solid #ffeaa7; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✨ Beauty Center ✨</h1>
              <h2>¡Reserva Confirmada!</h2>
            </div>
            <div class="content">
              <p>Estimad@ <strong>${booking.clientName}</strong>,</p>
              <p>Nos complace confirmar que tu reserva ha sido registrada exitosamente.</p>
              
              <div class="booking-details">
                <h3>📋 Detalles de tu Reserva</h3>
                <p><strong>🎯 Servicio:</strong> ${booking.serviceName}</p>
                <p><strong>📅 Fecha:</strong> ${appointmentDate}</p>
                <p><strong>🕐 Hora:</strong> ${booking.appointmentTime}</p>
                <p><strong>⏱️ Duración:</strong> ${booking.duration} minutos</p>
                <p><strong>💰 Precio:</strong> $${booking.price.toLocaleString()}</p>
                <div class="highlight">
                  <p><strong>🔢 Código de Reserva:</strong> <span style="font-size: 18px; font-weight: bold;">${booking.reservationCode}</span></p>
                </div>
              </div>

              <p><strong>⚠️ Importante:</strong></p>
              <ul>
                <li>Puedes cancelar tu reserva hasta 24 horas antes de la cita</li>
                <li>Te enviaremos un recordatorio un día antes</li>
                <li>Llega 10 minutos antes de tu cita</li>
              </ul>

              <div class="footer">
                <p>💌 Gracias por elegirnos</p>
                <p>📞 Contacto: +57 300 123 4567 | 💧 info@beautycenter.com</p>
                <p>📍 Dirección: Calle 123 #45-67, Ciudad</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generatePaymentConfirmationTemplate(booking: any, paymentDetails: any, appointmentDate: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #00b894 0%, #00cec9 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .payment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #00b894; }
            .success-badge { background: #d4edda; color: #155724; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; border: 1px solid #c3e6cb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💳 Beauty Center</h1>
              <h2>¡Pago Confirmado!</h2>
            </div>
            <div class="content">
              <div class="success-badge">
                <h3>✅ Tu pago ha sido procesado exitosamente</h3>
              </div>
              
              <p>Estimad@ <strong>${booking.clientName}</strong>,</p>
              <p>Tu pago se ha procesado correctamente. ¡Ya tienes tu cita reservada!</p>
              
              <div class="payment-details">
                <h3>💰 Detalles del Pago</h3>
                <p><strong>💳 ID de Pago:</strong> ${paymentDetails.id}</p>
                <p><strong>💵 Monto:</strong> $${paymentDetails.transaction_amount.toLocaleString()}</p>
                <p><strong>✅ Estado:</strong> ${paymentDetails.status === 'approved' ? 'Aprobado' : paymentDetails.status}</p>
                <p><strong>📅 Fecha de Pago:</strong> ${new Date().toLocaleDateString('es-CO')}</p>
                
                <hr style="margin: 20px 0;">
                
                <h3>📋 Tu Cita</h3>
                <p><strong>🎯 Servicio:</strong> ${booking.serviceName}</p>
                <p><strong>📅 Fecha:</strong> ${appointmentDate}</p>
                <p><strong>🕐 Hora:</strong> ${booking.appointmentTime}</p>
                <p><strong>🔢 Código:</strong> ${booking.reservationCode}</p>
              </div>

              <p style="text-align: center; margin: 30px 0;">
                <a href="${this.configService.get('frontend.url')}/booking/${booking.reservationCode}" 
                   style="display: inline-block; padding: 15px 30px; background: #00b894; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  📄 Descargar Comprobante
                </a>
              </p>

              <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
                <p>¡Gracias por tu confianza! 💅✨</p>
                <p>📞 +57 300 123 4567 | 💧 info@beautycenter.com</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateCancellationTemplate(booking: any, appointmentDate: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #e17055 0%, #fdcb6e 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Beauty Center</h1>
              <h2>Reserva Cancelada</h2>
            </div>
            <div class="content">
              <p>Estimad@ <strong>${booking.clientName}</strong>,</p>
              <p>Tu reserva para <strong>${booking.serviceName}</strong> programada para el <strong>${appointmentDate}</strong> a las <strong>${booking.appointmentTime}</strong> ha sido cancelada exitosamente.</p>
              
              <p>Esperamos verte pronto en Beauty Center. ¡Estaremos encantados de atenderte!</p>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${this.configService.get('frontend.url')}" 
                   style="display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  🗓️ Hacer Nueva Reserva
                </a>
              </div>
              
              <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
                <p>📞 +57 300 123 4567 | 💧 info@beautycenter.com</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateReminderTemplate(booking: any, appointmentDate: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .reminder-box { background: #fff; padding: 20px; border-radius: 8px; border-left: 4px solid #a29bfe; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Beauty Center</h1>
              <h2>Recordatorio de Cita</h2>
            </div>
            <div class="content">
              <p>¡Hola <strong>${booking.clientName}</strong>!</p>
              
              <div class="reminder-box">
                <h3>📅 Tu cita es MAÑANA</h3>
                <p><strong>🎯 Servicio:</strong> ${booking.serviceName}</p>
                <p><strong>📅 Fecha:</strong> ${appointmentDate}</p>
                <p><strong>🕐 Hora:</strong> ${booking.appointmentTime}</p>
                <p><strong>🔢 Código:</strong> ${booking.reservationCode}</p>
              </div>

              <p><strong>💡 Recomendaciones:</strong></p>
              <ul>
                <li>Llega 10 minutos antes de tu cita</li>
                <li>Trae ropa cómoda</li>
                <li>Si necesitas reprogramar, házlo con 24h de anticipación</li>
              </ul>

              <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
                <p>¡Te esperamos! 💅✨</p>
                <p>📞 +57 300 123 4567 | 💧 info@beautycenter.com</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private async generatePaymentReceipt(booking: any, paymentDetails: any): Promise<Buffer> {
    // Aquí integrarías una librería como PDFKit o Puppeteer para generar el PDF
    // Por ahora retornamos un buffer básico
    
    const receiptContent = `
      BEAUTY CENTER
      Comprobante de Pago
      
      Fecha: ${new Date().toLocaleDateString('es-CO')}
      
      Cliente: ${booking.clientName}
      Cédula: ${booking.clientId}
      Email: ${booking.email}
      Teléfono: ${booking.phone}
      
      Servicio: ${booking.serviceName}
      Fecha de Cita: ${new Date(booking.appointmentDate).toLocaleDateString('es-CO')}
      Hora: ${booking.appointmentTime}
      Duración: ${booking.duration} minutos
      
      Código de Reserva: ${booking.reservationCode}
      ID de Pago: ${paymentDetails.id}
      Monto: $${paymentDetails.transaction_amount.toLocaleString()}
      Estado: ${paymentDetails.status}
      
      ¡Gracias por elegirnos!
      
      Contacto: +57 300 123 4567
      Email: info@beautycenter.com
      Web: www.beautycenter.com
    `;
    
    return Buffer.from(receiptContent, 'utf-8');
  }
} 