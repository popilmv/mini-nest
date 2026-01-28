import 'reflect-metadata';
import { NestFactory } from './mini/nest-factory';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  console.log('Listening on http://localhost:3000');
}
bootstrap();

