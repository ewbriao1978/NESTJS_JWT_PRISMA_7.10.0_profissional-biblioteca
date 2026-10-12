// =============================================================================
// src/usuarios/usuarios.service.ts  -  CRUD de usuarios
// =============================================================================
// O cadastro (create) esta em /auth/register. Aqui ficam listar, buscar,
// atualizar e excluir.

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { codigoPrisma } from '../common/prisma-errors';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

// "select" = quais colunas devolver (SELECT id, nome, email ...).
// Deixamos a SENHA de fora, assim ela nunca vaza na resposta da API.
// Guardamos numa constante para reaproveitar em todos os metodos.
const CAMPOS_PUBLICOS = { id: true, nome: true, email: true } as const;

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  // GET /usuarios  ->  SELECT id, nome, email FROM usuarios
  findAll() {
    return this.prisma.usuario.findMany({
      select: { ...CAMPOS_PUBLICOS, perfil: true }, // traz tambem o perfil (JOIN 1:1)
    });
  }

  // GET /usuarios/:id
  async findOne(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      // JOIN com perfis e emprestimos em uma unica consulta
      select: { ...CAMPOS_PUBLICOS, perfil: true, emprestimos: true },
    });
    // findUnique devolve null quando nao acha -> transformamos em 404.
    if (!usuario) throw new NotFoundException(`Usuário ${id} não encontrado`);
    return usuario;
  }

  // PATCH /usuarios/:id
  async update(id: number, dto: UpdateUsuarioDto) {
    await this.findOne(id); // reaproveita: se nao existir, ja lanca 404

    // Se veio senha nova, precisa passar pelo bcrypt antes de salvar.
    // Montamos o objeto "data" copiando o dto (spread: ...dto).
    const data = { ...dto };
    if (dto.senha) data.senha = await bcrypt.hash(dto.senha, 10);

    try {
      return await this.prisma.usuario.update({
        where: { id },
        data,
        select: CAMPOS_PUBLICOS,
      });
    } catch (erro) {
      // P2002 = tentou usar um e-mail que ja pertence a OUTRO usuario.
      if (codigoPrisma(erro) === 'P2002') {
        throw new ConflictException('E-mail já cadastrado');
      }
      throw erro; // outros erros viram 500 automaticamente
    }
  }

  // DELETE /usuarios/:id
  async remove(id: number) {
    await this.findOne(id);

    // Regra de negocio: nao apagar quem tem historico de emprestimos
    // (o banco recusaria por causa da chave estrangeira; avisamos antes, com clareza).
    const total = await this.prisma.emprestimo.count({ where: { usuarioId: id } });
    if (total > 0) {
      throw new ConflictException(
        'Usuário possui empréstimos e não pode ser excluído',
      );
    }

    // O perfil (se existir) e apagado junto: onDelete Cascade no schema.prisma.
    return this.prisma.usuario.delete({ where: { id }, select: CAMPOS_PUBLICOS });
  }
}
