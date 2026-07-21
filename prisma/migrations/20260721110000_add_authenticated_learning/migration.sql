CREATE TABLE "learner_profiles" (
    "user_id" UUID NOT NULL,
    "timezone" VARCHAR(64) NOT NULL DEFAULT 'UTC',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "learner_profiles_pkey" PRIMARY KEY ("user_id")
);

CREATE TABLE "user_question_states" (
    "user_id" UUID NOT NULL,
    "question_key" VARCHAR(160) NOT NULL,
    "topic" VARCHAR(120) NOT NULL,
    "total_attempts" INTEGER NOT NULL DEFAULT 0,
    "last_score" SMALLINT,
    "review_stage" SMALLINT NOT NULL DEFAULT 0,
    "ever_perfect" BOOLEAN NOT NULL DEFAULT false,
    "first_attempted_at" TIMESTAMPTZ(3),
    "last_attempted_at" TIMESTAMPTZ(3),
    "next_review_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "user_question_states_pkey" PRIMARY KEY ("user_id", "question_key"),
    CONSTRAINT "user_question_states_last_score_check" CHECK ("last_score" IS NULL OR "last_score" BETWEEN 0 AND 3),
    CONSTRAINT "user_question_states_review_stage_check" CHECK ("review_stage" BETWEEN 0 AND 5)
);

CREATE TABLE "question_attempts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "question_key" VARCHAR(160) NOT NULL,
    "topic" VARCHAR(120) NOT NULL,
    "decisions" JSONB NOT NULL,
    "score" SMALLINT NOT NULL,
    "total" SMALLINT NOT NULL DEFAULT 3,
    "is_perfect" BOOLEAN NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "question_attempts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "question_attempts_score_check" CHECK ("score" BETWEEN 0 AND "total"),
    CONSTRAINT "question_attempts_total_check" CHECK ("total" = 3)
);

CREATE TABLE "user_saved_questions" (
    "user_id" UUID NOT NULL,
    "question_key" VARCHAR(160) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_saved_questions_pkey" PRIMARY KEY ("user_id", "question_key")
);

CREATE TABLE "user_daily_progress" (
    "user_id" UUID NOT NULL,
    "date_key" VARCHAR(10) NOT NULL,
    "perfect_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "user_daily_progress_pkey" PRIMARY KEY ("user_id", "date_key"),
    CONSTRAINT "user_daily_progress_date_key_check" CHECK ("date_key" ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'),
    CONSTRAINT "user_daily_progress_count_check" CHECK ("perfect_count" >= 0)
);

CREATE TABLE "user_subject_progress" (
    "user_id" UUID NOT NULL,
    "topic" VARCHAR(120) NOT NULL,
    "perfect_questions" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "user_subject_progress_pkey" PRIMARY KEY ("user_id", "topic"),
    CONSTRAINT "user_subject_progress_count_check" CHECK ("perfect_questions" >= 0)
);

CREATE INDEX "user_question_states_user_id_next_review_at_idx" ON "user_question_states"("user_id", "next_review_at");
CREATE INDEX "user_question_states_user_id_topic_ever_perfect_idx" ON "user_question_states"("user_id", "topic", "ever_perfect");
CREATE INDEX "question_attempts_user_id_created_at_idx" ON "question_attempts"("user_id", "created_at");
CREATE INDEX "question_attempts_user_id_question_key_created_at_idx" ON "question_attempts"("user_id", "question_key", "created_at");
CREATE INDEX "user_saved_questions_user_id_created_at_idx" ON "user_saved_questions"("user_id", "created_at");
CREATE INDEX "user_daily_progress_user_id_date_key_idx" ON "user_daily_progress"("user_id", "date_key");
CREATE INDEX "user_subject_progress_user_id_perfect_questions_idx" ON "user_subject_progress"("user_id", "perfect_questions");

ALTER TABLE "user_question_states" ADD CONSTRAINT "user_question_states_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "learner_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "question_attempts" ADD CONSTRAINT "question_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "learner_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_saved_questions" ADD CONSTRAINT "user_saved_questions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "learner_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_daily_progress" ADD CONSTRAINT "user_daily_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "learner_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_subject_progress" ADD CONSTRAINT "user_subject_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "learner_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Supabase exposes the public schema through its Data API. StudyScroll reads and
-- writes through trusted server routes, so no browser role receives a table policy.
ALTER TABLE "topics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "question_sets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "questions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "answers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "question_references" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "learner_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_question_states" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "question_attempts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_saved_questions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_daily_progress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_subject_progress" ENABLE ROW LEVEL SECURITY;
