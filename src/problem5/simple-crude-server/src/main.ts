import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

export async function createApp(globalPrefix: string) {
  const app = await NestFactory.create(AppModule, {
    logger: console,
  });
  app.setGlobalPrefix(globalPrefix);
  return app;
}

async function bootstrap() {
  const appGlobalPrefix = 'api/v1/blog-service';
  const app = await createApp(appGlobalPrefix);
  const port = process.env.PORT || 3000;
  const config = new DocumentBuilder()
    .setTitle('Blog Server')
    .setDescription('A simple blog server')
    .setVersion('1.0')
    .addTag('blog-server')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(port, () => {
    Logger.log(
      `Swagger UI at http://localhost:${port}/${appGlobalPrefix}/swagger/`,
    );
  });
}
bootstrap();
