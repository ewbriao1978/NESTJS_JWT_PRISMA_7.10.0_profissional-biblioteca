// =============================================================================
// src/auth/public.decorator.ts  -  O decorator @Public()
// =============================================================================
// O Guard (auth.guard.ts) vai proteger TODAS as rotas. Mas /auth/login e
// /auth/register precisam ficar abertas (ninguem tem token ainda!).
// Entao criamos o decorator @Public() que "marca" uma rota como aberta.

// SetMetadata grava uma informacao extra (chave + valor) na rota,
// como colar um post-it nela. O Guard le esse post-it depois.
import { SetMetadata } from '@nestjs/common';

// Nome do post-it. Constante exportada para o Guard usar o MESMO nome.
export const IS_PUBLIC_KEY = 'isPublic';

// Public() devolve um decorator que cola o post-it "isPublic = true".
// Uso:  @Public()  em cima do metodo (ou da classe) do controller.
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
