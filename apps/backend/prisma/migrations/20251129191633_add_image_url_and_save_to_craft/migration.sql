-- AlterTable
ALTER TABLE "CraftIdea" ADD COLUMN     "generated_image_url" TEXT,
ADD COLUMN     "is_saved" BOOLEAN NOT NULL DEFAULT false;
