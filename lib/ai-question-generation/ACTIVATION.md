# Activating premium AI question sets

> This is a developer checklist, not an active feature. The current UI does not call OpenAI, the route returns `feature_disabled`, and the entitlement and quota adapters deliberately deny every request.

## How the future request should work

1. A signed-in premium user submits a topic of at most 10 words.
2. The server validates the request, entitlement, quota, and topic policy.
3. The server creates a durable generation job and returns its ID immediately.
4. A background worker moderates the topic, generates 20 questions, validates them, reviews every claim, and repairs rejected questions.
5. The worker publishes the set only if all 20 questions pass.

Browser mutation requests must include `Content-Type: application/json`, `X-StudyScroll-Request: 1`, and the browser-provided same-origin headers. Set `APP_ORIGIN` to the canonical deployed HTTPS origin before enabling the endpoint.
6. The app polls the job and shows `queued`, `generating`, `reviewing`, `ready`, or `failed`.

The present `pipeline.ts` implements steps 4 and 5 synchronously as a proof of concept. Replace the direct pipeline call in the POST route with a database-backed job before enabling the feature in production.

## Where the OpenAI API key goes

Create a server-side OpenAI project key, then copy `.env.example` to `.env.local` and add it there:

```dotenv
OPENAI_API_KEY=your_server_side_key
AI_SAFETY_HMAC_SECRET=a_random_secret_of_at_least_32_characters
AI_QUESTION_GENERATION_ENABLED=false
```

`lib/ai-question-generation/openai-client.ts` reads `OPENAI_API_KEY` on the server. Never place the key in React code, expose it in the browser, commit `.env.local`, or prefix it with `NEXT_PUBLIC_`. In Vercel or AWS, use the platform's encrypted environment or secret manager instead of a file.

Keep `AI_QUESTION_GENERATION_ENABLED=false` while building the remaining infrastructure. An API key alone cannot activate the current endpoint because entitlement and quota checks also fail closed.

## Files a developer will connect

- `app/api/ai/question-sets/route.ts`: authenticate, validate, and create a job.
- `entitlement.ts`: replace the placeholder with a server-verified premium subscription lookup.
- `rate-limit.ts`: replace the placeholder with a distributed quota reservation, such as Redis plus a database ledger.
- `pipeline.ts`: run this from a worker, not a browser or a long serverless request.
- `prompts.ts`: version and evaluate prompt changes.
- `schemas.ts` and `validation.ts`: keep these as the hard output contract.
- `openai-client.ts`: the only place that constructs the server-side OpenAI client.

## Required production pieces

Before switching the flag to `true`:

- Add real authentication and premium billing webhooks. Never trust a premium flag sent by the client.
- Store generation jobs, idempotency keys, ownership, status, attempt count, prompt version, model version, token use, latency, and approved output.
- Add a queue and worker with bounded concurrency, cancellation, timeouts, retries, and dead-letter handling.
- Reserve quota before generation, settle it on success, and release it on provider or quality failure.
- Add per-user and per-IP limits, a daily spending ceiling, and alerts for unusual traffic or cost.
- Deduplicate within the new set and against previously published sets.
- Keep one user's custom sets private unless they explicitly publish them.
- Treat model-provided references as claims. Validate their domains and relevance, and never fetch arbitrary URLs from the app server without SSRF-safe controls.
- Add reporting, deletion, privacy retention rules, and a human review path for disputed questions.
- Reject personalized medical, legal, financial, self-harm, weapon, or other safety-critical guidance. General educational topics can be allowed only when they remain factual and non-prescriptive.
- Build an evaluation suite and release threshold for factual accuracy, verdict accuracy, feedback quality, source quality, duplicates, safety, latency, and cost.

## Suggested minimal data model

`ai_generation_jobs` should include `id`, `user_id`, `topic`, `status`, `idempotency_key`, `attempts`, `prompt_version`, `model`, `usage`, `error_code`, and timestamps. Save generated drafts in private staging storage. Copy questions into the learner dataset only after the entire set is approved.

## Safe activation order

1. Implement auth, entitlement checks, job storage, the queue, and quota reservation.
2. Run `npm run test:ai`, `npm run typecheck`, and `npm run build`.
3. Run factual and adversarial evaluations in a non-production environment with strict spend limits.
4. Add monitoring and a kill switch.
5. Enable the feature for internal accounts, then a small premium beta.
6. Set `AI_QUESTION_GENERATION_ENABLED=true` only after the other gates are proven.

See `README.md` in this folder for the pipeline design, security boundaries, model roles, and official OpenAI references.
