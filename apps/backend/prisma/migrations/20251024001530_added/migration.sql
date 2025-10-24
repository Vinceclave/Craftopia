-- AlterTable
ALTER TABLE "EcoChallenge" ADD COLUMN     "waste_kg" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "UserChallenge" ADD COLUMN     "waste_kg_saved" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "total_waste_kg" DOUBLE PRECISION NOT NULL DEFAULT 0;
