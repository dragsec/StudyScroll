# StudyScroll: Training Judgment in an AI-Saturated World

## Abstract

StudyScroll is a learning product built around a simple task: read three plausible answers to a technical question, judge each as **Legit** or **Sus**, commit all three decisions, and then inspect the result.

It does not try to replace courses, books, or teachers. It gives learners short, repeated practice in a skill those formats often leave implicit: deciding whether an explanation is correct before being shown the answer.

The design draws on research into retrieval practice, feedback, spacing, interleaving, metacognition, and source credibility. Those findings support parts of the learning loop; they do not prove that a social feed is inherently educational. StudyScroll treats the feed, persona system, and progression mechanics as product hypotheses to be tested with real learners.

## 1. The problem

Generative AI makes explanations cheap. It does not make them reliable.

A learner can now receive a fluent answer to almost any question in seconds. The remaining difficulty is epistemic: recognizing missing context, false confidence, subtle misconceptions, and answers that are technically true but practically misleading.

Most educational tools optimize for delivering information. StudyScroll focuses on evaluating it.

## 2. The interaction

Each feed item contains:

1. a short technical question;
2. three responses written by distinct fictional personas;
3. one independent **Legit/Sus** decision for each response; and
4. a reveal with the correct classification and a concise explanation.

All decisions are committed together. Feedback on the first answer cannot leak into the second or third decision.

The answers may be correct, incomplete, context-dependent, or wrong. Their distribution is not fixed. A learner cannot safely assume that one of three must be correct or eliminate an answer because another sounds stronger.

## 3. Why three answers

Three responses create comparison without turning a feed item into an essay. A correct answer can state the governing principle. A plausible wrong answer can expose a common misconception. A partial answer can show why context matters. The user must evaluate each claim on its own merits.

The choice of three is a product constraint, not a result established by the cited literature. It should be validated against alternatives through completion, accuracy, retention, and user-reported effort.

## 4. Why fictional personas

The personas make differences in confidence, vocabulary, and apparent expertise visible. A senior persona may be wrong; a junior persona may be right. Upvotes and status are deliberately unreliable cues.

Research shows that perceived expertise and source presentation can influence credibility judgments [8, 9]. StudyScroll turns that vulnerability into an explicit exercise: judge the reasoning, not the costume around it.

Fictional responses also make the environment controllable. Misconceptions can be written intentionally, reviewed before publication, and paired with precise feedback. This is a simulation of social information, not a claim that synthetic discussion should replace real communities.

## 5. Learning principles

### Retrieval before reveal

Retrieval practice can improve delayed retention more than additional study of the same material [1, 2]. StudyScroll requires a decision before revealing the label, creating a small retrieval attempt rather than another passive exposure.

The task is not equivalent to free recall: users judge supplied answers instead of producing an answer from scratch. That makes it faster, but possibly less powerful. A future version should compare binary judgment with short-answer retrieval.

### Corrective feedback

Feedback can correct errors and strengthen later retention, including cases in which learners were unsure of an answer [3, 4]. StudyScroll reveals the classification and explanation after the three judgments are committed. The explanation should resolve the misconception, not merely announce that a vote was wrong.

### Spaced review

Spacing practice across time generally improves long-term memory, but there is no universal interval that is optimal for every learner, item, and retention goal [5, 6]. StudyScroll can return missed or uncertain concepts later and adjust the schedule from observed performance.

The initial scheduler is therefore a practical baseline, not a scientific optimum. Item-level history should eventually replace fixed timing.

### Plausible errors and desirable difficulty

Learning can benefit from conditions that require effortful discrimination, even when those conditions reduce immediate fluency [7]. StudyScroll uses believable mistakes because obvious distractors test pattern recognition more than understanding.

Difficulty still needs calibration. If every distinction is obscure, the product becomes frustrating; if every error is obvious, the judgment has little value.

### Interleaving

Mixing related problem types can improve learners' ability to select the appropriate method compared with practicing one type in a block [10]. A feed can interleave topics and misconception types naturally.

This does not imply that random topic switching is always beneficial. Interleaving should remain coherent enough for learners to compare related ideas.

## 6. Progress and gamification

StudyScroll uses restrained progression mechanics:

- a daily goal makes a session finite;
- streaks record consistency;
- topic ranks make accumulated practice visible; and
- saved questions give the learner control over what returns.

These mechanics are not a shortcut to learning. Their purpose is to make progress legible and encourage repeated practice. Habit formation is gradual and varies widely between people [11]; a streak counter does not create a habit by itself.

The product follows four constraints:

1. **No punishment for mistakes.** An incorrect judgment is useful evidence.
2. **No endless obligation.** A daily target should provide closure, not pressure users to continue.
3. **No pay-to-preserve mechanics.** Progress should never depend on spending money.
4. **No social humiliation.** Topic ranks describe personal progression, not public status.

The system should be evaluated on whether it supports voluntary, consistent practice, not on time spent in the app.

## 7. Possible next steps

The following ideas are not part of the current MVP.

### Educator-curated collections

Professors and other subject-matter experts could receive verified educator accounts and publish dedicated question collections for a course, syllabus, exam, or topic. AI could help draft material, but the educator would choose the learning objectives, review the answers, and remain clearly identified as the curator.

Each collection should show its author, sources, revision history, and review status. This would let learners distinguish expert-reviewed material from open community or AI-generated content.

### Personal learning sections

Users could create private sections around whatever they want to learn. They might describe a goal in a prompt, paste a syllabus, or provide their own notes and source material. StudyScroll could turn that context into a structured feed of questions, plausible answers, and explanations.

Generated sections should be labeled as AI-generated, remain editable, and preserve links to the source material when possible. Users should be able to regenerate weak questions or report ambiguous ones instead of treating generated content as automatically correct.

### Adaptive review

A later version could use interaction history to return missed concepts and adjust review timing. That system would require separate implementation and evaluation; it is not included in the current product.
## 8. Content quality

AI can help draft questions, personas, misconceptions, and explanations. It cannot be the final authority on their correctness.

A production content pipeline should include:

1. generation from a defined concept and learning objective;
2. verification against primary or authoritative sources;
3. checks for ambiguity and multiple defensible interpretations;
4. review of every answer label and explanation;
5. versioning so corrected content remains traceable; and
6. post-publication monitoring for reports and abnormal confusion rates.

Pre-generated content keeps inference cost out of the core interaction and makes review possible before a learner sees an item.

## 9. What should be measured

Engagement alone cannot establish educational value. The useful questions are:

- Do learners retain concepts after several days or weeks?
- Does performance transfer to new questions with different wording?
- Can learners explain why an answer is wrong?
- Does spaced review outperform an equivalent unspaced feed?
- Do personas improve source evaluation, or merely add decoration?
- Do progress mechanics increase consistent practice without unhealthy pressure?

A credible evaluation would use delayed tests and compare StudyScroll with passive reading and conventional multiple-choice practice. Until that work exists, claims about retention gains specific to StudyScroll remain hypotheses.

## 10. Scope and limitations

StudyScroll is an early product. Its scientific foundations support retrieval, feedback, and distributed practice broadly; they do not validate the complete interface as a package.

Binary labels can oversimplify questions whose answer depends on assumptions. AI-assisted content can contain errors. A social-feed format may distract some learners. Personalization signals can be misread. Technical knowledge also requires construction, debugging, explanation, and open-ended problem solving, which Legit/Sus judgments cannot fully train.

StudyScroll should complement deeper study and practical work, not claim to replace them.

## References

1. Roediger, H. L., & Karpicke, J. D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. *Psychological Science, 17*(3), 249–255. https://doi.org/10.1111/j.1467-9280.2006.01693.x
2. Karpicke, J. D., & Roediger, H. L. (2008). The critical importance of retrieval for learning. *Science, 319*(5865), 966–968. https://doi.org/10.1126/science.1152408
3. Butler, A. C., Karpicke, J. D., & Roediger, H. L. (2008). Correcting a metacognitive error: Feedback increases retention of low-confidence correct responses. *Journal of Experimental Psychology: Learning, Memory, and Cognition, 34*(4), 918–928. https://doi.org/10.1037/0278-7393.34.4.918
4. McDaniel, M. A., Roediger, H. L., & McDermott, K. B. (2007). Generalizing test-enhanced learning from the laboratory to the classroom. *Psychonomic Bulletin & Review, 14*(2), 200–206. https://doi.org/10.3758/BF03194052
5. Cepeda, N. J., Vul, E., Rohrer, D., Wixted, J. T., & Pashler, H. (2008). Spacing effects in learning: A temporal ridgeline of optimal retention. *Psychological Science, 19*(11), 1095–1102. https://doi.org/10.1111/j.1467-9280.2008.02209.x
6. Tabibian, B., Upadhyay, U., De, A., Zarezade, A., Schölkopf, B., & Gomez-Rodriguez, M. (2019). Enhancing human learning via spaced repetition optimization. *PNAS, 116*(10), 3988–3993. https://doi.org/10.1073/pnas.1815156116
7. Bjork, E. L., & Bjork, R. A. (2011). Making things hard on yourself, but in a good way: Creating desirable difficulties to enhance learning. In M. A. Gernsbacher et al. (Eds.), *Psychology and the Real World*. Worth.
8. Hendriks, F., Kienhues, D., & Bromme, R. (2022). How the expertise heuristic accelerates decision-making and credibility judgments in social media. *Current Psychology*. https://doi.org/10.1007/s12144-021-02405-9
9. Fenn, E., Ramsay, N., Kantner, J., Pezdek, K., & Abed, E. (2020). Nonprobative photographs and source credibility inflate truthiness. *Cognitive Research: Principles and Implications, 5*, 17. https://doi.org/10.1186/s41235-020-00215-4
10. Rohrer, D., & Taylor, K. (2007). The shuffling of mathematics problems improves learning. *Instructional Science, 35*, 481–498. https://doi.org/10.1007/s11251-007-9015-8
11. Lally, P., van Jaarsveld, C. H. M., Potts, H. W. W., & Wardle, J. (2010). How are habits formed: Modelling habit formation in the real world. *European Journal of Social Psychology, 40*(6), 998–1009. https://doi.org/10.1002/ejsp.674
12. Kruger, J., & Dunning, D. (1999). Unskilled and unaware of it: How difficulties in recognizing one's own incompetence lead to inflated self-assessments. *Journal of Personality and Social Psychology, 77*(6), 1121–1134. https://doi.org/10.1037/0022-3514.77.6.1121
