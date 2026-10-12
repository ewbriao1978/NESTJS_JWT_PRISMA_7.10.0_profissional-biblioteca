// DTO para criar um perfil (POST /perfis).
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreatePerfilDto {
  @IsOptional() // pode nao vir...
  @IsString() // ...mas, se vier, tem que ser texto
  telefone?: string;

  @IsOptional()
  @IsString()
  endereco?: string;

  @IsInt() // id do usuario dono do perfil (obrigatorio)
  usuarioId: number;
}
