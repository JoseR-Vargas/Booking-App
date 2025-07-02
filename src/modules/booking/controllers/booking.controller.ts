import { Controller, Post, Body, Get, Param, Delete, Query, HttpException, HttpStatus, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { BookingService } from '../services/booking.service';
import { PaymentService } from '../../payment/services/payment.service';
import { NotificationService } from '../../notification/services/notification.service';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { SERVICES_CONFIG, BUSINESS_CONFIG } from '../../../config/services.config';

@ApiTags('bookings')
@Controller('bookings')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly paymentService: PaymentService,
    private readonly notificationService: NotificationService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear nueva reserva' })
  @ApiResponse({ status: 201, description: 'Reserva creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o horario no disponible' })
  async create(@Body() createBookingDto: CreateBookingDto) {
    try {
      // Crear la reserva
      const booking = await this.bookingService.create(createBookingDto);
      
      // Crear preferencia de pago en MercadoPago
      const paymentPreference = await this.paymentService.createPayment(booking);
      
      // Enviar email de confirmación
      await this.notificationService.sendBookingConfirmation(booking);

      return {
        success: true,
        message: 'Reserva creada exitosamente',
        data: {
          booking: {
            reservationCode: booking.reservationCode,
            serviceName: booking.serviceName,
            appointmentDate: booking.appointmentDate,
            appointmentTime: booking.appointmentTime,
            price: booking.price,
            status: booking.status
          },
          paymentUrl: paymentPreference.init_point,
        }
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al crear la reserva',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get('services')
  @ApiOperation({ summary: 'Obtener servicios disponibles' })
  @ApiResponse({ status: 200, description: 'Lista de servicios disponibles' })
  async getServices() {
    const activeServices = SERVICES_CONFIG.filter(service => service.isActive);
    return {
      success: true,
      data: activeServices.map(service => ({
        id: service.id,
        name: service.name,
        description: service.description,
        duration: service.duration,
        price: service.basePrice,
        category: service.category,
        requirements: service.requirements
      }))
    };
  }

  @Get('available-slots/:serviceId/:date')
  @ApiOperation({ summary: 'Obtener horarios disponibles para un servicio y fecha' })
  @ApiResponse({ status: 200, description: 'Lista de horarios disponibles' })
  async getAvailableSlots(
    @Param('serviceId') serviceId: string,
    @Param('date') date: string
  ) {
    try {
      const slots = await this.bookingService.getAvailableSlots(date, serviceId);
      return {
        success: true,
        data: {
          date,
          serviceId,
          availableSlots: slots,
          businessHours: BUSINESS_CONFIG.workingHours
        }
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al obtener horarios disponibles',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get('verify-payment/:paymentId')
  @ApiOperation({ summary: 'Verificar estado de pago' })
  async verifyPayment(
    @Param('paymentId') paymentId: string,
    @Query('reservationCode') reservationCode: string,
  ) {
    try {
      const paymentDetails = await this.paymentService.verifyPayment(paymentId);
      const booking = await this.bookingService.findByReservationCode(reservationCode);

      if (!booking) {
        throw new HttpException('Reserva no encontrada', HttpStatus.NOT_FOUND);
      }

      if (paymentDetails.status === 'approved') {
        // Actualizar estado de la reserva
        booking.paymentStatus = 'approved';
        booking.status = 'confirmed';
        booking.paymentId = paymentId;
        await booking.save();

        // Enviar confirmación de pago
        await this.notificationService.sendPaymentConfirmation(booking, paymentDetails);
      }

      return {
        success: true,
        data: {
          payment: {
            id: paymentDetails.id,
            status: paymentDetails.status,
            amount: paymentDetails.transaction_amount
          },
          booking: {
            reservationCode: booking.reservationCode,
            status: booking.status,
            paymentStatus: booking.paymentStatus
          }
        }
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al verificar el pago',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get('booking/:reservationCode')
  @ApiOperation({ summary: 'Obtener detalles de reserva por código' })
  async getBookingByCode(@Param('reservationCode') reservationCode: string) {
    try {
      const booking = await this.bookingService.findByReservationCode(reservationCode);
      
      if (!booking) {
        throw new HttpException('Reserva no encontrada', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        data: {
          reservationCode: booking.reservationCode,
          clientName: booking.clientName,
          clientId: booking.clientId,
          email: booking.email,
          phone: booking.phone,
          serviceName: booking.serviceName,
          appointmentDate: booking.appointmentDate,
          appointmentTime: booking.appointmentTime,
          duration: booking.duration,
          price: booking.price,
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          notes: booking.notes,
          createdAt: booking.createdAt
        }
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al obtener la reserva',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Delete('cancel/:reservationCode')
  @ApiOperation({ summary: 'Cancelar reserva' })
  @ApiResponse({ status: 200, description: 'Reserva cancelada exitosamente' })
  @ApiResponse({ status: 400, description: 'No se puede cancelar la reserva' })
  async cancelBooking(@Param('reservationCode') reservationCode: string) {
    try {
      const cancelledBooking = await this.bookingService.cancelBooking(reservationCode);
      
      return {
        success: true,
        message: 'Reserva cancelada exitosamente',
        data: {
          reservationCode: cancelledBooking.reservationCode,
          status: cancelledBooking.status,
          cancelledAt: cancelledBooking.cancelledAt
        }
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al cancelar la reserva',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  // ENDPOINTS DE ADMINISTRACIÓN

  @Get('admin/dashboard')
  @ApiOperation({ summary: 'Estadísticas del dashboard admin' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Fecha de inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Fecha de fin (YYYY-MM-DD)' })
  async getDashboardStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    try {
      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;
      
      const stats = await this.bookingService.getDashboardStats(start, end);
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      throw new HttpException(
        'Error al obtener estadísticas',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('admin/daily')
  @ApiOperation({ summary: 'Reservas del día para admin' })
  @ApiQuery({ name: 'date', required: false, description: 'Fecha específica (YYYY-MM-DD)' })
  async getDailyBookings(@Query('date') date?: string) {
    try {
      const selectedDate = date ? new Date(date) : new Date();
      const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));
      
      const bookings = await this.bookingService.getBookingsByDateRange(startOfDay, endOfDay);
      
      return {
        success: true,
        data: {
          date: startOfDay.toISOString().split('T')[0],
          totalBookings: bookings.length,
          bookings: bookings.map(booking => ({
            reservationCode: booking.reservationCode,
            clientName: booking.clientName,
            serviceName: booking.serviceName,
            appointmentTime: booking.appointmentTime,
            duration: booking.duration,
            price: booking.price,
            status: booking.status,
            paymentStatus: booking.paymentStatus,
            phone: booking.phone
          }))
        }
      };
    } catch (error) {
      throw new HttpException(
        'Error al obtener reservas del día',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('admin/weekly')
  @ApiOperation({ summary: 'Reservas de la semana para admin' })
  @ApiQuery({ name: 'week', required: false, description: 'Fecha de inicio de semana (YYYY-MM-DD)' })
  async getWeeklyBookings(@Query('week') week?: string) {
    try {
      const startOfWeek = week ? new Date(week) : new Date();
      if (!week) {
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
      }
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const bookings = await this.bookingService.getBookingsByDateRange(startOfWeek, endOfWeek);
      
      return {
        success: true,
        data: {
          weekStart: startOfWeek.toISOString().split('T')[0],
          weekEnd: endOfWeek.toISOString().split('T')[0],
          totalBookings: bookings.length,
          bookings: bookings
        }
      };
    } catch (error) {
      throw new HttpException(
        'Error al obtener reservas de la semana',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('admin/monthly')
  @ApiOperation({ summary: 'Reservas del mes para admin' })
  @ApiQuery({ name: 'month', required: false, description: 'Mes en formato YYYY-MM' })
  async getMonthlyBookings(@Query('month') month?: string) {
    try {
      const startOfMonth = month ? new Date(`${month}-01`) : new Date();
      if (!month) {
        startOfMonth.setDate(1);
      }
      
      const endOfMonth = new Date(startOfMonth);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);
      endOfMonth.setHours(23, 59, 59, 999);

      const bookings = await this.bookingService.getBookingsByDateRange(startOfMonth, endOfMonth);
      
      return {
        success: true,
        data: {
          month: startOfMonth.toISOString().slice(0, 7),
          totalBookings: bookings.length,
          bookings: bookings
        }
      };
    } catch (error) {
      throw new HttpException(
        'Error al obtener reservas del mes',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Patch('admin/complete/:reservationCode')
  @ApiOperation({ summary: 'Marcar reserva como completada' })
  async completeBooking(@Param('reservationCode') reservationCode: string) {
    try {
      const booking = await this.bookingService.findByReservationCode(reservationCode);
      
      if (!booking) {
        throw new HttpException('Reserva no encontrada', HttpStatus.NOT_FOUND);
      }

      booking.status = 'completed';
      booking.completedAt = new Date();
      await booking.save();

      return {
        success: true,
        message: 'Reserva marcada como completada',
        data: {
          reservationCode: booking.reservationCode,
          status: booking.status,
          completedAt: booking.completedAt
        }
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al completar la reserva',
        HttpStatus.BAD_REQUEST
      );
    }
  }
} 