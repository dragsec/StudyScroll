# StudyScroll

StudyScroll is a mobile-first learning app that redirects the scrolling habit into short, active study sessions. This MVP reproduces the project Figma and uses mocked questions so the complete learning loop can be tested without a database.

## Included in the MVP

- Responsive landing page
- Infinite question feed with topic and difficulty filters
- Legit/Sus answer judgments with explanations and scoring
- Saved questions, sharing, session progress, and guest profile views
- Mobile bottom navigation and accessible bottom sheets

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The landing page is `/`; the learning app is `/learn`.

## Validation

```bash
npm run typecheck
npm run build
```

Product and design decisions are documented in `PRODUCT.md` and `DESIGN.md`. The original whitepaper remains in `docs/WHITEPAPER.md`.
