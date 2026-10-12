// =============================================================================
// src/main.ts  -  PONTO DE ENTRADA (equivalente ao seu server.js / app.js)
// =============================================================================
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  // Cria a aplicacao Nest (por baixo dos panos e um app Express).
  // Equivale a:  const app = express()
  const app = await NestFactory.create(AppModule);

  // Pipe GLOBAL de validacao: aplica as regras dos DTOs (class-validator)
  // em TODAS as rotas.
  //   whitelist: true -> campos que NAO existem no DTO sao descartados
  //                      (ex.: ninguem consegue enviar "id" ou "role" escondido)
  //   transform: true -> converte o body para a classe do DTO (e tipos simples)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Libera CORS (necessario se um frontend em outra porta, como o Vite
  // em localhost:5173, for consumir a API). Equivale a app.use(cors()).
  app.enableCors();

  // Sobe o servidor. PORT vem do .env (ConfigModule ja o carregou).
  // Equivale a app.listen(PORT).
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
