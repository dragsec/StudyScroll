# StudyScroll database

StudyScroll uses PostgreSQL through Prisma ORM 7. The app has two explicit question data modes:

- `mock`: serve the reviewed JSON dataset through the backend API without opening a database connection;
- `postgres`: require PostgreSQL and return `503` if it is unavailable;
- `auto`: use PostgreSQL when `DATABASE_URL` exists, otherwise use the JSON dataset.

The browser always requests questions from `GET /api/questions`. This keeps the UI independent from the storage implementation and lets the hackathon demo remain usable before PostgreSQL is configured.

## Choose a local mode

Use an explicit development command instead of editing `.env` whenever you switch:

```bash
# Reviewed JSON dataset, no question database required
npm run dev:mock

# PostgreSQL is required and failures do not fall back to mock data
npm run dev:postgres
```

Both commands still load shared settings such as Supabase credentials and database URLs from `.env`. They only override `QUESTION_DATA_SOURCE` for that process. Use `npm run dev` when you deliberately want the value from `.env`, including `auto`.

For a local production build, the equivalent commands are `npm run start:mock` and `npm run start:postgres`. Run `npm run build` first. Normal development should use the `dev:*` commands.

## Local PostgreSQL setup

1. Copy `.env.example` to `.env`.
2. Start the database:

```bash
docker compose up -d postgres
```

3. Apply the committed migrations and import the reviewed v1 dataset:

```bash
npm run db:deploy
npm run db:seed
```

4. Start StudyScroll in PostgreSQL mode and verify both endpoints:

```bash
npm run dev:postgres
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
- `learner_profiles` connects a Supabase Auth UUID to timezone-aware learning data without duplicating email addresses.
- `question_attempts` keeps the append-only grading history used for analytics and progress totals.
- `user_question_states` records attempts, mastery, and the next time a question should return.
- `user_saved_questions` synchronizes a learner's saved feed items.
- `user_daily_progress` stores unique perfect questions per local calendar day for streaks.
- `user_subject_progress` stores unique perfect questions per topic for ranks.
- `password_recovery_grants` stores SHA-256 hashes for short-lived, single-use password recovery grants.

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
- Keep `DATABASE_POOL_MAX=1` on Vercel unless the Supabase connection budget has been calculated for concurrent function instances.
- Set `QUESTION_DATA_SOURCE=postgres` in production so a database outage is visible instead of silently switching content stores.
- Set `APP_ORIGIN` to the exact deployed HTTPS origin so mutation requests can be verified independently of proxy headers.
- Run `npm run db:deploy` before starting the new application release.
- Authentication setup and the user-data security boundary are documented in [`AUTH.md`](AUTH.md).
