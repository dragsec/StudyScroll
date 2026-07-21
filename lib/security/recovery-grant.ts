import "server-only";

import { createHash } from "node:crypto";
import { getPrisma } from "@/lib/db/prisma";
import { passwordRecoveryProofExpiresAt } from "@/lib/security/recovery-proof";

function proofHash(proof: string) {
  return createHash("sha256").update(proof).digest("hex");
}

export async function registerPasswordRecoveryGrant(userId: string, proof: string) {
  const expiresAt = passwordRecoveryProofExpiresAt(proof);
  if (!expiresAt || expiresAt.getTime() <= Date.now()) return false;

  const prisma = getPrisma();
  await prisma.$transaction(async (tx) => {
    await tx.learnerProfile.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
    await tx.passwordRecoveryGrant.deleteMany({
      where: {
        userId,
        OR: [
          { expiresAt: { lte: new Date() } },
          { consumedAt: { not: null } },
        ],
      },
    });
    await tx.passwordRecoveryGrant.create({
      data: {
        tokenHash: proofHash(proof),
        userId,
        expiresAt,
      },
    });
  });
  return true;
}

export async function consumePasswordRecoveryGrant(userId: string, proof: string) {
  const result = await getPrisma().passwordRecoveryGrant.updateMany({
    where: {
      tokenHash: proofHash(proof),
      userId,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: { consumedAt: new Date() },
  });
  return result.count === 1;
}
