/*
  Warnings:

  - You are about to drop the column `verified` on the `UserChallenge` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."UserChallenge" DROP COLUMN "verified",
ADD COLUMN     "admin_notes" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "points_awarded" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "verified_at" TIMESTAMP(3),
ADD COLUMN     "verified_by_admin_id" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."UserChallenge" ADD CONSTRAINT "UserChallenge_verified_by_admin_id_fkey" FOREIGN KEY ("verified_by_admin_id") REFERENCES "public"."User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
