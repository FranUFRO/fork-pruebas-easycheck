import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ⚠️ Workaround SOLO de desarrollo/demo hasta que CU-01 emita JWT real:
  // puebla req.user desde el header `x-user-role` para poder ejercitar los
  // guards (AdminGuard, DirectorOrAdminGuard) con curl/Postman. Es el mismo
  // mecanismo que usan los tests de integración. En producción se reemplaza
  // por un middleware de autenticación real.
  app.use(
    (
      req: { headers: Record<string, unknown>; user?: { role: string } },
      _res: unknown,
      next: () => void,
    ) => {
      const role = req.headers['x-user-role'];
      if (typeof role === 'string') {
        req.user = { role };
      }
      next();
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('EasyCheck API')
    .setDescription('Backend NestJS para EasyCheck UFRO')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
