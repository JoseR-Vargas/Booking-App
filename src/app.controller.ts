import { Controller, Get, Post, Body, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';
import { Response } from 'express';
import { join } from 'path';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  getHome(@Res() res: Response): void {
    res.sendFile(join(process.cwd(), 'public', 'index.html'));
  }

  @Get('admin')
  getAdmin(@Res() res: Response): void {
    res.sendFile(join(process.cwd(), 'public', 'admin.html'));
  }

  @Get('config')
  getConfig() {
    return {
      success: true,
      data: {
        mercadopago: {
          publicKey: this.configService.get('mercadopago.publicKey'),
        },
        api: {
          baseUrl: this.configService.get('frontend.url'),
        },
      },
    };
  }

  @Post('api/logs')
  async saveFrontendLog(@Body() logData: any) {
    try {
      // Aquí puedes guardar los logs en base de datos, archivo, o servicio de logging
      console.log('🔍 Frontend Log:', {
        timestamp: logData.timestamp,
        level: logData.level,
        message: logData.message,
        url: logData.url,
        data: logData.data
      });
      
      // Opcionalmente, guardar en base de datos
      // await this.logService.save(logData);
      
      return {
        success: true,
        message: 'Log guardado exitosamente'
      };
    } catch (error) {
      console.error('Error guardando log del frontend:', error);
      return {
        success: false,
        message: 'Error guardando log'
      };
    }
  }
}
