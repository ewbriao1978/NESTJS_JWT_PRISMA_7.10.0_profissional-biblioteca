// =============================================================================
// src/prisma/prisma.service.ts  -  UMA UNICA conexao com o banco para o app todo
// =============================================================================
// No Express voces faziam "const prisma = new PrismaClient()" em varios arquivos.
// Isso abre varias conexoes e vira bagunca. No Nest criamos UMA classe
// (PrismaService) e pedimos para o Nest ENTREGA-LA pronta onde precisarmos.
// Isso se chama INJECAO DE DEPENDENCIAS (veremos nos services).

// Injectable = "decorator" (parecido com uma etiqueta). Diz ao Nest:
// "esta classe pode ser criada e injetada por voce em outras classes".
// OnModuleInit / OnModuleDestroy = interfaces dos "ganchos de ciclo de vida":
// o Nest chama esses metodos quando o modulo inicia e quando encerra.
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

// Adapter: "ponte" que faz o Prisma 7 conversar com o Postgres do Neon.
import { PrismaNeon } from '@prisma/adapter-neon';

// O PrismaClient vem da pasta gerada por "npx prisma generate" (ver schema.prisma).
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class PrismaService
  // "extends PrismaClient": o PrismaService E um PrismaClient.
  // Por isso, nos services, podemos escrever this.prisma.livro.findMany(...)
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // O constructor roda quando o Nest cria o objeto (uma unica vez).
  constructor() {
    // Criamos o adapter do Neon com a URL do .env.
    // (O ConfigModule do app.module.ts ja carregou o .env antes deste ponto.)
    const adapter = new PrismaNeon({
      connectionString: process.env.DATABASE_URL,
    });
    // super(...) chama o constructor da classe pai (PrismaClient),
    // entregando o adapter para ele.
    super({ adapter });
  }

  // Chamado pelo Nest quando o modulo termina de carregar: abre a conexao.
  async onModuleInit() {
    await this.$connect();
  }

  // Chamado quando a aplicacao encerra (Ctrl+C): fecha a conexao direitinho.
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
