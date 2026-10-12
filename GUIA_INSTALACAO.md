# Guia de instalação do zero: NestJS + Prisma 7 + Neon

Guia passo a passo para criar o projeto **backend-biblioteca** a partir de uma pasta vazia.
Disciplina de Backend — IFRS Campus Rio Grande.

> Dois caminhos:
> - **Caminho A (do zero):** você escreve o código nas aulas. Siga as seções 1 a 8.
> - **Caminho B (projeto pronto):** você recebeu o zip com o código. Vá direto à seção 9.

---

## 1. Pré-requisitos

| Ferramenta | Versão | Como conferir |
|---|---|---|
| Node.js | 20 ou superior | `node -v` |
| npm | vem com o Node | `npm -v` |
| Git | qualquer recente | `git --version` |
| VS Code | opcional, recomendado | — |
| Conta no Neon | gratuita | https://neon.tech |

Instale o Nest CLI uma única vez, de forma global:

```bash
npm i -g @nestjs/cli
nest --version
```

---

## 2. Criar o banco no Neon

1. Acesse https://neon.tech e crie uma conta.
2. Crie um **projeto** (ex.: `biblioteca`). O banco padrão se chama `neondb`.
3. No painel, clique em **Connect** e copie a **connection string**. Ela tem este formato:

```
postgresql://usuario:senha@ep-xxxx.neon.tech/neondb?sslmode=require
```

Guarde essa URL: ela vai para o arquivo `.env` na seção 5.

---

## 3. Criar o projeto Nest

```bash
nest new backend-biblioteca
# gerenciador de pacotes: escolha npm
cd backend-biblioteca
code .
npm run start:dev
```

Abra http://localhost:3000. Deve aparecer `Hello World!`. Pare o servidor com `Ctrl+C`.

### Limpar o que não vamos usar

Apague estes arquivos de `src/`:

- `app.controller.ts`
- `app.controller.spec.ts`
- `app.service.ts`

Deixe o `src/app.module.ts` assim, por enquanto:

```ts
import { Module } from '@nestjs/common';

@Module({
  imports: [],
})
export class AppModule {}
```

---

## 4. Instalar as bibliotecas

Use **exatamente** estas versões do Prisma.

```bash
# Prisma 7 + adapter do Neon
npm i @prisma/client@7.10.0 @prisma/adapter-neon@7.10.0
npm i -D prisma@7.10.0

# Configuração (.env), JWT, DTOs parciais
npm i @nestjs/config @nestjs/jwt @nestjs/mapped-types

# Senha, validação e dotenv
npm i bcrypt class-validator class-transformer dotenv
npm i -D @types/bcrypt
```

| Biblioteca | Para que serve |
|---|---|
| `@prisma/client`, `prisma` | ORM: acessa o banco sem escrever SQL |
| `@prisma/adapter-neon` | "ponte" entre o Prisma 7 e o Postgres do Neon |
| `@nestjs/config` | lê o `.env` dentro do Nest |
| `@nestjs/jwt` | cria e verifica tokens JWT |
| `@nestjs/mapped-types` | `PartialType` / `OmitType` para DTOs de atualização |
| `bcrypt` | criptografa a senha (hash) |
| `class-validator`, `class-transformer` | validação dos DTOs |
| `dotenv` | carrega o `.env` na CLI do Prisma |

### Ajuste no `tsconfig.build.json`

Troque o conteúdo por este. Sem isso, o `prisma.config.ts` da raiz muda a pasta do build e o comando `npm run start:prod` quebra.

```json
{
  "extends": "./tsconfig.json",
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test", "**/*spec.ts"]
}
```

---

## 5. Configurar o Prisma

### 5.1 Inicializar

```bash
npx prisma init --datasource-provider postgresql
```

Isso cria `prisma/schema.prisma`, `prisma.config.ts` e o arquivo `.env`.

> **Atenção:** use o `prisma init` **só aqui**, num projeto novo. Se você recebeu o projeto pronto (Caminho B), **não rode** o `init`: ele pode sobrescrever o `prisma.config.ts` e o `schema.prisma`.

### 5.2 Arquivo `.env`

Substitua o conteúdo pelo seguinte, com a **sua** URL do Neon:

```env
DATABASE_URL="postgresql://usuario:senha@ep-xxxx.neon.tech/neondb?sslmode=require"
JWT_SECRET="troque_por_uma_chave_longa_e_aleatoria"
PORT=3000
```

Regras do `.env`:

- Sem espaços antes ou depois do `=`.
- A URL vai entre aspas.
- O nome do arquivo é exatamente `.env` (não `.env.txt`).
- **Nunca** suba o `.env` para o Git.

### 5.3 Arquivo `.gitignore`

Acrescente estas linhas ao final:

```
.env
src/generated/
```

### 5.4 Arquivo `prisma.config.ts` (na raiz)

```ts
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: env('DATABASE_URL') },
});
```

### 5.5 Arquivo `prisma/schema.prisma`

O cabeçalho precisa ficar assim (o `output` e o `moduleFormat` são o que muda em relação ao gerado pelo `init`):

```prisma
generator client {
  provider     = "prisma-client"
  output       = "../src/generated/prisma"
  moduleFormat = "cjs"
}

datasource db {
  provider = "postgresql"
}
```

Abaixo dele, escreva os 4 models:

| Model | Tabela | Relações |
|---|---|---|
| `Usuario` | `usuarios` | 1:1 com `Perfil`, 1:N com `Emprestimo` |
| `Perfil` | `perfis` | `usuarioId` com `@unique` (isso faz o 1:1) |
| `Livro` | `livros` | 1:N com `Emprestimo` |
| `Emprestimo` | `emprestimos` | liga `Usuario` e `Livro` (N:N) |

Cada model usa `@@map("nome_da_tabela")` para definir o nome real no banco.

### 5.6 Criar as tabelas no Neon e gerar o client

```bash
npx prisma migrate dev --name init
npx prisma generate
```

- O `migrate dev` cria as tabelas e guarda o histórico em `prisma/migrations/`.
- No Prisma 7 o `migrate dev` **não** gera o client sozinho. Por isso o `generate` vem em seguida.
- Confira no painel do Neon (aba **Tables**) se as 4 tabelas apareceram.

---

## 6. PrismaService e módulo base

```bash
nest g module prisma
nest g service prisma --no-spec
```

Escreva o `prisma.service.ts` (estende `PrismaClient` e usa o `PrismaNeon`) e o `prisma.module.ts` (com `@Global()`).

No `app.module.ts`, registre o `ConfigModule` **primeiro** da lista:

```ts
imports: [
  ConfigModule.forRoot({ isGlobal: true }),
  PrismaModule,
],
```

No `main.ts`, ligue a validação global e o CORS:

```ts
app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
app.enableCors();
```

Teste: `npm run start:dev` deve subir sem erros.

---

## 7. Gerar os módulos com o CLI

Cada comando cria os arquivos e já registra o módulo no `app.module.ts`.

```bash
# Autenticação
nest g module auth
nest g controller auth --no-spec
nest g service auth --no-spec
nest g guard auth/auth --no-spec
nest g decorator auth/public --no-spec
mkdir src/auth/dto

# CRUDs (responda: REST API  e depois  Yes)
nest g resource usuarios --no-spec
nest g resource perfis --no-spec
nest g resource livros --no-spec
nest g resource emprestimos --no-spec

# Relatórios
nest g module relatorios
nest g controller relatorios --no-spec
nest g service relatorios --no-spec
```

Depois de gerar cada `resource`, apague a pasta `entities/` (não é usada com Prisma).

### Ordem sugerida das aulas

| Aula | Conteúdo | Checkpoint |
|---|---|---|
| 1 | Seções 3 a 6: projeto, Prisma, Neon, PrismaService | servidor sobe e conecta no banco |
| 2 | `auth`: DTOs, decorator, service, guard, controller, module | register/login funcionam, rota sem token dá 401 |
| 3 | CRUDs de `livros`, `perfis`, `usuarios` | CRUD completo e o 409 do perfil duplicado |
| 4 | `emprestimos`, `relatorios`, README | empréstimo baixa estoque, relatório com 4 tabelas |

Em cada módulo, escreva nesta ordem: **DTO, service, controller**.

---

## 8. Testar a API

Use Insomnia, Postman, Thunder Client ou a extensão REST Client do VS Code.

1. `POST http://localhost:3000/auth/register`
   ```json
   { "nome": "Ana", "email": "ana@email.com", "senha": "123456" }
   ```
2. `POST http://localhost:3000/auth/login` e copie o `access_token` da resposta.
3. Nas demais rotas, envie o cabeçalho:
   ```
   Authorization: Bearer SEU_TOKEN
   ```
4. Teste também:
   - sem token: deve dar **401**
   - com dados inválidos: deve dar **400**
   - id que não existe: deve dar **404**
   - duplicidade (e-mail, perfil): deve dar **409**

### Fluxo de uma requisição

```
Cliente (Insomnia)
   │  POST /emprestimos + Bearer token
   ▼
Guard global ───── sem token? → 401
   ▼
ValidationPipe ─── DTO inválido? → 400
   ▼
Controller ─────── só recebe e repassa
   ▼
Service ────────── regras de negócio: 404, 409, 400
   ▼
PrismaService ──── SQL via adapter
   ▼
Neon (PostgreSQL)
```

---

## 9. Caminho B: instalar o projeto pronto (zip ou Git)

```bash
unzip backend-biblioteca.zip      # ou: git clone <url-do-repositorio>
cd backend-biblioteca
npm install
cp .env.example .env              # no Windows (cmd): copy .env.example .env
```

Edite o `.env` com a sua `DATABASE_URL` do Neon e o seu `JWT_SECRET`. Depois:

```bash
npx prisma migrate dev --name init
npx prisma generate
npm run start:dev
```

**Não rode `npx prisma init` neste caminho.**

---

## 10. Comandos do dia a dia

| Comando | Quando usar |
|---|---|
| `npm run start:dev` | desenvolver (reinicia ao salvar) |
| `npx prisma migrate dev --name <nome>` | depois de **alterar** o `schema.prisma` |
| `npx prisma generate` | depois de alterar o schema ou **clonar** o projeto |
| `npx prisma studio` | ver e editar as tabelas no navegador |
| `npm run build` | conferir se o projeto compila |

---

## 11. Problemas comuns

| Erro | Causa e solução |
|---|---|
| `Cannot resolve environment variable: DATABASE_URL` | Não existe o `.env` ou a variável está vazia. Crie o `.env` na **raiz** (veja 5.2). |
| `The datasource.url property is required in your Prisma config file` | O `prisma.config.ts` foi sobrescrito (geralmente por um `prisma init` repetido). Restaure o arquivo da seção 5.4. |
| `Property 'usuario' does not exist on type 'PrismaService'` | O client não foi gerado. Rode `npx prisma generate`. |
| `Cannot find module '../generated/prisma/client'` | Mesma causa: falta o `npx prisma generate`. |
| `401 Token não informado` em todas as rotas | Faltou o cabeçalho `Authorization: Bearer <token>`. |
| `secretOrPrivateKey must have a value` | O `JWT_SECRET` não está no `.env`, ou o `ConfigModule` não é o primeiro dos `imports`. |
| `start:prod` não encontra `dist/main` | Falta o ajuste do `tsconfig.build.json` (seção 4). |
| Timeout no `migrate dev` com o Neon | Use no `.env` a conexão **direta** (host sem `-pooler`) para as migrações. |
| Erro de CORS no navegador | Confira o `app.enableCors()` no `main.ts`. |

---

## 12. Checklist de entrega

- [ ] `.env` **não** está no Git (confira o `.gitignore`)
- [ ] `.env.example` com as 3 variáveis e valores de exemplo
- [ ] `prisma/migrations/` versionada no Git
- [ ] `README.md` com instalação, variáveis, migrações e lista de rotas
- [ ] Todas as rotas, exceto `/auth/register` e `/auth/login`, retornam 401 sem token
- [ ] Pelo menos uma regra de negócio e uma consulta com 3+ tabelas funcionando
