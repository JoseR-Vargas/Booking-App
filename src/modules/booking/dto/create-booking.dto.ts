import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class CreateBookingDto {
  @IsNotEmpty()
  @IsString()
  clientName: string;

  @IsNotEmpty()
  @IsString()
  clientId: string;

  @IsNotEmpty()
  @IsString()
  serviceType: string;

  @IsNotEmpty()
  @IsDateString()
  appointmentDate: string;

  @IsNotEmpty()
  @IsString()
  appointmentTime: string;
} 