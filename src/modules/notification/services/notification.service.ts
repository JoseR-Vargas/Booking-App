import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationService {
  private transporter: any;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('email.host'),
      port: this.configService.get('email.port'),
      secure: false,
      auth: {
        user: this.configService.get('email.user'),
        pass: this.configService.get('email.pass'),
      },
    });
  }

  async sendBookingConfirmation(booking: any) {
    const mailOptions = {
      from: this.configService.get('email.user'),
      to: booking.email,
      subject: 'Confirmación de Reserva',
      html: `
        <h1>Confirmación de Reserva</h1>
        <p>Estimado/a ${booking.clientName},</p>
        <p>Su reserva ha sido confirmada con éxito.</p>
        <p>Detalles de la reserva:</p>
        <ul>
          <li>Código de reserva: ${booking.reservationCode}</li>
          <li>Servicio: ${booking.serviceType}</li>
          <li>Fecha: ${booking.appointmentDate}</li>
          <li>Hora: ${booking.appointmentTime}</li>
        </ul>
        <p>Puede cancelar su reserva hasta 24 horas antes de la cita.</p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendPaymentConfirmation(booking: any, paymentDetails: any) {
    const mailOptions = {
      from: this.configService.get('email.user'),
      to: booking.email,
      subject: 'Confirmación de Pago',
      html: `
        <h1>Confirmación de Pago</h1>
        <p>Estimado/a ${booking.clientName},</p>
        <p>Su pago ha sido procesado con éxito.</p>
        <p>Detalles del pago:</p>
        <ul>
          <li>ID de pago: ${paymentDetails.id}</li>
          <li>Monto: ${paymentDetails.transaction_amount}</li>
          <li>Estado: ${paymentDetails.status}</li>
        </ul>
        <p>Adjunto encontrará su comprobante de pago.</p>
      `,
      attachments: [
        {
          filename: 'comprobante.pdf',
          content: this.generatePaymentReceipt(booking, paymentDetails),
        },
      ],
    };

    await this.transporter.sendMail(mailOptions);
  }

  private generatePaymentReceipt(booking: any, paymentDetails: any): Buffer {
    // Here you would implement the PDF generation logic
    // For now, we'll return a simple buffer
    return Buffer.from('Receipt content');
  }
} 