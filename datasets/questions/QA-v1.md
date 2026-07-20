# Question dataset v1 quality report

Status: approved for the StudyScroll prototype  
Reviewed: 20 July 2026

## Coverage

The v1 dataset contains 168 questions across 14 topics. Every topic has:

- 3 easy questions
- 6 medium questions
- 3 hard questions
- 3 answer statements per question
- feedback for both a Legit vote and a Sus vote on every statement

That produces 504 answer statements and 1,008 vote-specific feedback paths.

| Topic | Questions | Easy | Medium | Hard | 0 Sus | 1 Sus | 2 Sus | 3 Sus |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| JavaScript | 12 | 3 | 6 | 3 | 2 | 6 | 3 | 1 |
| Python | 12 | 3 | 6 | 3 | 2 | 6 | 3 | 1 |
| DSA | 12 | 3 | 6 | 3 | 2 | 6 | 3 | 1 |
| Java | 12 | 3 | 6 | 3 | 2 | 6 | 3 | 1 |
| SQL | 12 | 3 | 6 | 3 | 2 | 6 | 3 | 1 |
| System Design | 12 | 3 | 6 | 3 | 2 | 6 | 3 | 1 |
| AWS | 12 | 3 | 6 | 3 | 2 | 6 | 3 | 1 |
| Spring Boot | 12 | 3 | 6 | 3 | 2 | 6 | 3 | 1 |
| Docker | 12 | 3 | 6 | 3 | 2 | 6 | 3 | 1 |
| Networking | 12 | 3 | 6 | 3 | 2 | 6 | 3 | 1 |
| Linux | 12 | 3 | 6 | 3 | 2 | 6 | 3 | 1 |
| Calculus | 12 | 3 | 6 | 3 | 2 | 6 | 3 | 1 |
| Operating Systems | 12 | 3 | 6 | 3 | 2 | 6 | 3 | 1 |
| Discrete Maths | 12 | 3 | 6 | 3 | 2 | 6 | 3 | 1 |

## Review performed

Every prompt, statement, verdict, and feedback branch received an editorial and technical review during MVP development. The review checked that:

- each Legit statement is true within the wording of its prompt;
- each Sus statement expresses a clear misconception rather than an arguable opinion;
- every correction directly explains the misconception without introducing a second error;
- claims with important assumptions state those assumptions in the prompt;
- terminology is appropriate for the stated difficulty;
- the three statements are distinct and the dataset includes every possible Sus count from zero to three;
- answer order and verdict count do not reveal a fixed per-question shortcut.

The review tightened several claims whose original wording left room for edge cases. These included GIL-enabled versus free-threaded CPython, traditional RDS Multi-AZ DB instances, CAP during an active partition, Spring's default proxy transaction mode, Docker Compose startup versus readiness, Linux permission mode bits, the domain of the calculus power rule, the Euclidean gradient claim, and the domains used for trees, induction, and modular congruence.

## Social-feed voice

The prompts and replies are written as direct technical posts and comments. They do not pass through reusable conversational wrappers. This keeps the feed social without making every learner sound like the same person repeating a handful of catchphrases.

Vote feedback leads with the question-specific fact or correction, then confirms the learner's judgment with varied language. The automated checks reject the canned openers removed during the editorial pass.

The current release contains no exact duplicate prompt, answer statement, or feedback string. Similar openings remain only where the parallel wording teaches a real contrast, such as stack versus queue or injective versus surjective functions.

## Automated gates

Run `npm run validate:dataset` before committing dataset changes. The validator rejects:

- missing topics, questions, answers, references, verdicts, or feedback;
- duplicate question IDs, prompts, or answer text;
- invalid difficulty totals or review states;
- missing or identical feedback branches and banned canned openers;
- malformed prompts and placeholder values;
- a return to a fixed Sus-count pattern.

The source generator rotates answers deterministically, so builds are reproducible while Sus statements are distributed across positions.

## Reference policy

Each topic file links to a primary or authoritative source family, including language specifications, official platform documentation, RFCs, standards-oriented references, and open textbooks. Version-sensitive claims use direct documentation pages. References are stored with the questions so they can be migrated into a relational database later.

This dataset is ready for prototype use. That is not the same as independent subject-matter certification. Future versions should keep the same review and validation gates, record changes in a new version folder, add claim-level deep links throughout, and add subject-matter expert review before making high-stakes educational claims.
