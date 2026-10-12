// =============================================================================
// src/perfis/perfis.service.ts  -  CRUD de perfis (relacao 1:1 com usuarios)
// =============================================================================
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePerfilDto } from './dto/create-perfil.dto';
import { UpdatePerfilDto } from './dto/update-perfil.dto';

@Injectable()
export class PerfisService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePerfilDto) {
    // Regra 1: o usuario informado precisa existir.
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: dto.usuarioId },
    });
    if (!usuario) throw new NotFoundException('Usuário informado não existe');

    // REGRA DE NEGOCIO 1:1 - nao permitir dois perfis para o mesmo usuario.
    // (O @unique do schema tambem protegeria, mas assim damos uma mensagem clara.)
    const jaTem = await this.prisma.perfil.findUnique({
      where: { usuarioId: dto.usuarioId },
    });
    if (jaTem) throw new ConflictException('Este usuário já possui um perfil');

    return this.prisma.perfil.create({ data: dto });
  }

  findAll() {
    // include = JOIN: traz o usuario (sem a senha!) junto de cada perfil.
    return this.prisma.perfil.findMany({
      include: { usuario: { select: { id: true, nome: true, email: true } } },
    });
  }

  async findOne(id: number) {
    const perfil = await this.prisma.perfil.findUnique({
      where: { id },
      include: { usuario: { select: { id: true, nome: true, email: true } } },
    });
    if (!perfil) throw new NotFoundException(`Perfil ${id} não encontrado`);
    return perfil;
  }

  async update(id: number, dto: UpdatePerfilDto) {
    await this.findOne(id); // 404 se nao existir
    return this.prisma.perfil.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.perfil.delete({ where: { id } });
  }
}
