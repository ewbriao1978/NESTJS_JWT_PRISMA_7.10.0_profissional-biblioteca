// Atualizacao parcial: todos os campos do CreateLivroDto viram opcionais.
import { PartialType } from '@nestjs/mapped-types';
import { CreateLivroDto } from './create-livro.dto';

export class UpdateLivroDto extends PartialType(CreateLivroDto) {}
