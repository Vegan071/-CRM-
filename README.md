# МФЦДО CRM

CRM для учёта учебных групп, слушателей, преподавателей, договоров и оплат.

**Стек:** Next.js (App Router) · React 19 · Prisma 7 + PostgreSQL · better-auth · Tailwind 4 · zod · react-hook-form.
Структура `src/` — по Feature-Sliced Design (`app`, `pages`, `widgets`, `features`, `entities`, `shared`); маршруты Next лежат в `app/`.

## Запуск

```bash
pnpm install
cp .env.example .env        # заполните переменные
pnpm db:migrate             # применить миграции
pnpm db:seed                # создать первого администратора (ADMIN_EMAIL / ADMIN_PASSWORD)
pnpm dev
```

Открыть http://localhost:3000.

## Переменные окружения

См. `.env.example`: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `DATA_ENCRYPTION_KEY`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
`DATA_ENCRYPTION_KEY` — 32 байта в base64 (`openssl rand -base64 32`); им шифруются СНИЛС и паспорт.

## Доступ

Регистрация создаёт заявку (`PENDING`). Войти можно только после подтверждения администратором в «Администрирование → Пользователи».

## Скрипты

| Команда | Что делает |
| --- | --- |
| `pnpm dev` / `pnpm build` / `pnpm start` | разработка / сборка / запуск |
| `pnpm lint` | ESLint |
| `pnpm db:generate` | сгенерировать Prisma Client (в `prisma/generated`, в git не хранится) |
| `pnpm db:migrate` / `pnpm db:deploy` | миграции (dev / prod) |
| `pnpm db:seed` / `pnpm db:studio` | сид админа / Prisma Studio |
