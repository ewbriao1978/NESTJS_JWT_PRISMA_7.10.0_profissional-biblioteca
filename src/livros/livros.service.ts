// =============================================================================
// src/livros/livros.service.ts  -  CRUD de livros
// =============================================================================
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { codigoPrisma } from '../common/prisma-errors';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLivroDto } from './dto/create-livro.dto';
import { UpdateLivroDto } from './dto/update-livro.dto';

@Injectable()
export class LivrosService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLivroDto) {
    try {
      // INSERT INTO livros (...) VALUES (...)  (dto ja tem titulo, autor, isbn, estoque)
      return await this.prisma.livro.create({ data: dto });
    } catch (erro) {
      // P2002 = ISBN repetido (campo @unique)
      if (codigoPrisma(erro) === 'P2002') {
        throw new ConflictException('Já existe um livro com este ISBN');
      }
      throw erro;
    }
  }

  // "titulo" vem da query string: GET /livros?titulo=dom  (req.query.titulo no Express)
  findAll(titulo?: string) {
    return this.prisma.livro.findMany({
      // Se veio titulo, filtra com LIKE '%titulo%' sem diferenciar maiusculas.
      // Se nao veio, "where" fica undefined e o Prisma traz tudo.
      where: titulo
        ? { titulo: { contains: titulo, mode: 'insensitive' } }
        : undefined,
      orderBy: { titulo: 'asc' }, // ORDER BY titulo ASC
    });
  }

  async findOne(id: number) {
    const livro = await this.prisma.livro.findUnique({ where: { id } });
    if (!livro) throw new NotFoundException(`Livro ${id} não encontrado`);
    return livro;
  }

  async update(id: number, dto: UpdateLivroDto) {
    await this.findOne(id); // 404 se nao existir
    try {
      return await this.prisma.livro.update({ where: { id }, data: dto });
    } catch (erro) {
      if (codigoPrisma(erro) === 'P2002') {
        throw new ConflictException('Já existe um livro com este ISBN');
      }
      throw erro;
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    // Regra de negocio: livro com historico de emprestimos nao pode ser apagado.
    const total = await this.prisma.emprestimo.count({ where: { livroId: id } });
    if (total > 0) {
      throw new ConflictException(
        'Livro possui empréstimos registrados e não pode ser excluído',
      );
    }
    return this.prisma.livro.delete({ where: { id } });
  }
}
