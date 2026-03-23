## 2) `src/routes/AGENTS.md`

Substitua o arquivo de `src/routes/AGENTS.md` por isto:

```md
# AGENTS.md

Estas instruções se aplicam a todos os arquivos dentro de `src/routes/`.

## Fastify: Rotas de API

- **SEMPRE** siga os princípios do REST para criar rotas.
- Exemplo: `GET /workout-plans`, `GET /workout-plans/:id/days`.
- **SEMPRE** crie os arquivos das rotas em `src/routes`.
- **SEMPRE** use `fastify-type-provider-zod` para definir os schemas de request e response.
- **SEMPRE** use Zod v4.
- **SEMPRE** crie os schemas das operações de criação e atualização dentro de `src/schemas/index.ts`.
- **SEMPRE** use `z.enum(WeekDay)` importado de `../generated/prisma/enums.js` para tipar campos de dia da semana nos schemas.
- **NUNCA** use `z.string()` para representar `WeekDay`.
- **SEMPRE** use `src/schemas/index.ts` para tipar respostas de erro.
- Uma rota **NUNCA** deve conter regras de negócio, apenas:
  - validações de dados com Zod;
  - autenticação, quando necessário;
  - chamada do use case;
  - tratamento de erros;
  - definição de status HTTP.
- Quando uma rota precisar ser protegida, **SEMPRE** use `auth.api.getSession` em `src/lib/auth.ts` para recuperar a sessão do usuário.
- Uma rota deve **SEMPRE** instanciar e chamar um use case.
- **SEMPRE** trate os erros lançados pelo use case.
- **SEMPRE** inclua `tags` e `summary` no schema da rota para documentação Swagger/OpenAPI.

## Estrutura esperada de uma rota

- importar schemas compartilhados de `src/schemas/index.ts`;
- validar request/response com Zod;
- buscar sessão quando a rota for protegida;
- instanciar um use case;
- chamar `execute`;
- traduzir erros para respostas HTTP apropriadas;
- logar erros inesperados com `app.log.error`.

## Restrições

- Não implementar regra de negócio dentro da rota.
- Não acessar Prisma diretamente dentro da rota.
- Não duplicar schemas se eles já puderem viver em `src/schemas/index.ts`.
```
