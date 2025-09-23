/*
  Warnings:

  - Added the required column `category` to the `EcoChallenge` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ChallengeCategory" AS ENUM ('daily', 'weekly', 'monthly');

-- AlterTable
ALTER TABLE "EcoChallenge" ADD COLUMN     "category" "ChallengeCategory" NOT NULL;
