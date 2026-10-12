// =============================================================================
// prisma.config.ts  -  Configuracao da CLI do Prisma 7
// =============================================================================
// No Prisma 6 (e anteriores) a URL do banco ficava dentro do schema.prisma.
// No Prisma 7 ela saiu de la: agora a CLI (migrate, studio...) le a URL
// DESTE arquivo.  Este arquivo so e usado pelos COMANDOS "npx prisma ...",
// nao pela aplicacao rodando (a aplicacao usa o PrismaService + adapter).

// "dotenv/config" le o arquivo .env e coloca as variaveis em process.env.
// E o mesmo "require('dotenv').config()" que voces usavam no Express.
import 'dotenv/config';

// defineConfig = funcao auxiliar que so serve para dar autocomplete/tipos.
// env() = le uma variavel de ambiente e AVISA com erro claro se faltar.
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  // Onde esta o arquivo com os models (tabelas).
  schema: 'prisma/schema.prisma',

  // Onde o Prisma guarda o historico de migracoes (arquivos .sql).
  // Essa pasta VAI para o Git: ela e o "controle de versao do banco".
  migrations: { path: 'prisma/migrations' },

  // URL de conexao usada pelo "prisma migrate". Vem do .env.
  datasource: { url: env('DATABASE_URL') },
});
