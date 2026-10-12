// =============================================================================
// src/auth/dto/auth.dto.ts  -  DTOs de autenticacao
// =============================================================================
// DTO = Data Transfer Object = "molde" dos dados que ENTRAM na API.
// No Express voces validavam assim:  if (!email || !senha) return res.status(400)...
// No Nest descrevemos as regras COM DECORATORS e o ValidationPipe (main.ts)
// valida sozinho ANTES de o controller executar. Se estiver invalido,
// o Nest responde 400 automaticamente com a lista dos erros.

import { IsEmail, IsString, MinLength } from 'class-validator';

// Corpo esperado em POST /auth/register
export class RegisterDto {
  @IsString() // precisa ser texto
  nome: string;

  @IsEmail() // precisa ter formato de e-mail
  email: string;

  @IsString()
  @MinLength(6) // senha com no minimo 6 caracteres
  senha: string;
}

// Corpo esperado em POST /auth/login
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  senha: string;
}
