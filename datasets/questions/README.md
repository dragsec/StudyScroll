# StudyScroll question dataset

This folder contains the first reviewable StudyScroll question dataset. The 14 topic files in `v1` are formatted as JSON so they can be inspected by humans, loaded directly into an ETL script, or inserted into PostgreSQL as normalized question, answer, and feedback records.

Each topic contains exactly 12 questions:

- 3 easy
- 6 medium
- 3 hard

The requested "normal" band is stored as `medium` to match the difficulty name already used by the application and avoid a translation step during import.

Every question contains three answers. Every answer stores its ground-truth verdict and separate feedback for a learner who selects `legit` or `sus`. Questions deliberately vary from zero to three Sus statements, so learners cannot infer an answer pattern from the other cards.

The v1 copy is written as a simulated social feed rather than a stack of textbook cards. Prompts move between study-group questions, code-review debates, comment-thread arguments, practical requests, and deliberately casual knowledge checks. Replies vary in confidence and tone because some fictional commenters are correct and some are confidently wrong.

Every post and reply has its own editorial entry. The copy is paraphrased around the actual concept instead of wrapping a textbook sentence in a reusable opener. Fictional students can sound tentative, tutors tend to be precise, and experienced technical roles are more direct, including when their answer is deliberately wrong.

The factual verdicts and correction branches remain separate from the social copy. Future rebuilds therefore reproduce the reviewed writing without changing which claims are Legit or Sus.

## Review status

All v1 records have `review_status: "approved"` after a complete technical and editorial pass. The coverage, review method, source policy, and automated gates are documented in [QA-v1.md](./QA-v1.md).

New or changed content should begin as `draft` in a new dataset version and become `approved` only after the same checks.

## Validate

```bash
npm run validate:dataset
```

The validator checks file structure, IDs, duplicate content, question counts, difficulty distribution, answer counts, verdict distribution, feedback consistency, review state, placeholders, and references.

## Database mapping

- `topics`: one row per topic object
- `question_sets`: the curated release or a future reviewed AI-generated set
- `questions`: one row per question
- `answers`: three rows per question, including both vote-specific feedback branches
- `question_references`: one row per question reference

String IDs are stable import keys and coexist with database-generated UUID primary keys. The implemented Prisma schema and seed are documented in [`docs/DATABASE.md`](../../docs/DATABASE.md).
