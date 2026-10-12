// =============================================================================
// src/emprestimos/emprestimos.service.ts  -  Emprestimos (liga usuarios <-> livros)
// =============================================================================
// Aqui estao as REGRAS DE NEGOCIO principais do sistema:
//   1) nao emprestar livro sem estoque
//   2) o mesmo usuario nao pode pegar o mesmo livro 2x sem devolver
//   3) emprestar diminui o estoque; devolver aumenta (usando TRANSACAO)
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmprestimoDto } from './dto/create-emprestimo.dto';

// Para as respostas, trazemos o usuario SEM a senha.
const USUARIO_PUBLICO = { id: true, nome: true, email: true } as const;

@Injectable()
export class EmprestimosService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEmprestimoDto) {
    // Os dois findUnique nao dependem um do outro: Promise.all roda os dois ao mesmo tempo.
    const [usuario, livro] = await Promise.all([
      this.prisma.usuario.findUnique({ where: { id: dto.usuarioId } }),
      this.prisma.livro.findUnique({ where: { id: dto.livroId } }),
    ]);
    if (!usuario) throw new NotFoundException('Usuário não encontrado'); // 404
    if (!livro) throw new NotFoundException('Livro não encontrado'); // 404

    // REGRA 2: ja existe emprestimo desse livro para esse usuario SEM devolucao?
    // (dataDevolucao: null  ->  WHERE data_devolucao IS NULL)
    const aberto = await this.prisma.emprestimo.findFirst({
      where: {
        usuarioId: dto.usuarioId,
        livroId: dto.livroId,
        dataDevolucao: null,
      },
    });
    if (aberto) {
      throw new ConflictException('Usuário já está com este livro emprestado'); // 409
    }

    // TRANSACAO: ou TUDO dentro dela funciona, ou NADA e salvo (rollback).
    // Usamos para nao diminuir o estoque e depois falhar ao criar o emprestimo.
    // "tx" funciona igual ao this.prisma, mas dentro da transacao.
    return this.prisma.$transaction(async (tx) => {
      // REGRA 1 (atomica): so decrementa se estoque > 0.
      // UPDATE livros SET estoque = estoque - 1 WHERE id = ? AND estoque > 0
      // Fazer a checagem DENTRO do UPDATE evita que duas pessoas peguem a
      // ultima copia ao mesmo tempo.
      const resultado = await tx.livro.updateMany({
        where: { id: dto.livroId, estoque: { gt: 0 } },
        data: { estoque: { decrement: 1 } },
      });
      // count = quantas linhas foram alteradas. 0 = nao havia estoque.
      if (resultado.count === 0) {
        // Lancar excecao dentro da transacao desfaz tudo automaticamente.
        throw new BadRequestException('Livro sem estoque disponível'); // 400
      }

      return tx.emprestimo.create({
        data: { usuarioId: dto.usuarioId, livroId: dto.livroId },
        include: { livro: true, usuario: { select: USUARIO_PUBLICO } },
      });
    });
  }

  findAll() {
    return this.prisma.emprestimo.findMany({
      include: { livro: true, usuario: { select: USUARIO_PUBLICO } },
      orderBy: { dataEmprestimo: 'desc' }, // mais recentes primeiro
    });
  }

  async findOne(id: number) {
    const emprestimo = await this.prisma.emprestimo.findUnique({
      where: { id },
      include: { livro: true, usuario: { select: USUARIO_PUBLICO } },
    });
    if (!emprestimo) {
      throw new NotFoundException(`Empréstimo ${id} não encontrado`);
    }
    return emprestimo;
  }

  // "UPDATE" do emprestimo = registrar a DEVOLUCAO (PATCH /emprestimos/:id/devolver).
  // E o unico campo que faz sentido mudar depois de criado.
  async devolver(id: number) {
    const emprestimo = await this.findOne(id); // 404 se nao existir
    if (emprestimo.dataDevolucao) {
      throw new BadRequestException('Este empréstimo já foi devolvido'); // 400
    }

    return this.prisma.$transaction(async (tx) => {
      // devolve a copia para o estoque (estoque + 1)...
      await tx.livro.update({
        where: { id: emprestimo.livroId },
        data: { estoque: { increment: 1 } },
      });
      // ...e marca a data da devolucao.
      return tx.emprestimo.update({
        where: { id },
        data: { dataDevolucao: new Date() },
        include: { livro: true, usuario: { select: USUARIO_PUBLICO } },
      });
    });
  }

  async remove(id: number) {
    const emprestimo = await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      // Se apagamos um emprestimo que ainda estava aberto, a copia volta ao estoque.
      if (!emprestimo.dataDevolucao) {
        await tx.livro.update({
          where: { id: emprestimo.livroId },
          data: { estoque: { increment: 1 } },
        });
      }
      return tx.emprestimo.delete({ where: { id } });
    });
  }
}
