// =============================================================================
// src/app.module.ts  -  MODULO RAIZ: junta todos os modulos do projeto
// =============================================================================
// Pense nele como o "app.use(...)" do Express, mas para modulos: tudo o que
// nao estiver listado aqui (direta ou indiretamente) nao existe para o Nest.
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // carrega o .env
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { PerfisModule } from './perfis/perfis.module';
import { LivrosModule } from './livros/livros.module';
import { EmprestimosModule } from './emprestimos/emprestimos.module';
import { RelatoriosModule } from './relatorios/relatorios.module';

@Module({
  imports: [
    // PRIMEIRO da lista: le o .env. isGlobal => ConfigService em todo o app.
    // (Equivale ao require('dotenv').config() do Express.)
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsuariosModule,
    PerfisModule,
    LivrosModule,
    EmprestimosModule,
    RelatoriosModule,
  ],
})
export class AppModule {}
