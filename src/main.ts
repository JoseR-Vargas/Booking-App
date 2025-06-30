import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configuración de CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Configuración de validación global
  app.useGlobalPipes(new ValidationPipe());

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Reserva de Citas')
    .setDescription('API para sistema de reserva de citas')
    .setVersion('1.0')
    .addTag('bookings')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || '3000';
  await app.listen(port);
  console.log(`🚀 Servidor corriendo en el puerto ${port}`);
  console.log(`📚 Documentación de la API disponible en http://localhost:${port}/api`);
}
bootstrap();
