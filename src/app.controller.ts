import { Controller, Get, Res } from '@nestjs/common';
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
}
