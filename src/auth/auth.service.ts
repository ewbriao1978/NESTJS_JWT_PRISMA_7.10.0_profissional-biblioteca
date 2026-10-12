// =============================================================================
// src/auth/auth.service.ts  -  REGRAS DE NEGOCIO da autenticacao
// =============================================================================
// Divisao de papeis no Nest (no Express o controller fazia tudo):
//   Controller -> recebe a requisicao e devolve a resposta (fino)
//   Service    -> contem a logica e conversa com o banco (aqui!)

import {
  ConflictException, // 409
  Injectable,
  UnauthorizedException, // 401
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'; // biblioteca de hash de senha (a mesma do Express)
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable() // permite que o Nest injete dependencias aqui e injete este service em outros
export class AuthService {
  // "private prisma: PrismaService" no constructor faz 2 coisas de uma vez:
  // declara o atributo this.prisma E recebe o valor injetado pelo Nest.
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  // ---------------------------- REGISTRO ------------------------------------
  async register(dto: RegisterDto) {
    // Ja existe usuario com esse e-mail? findUnique busca por campo @unique.
    const existe = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });
    // Excecoes do Nest viram resposta HTTP automaticamente (nada de res.status().json()).
    if (existe) throw new ConflictException('E-mail já cadastrado'); // 409

    // Criptografa a senha. O 10 e o "custo" (quanto maior, mais lento e mais seguro).
    const senha = await bcrypt.hash(dto.senha, 10);

    // INSERT INTO usuarios (nome, email, senha) VALUES (...)
    const user = await this.prisma.usuario.create({
      data: { nome: dto.nome, email: dto.email, senha },
    });

    // Devolvemos so os campos seguros. NUNCA devolva a senha (nem o hash)!
    return { id: user.id, nome: user.nome, email: user.email };
  }

  // ------------------------------ LOGIN -------------------------------------
  async login(dto: LoginDto) {
    // Busca o usuario pelo e-mail.
    const user = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });

    // Mesma mensagem para "e-mail nao existe" e "senha errada": assim quem
    // ataca nao descobre quais e-mails estao cadastrados.
    // bcrypt.compare compara a senha digitada com o hash guardado no banco.
    if (!user || !(await bcrypt.compare(dto.senha, user.senha))) {
      throw new UnauthorizedException('Credenciais inválidas'); // 401
    }

    // Gera o token. "sub" (subject) e o nome padrao do JWT para o id do dono.
    // O token e ASSINADO com o JWT_SECRET e expira em 1h (auth.module.ts).
    const token = await this.jwt.signAsync({ sub: user.id, email: user.email });
    return { access_token: token };
  }
}
