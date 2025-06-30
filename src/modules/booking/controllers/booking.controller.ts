import { Controller, Post, Body, Get, Param, Delete, Query } from '@nestjs/common';
import { BookingService } from '../services/booking.service';
import { PaymentService } from '../../payment/services/payment.service';
import { NotificationService } from '../../notification/services/notification.service';
import { CreateBookingDto } from '../dto/create-booking.dto';

@Controller('bookings')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly paymentService: PaymentService,
    private readonly notificationService: NotificationService,
  ) {}

  @Post()
  async create(@Body() createBookingDto: CreateBookingDto) {
    // Create booking
    const booking = await this.bookingService.create(createBookingDto);
    
    // Create payment preference
    const paymentPreference = await this.paymentService.createPayment(booking);
    
    // Send confirmation email
    await this.notificationService.sendBookingConfirmation(booking);

    return {
      booking,
      paymentUrl: paymentPreference.init_point,
    };
  }

  @Get('verify-payment/:paymentId')
  async verifyPayment(
    @Param('paymentId') paymentId: string,
    @Query('reservationCode') reservationCode: string,
  ) {
    const paymentDetails = await this.paymentService.verifyPayment(paymentId);
    const booking = await this.bookingService.findByReservationCode(reservationCode);

    if (paymentDetails.status === 'approved') {
      await this.notificationService.sendPaymentConfirmation(booking, paymentDetails);
    }

    return { paymentDetails, booking };
  }

  @Delete(':reservationCode')
  async cancelBooking(@Param('reservationCode') reservationCode: string) {
    return this.bookingService.cancelBooking(reservationCode);
  }

  @Get('admin/daily')
  async getDailyBookings(@Query('date') date: string) {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59);
    return this.bookingService.getBookingsByDateRange(startDate, endDate);
  }

  @Get('admin/weekly')
  async getWeeklyBookings(@Query('startDate') startDate: string) {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return this.bookingService.getBookingsByDateRange(start, end);
  }

  @Get('admin/monthly')
  async getMonthlyBookings(@Query('month') month: string) {
    const start = new Date(month);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    end.setDate(0);
    return this.bookingService.getBookingsByDateRange(start, end);
  }
} 