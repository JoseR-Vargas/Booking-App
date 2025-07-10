import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BookingService } from './modules/booking/services/booking.service';
import { PaymentService } from './modules/payment/services/payment.service';
import { NotificationService } from './modules/notification/services/notification.service';
import { BookingController } from './modules/booking/controllers/booking.controller';
import { Booking, BookingSchema } from './modules/booking/schemas/booking.schema';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api*', '/bookings*', '/health*', '/health'],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
    ]),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController, BookingController],
  providers: [
    AppService,
    BookingService,
    PaymentService,
    NotificationService,
  ],
})
export class AppModule {}
