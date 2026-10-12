# Backend Biblioteca (NestJS + Prisma 7 + Neon)

> Projeto didático da disciplina de Backend — IFRS Campus Rio Grande.
> API REST (sem frontend) para gerenciar **usuários, perfis, livros e empréstimos**,
> com autenticação JWT e **Guard global**. Todo o código está comentado linha a linha.

## Tecnologias
Node.js 20+, NestJS 11, Prisma ORM 7.10.0, PostgreSQL (Neon), JWT (`@nestjs/jwt`), bcrypt, class-validator.

## Modelagem (4 tabelas)
| Relação | Tabelas | Tipo |
|---|---|---|
| Usuário tem um perfil | `usuarios` ↔ `perfis` | **1:1** |
| Usuário faz vários empréstimos | `usuarios` → `emprestimos` | **1:N** |
| Livro aparece em vários empréstimos | `livros` → `emprestimos` | **1:N** |
| Usuários pegam vários livros | `usuarios` ↔ `livros` (via `emprestimos`) | **N:N** |

## Instalação
```bash
npm install
cp .env.example .env     # preencha DATABASE_URL (Neon) e JWT_SECRET
```

## Migrações e client do Prisma
```bash
npx prisma migrate dev --name init   # cria as tabelas no Neon
npx prisma generate                  # gera o client em src/generated/prisma
```
> No Prisma 7 o `migrate dev` **não** gera o client sozinho. Rode também `npx prisma generate`
> sempre que clonar o projeto ou alterar o `schema.prisma`.

## Executando
```bash
npm run start:dev   # http://localhost:3000 com hot reload
```

## Estrutura
```
src/
├── main.ts                 # ponto de entrada (ValidationPipe global + CORS)
├── app.module.ts           # módulo raiz
├── common/prisma-errors.ts # ajudante p/ códigos de erro do Prisma (P2002...)
├── prisma/                 # PrismaModule (global) + PrismaService (adapter Neon)
├── auth/                   # register, login, AuthGuard global, @Public(), DTOs
├── usuarios/               # CRUD de usuários (module, controller, service, dto)
├── perfis/                 # CRUD de perfis (1:1)
├── livros/                 # CRUD de livros
├── emprestimos/            # empréstimos + devolução (regras de estoque)
└── relatorios/             # consultas avançadas (3+ tabelas)
prisma/schema.prisma        # modelagem
prisma.config.ts            # URL do banco para a CLI (Prisma 7)
requests.http               # requisições prontas para testar
```

## Autenticação
Registrar → logar → receber o token → enviar `Authorization: Bearer SEU_TOKEN`.
O `AuthGuard` é global (`APP_GUARD`): toda rota é protegida, exceto as marcadas com `@Public()`.

## Rotas da API
| Método | Rota | Descrição | Pública? |
|---|---|---|---|
| POST | /auth/register | Cadastro de usuário | Sim |
| POST | /auth/login | Login (retorna JWT) | Sim |
| GET | /auth/me | Dados do token | Não |
| GET | /usuarios | Lista usuários (com perfil) | Não |
| GET | /usuarios/:id | Busca usuário | Não |
| PATCH | /usuarios/:id | Atualiza usuário | Não |
| DELETE | /usuarios/:id | Remove usuário (409 se tiver empréstimos) | Não |
| POST | /perfis | Cria perfil (409 se o usuário já tiver) | Não |
| GET | /perfis | Lista perfis | Não |
| GET | /perfis/:id | Busca perfil | Não |
| PATCH | /perfis/:id | Atualiza perfil | Não |
| DELETE | /perfis/:id | Remove perfil | Não |
| POST | /livros | Cria livro | Não |
| GET | /livros?titulo= | Lista/filtra livros | Não |
| GET | /livros/:id | Busca livro | Não |
| PATCH | /livros/:id | Atualiza livro | Não |
| DELETE | /livros/:id | Remove livro (409 se tiver empréstimos) | Não |
| POST | /emprestimos | Empresta livro (baixa o estoque) | Não |
| GET | /emprestimos | Lista empréstimos | Não |
| GET | /emprestimos/:id | Busca empréstimo | Não |
| PATCH | /emprestimos/:id/devolver | Registra devolução (repõe estoque) | Não |
| DELETE | /emprestimos/:id | Remove empréstimo | Não |
| GET | /relatorios/emprestimos-detalhados | Empréstimos + usuário + perfil + livro | Não |
| GET | /relatorios/dashboard | Totais do sistema | Não |

## Regras de negócio
- Livro sem estoque não pode ser emprestado (400); a baixa é atômica dentro de uma transação.
- O mesmo usuário não pode pegar o mesmo livro duas vezes sem devolver (409).
- Um usuário só pode ter **um** perfil (409).
- Usuário/livro com empréstimos não pode ser excluído (409).
- Estoque negativo é rejeitado pelo DTO (400).

## Status HTTP usados
400 dado inválido · 401 não autenticado · 404 não encontrado · 409 conflito · 500 erro interno.

## Integrantes
- Nome do aluno 1
- Nome do aluno 2
