# AGENTS.md

## Overview

This repository contains a workout API built with Fastify, TypeScript, Prisma, PostgreSQL, and better-auth.

Codex must follow the architecture, conventions, and workflow rules defined in this file when generating, editing, or reviewing code.

---

## Stack

- Node.js 24.x (ES modules)
- pnpm as package manager
- TypeScript (ES2024)
- Fastify
- fastify-type-provider-zod
- Prisma ORM with PostgreSQL
- better-auth
- Zod v4
- dayjs

---

## Project Structure

- `src/index.ts` - server bootstrap
- `src/lib/` - shared infrastructure
  - `db.ts` - Prisma client
  - `auth.ts` - authentication setup
- `src/routes/` - HTTP layer (Fastify)
- `src/schemas/` - shared Zod schemas
- `src/usecases/` - business logic
- `src/errors/` - custom errors
- `src/generated/prisma/` - generated files
- `prisma/schema.prisma` - database schema
- `dist/` - build output (do not edit)

---

## Commands

### Development

- `pnpm install`
- `pnpm dev`
- `docker-compose up -d`

### Validation

- `pnpm exec tsc`
- `pnpm exec eslint .`
- `pnpm exec prettier --write .`

### Database

- `pnpm exec prisma generate`
- `pnpm exec prisma migrate dev`
- `pnpm exec prisma studio`

---

## Core Architecture

This project follows:

**Routes → Use Cases → Prisma**

### Rules

- Routes handle HTTP only
- Use cases handle business logic
- Prisma is accessed only inside use cases
- Never skip layers
- Never move business logic into routes

---

## General Workflow Rules

- Always understand existing code before modifying
- Prefer minimal, focused changes
- Follow existing patterns before creating new ones
- Do not introduce new libraries without clear necessity
- Treat `tsc` + `eslint` as mandatory validation
- Keep schemas, routes, and docs in sync

### Decision Priority (VERY IMPORTANT)

When generating code, follow this priority:

1. Existing project patterns
2. Rules in this file
3. Simplicity and readability
4. Performance (only when relevant)

---

## Git Rules

- Always use Conventional Commits
- Examples:
  - `feat: add workout creation`
  - `fix: validation error`
- Never commit without explicit user permission
- Never run git commands unless asked

---

## Coding Style

- Always use TypeScript
- Never use `any`
- Prefer named exports
- Use 2 spaces + semicolons
- One responsibility per file/module
- Use ESM imports with `.js` when required
- Respect ESLint import order

---

## Functions

- Prefer arrow functions
- Use verb-based names
- Prefer early returns
- Avoid nested conditionals
- Prefer `map`, `filter`, `reduce`
- Use object params when > 2 arguments

---

## Naming Conventions

- `camelCase` → variables/functions
- `PascalCase` → classes
- `kebab-case` → files
- Use cases are exception → `PascalCase`

---

## Date Handling

- Always use `dayjs`

---

## Zod Rules

- Always use Zod v4
- Never use Zod v3 patterns
- Prefer specific validators:
  - `z.url()`
  - `z.iso.date()`
  - `z.iso.datetime()`
  - `z.iso.time()`
  - `z.iso.duration()`

---

## Routes Rules

Routes must:

- follow REST
- use `fastify-type-provider-zod`
- validate request/response with Zod
- use shared schemas (`src/schemas`)
- call a use case (always)
- never contain business logic
- handle errors from use cases
- include `tags` and `summary`

### Authentication

- Always use `auth.api.getSession`
- Return `401` if no session

### WeekDay

- Always use `z.enum(WeekDay)`
- Never use `z.string()`

---

## Use Case Rules

Use cases must:

- be classes
- have `execute()` method
- use `InputDto` and `OutputDto`
- never return Prisma models
- map output explicitly
- call Prisma directly
- never use repositories
- never use `try/catch` for HTTP
- throw custom errors

---

## Error Handling

- Use cases throw errors
- Routes translate errors → HTTP
- Routes log unexpected errors

---

## Prisma Rules

- Only used inside use cases
- Prefer transactions when needed
- Always regenerate client after schema changes

---

## Authentication Rules

- Managed by better-auth
- Routes handle session retrieval
- Do not duplicate auth logic in use cases

---

## Documentation Rules

- Swagger must match schemas
- Always include:
  - `tags`
  - `summary`
  - typed responses

---

## Testing (Current State)

No test suite yet.

Minimum validation:

- `tsc`
- `eslint`

---

## Security

- Use `.env` for secrets
- Never commit credentials
- Be careful with auth and CORS changes

---

## What Codex MUST Avoid

- Writing business logic in routes
- Returning Prisma models directly
- Ignoring DTO patterns
- Creating abstractions not used in the project (ex: repositories)
- Adding libraries without reason
- Making large refactors without request

---

## Review Checklist

Before finishing any change, ensure:

- Routes are thin
- Business logic is in use cases
- DTOs are respected
- Zod v4 is used correctly
- Errors follow pattern
- Naming conventions are correct
- No git action was performed
