// =============================================================================
// src/auth/auth.controller.ts  -  ROTAS de autenticacao
// =============================================================================
// Controller = define URLs e metodos HTTP. Seria o seu "routes + controllers"
// do Express juntos, mas por decorators:
//   Express: router.post('/auth/login', (req, res) => {...})
//   Nest:    @Controller('auth') + @Post('login')

import {
  Body, // pega req.body  (ja validado pelo DTO)
  Controller, // marca a classe como controller e define o prefixo da URL
  Get,
  HttpCode, // muda o status de sucesso padrao
  Post,
  Req, // pega o objeto req do Express
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Controller('auth') // todas as rotas daqui comecam com /auth
export class AuthController {
  // Injecao de dependencias: o Nest cria o AuthService e entrega aqui.
  constructor(private auth: AuthService) {}

  @Public() // rota aberta: o Guard global deixa passar sem token
  @Post('register') // POST /auth/register
  register(@Body() dto: RegisterDto) {
    // @Body() dto: RegisterDto -> o Nest pega o req.body, converte para um
    // RegisterDto e valida (se falhar, 400 antes de chegar aqui).
    return this.auth.register(dto); // o return vira o res.json() (status 201 em POST)
  }

  @Public()
  @HttpCode(200) // POST devolve 201 por padrao; no login 200 e mais natural
  @Post('login') // POST /auth/login
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  // Rota EXTRA (protegida): devolve os dados do token do usuario logado.
  // Sem @Public(), o Guard exige o token. Util para testar se a autenticacao funciona.
  @Get('me') // GET /auth/me
  me(@Req() req: Request) {
    // req['user'] foi preenchido pelo Guard (payload do JWT).
    return req['user'];
  }
}
