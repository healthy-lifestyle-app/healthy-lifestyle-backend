import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { envSchema } from './config/env.schema';

async function bootstrap() {
  // env validate (fail fast)
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error(
      'Invalid environment variables:',
      parsed.error.flatten().fieldErrors,
    );
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);

  // Graceful shutdown (Docker, k8s vs)
  app.enableShutdownHooks();

  // Eğer mobile/web farklı origin'den gelecekse şimdiden açmak faydalı
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Versiyonlama yerine şimdilik standart prefix
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new PrismaExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Healthy Lifestyle API')
    .setDescription('Backend API')
    .setVersion('0.1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);
  const port = parsed.data.PORT;
  await app.listen(port);

  console.log(
    `API running on http://localhost:${port}/api | Swagger: /api/docs`,
  );
}

bootstrap().catch((err) => {
  console.error('Bootstrap error:', err);
  process.exit(1);
});
