import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 💡 これを必ず追加！
  // これがないと Angular からのデータリクエストがブロックされます
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
