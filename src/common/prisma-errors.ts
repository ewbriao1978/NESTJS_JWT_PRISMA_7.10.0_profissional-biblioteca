// =============================================================================
// src/common/prisma-errors.ts  -  Ajudante para ler erros do Prisma
// =============================================================================
// Quando o BANCO recusa uma operacao, o Prisma lanca um erro com um "code":
//   P2002 -> violacao de campo UNIQUE (ex.: e-mail repetido)
//   P2025 -> registro nao encontrado em update/delete
//   P2003 -> violacao de chave estrangeira (ex.: apagar algo que e usado em outra tabela)
// Esta funcao extrai esse codigo (ou devolve undefined se nao for erro do Prisma),
// para os services decidirem qual status HTTP devolver (409, 404...).

export function codigoPrisma(erro: unknown): string | undefined {
  // "typeof ... === 'object'" garante que e um objeto antes de olhar dentro dele.
  if (typeof erro === 'object' && erro !== null && 'code' in erro) {
    return String((erro as { code: unknown }).code);
  }
  return undefined;
}
