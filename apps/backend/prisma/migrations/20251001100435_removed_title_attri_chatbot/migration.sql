/*
  Warnings:

  - You are about to drop the column `title` on the `ChatbotConversation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `ChatbotConversation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ChatbotConversation" DROP COLUMN "title";

-- CreateIndex
CREATE UNIQUE INDEX "ChatbotConversation_user_id_key" ON "ChatbotConversation"("user_id");
