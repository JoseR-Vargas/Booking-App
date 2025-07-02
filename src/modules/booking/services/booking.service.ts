import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as moment from 'moment-timezone';
import { v4 as uuidv4 } from 'uuid';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Booking, BookingDocument } from '../schemas/booking.schema';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { SERVICES_CONFIG, BUSINESS_CONFIG } from '../../../config/services.config';
import { NotificationService } from '../../notification/services/notification.service';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    private notificationService: NotificationService,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<BookingDocument> {
    const service = SERVICES_CONFIG.find(s => s.id === createBookingDto.serviceType);
    if (!service || !service.isActive) {
      throw new BadRequestException('Servicio no disponible');
    }

    const appointmentDateTime = moment.tz(
      `${createBookingDto.appointmentDate} ${createBookingDto.appointmentTime}`,
      BUSINESS_CONFIG.timezone
    );
    
    // Validar que la cita sea en el futuro
    if (appointmentDateTime.isBefore(moment())) {
      throw new BadRequestException('La fecha de la cita debe ser futura');
    }

    // Validar horarios de trabajo
    if (!this.isWithinWorkingHours(appointmentDateTime)) {
      throw new BadRequestException('La hora seleccionada está fuera del horario de atención');
    }

    // Verificar disponibilidad del horario
    const isSlotAvailable = await this.isTimeSlotAvailable(
      appointmentDateTime.toDate(),
      createBookingDto.appointmentTime,
      service.duration + (service.preparationTime || 0),
    );

    if (!isSlotAvailable) {
      throw new BadRequestException('Este horario no está disponible');
    }

    const booking = new this.bookingModel({
      ...createBookingDto,
      serviceName: service.name,
      duration: service.duration,
      price: service.basePrice,
      reservationCode: this.generateReservationCode(),
      status: 'pending',
      paymentStatus: 'pending',
    });

    return booking.save();
  }

  private generateReservationCode(): string {
    const prefix = 'BC'; // Beauty Center
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  private isWithinWorkingHours(appointmentDateTime: moment.Moment): boolean {
    const dayOfWeek = appointmentDateTime.format('dddd').toLowerCase();
    const workingHours = BUSINESS_CONFIG.workingHours[dayOfWeek];
    
    if (!workingHours) return false;

    const appointmentTime = appointmentDateTime.format('HH:mm');
    const breakStart = BUSINESS_CONFIG.breakTime.start;
    const breakEnd = BUSINESS_CONFIG.breakTime.end;

    // Verificar horario de trabajo
    if (appointmentTime < workingHours.start || appointmentTime > workingHours.end) {
      return false;
    }

    // Verificar que no esté en horario de almuerzo
    if (appointmentTime >= breakStart && appointmentTime < breakEnd) {
      return false;
    }

    return true;
  }

  async getAvailableSlots(date: string, serviceId: string): Promise<string[]> {
    const service = SERVICES_CONFIG.find(s => s.id === serviceId);
    if (!service) {
      throw new BadRequestException('Servicio no encontrado');
    }

    const selectedDate = moment.tz(date, BUSINESS_CONFIG.timezone);
    const dayOfWeek = selectedDate.format('dddd').toLowerCase();
    const workingHours = BUSINESS_CONFIG.workingHours[dayOfWeek];

    if (!workingHours) return [];

    const slots: string[] = [];
    const startTime = moment.tz(`${date} ${workingHours.start}`, BUSINESS_CONFIG.timezone);
    const endTime = moment.tz(`${date} ${workingHours.end}`, BUSINESS_CONFIG.timezone);
    const breakStart = moment.tz(`${date} ${BUSINESS_CONFIG.breakTime.start}`, BUSINESS_CONFIG.timezone);
    const breakEnd = moment.tz(`${date} ${BUSINESS_CONFIG.breakTime.end}`, BUSINESS_CONFIG.timezone);

    const serviceDuration = service.duration + (service.preparationTime || 0);
    let current = startTime.clone();

    while (current.clone().add(serviceDuration, 'minutes').isSameOrBefore(endTime)) {
      const slotTime = current.format('HH:mm');
      
      // Verificar que no esté en horario de almuerzo
      if (current.isBefore(breakStart) || current.isSameOrAfter(breakEnd)) {
        // Verificar disponibilidad
        const isAvailable = await this.isTimeSlotAvailable(
          selectedDate.toDate(),
          slotTime,
          serviceDuration
        );
        
        if (isAvailable) {
          slots.push(slotTime);
        }
      }
      
      current.add(30, 'minutes'); // Intervalos de 30 minutos
    }

    return slots;
  }

  async findByReservationCode(code: string): Promise<BookingDocument | null> {
    return this.bookingModel.findOne({ reservationCode: code }).exec();
  }

  async cancelBooking(reservationCode: string): Promise<BookingDocument> {
    const booking = await this.findByReservationCode(reservationCode);
    
    if (!booking) {
      throw new BadRequestException('Reserva no encontrada');
    }

    if (booking.status === 'cancelled') {
      throw new BadRequestException('Esta reserva ya fue cancelada');
    }

    const appointmentDateTime = moment.tz(
      `${booking.appointmentDate} ${booking.appointmentTime}`,
      BUSINESS_CONFIG.timezone
    );
    
    const deadlineHours = BUSINESS_CONFIG.cancelationDeadlineHours;
    if (moment().add(deadlineHours, 'hours').isAfter(appointmentDateTime)) {
      throw new BadRequestException(`Las reservas solo se pueden cancelar ${deadlineHours} horas antes de la cita`);
    }

    booking.status = 'cancelled';
    booking.isCancelled = true;
    booking.cancelledAt = new Date();
    
    const savedBooking = await booking.save();
    
    // Notificar cancelación
    await this.notificationService.sendCancellationNotification(booking);
    
    return savedBooking;
  }

  // Cron job para enviar recordatorios automáticos
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendDailyReminders() {
    const tomorrow = moment().add(1, 'day').startOf('day').toDate();
    const dayAfter = moment().add(2, 'day').startOf('day').toDate();

    const upcomingBookings = await this.bookingModel.find({
      appointmentDate: { $gte: tomorrow, $lt: dayAfter },
      status: 'confirmed',
      reminderSent: { $ne: true }
    });

    for (const booking of upcomingBookings) {
      await this.notificationService.sendAppointmentReminder(booking);
      booking.reminderSent = true;
      await booking.save();
    }
  }

  private async isTimeSlotAvailable(
    date: Date,
    time: string,
    duration: number,
  ): Promise<boolean> {
    const startTime = moment.tz(`${moment(date).format('YYYY-MM-DD')} ${time}`, BUSINESS_CONFIG.timezone);
    const endTime = moment(startTime).add(duration, 'minutes');

    const conflictingBookings = await this.bookingModel.find({
      appointmentDate: date,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          $and: [
            { appointmentTime: { $lte: time } },
            {
              $expr: {
                $gte: [
                  { $dateToString: { 
                    date: { $add: [
                      { $dateFromString: { 
                        dateString: { $concat: [
                          { $dateToString: { date: '$appointmentDate', format: '%Y-%m-%d' }},
                          'T',
                          '$appointmentTime'
                        ]}
                      }},
                      { $multiply: ['$duration', 60000] }
                    ]},
                    format: '%H:%M'
                  }},
                  time
                ]
              }
            }
          ]
        },
        {
          $and: [
            { appointmentTime: { $gte: time } },
            { appointmentTime: { $lt: endTime.format('HH:mm') } }
          ]
        }
      ],
    });

    return conflictingBookings.length === 0;
  }

  async getBookingsByDateRange(startDate: Date, endDate: Date): Promise<BookingDocument[]> {
    return this.bookingModel.find({
      appointmentDate: {
        $gte: startDate,
        $lte: endDate,
      },
      status: { $ne: 'cancelled' }
    }).sort({ appointmentDate: 1, appointmentTime: 1 }).exec();
  }

  async getDashboardStats(startDate?: Date, endDate?: Date) {
    const dateFilter = startDate && endDate ? {
      appointmentDate: { $gte: startDate, $lte: endDate }
    } : {};

    const [totalBookings, confirmedBookings, cancelledBookings, revenue] = await Promise.all([
      this.bookingModel.countDocuments(dateFilter),
      this.bookingModel.countDocuments({ ...dateFilter, status: 'confirmed' }),
      this.bookingModel.countDocuments({ ...dateFilter, status: 'cancelled' }),
      this.bookingModel.aggregate([
        { $match: { ...dateFilter, paymentStatus: 'approved' } },
        { $group: { _id: null, total: { $sum: '$price' } } }
      ])
    ]);

    return {
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      revenue: revenue[0]?.total || 0,
      conversionRate: totalBookings > 0 ? (confirmedBookings / totalBookings * 100).toFixed(2) : 0
    };
  }
} 