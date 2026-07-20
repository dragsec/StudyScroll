# AI question generation

> Proof of concept only. No OpenAI request is made by the current product.

This folder contains the server-only scaffold for premium custom question sets. It is intentionally disabled and fails closed until StudyScroll has authentication, verified premium entitlements, distributed rate limiting, durable jobs, and background workers. The concise developer activation guide is in [`ACTIVATION.md`](ACTIVATION.md).

## Why this is a pipeline, not an agent

The workflow is bounded and has one known output. A general-purpose agent would add tool access, branching, state, and failure modes without improving the product. The pipeline is easier to test, observe, budget, and explain:

```text
authenticated premium user
          |
          v
local input policy -> moderation -> semantic topic gate
                                          |
                                          v
                               generate 20 questions
                                          |
                                          v
                          local schema and policy checks
                                          |
                                          v
                            independent factual reviewer
                                          |
                         rejected IDs only | approved
                                  |         v
                                  +---- targeted repair
                                            |
                                    maximum 2 rounds
                                            |
                               publish all 20 or publish none
```

## Quality contract

Each generated set contains exactly 20 questions:

- 5 easy, 10 medium, and 5 hard
- exactly 3 independently judged replies per question
- a mixture of 0, 1, 2, and 3 Sus replies
- feedback for both possible learner votes on every reply
- one authoritative public HTTPS reference per question
- restrained social-feed writing consistent with the curated dataset

Structured Outputs guarantees the response shape. Local checks then enforce constraints that a JSON schema cannot express cleanly, including uniqueness, difficulty totals, verdict distribution, safe reference URLs, and distinct feedback. A separate model pass reviews factual accuracy, verdicts, explanations, sources, relevance, safety, and tone. Only rejected question IDs are regenerated, and the complete set is reviewed again.

The pipeline is atomic: StudyScroll returns all 20 approved questions or no dataset. Partially reviewed content is never published.

## Security boundaries

- The OpenAI API key exists only on the server and is never prefixed with `NEXT_PUBLIC_`.
- The route checks a server-side premium entitlement. Client claims are ignored.
- The feature flag, entitlement adapter, and rate limiter all fail closed today.
- Input is normalized and limited to 10 words and 80 characters before any model call.
- Common instruction-injection forms, URLs, code fences, control characters, and oversized bodies are rejected locally.
- The free Moderation API runs before the semantic topic gate.
- User text is serialized as JSON in a user message. It is never concatenated into the system prompt.
- System prompts state that the topic and web results are untrusted data, not instructions.
- Generation and review receive only read-only web search. They receive no database, shell, email, or write tools.
- Responses use strict Zod schemas and are validated again locally.
- Generated HTML and local or private reference URLs are rejected.
- Browser requests are restricted to the application's own origin, and generated strings must later be rendered as text rather than with `dangerouslySetInnerHTML`.
- A privacy-preserving HMAC identifier is sent as `safety_identifier`; raw user IDs are not sent.
- Requests use `store: false`, bounded output, SDK timeouts, bounded retries, and a maximum of two repair rounds.
- API errors are sanitized. Logs use the request ID and do not include generated content or secrets.

Prompt-injection defenses reduce risk but do not prove that arbitrary input is safe. Before launch, red-team the endpoint with adversarial topics and keep the model toolset read-only and minimal.

## Route

Future endpoint:

```http
POST /api/ai/question-sets
Content-Type: application/json

{"topic":"Roman military logistics"}
```

The successful response contains a request ID and a schema-compatible `ai-v1` question set. Currently the route returns `404 feature_disabled`. Even if the feature flag is changed, entitlement and rate-limit adapters still deny access until implemented.

## Before enabling it

1. Add authentication and replace `getAiGenerationEntitlement` with a database-backed server check.
2. Add a distributed per-user and per-IP limiter. Do not use an in-memory `Map` on Vercel or multiple servers.
3. Store generation jobs and idempotency keys so refreshes cannot create duplicate paid runs.
4. Add a queue or background job because generation, web verification, review, and repair can take longer than a normal request. The current synchronous route is only a proof of concept.
5. Persist only approved sets and keep rejected drafts outside the learner feed.
6. Add spend ceilings, per-user daily quotas, timeouts, cancellation, and provider error monitoring.
7. Build an evaluation suite from curated v1 questions plus adversarial topics. Measure factual accuracy, verdict accuracy, source quality, duplicates, latency, and cost.
8. Pin a model snapshot after evaluation if reproducibility matters more than receiving automatic model updates.
9. Add a report button and a human review queue for flagged generated content.
10. Review privacy, retention, age, and acceptable-use requirements before production launch.

## Model roles

- `gpt-5.6-terra`: inexpensive semantic gate for topic usefulness and scope.
- `gpt-5.6-sol`: quality-critical generation, review, and repair.
- `omni-moderation-latest`: initial safety classification.

Models are configurable through server environment variables. Do not expose a client-side model picker for this workflow.

## Commands

```bash
npm run test:ai
npm run typecheck
npm run build
```

The API-backed stages are not executed without an API key and are not called by the current interface.

## Official references

- [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- [Safety best practices](https://developers.openai.com/api/docs/guides/safety-best-practices)
- [Moderation](https://developers.openai.com/api/docs/guides/moderation)
- [Safety identifiers](https://developers.openai.com/api/docs/guides/safety-checks)
- [Current model guidance](https://developers.openai.com/api/docs/guides/latest-model)
