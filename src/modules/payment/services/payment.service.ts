import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

@Injectable()
export class PaymentService {
  private mercadopago: any;

  constructor(private configService: ConfigService) {
    const client = new MercadoPagoConfig({ 
      accessToken: this.configService.get<string>('mercadopago.accessToken') || '' 
    });
    this.mercadopago = { preference: new Preference(client), payment: new Payment(client) };
  }

  async createPayment(booking: any) {
    const preference = {
      items: [
        {
          title: `Reserva de cita - ${booking.serviceType}`,
          unit_price: this.getServicePrice(booking.serviceType),
          quantity: 1,
        },
      ],
      external_reference: booking.reservationCode,
      back_urls: {
        success: `${process.env.FRONTEND_URL}/payment/success`,
        failure: `${process.env.FRONTEND_URL}/payment/failure`,
        pending: `${process.env.FRONTEND_URL}/payment/pending`,
      },
      auto_return: 'approved',
    };

    const response = await this.mercadopago.preference.create(preference);
    return response;
  }

  private getServicePrice(serviceType: string): number {
    const prices: Record<string, number> = {
      'service1': 100,
      'service2': 150,
      'service3': 200,
    };
    return prices[serviceType] || 100;
  }

  async verifyPayment(paymentId: string) {
    const payment = await this.mercadopago.payment.get({ id: paymentId });
    return payment;
  }
} 