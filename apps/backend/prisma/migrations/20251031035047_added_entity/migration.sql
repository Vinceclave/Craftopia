-- CreateEnum
CREATE TYPE "RedemptionStatus" AS ENUM ('pending', 'fulfilled', 'cancelled');

-- CreateTable
CREATE TABLE "Sponsor" (
    "sponsor_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "logo_url" TEXT,
    "description" TEXT,
    "contact_email" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_admin_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Sponsor_pkey" PRIMARY KEY ("sponsor_id")
);

-- CreateTable
CREATE TABLE "SponsorReward" (
    "reward_id" SERIAL NOT NULL,
    "sponsor_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "points_cost" INTEGER NOT NULL,
    "quantity" INTEGER,
    "redeemed_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "display_on_leaderboard" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "SponsorReward_pkey" PRIMARY KEY ("reward_id")
);

-- CreateTable
CREATE TABLE "UserRedemption" (
    "redemption_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "reward_id" INTEGER NOT NULL,
    "status" "RedemptionStatus" NOT NULL DEFAULT 'pending',
    "claimed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fulfilled_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "UserRedemption_pkey" PRIMARY KEY ("redemption_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Sponsor_name_key" ON "Sponsor"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserRedemption_user_id_reward_id_key" ON "UserRedemption"("user_id", "reward_id");

-- AddForeignKey
ALTER TABLE "Sponsor" ADD CONSTRAINT "Sponsor_created_by_admin_id_fkey" FOREIGN KEY ("created_by_admin_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SponsorReward" ADD CONSTRAINT "SponsorReward_sponsor_id_fkey" FOREIGN KEY ("sponsor_id") REFERENCES "Sponsor"("sponsor_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRedemption" ADD CONSTRAINT "UserRedemption_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRedemption" ADD CONSTRAINT "UserRedemption_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "SponsorReward"("reward_id") ON DELETE RESTRICT ON UPDATE CASCADE;
