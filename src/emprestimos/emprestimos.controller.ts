// Rotas de /emprestimos. Protegidas pelo Guard global.
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
import { CreateEmprestimoDto } from './dto/create-emprestimo.dto';
import { EmprestimosService } from './emprestimos.service';

@Controller('emprestimos')
export class EmprestimosController {
  constructor(private readonly emprestimos: EmprestimosService) {}

  @Post() // POST /emprestimos   { "usuarioId": 1, "livroId": 2 }
  create(@Body() dto: CreateEmprestimoDto) {
    return this.emprestimos.create(dto);
  }

  @Get() // GET /emprestimos
  findAll() {
    return this.emprestimos.findAll();
  }

  @Get(':id') // GET /emprestimos/1
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.emprestimos.findOne(id);
  }

  // Rota "especial": acao sobre um emprestimo (nao precisa de body).
  @Patch(':id/devolver') // PATCH /emprestimos/1/devolver
  devolver(@Param('id', ParseIntPipe) id: number) {
    return this.emprestimos.devolver(id);
  }

  @Delete(':id') // DELETE /emprestimos/1
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.emprestimos.remove(id);
  }
}
