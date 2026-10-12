// Rotas de /perfis (CRUD completo). Protegidas pelo Guard global.
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreatePerfilDto } from './dto/create-perfil.dto';
import { UpdatePerfilDto } from './dto/update-perfil.dto';
import { PerfisService } from './perfis.service';

@Controller('perfis')
export class PerfisController {
  constructor(private readonly perfis: PerfisService) {}

  @Post() // POST /perfis
  create(@Body() dto: CreatePerfilDto) {
    return this.perfis.create(dto);
  }

  @Get() // GET /perfis
  findAll() {
    return this.perfis.findAll();
  }

  @Get(':id') // GET /perfis/1
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.perfis.findOne(id);
  }

  @Patch(':id') // PATCH /perfis/1
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePerfilDto) {
    return this.perfis.update(id, dto);
  }

  @Delete(':id') // DELETE /perfis/1
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.perfis.remove(id);
  }
}
