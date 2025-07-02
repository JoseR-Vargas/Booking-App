import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BookingDocument = Booking & Document;

@Schema({ timestamps: true })
export class Booking {
  @Prop({ required: true })
  clientName: string;

  @Prop({ required: true })
  clientId: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  serviceType: string;

  @Prop({ required: true })
  serviceName: string;

  @Prop({ required: true })
  appointmentDate: Date;

  @Prop({ required: true })
  appointmentTime: string;

  @Prop({ required: true })
  duration: number;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, unique: true })
  reservationCode: string;

  @Prop({ required: true, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' })
  status: string;

  @Prop({ required: true, enum: ['pending', 'approved', 'rejected'], default: 'pending' })
  paymentStatus: string;

  @Prop()
  paymentId: string;

  @Prop()
  notes: string;

  @Prop({ default: false })
  isCancelled: boolean;

  @Prop()
  cancelledAt: Date;

  @Prop()
  reminderSent: boolean;

  @Prop()
  completedAt: Date;

  // Timestamps añadidos automáticamente por Mongoose
  createdAt?: Date;
  updatedAt?: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking); 