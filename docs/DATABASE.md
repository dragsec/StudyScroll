# StudyScroll database

StudyScroll uses PostgreSQL through Prisma ORM 7. The app has two explicit question data modes:

- `mock`: serve the reviewed JSON dataset through the backend API without opening a database connection;
- `postgres`: require PostgreSQL and return `503` if it is unavailable;
- `auto`: use PostgreSQL when `DATABASE_URL` exists, otherwise use the JSON dataset.

The browser always requests questions from `GET /api/questions`. This keeps the UI independent from the storage implementation and lets the hackathon demo remain usable before PostgreSQL is configured.

## Local PostgreSQL setup

1. Copy `.env.example` to `.env`.
2. Set `QUESTION_DATA_SOURCE=postgres`.
3. Start the database:

```bash
docker compose up -d postgres
```

4. Apply the committed migrations and import the reviewed v1 dataset:

```bash
npm run db:deploy
npm run db:seed
```

5. Start StudyScroll and verify both endpoints:

```bash
npm run dev
```

- `GET /api/health` should return `{"status":"ok"}`.
- `GET /api/questions` should report 168 questions without exposing verdicts, feedback, or the storage implementation.

The seed is idempotent. It upserts the curated `v1` question set by stable keys, updates changed content, removes stale questions only from that exact set, and verifies that PostgreSQL contains 14 topics, 168 questions, and 504 answers before succeeding.

## Schema

The canonical schema is `prisma/schema.prisma`; SQL migrations live under `prisma/migrations`.

- `topics` stores searchable subjects.
- `question_sets` separates curated releases from future AI-generated sets and gives each set a publish lifecycle.
- `questions` stores difficulty, review state, source set, topic, and stable import key.
- `answers` stores the three replies, verdicts, and vote-specific feedback.
- `question_references` stores the authoritative source attached to each question.

Foreign keys protect relationships. Cascades are limited to content owned by a question set or question, while topics use restricted deletion. Feed lookup indexes cover publication state, topic, difficulty, review status, and active content.

## Prisma commands

```bash
npm run db:validate
npm run db:generate
npm run db:migrate
npm run db:deploy
npm run db:seed
npm run db:studio
```

Use `db:migrate` only while creating migrations in development. Use `db:deploy` in CI and hosted environments to apply committed migrations non-interactively. Prisma 7 does not run seeds automatically, so execute `db:seed` explicitly when a new environment needs the curated dataset.

## Deployment notes

- Keep database URLs server-side. Never use a `NEXT_PUBLIC_` prefix.
- Use TLS in hosted environments.
- If the provider supplies separate URLs, use a pooled `DATABASE_URL` at runtime and a direct `DIRECT_DATABASE_URL` for migrations and seeding.
- Set `QUESTION_DATA_SOURCE=postgres` in production so a database outage is visible instead of silently switching content stores.
- Set `APP_ORIGIN` to the exact deployed HTTPS origin so mutation requests can be verified independently of proxy headers.
- Run `npm run db:deploy` before starting the new application release.
- The current content endpoint is read-only. Authentication, server-recorded attempts, saved questions, streaks, and ranks belong in a later user-data migration once the authentication provider is selected.
