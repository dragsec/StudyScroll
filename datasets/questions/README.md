# StudyScroll question dataset

This folder contains the first reviewable StudyScroll question dataset. The 14 topic files in `v1` are formatted as JSON so they can be inspected by humans, loaded directly into an ETL script, or inserted into PostgreSQL as normalized question, answer, and feedback records.

Each topic contains exactly 12 questions:

- 3 easy
- 6 medium
- 3 hard

The requested "normal" band is stored as `medium` to match the difficulty name already used by the application and avoid a translation step during import.

Every question contains three answers. Every answer stores its ground-truth verdict and separate feedback for a learner who selects `legit` or `sus`. Questions deliberately vary from zero to three Sus statements, so learners cannot infer an answer pattern from the other cards.

The v1 copy uses a restrained social-feed voice. Prompts read like real technical posts and answers read like direct community replies. Reusable conversational wrappers are intentionally banned so the dataset does not repeat the same synthetic-sounding openers.

## Review status

All v1 records have `review_status: "approved"` after a complete technical and editorial pass. The coverage, review method, source policy, and automated gates are documented in [QA-v1.md](./QA-v1.md).

New or changed content should begin as `draft` in a new dataset version and become `approved` only after the same checks.

## Validate

```bash
npm run validate:dataset
```

The validator checks file structure, IDs, duplicate content, question counts, difficulty distribution, answer counts, verdict distribution, feedback consistency, review state, placeholders, and references.

## Suggested database mapping

- `topics`: one row per topic object
- `questions`: one row per question
- `answers`: three rows per question
- `answer_feedback`: two rows per answer, keyed by the learner's selected verdict
- `question_references`: one row per question reference

String IDs are stable import keys and can coexist with database-generated UUID primary keys.
