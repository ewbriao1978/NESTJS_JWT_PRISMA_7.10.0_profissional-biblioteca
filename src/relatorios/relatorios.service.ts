// =============================================================================
// src/relatorios/relatorios.service.ts  -  CONSULTAS AVANCADAS (3+ tabelas)
// =============================================================================
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RelatoriosService {
  constructor(private prisma: PrismaService) {}

  // Relatorio que combina 4 TABELAS em uma unica consulta:
  //   emprestimos -> usuarios -> perfis   e   emprestimos -> livros
  // O "include/select" aninhado do Prisma gera os JOINs por baixo dos panos.
  emprestimosDetalhados(apenasAtivos: boolean) {
    return this.prisma.emprestimo.findMany({
      // Se apenasAtivos, filtra emprestimos ainda nao devolvidos.
      where: apenasAtivos ? { dataDevolucao: null } : undefined,
      include: {
        usuario: {
          // select: escolhe as colunas (a senha fica de fora!)
          select: {
            id: true,
            nome: true,
            email: true,
            perfil: true, // JOIN 1:1 com perfis
          },
        },
        livro: true, // JOIN com livros
      },
      orderBy: { dataEmprestimo: 'desc' },
    });
  }

  // Dashboard com TOTAIS de varias tabelas.
  async dashboard() {
    // Promise.all executa as consultas em paralelo e espera todas terminarem.
    const [usuarios, perfis, livros, emprestimos, ativos, estoque] =
      await Promise.all([
        this.prisma.usuario.count(), // SELECT COUNT(*) FROM usuarios
        this.prisma.perfil.count(),
        this.prisma.livro.count(),
        this.prisma.emprestimo.count(),
        // emprestimos em aberto (sem data de devolucao)
        this.prisma.emprestimo.count({ where: { dataDevolucao: null } }),
        // aggregate = SUM(estoque) FROM livros
        this.prisma.livro.aggregate({ _sum: { estoque: true } }),
      ]);

    return {
      totalUsuarios: usuarios,
      totalPerfis: perfis,
      totalLivros: livros,
      totalEmprestimos: emprestimos,
      emprestimosAtivos: ativos,
      // _sum.estoque vem null se nao houver livros; "?? 0" troca por zero
      copiasDisponiveis: estoque._sum.estoque ?? 0,
    };
  }
}
