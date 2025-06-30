import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { Booking, BookingDocument } from '../schemas/booking.schema';
import { CreateBookingDto } from '../dto/create-booking.dto';

@Injectable()
export class BookingService {
  private readonly SERVICE_DURATIONS = {
    'service1': 60, // duration in minutes
    'service2': 90,
    'service3': 120,
  };

  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<BookingDocument> {
    const appointmentDateTime = moment(`${createBookingDto.appointmentDate} ${createBookingDto.appointmentTime}`);
    
    // Validate if the appointment is in the future
    if (appointmentDateTime.isBefore(moment())) {
      throw new BadRequestException('Appointment date must be in the future');
    }

    // Check if the time slot is available
    const isSlotAvailable = await this.isTimeSlotAvailable(
      appointmentDateTime.toDate(),
      createBookingDto.appointmentTime,
      this.SERVICE_DURATIONS[createBookingDto.serviceType],
    );

    if (!isSlotAvailable) {
      throw new BadRequestException('This time slot is not available');
    }

    const booking = new this.bookingModel({
      ...createBookingDto,
      duration: this.SERVICE_DURATIONS[createBookingDto.serviceType],
      reservationCode: uuidv4(),
      paymentStatus: 'pending',
    });

    return booking.save();
  }

  async findByReservationCode(code: string): Promise<BookingDocument | null> {
    return this.bookingModel.findOne({ reservationCode: code }).exec();
  }

  async cancelBooking(reservationCode: string): Promise<BookingDocument> {
    const booking = await this.findByReservationCode(reservationCode);
    
    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    const appointmentDate = moment(booking.appointmentDate);
    if (moment().add(24, 'hours').isAfter(appointmentDate)) {
      throw new BadRequestException('Bookings can only be cancelled 24 hours before the appointment');
    }

    booking.isCancelled = true;
    booking.cancelledAt = new Date();
    return booking.save();
  }

  private async isTimeSlotAvailable(
    date: Date,
    time: string,
    duration: number,
  ): Promise<boolean> {
    const startTime = moment(`${moment(date).format('YYYY-MM-DD')} ${time}`);
    const endTime = moment(startTime).add(duration, 'minutes');

    const conflictingBookings = await this.bookingModel.find({
      appointmentDate: date,
      isCancelled: false,
      $or: [
        {
          appointmentTime: {
            $gte: startTime.format('HH:mm'),
            $lt: endTime.format('HH:mm'),
          },
        },
        {
          $and: [
            { appointmentTime: { $lte: startTime.format('HH:mm') } },
            {
              $expr: {
                $lt: [
                  { $add: [{ $toDate: '$appointmentTime' }, { $multiply: ['$duration', 60000] }] },
                  endTime.toDate(),
                ],
              },
            },
          ],
        },
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
      isCancelled: false,
    }).sort({ appointmentDate: 1, appointmentTime: 1 }).exec();
  }
} 