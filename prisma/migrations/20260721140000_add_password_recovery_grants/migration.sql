CREATE TABLE "password_recovery_grants" (
    "token_hash" CHAR(64) NOT NULL,
    "user_id" UUID NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "consumed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "password_recovery_grants_pkey" PRIMARY KEY ("token_hash")
);

CREATE INDEX "password_recovery_grants_user_id_expires_at_idx"
ON "password_recovery_grants"("user_id", "expires_at");

ALTER TABLE "password_recovery_grants"
ADD CONSTRAINT "password_recovery_grants_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "learner_profiles"("user_id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "password_recovery_grants" ENABLE ROW LEVEL SECURITY;
