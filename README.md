# FIT.AI Backend

Backend da plataforma FIT.AI, responsável por autenticação, regras de negócio, geração de planos de treino, estatísticas, sessão do usuário, documentação OpenAPI e endpoints consumidos pelo frontend.

## Link externo

- Produção: https://fit-api.anderssouza25.com.br

## Tecnologias e ferramentas

### Frameworks e runtime

- Fastify 5
- TypeScript 5
- Node.js 24

### Banco de dados e ORM

- PostgreSQL
- Prisma 7
- @prisma/client
- @prisma/adapter-pg

### Autenticação

- Better Auth

### Validação e tipagem

- Zod
- fastify-type-provider-zod

### Documentação de API

- @fastify/swagger
- @scalar/fastify-api-reference

### IA

- AI SDK
- @ai-sdk/openai
- @ai-sdk/google

### Infra e utilitários

- Docker
- Docker Compose
- dayjs
- dotenv
- pino-pretty

### Qualidade e desenvolvimento

- ESLint 9
- Prettier 3
- tsx
- pnpm

## Funcionalidades principais

- Autenticação com Better Auth
- Exposição de endpoints REST para o frontend
- Geração e consulta de planos de treino
- Consulta de dados da home do usuário
- Consulta de estatísticas de treino
- Persistência de dados com Prisma e PostgreSQL
- Documentação OpenAPI em `/swagger.json`
- Referência interativa da API com Scalar
- Rotas de IA para suporte ao fluxo do produto

## Estrutura do projeto

```text
src/             código-fonte da API
src/routes/      definição das rotas HTTP
src/usecases/    regras de negócio e casos de uso
src/lib/         autenticação, banco e variáveis de ambiente
prisma/          schema e migrations
docs/            documentação auxiliar
```

## Variáveis de ambiente

Crie um arquivo `.env` com base no `.env.example`.

Principais variáveis esperadas pelo projeto:

- `DATABASE_URL`
- variáveis de autenticação do Better Auth
- variáveis de provedores de IA
- porta e ambiente de execução

## Scripts

```bash
pnpm dev
pnpm build
```

## Infra local

O projeto possui suporte a ambiente local com Docker Compose para subir o PostgreSQL.

## Integração com o frontend

Frontend público:

- https://fitai.andressouza25.com.br
