import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const PORT = parseInt(process.env.PORT);
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('/api/v1');
  const config = new DocumentBuilder()
    .setTitle('Stealth Services')
    .setDescription('API endpoints to be utilized in the stealth app')
    .setVersion('1.0')
    .addBearerAuth(
      {
        description: 'Please enter token in following format:<JWT>',
        name: 'Authorization',
        bearerFormat: 'Bearer',
        scheme: 'Bearer',
        type: 'http',
        in: 'Header',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(PORT);
  console.info(`APP IS LISTENING ON PORT ${process.env.PORT}`);
  console.info(`SERVER IS RUNNING AT http://localhost:${PORT}`);
  console.info(`ACCESS SWAGGER DOCUMENTATION AT http://localhost:${PORT}/docs`);
}
bootstrap();
