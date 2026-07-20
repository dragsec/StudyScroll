# StudyScroll

StudyScroll is a mobile-first learning app that redirects the habit of scrolling into active study. Instead of passively consuming a feed, learners inspect short technical questions, judge three plausible answers as **Legit** or **Sus**, and receive immediate explanations.

The MVP is designed for quick sessions, low friction, and deliberate practice. Its versioned local dataset contains 168 reviewed technical questions, so the complete product loop can be tested before authentication, AI generation, and a production database are introduced.

## Mobile-first by design

StudyScroll is designed for phones first because its core interaction is short, thumb-friendly learning inside a scrolling feed. Mobile is the primary product experience and the main design target for every screen, control, bottom sheet, and navigation decision.

The desktop version is a responsive adaptation rather than a separate interface. It keeps the learning feed compact and centered while moving navigation into an Instagram-style left sidebar. This preserves the mobile rhythm without stretching cards or weakening the focused scrolling experience on larger screens.

## Why StudyScroll

Most learning tools ask users to create a new habit. StudyScroll starts from one they already have.

The experience combines retrieval practice, immediate feedback, spaced repetition, and calibrated difficulty with the familiar interaction pattern of a social feed. The research and product rationale are documented in [`docs/WHITEPAPER.md`](docs/WHITEPAPER.md).

## Current MVP

- Mobile-first landing page and learning app
- Infinite technical question feed
- Topic search and difficulty filters
- Three Legit/Sus judgments per question
- Immediate scoring and answer explanations
- Saved questions and share controls
- Daily goal of five perfect questions
- Persistent streak and progress data stored locally
- Subject ranks from Junior Scroller to CEO of Scrolling
- Accessible bottom sheets, keyboard controls, focus states, and reduced-motion support
- Responsive desktop presentation of the mobile product
- 168 source-backed questions across 14 technical and mathematical topics
- Backend question API with mock and PostgreSQL data modes

A question is considered perfect only when all three judgments are correct. Five perfect questions in one subject unlock the first rank.

## Product model

The core learning experience remains free:

| Access | Experience |
| --- | --- |
| Without an account | 10 posts per day, every topic, no registration |
| Free account | 100 posts per day, personalized feed, spaced repetition, streaks, and ranks |
| Premium account | Everything in the free account, plus AI-generated questions based on the learner's own prompt |

The premium feature is an optional creation tool. It does not place the core feed, topics, or learning loop behind payment.

## Rank system

| Rank | Perfect questions in one subject |
| --- | ---: |
| Junior Scroller | 5 |
| Senior Scroller | 15 |
| Staff Scroller | 35 |
| Principal Scroller | 65 |
| CEO of Scrolling | 120 |

## Design

The interface is based on the original [StudyScroll Figma design](https://www.figma.com/design/HGWDBinn0RIboxdUAf43su/Studyscroll), created for the project by the founder's design collaborator. It defines the mobile UX, visual identity, typography, colors, feed cards, bottom sheets, and navigation direction.

The implementation preserves that dark, compact visual language while extending it to interactive states, responsive behavior, accessibility, progress gamification, and the new premium product tier.

More detail is available in [`DESIGN.md`](DESIGN.md) and [`PRODUCT.md`](PRODUCT.md).

## Built with

- Next.js 16 and React 19
- TypeScript
- CSS with reusable design tokens and responsive layouts
- Lucide and Material icon libraries
- Browser local storage for MVP progress persistence
- Versioned JSON question data with schema and quality validation
- PostgreSQL, Prisma ORM 7, migrations, and an idempotent dataset seed
- A disabled, server-only AI question-generation pipeline using the OpenAI Responses API, Structured Outputs, moderation, factual review, and bounded repair

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The landing page is `/` and the learning app is `/learn`.

By default the backend API serves the local reviewed dataset. PostgreSQL setup, migration, seeding, deployment, and verification are documented in [`docs/DATABASE.md`](docs/DATABASE.md).

## Validation

```bash
npm run typecheck
npm run validate:dataset
npm run db:validate
npm run test:security
npm run test:ai
npm run build
npm run check:client-bundle
```

The current threat model, VAPT findings, implemented controls, and production security checklist are documented in [`docs/SECURITY.md`](docs/SECURITY.md).

The future premium AI workflow is documented in [`lib/ai-question-generation/README.md`](lib/ai-question-generation/README.md). Developers can follow the concise [`AI activation guide`](lib/ai-question-generation/ACTIVATION.md) when the product is ready for a premium beta. Its API route is scaffolded but deliberately fails closed until authentication, premium entitlements, distributed rate limiting, durable jobs, and background execution exist.

## How we collaborated with Codex

StudyScroll was not built from one giant prompt. It came together through a lot of small, fast conversations between the founder and Codex, powered by GPT-5.6.

The founder brought the idea, the research whitepaper, the Figma design, and a very specific opinion about how the product should feel. That meant making it mobile-first, keeping the feed familiar without turning learning into a sterile quiz, counting only perfect questions toward progress, and keeping the core experience free. Even details such as rank names, icon weight, difficulty colors, and lines of copy were discussed while looking at the running app.

The working rhythm was simple: describe an idea, build it, open it locally, notice what felt wrong, and iterate. Codex turned rough notes into React and Next.js code directly in the repository, then helped refine the feed, filters, answer sheets, responsive navigation, saved state, streaks, ranks, and landing page. Because it could inspect the code and the live result in the same loop, changes that would normally become a backlog were often tested a few minutes after they were suggested.

Codex also took care of much of the engineering work behind the visible prototype. It helped structure and validate the 168-question dataset, move the questions behind server APIs, design the Prisma and PostgreSQL content model, add server-side grading, audit the client bundle for leaked answers, run security tests, and scaffold the future premium AI workflow so that it stays disabled until authentication and the other production controls exist.

GPT-5.6 was especially useful when a loose product idea crossed several disciplines at once. It could reason about the UX, trace the change through the frontend and backend, and then verify the result with type checks, tests, and production builds. The founder still made the calls: what belonged in StudyScroll, what sounded wrong, what looked off, and when an iteration was good enough to keep. Codex made those decisions much faster to explore and much cheaper to revise.

That back-and-forth is the real role AI played in StudyScroll. It was not a replacement for the product vision or the design process. It was a very fast collaborator that helped turn both into a working, testable MVP.

## Next steps

- Add authentication and account synchronization
- Add authenticated user persistence for saved questions, attempts, streaks, and ranks
- Connect authentication, premium entitlements, rate limiting, and background jobs to the scaffolded AI question-generation pipeline
- Implement personalized ranking, feed selection, and spaced repetition on the backend
- Containerize local services with Docker
- Deploy the MVP to Vercel, with a possible later migration to AWS

## Project status

StudyScroll is an interactive hackathon MVP. The learning flow, filters, saved state, streaks, ranks, product presentation, backend question API, and PostgreSQL content layer are functional. The production-oriented AI pipeline is scaffolded but disabled; authentication, user-progress persistence, payments, distributed rate limiting, and background execution are still required before it can launch.
