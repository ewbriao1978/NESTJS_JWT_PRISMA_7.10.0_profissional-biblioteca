// DTO para registrar um emprestimo (POST /emprestimos).
// A data do emprestimo NAO vem do cliente: o banco preenche com now().
import { IsInt } from 'class-validator';

export class CreateEmprestimoDto {
  @IsInt() // quem esta pegando o livro
  usuarioId: number;

  @IsInt() // qual livro esta sendo pego
  livroId: number;
}
