// =============================================================================
// src/auth/auth.module.ts  -  Modulo de autenticacao
// =============================================================================
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // le variaveis do .env
import { APP_GUARD } from '@nestjs/core'; // "token especial" para registrar Guard GLOBAL
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [
    // Configura o JwtService (usado para assinar e verificar tokens).
    // registerAsync = a configuracao e montada DEPOIS do .env ser carregado
    // (com register() simples o JWT_SECRET poderia ainda estar "undefined").
    JwtModule.registerAsync({
      global: true, // JwtService fica disponivel em todo o app
      inject: [ConfigService], // pede ao Nest o ConfigService...
      useFactory: (config: ConfigService) => ({
        // ...e usa o JWT_SECRET do .env
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' }, // token vale 1 hora
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    // ESTA LINHA torna o Guard GLOBAL: ele passa a rodar em TODAS as rotas de
    // TODOS os modulos. Ninguem esquece de proteger uma rota nova.
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
})
export class AuthModule {}
