// =============================================================================
// src/usuarios/usuarios.controller.ts  -  Rotas de /usuarios
// =============================================================================
// Todas protegidas pelo Guard global (nenhum @Public() aqui).
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UsuariosService } from './usuarios.service';

@Controller('usuarios') // prefixo: /usuarios
export class UsuariosController {
  constructor(private readonly usuarios: UsuariosService) {}

  @Get() // GET /usuarios
  findAll() {
    return this.usuarios.findAll();
  }

  // @Param('id') = req.params.id (sempre texto na URL).
  // ParseIntPipe converte para numero; se vier "abc" responde 400 sozinho.
  @Get(':id') // GET /usuarios/5
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuarios.findOne(id);
  }

  @Patch(':id') // PATCH /usuarios/5
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUsuarioDto,
  ) {
    return this.usuarios.update(id, dto);
  }

  @Delete(':id') // DELETE /usuarios/5
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usuarios.remove(id);
  }
}
