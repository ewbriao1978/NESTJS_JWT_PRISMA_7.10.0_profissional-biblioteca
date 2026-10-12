// DTO para criar um livro (POST /livros).
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateLivroDto {
  @IsString()
  titulo: string;

  @IsString()
  autor: string;

  @IsOptional()
  @IsString()
  isbn?: string;

  // @Min(0): estoque negativo e rejeitado com 400 (regra de negocio simples).
  @IsInt()
  @Min(0)
  estoque: number;
}
