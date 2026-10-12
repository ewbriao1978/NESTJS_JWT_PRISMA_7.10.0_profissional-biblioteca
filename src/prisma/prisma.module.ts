// =============================================================================
// src/prisma/prisma.module.ts  -  Modulo que "empacota" o PrismaService
// =============================================================================
// No Nest, tudo e organizado em MODULOS. Um modulo e uma "caixinha" que diz:
//   - providers:   quais classes de servico existem aqui dentro
//   - exports:     quais delas outros modulos podem usar
//   - controllers: quais controllers (rotas) pertencem a ele
//   - imports:     de quais outros modulos eu dependo

import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// @Global(): torna este modulo disponivel em TODO o app. Sem isso, cada modulo
// (livros, perfis...) precisaria escrever "imports: [PrismaModule]".
@Global()
@Module({
  providers: [PrismaService], // registra o PrismaService no "container" do Nest
  exports: [PrismaService], // permite que outros modulos o recebam por injecao
})
export class PrismaModule {}
