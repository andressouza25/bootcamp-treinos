# AGENTS.md

Estas instruções se aplicam a todos os arquivos dentro de `src/usecases/`.

## Use Cases

- Todas as regras de negócio devem estar concentradas dentro de um use case.
- Todos os use cases devem ser criados em `src/usecases`.
- Todos os use cases devem ser classes, com um método `execute`.
- Todos os use cases devem ser nomeados com verbos.
- Arquivos de use case devem usar PascalCase.
- Quando um use case receber parâmetros, eles devem **SEMPRE** ser recebidos em um DTO `InputDto`, definido no mesmo arquivo.
- O retorno de um use case deve **SEMPRE** ser tipado com uma interface `OutputDto`, definida no mesmo arquivo.
- O use case deve mapear o resultado do banco para o `OutputDto`.
- **NUNCA** retorne o model do Prisma diretamente.
- Ao precisar interagir com o banco, um use case deve **SEMPRE** chamar o Prisma diretamente.
- Não crie repository layer neste projeto, a menos que o usuário peça explicitamente.
- **NUNCA** lide com erros nos use cases usando `try/catch`.
- Caso um use case precise sinalizar erro, ele deve lançar **SEMPRE** um erro customizado definido em `src/errors/index.ts`.
- Se o erro necessário não existir, crie-o.

## Prisma

- Use transações Prisma quando houver necessidade de atomicidade.
- Prefira consultas explícitas e mapeamento explícito do retorno.
- Mantenha o use case desacoplado dos detalhes de transporte HTTP.

## Restrições

- Não usar `reply`, `request`, `FastifyInstance` ou qualquer detalhe de rota dentro de use cases.
- Não usar schemas de rota como substituto do DTO interno.
- Não retornar resposta formatada para HTTP.
