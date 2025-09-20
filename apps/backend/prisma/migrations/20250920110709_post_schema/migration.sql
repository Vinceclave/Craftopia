/*
  Warnings:

  - Added the required column `category` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Category" AS ENUM ('Social', 'Tutorial', 'Challenge', 'Marketplace', 'Other');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "category" "Category" NOT NULL,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "title" TEXT NOT NULL;
