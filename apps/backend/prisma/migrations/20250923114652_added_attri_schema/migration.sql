-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('manual', 'ai');

-- AlterTable
ALTER TABLE "UserChallenge" ADD COLUMN     "ai_confidence_score" DOUBLE PRECISION,
ADD COLUMN     "verification_type" "VerificationType";
