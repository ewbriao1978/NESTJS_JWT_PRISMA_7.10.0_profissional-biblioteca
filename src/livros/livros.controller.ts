// Rotas de /livros (CRUD completo). Protegidas pelo Guard global.
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query, // @Query('x') = req.query.x do Express
} from '@nestjs/common';
import { CreateLivroDto } from './dto/create-livro.dto';
import { UpdateLivroDto } from './dto/update-livro.dto';
import { LivrosService } from './livros.service';

@Controller('livros')
export class LivrosController {
  constructor(private readonly livros: LivrosService) {}

  @Post() // POST /livros
  create(@Body() dto: CreateLivroDto) {
    return this.livros.create(dto);
  }

  @Get() // GET /livros   ou   GET /livros?titulo=dom
  findAll(@Query('titulo') titulo?: string) {
    return this.livros.findAll(titulo);
  }

  @Get(':id') // GET /livros/1
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.livros.findOne(id);
  }

  @Patch(':id') // PATCH /livros/1
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLivroDto) {
    return this.livros.update(id, dto);
  }

  @Delete(':id') // DELETE /livros/1
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.livros.remove(id);
  }
}
