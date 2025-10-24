-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "skipped_challenges" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
