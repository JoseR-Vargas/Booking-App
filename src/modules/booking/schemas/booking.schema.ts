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
  serviceType: string;

  @Prop({ required: true })
  appointmentDate: Date;

  @Prop({ required: true })
  appointmentTime: string;

  @Prop({ required: true })
  duration: number;

  @Prop({ required: true, unique: true })
  reservationCode: string;

  @Prop({ required: true })
  paymentStatus: string;

  @Prop()
  paymentId: string;

  @Prop({ default: false })
  isCancelled: boolean;

  @Prop()
  cancelledAt: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking); 