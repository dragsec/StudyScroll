# Authentication and learner accounts

StudyScroll uses Supabase Auth for identity and PostgreSQL through Prisma for learning data. Email/password and Google sign-in share the same server-verified session flow.

Passwords never enter the Prisma schema or StudyScroll database. Supabase Auth salts and hashes passwords. StudyScroll also does not duplicate email addresses in its learner tables: email remains in Supabase Auth, while the application database stores only the Supabase user UUID and learning records.

## Configure Supabase

1. Create a Supabase project and copy `.env.example` to `.env.local`.
2. Add the project URL, publishable key, and service role key:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_ONLY_SERVICE_ROLE_KEY
AUTH_RECOVERY_HMAC_SECRET=AN_INDEPENDENT_RANDOM_VALUE_OF_AT_LEAST_32_CHARACTERS
```

3. Use the Supabase pooled PostgreSQL URL for `DATABASE_URL` and the direct URL for `DIRECT_DATABASE_URL`.
4. Apply migrations and seed the reviewed questions:

```bash
npm run db:deploy
npm run db:seed
```

5. In Supabase Authentication URL Configuration, set the production Site URL and allow these redirect URLs as appropriate:

```text
http://localhost:3000/auth/callback
https://YOUR_DOMAIN/auth/callback
```

Add preview redirect patterns only if the team needs authentication on Vercel previews. Keep `APP_ORIGIN` set to the exact production HTTPS origin. Vercel preview requests are separately restricted to the current `VERCEL_URL`.

## Email and password

Enable email/password sign-in and email confirmation in Supabase. StudyScroll enforces 12 characters in the UI; configure the same minimum in the Supabase password settings so the server remains authoritative. Before a public launch:

- configure a custom SMTP provider;
- enable leaked-password protection if available on the selected Supabase plan;
- review Supabase Auth rate limits;
- add CAPTCHA to sign-up and password recovery if abuse becomes possible;
- customize confirmation, email-change, and password-reset templates.

Password recovery returns through `/auth/callback` and then `/auth/reset?mode=update`. The callback accepts only Supabase's PKCE `recovery` redirect type and issues a signed, HTTP-only, user-bound grant that expires after ten minutes. PostgreSQL stores only its SHA-256 hash. The password update route atomically consumes the grant before changing the password and revoking sessions, so concurrent or replayed submissions cannot reuse it. A normal signed-in session cannot open the recovery form directly. Email changes use Supabase's confirmation flow. Error messages deliberately avoid revealing whether an email address exists.

## Google sign-in

Create a Google OAuth web client. In Google Cloud, use the callback URL shown by Supabase, normally:

```text
https://YOUR_PROJECT.supabase.co/auth/v1/callback
```

Put the Google client ID and secret in the Supabase Google provider settings, not in StudyScroll or Vercel. Add the local and deployed StudyScroll origins to the Google client's authorized JavaScript origins, then enable the provider in Supabase.

## Learning data behavior

Guests remain usable without an account. Their saves and progress stay in browser local storage.

Signed-in learners use server-owned PostgreSQL records:

- `learner_profiles` stores the Supabase user UUID and timezone, but no email;
- `question_attempts` is an append-only attempt history;
- `user_question_states` schedules missed questions and later reviews;
- `user_saved_questions` synchronizes saves;
- `user_daily_progress` powers the five-perfect-questions daily goal and streak;
- `user_subject_progress` powers ranks using unique perfect questions per subject.
- `password_recovery_grants` stores hashed, expiring, single-use recovery grants and never stores reset tokens in plaintext.

An imperfect question becomes due again after 10 minutes. Perfect answers progress through 1, 3, 7, 14, and 30 day intervals. Feed ordering puts due missed questions first, then due reviews, unseen questions, and future reviews.

## Security model

- Browser auth uses Supabase's publishable key. This key is public by design.
- The service role key is used only in the server-side account deletion route. Never expose it with a `NEXT_PUBLIC_` prefix.
- The password recovery signing key is independent, server-only, and must contain at least 32 random characters.
- Every learner-data route verifies the user with Supabase Auth and scopes database queries to that UUID.
- Mutation routes require same-origin requests, a custom request header, JSON content types, and bounded bodies.
- Row Level Security is enabled with no browser policies on StudyScroll tables. The Supabase Data API cannot read answer keys or learner data; trusted Next.js routes are the data boundary.
- Account deletion requires a sign-in from the last 15 minutes, removes the learner profile and all related learning rows through database cascades, then deletes the Supabase Auth user.

## Local verification

Authentication cannot complete until the Supabase project and provider credentials are configured. The rest of the app stays available in guest mode. After configuration, verify:

1. email sign-up, confirmation, login, logout, and reset;
2. Google sign-in and callback;
3. save synchronization in a second browser session;
4. a perfect and imperfect attempt, then the Progress tab;
5. email and password changes;
6. account deletion and rejection of the old credentials.
