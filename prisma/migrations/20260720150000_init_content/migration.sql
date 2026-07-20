CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "question_set_origin" AS ENUM ('curated', 'ai_generated');
CREATE TYPE "publish_status" AS ENUM ('draft', 'reviewing', 'published', 'archived');
CREATE TYPE "difficulty" AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE "verdict" AS ENUM ('legit', 'sus');
CREATE TYPE "review_status" AS ENUM ('draft', 'approved', 'rejected');

CREATE TABLE "topics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" VARCHAR(80) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "question_sets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" VARCHAR(120) NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "schema_version" VARCHAR(20) NOT NULL,
    "dataset_version" VARCHAR(40),
    "origin" "question_set_origin" NOT NULL,
    "status" "publish_status" NOT NULL DEFAULT 'draft',
    "topic_prompt" VARCHAR(160),
    "published_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "question_sets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "questions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" VARCHAR(160) NOT NULL,
    "question_set_id" UUID NOT NULL,
    "topic_id" UUID NOT NULL,
    "difficulty" "difficulty" NOT NULL,
    "prompt" TEXT NOT NULL,
    "context" TEXT,
    "position" INTEGER NOT NULL,
    "review_status" "review_status" NOT NULL DEFAULT 'draft',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "answers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "question_id" UUID NOT NULL,
    "key" VARCHAR(20) NOT NULL,
    "position" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "verdict" "verdict" NOT NULL,
    "feedback_legit" TEXT NOT NULL,
    "feedback_sus" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "answers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "question_references" (
    "question_id" UUID NOT NULL,
    "title" VARCHAR(240) NOT NULL,
    "url" VARCHAR(2048) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "question_references_pkey" PRIMARY KEY ("question_id")
);

CREATE UNIQUE INDEX "topics_slug_key" ON "topics"("slug");
CREATE UNIQUE INDEX "topics_name_key" ON "topics"("name");
CREATE UNIQUE INDEX "question_sets_key_key" ON "question_sets"("key");
CREATE INDEX "question_sets_status_origin_idx" ON "question_sets"("status", "origin");
CREATE UNIQUE INDEX "questions_key_key" ON "questions"("key");
CREATE UNIQUE INDEX "questions_question_set_id_topic_id_position_key" ON "questions"("question_set_id", "topic_id", "position");
CREATE INDEX "questions_topic_id_difficulty_is_active_idx" ON "questions"("topic_id", "difficulty", "is_active");
CREATE INDEX "questions_question_set_id_review_status_idx" ON "questions"("question_set_id", "review_status");
CREATE UNIQUE INDEX "answers_question_id_key_key" ON "answers"("question_id", "key");
CREATE UNIQUE INDEX "answers_question_id_position_key" ON "answers"("question_id", "position");

ALTER TABLE "questions" ADD CONSTRAINT "questions_question_set_id_fkey" FOREIGN KEY ("question_set_id") REFERENCES "question_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "questions" ADD CONSTRAINT "questions_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "answers" ADD CONSTRAINT "answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "question_references" ADD CONSTRAINT "question_references_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
