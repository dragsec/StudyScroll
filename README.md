# StudyScroll

StudyScroll is a mobile-first learning app that redirects the habit of scrolling into active study. Instead of passively consuming a feed, learners inspect short technical questions, judge three plausible answers as **Legit** or **Sus**, and receive immediate explanations.

The MVP is designed for quick sessions, low friction, and deliberate practice. It currently runs with mocked technical questions so the complete product loop can be tested before authentication, AI generation, and a production database are introduced.

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
- Mocked question data for the current prototype

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The landing page is `/` and the learning app is `/learn`.

## Validation

```bash
npm run typecheck
npm run build
```

## How we collaborated with Codex

StudyScroll was built through an iterative collaboration between the founder and Codex, powered by GPT-5.6.

The founder supplied the original concept, research whitepaper, product constraints, and detailed feedback throughout development. The key product decisions also came from the founder: making the experience mobile-first, separating the guest landing page from the main app, using three judgments per question, counting only perfect questions toward progress, setting the daily goal and rank thresholds, keeping the core learning loop free, and introducing premium AI-generated questions from a learner's specific prompt. The visual direction came from the supplied Figma work, with continuous human review of spacing, colors, icons, copy, and interaction details.

Codex accelerated the workflow by translating those inputs into a working Next.js prototype directly in the repository. It helped scaffold and refine the application, implement the responsive feed and bottom sheets, connect filters and answer states, add local progress persistence, build the streak and ranking experience, reproduce the navigation icon states, and keep the landing page aligned with evolving product decisions. It also shortened the feedback loop by repeatedly running TypeScript and production builds, inspecting the app in a local browser, and correcting visual or interaction issues immediately.

GPT-5.6 contributed reasoning across product, engineering, and design implementation. It helped turn rough notes into coherent interface behavior, suggested clear information hierarchy for new screens, identified inconsistencies between the design and the running app, and implemented approved changes. Codex acted as a fast engineering and design partner, while the founder remained responsible for the idea, priorities, final product choices, and approval of the experience.

This collaboration made it possible to move quickly without treating AI output as the product decision itself. Each iteration started from human intent and was checked against the research, Figma design, and live prototype.

## Next steps

- Add authentication and account synchronization
- Replace mocked questions with PostgreSQL-backed content
- Generate custom premium questions with AI
- Add validation and moderation for generated learning content
- Implement personalized ranking, feed selection, and spaced repetition on the backend
- Containerize local services with Docker
- Deploy the MVP to Vercel, with a possible later migration to AWS

## Project status

StudyScroll is an interactive hackathon MVP. The learning flow, filters, saved state, streaks, ranks, and product presentation are functional. Authentication, database persistence, production AI generation, and payments are planned but not yet implemented.
