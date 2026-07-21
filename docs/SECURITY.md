# StudyScroll security architecture

Assessment date: 21 July 2026  
Scope: the local StudyScroll repository and `http://127.0.0.1:4173` only  
Assessment type: authorized, non-destructive source review and local web/API security testing

## Executive summary

This document records the controls implemented in the local MVP and the checks that must still be repeated against the deployed Supabase, PostgreSQL, Vercel, email, and Google OAuth configuration. It is not a claim that the future production environment has already been penetration-tested.

The most important issue was that `GET /api/questions` returned the correct verdict and both feedback branches before the learner voted. The same private dataset also entered a client JavaScript chunk through a shared module. Anyone could inspect either source, obtain every answer, and fabricate perfect local progress. The public feed and client bundle now contain only question and reply text. Grading happens through a separate same-origin POST endpoint after all three judgments are submitted.

No dependency vulnerability, committed secret, SQL injection path, unsafe HTML rendering sink, permissive CORS policy, enabled premium bypass, or exposed unauthenticated database write endpoint was found.

## Fixed findings

| Severity | Finding | Resolution |
| --- | --- | --- |
| High | Answer keys and feedback were exposed in the public feed and client bundle | Split public and server-private modules, stripped verdicts and feedback, scanned production chunks, and moved grading to `POST /api/questions/{id}/grade` |
| High | Any authenticated session could open the password update URL without proving it came from a recovery email | Password recovery now requires Supabase's PKCE recovery type plus a signed, HTTP-only, user-bound, ten-minute grant whose hash is atomically consumed in PostgreSQL |
| Medium | Auth callback destinations and production origin fallback were too permissive | Added an exact destination allowlist and fail-closed HTTPS canonical-origin validation |
| Medium | Authentication responses could retain sensitive recovery navigation data in caches or referrers | Added `no-store` to callback and mutation responses, revalidation on rendered auth pages, and `no-referrer` across authentication routes |
| Medium | No global clickjacking, MIME-sniffing, referrer, permissions, or CSP headers | Added a site-wide security-header policy and disabled the `X-Powered-By` fingerprint |
| Medium | State-changing AI requests accepted requests with no Origin header | Added strict same-origin, Fetch Metadata, and custom-header verification |
| Medium | Request size was checked only after `request.text()` allocated the complete body | Added streaming byte limits plus early `Content-Length` rejection |
| Medium | Grading could have caused a full dataset database read per submission | Added a single indexed question lookup for PostgreSQL grading |
| Low | `application/json.evil` passed the previous prefix content-type check | Content type must now be exactly `application/json`, with optional parameters |
| Low | API responses revealed whether mock or PostgreSQL storage was active | Removed storage implementation metadata and headers from public responses |
| Low | Reference URL checks missed several private IPv4 and IPv6 ranges | Expanded URL validation and added regression coverage |
| Low | Raw database error messages were written to logs | Logs now record only the error type at the public API boundary |

## Controls verified

- Prisma parameterizes database queries; no raw user-controlled SQL is present.
- The database API exposes read and grading operations only.
- React renders question content as text; the app has no application-owned `dangerouslySetInnerHTML`, `innerHTML`, `eval`, or dynamic function sink.
- External references require public HTTPS URLs and links use `noopener noreferrer`.
- Premium AI generation, entitlement checks, and rate limiting fail closed.
- AI topics have length, word-count, normalization, prompt-injection, moderation, and structured-output gates.
- AI references reject credentials, local names, private addresses, link-local addresses, and unsafe protocols.
- Database URLs and OpenAI credentials remain server-side and `.env` files are ignored.
- Supabase sessions are verified server-side with `auth.getUser()` before learner data is read or mutated.
- Every learner query is scoped by the verified Supabase UUID; email addresses and passwords are not duplicated in Prisma.
- Password recovery grants are signed, expire after ten minutes, are bound to one user, use HTTP-only cookies, store only a SHA-256 hash in PostgreSQL, and are atomically rejected on replay, tampering, expiry, or direct navigation.
- Account deletion requires a sign-in from the last 15 minutes and the service-role key remains in a server-only module.
- Auth callbacks accept only `/learn`, `/account`, or the forced recovery destination and never trust the production request host as a fallback.
- Cross-origin probes received no permissive CORS response header.
- Unsupported write methods on the question feed return `405`.
- Application routes do not implement TRACE or CONNECT, and probe headers or cookies are not reflected. The hosting edge must reject those methods before they reach Next.js.
- Production client chunks contain no verdict or feedback signatures from the private dataset.
- The package audit reported zero known vulnerabilities; installed package signatures and attestations verified.

## Residual risks and launch requirements

These are architectural boundaries of the current guest MVP, not hidden fixes:

1. Guest saves, streaks, and ranks remain in `localStorage`. They are presentation-only and can be edited by the device owner. Never treat them as trusted rewards or account state.
2. The grading endpoint returns the correct verdict after a submission and currently permits retries. When accounts launch, record the first attempt server-side in a transaction and calculate ranks only from immutable server records.
3. Supabase email delivery, provider rate limits, breached-password protection, CAPTCHA, Google OAuth, and cookie behavior require verification against the real hosted project. They cannot be fully exercised without deployment credentials.
4. The production CSP still needs `unsafe-inline` for Next.js bootstrap scripts. A nonce-based CSP can remove it later, but it makes the current static pages dynamic and adds deployment complexity.
5. PostgreSQL was not available during this assessment because Docker Desktop was stopped. Prisma validation passed, but live database roles, TLS, network exposure, backups, and migration permissions must be checked against the deployed instance.
6. AI generation remains disabled. Before activation, add authenticated jobs, distributed quotas, cost ceilings, audit logs, and an explicit human dispute path.

## Commands and regression tests

```bash
npm audit --audit-level=low
npm audit signatures
npm run test:security
npm run test:ai
npm run validate:dataset
npm run db:validate
npm run typecheck
npm run build
npm run check:client-bundle
```

The security test suite covers same-origin mutation enforcement, custom request headers, exact JSON media types, streaming body limits, answer-key removal, private-reference URL rejection, auth redirect allowlisting, production-origin validation, and tamper-resistant password recovery grants.

## Production checklist

- Set `APP_ORIGIN` to the exact deployed HTTPS origin.
- Set `QUESTION_DATA_SOURCE=postgres`; never silently fall back in production.
- Use a least-privileged runtime database role that cannot create schemas or run migrations.
- Run migrations with a separate deployment credential.
- Restrict PostgreSQL network access to the application and deployment environment.
- Configure `AUTH_RECOVERY_HMAC_SECRET` with an independent random value of at least 32 characters.
- Enable Supabase's current-password requirement, a 12-character minimum, leaked-password protection where available, and appropriate Auth rate limits.
- Configure custom SMTP and verify that password reset responses do not reveal whether an account exists.
- Add CAPTCHA before public registration if automated abuse is possible.
- Block TRACE and CONNECT at the hosting edge.
- Add centralized rate limiting and security-event logging before enabling authenticated writes or AI.
- Retest from the deployed HTTPS origin, including TLS, CDN, cookies, authentication, and database authorization.
