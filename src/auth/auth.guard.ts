// =============================================================================
// src/auth/auth.guard.ts  -  O GUARD: porteiro de TODAS as rotas
// =============================================================================
// Equivalente Express: o middleware "authenticateToken" que voces usavam assim:
//     router.get('/livros', authenticateToken, controller)
// Diferenca: la voces precisavam lembrar de colocar em cada rota.
// Aqui o Guard e GLOBAL (registrado no auth.module.ts): protege tudo por
// padrao e so deixa passar o que estiver marcado com @Public().

import {
  CanActivate, // interface: obriga a ter o metodo canActivate()
  ExecutionContext, // "contexto" da requisicao atual (acesso ao req, handler, classe)
  Injectable,
  UnauthorizedException, // gera resposta 401
} from '@nestjs/common';
import { Reflector } from '@nestjs/core'; // le os "post-its" (metadata) das rotas
import { JwtService } from '@nestjs/jwt'; // verifica/assina tokens JWT
import { Request } from 'express'; // so para tipar o req (Nest usa Express por baixo)
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  // Injecao de dependencias: o Nest ve os tipos do constructor e ENTREGA os
  // objetos prontos. Voce nao escreve "new JwtService()" em lugar nenhum.
  constructor(
    private jwt: JwtService,
    private reflector: Reflector,
  ) {}

  // O Nest chama canActivate ANTES de cada rota.
  // Devolver true = passa. Lancar excecao (ou devolver false) = bloqueia.
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1) A rota tem o post-it @Public()? Procuramos primeiro no metodo
    //    (getHandler) e depois na classe (getClass).
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true; // rota aberta: nao precisa de token

    // 2) Pegamos o objeto "req" do Express (igual ao req dos seus controllers).
    const request = context.switchToHttp().getRequest<Request>();

    // 3) Header esperado:  Authorization: Bearer <token>
    //    split(' ') separa em ["Bearer", "<token>"]. O "?." e o "?? []" evitam
    //    erro caso o header nem exista.
    const [tipo, token] = request.headers.authorization?.split(' ') ?? [];
    if (tipo !== 'Bearer' || !token) {
      throw new UnauthorizedException('Token não informado'); // 401
    }

    // 4) Verifica assinatura e validade do token.
    try {
      // verifyAsync devolve o "payload" ({ sub, email, iat, exp }).
      // Guardamos em request.user - igual ao "req.user = decoded" do Express.
      request['user'] = await this.jwt.verifyAsync(token);
    } catch {
      // token adulterado ou expirado
      throw new UnauthorizedException('Token inválido ou expirado'); // 401
    }

    return true; // token valido: deixa a requisicao seguir ate o controller
  }
}
