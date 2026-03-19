-- CreateEnum
CREATE TYPE "WithdrawalStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "GameSessionStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'FAILED', 'FLAGGED_CHEAT', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BoosterType" AS ENUM ('MINING_BOOST_1_5X', 'AUTO_MINING');

-- CreateEnum
CREATE TYPE "CardName" AS ENUM ('COIN_CAPACITY', 'MINING_RATE');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('FISHING_START', 'FISHING_COLLECT', 'COINS_EARNED', 'UPGRADE_PURCHASED', 'BOOSTER_ACTIVATED', 'WITHDRAWAL_REQUESTED', 'WITHDRAWAL_COMPLETED', 'WITHDRAWAL_FAILED', 'SPIN_PLAYED', 'ROULETTE_PLAYED', 'BRUNOS_RIDE_STARTED', 'BRUNOS_RIDE_COMPLETED', 'BRUNOS_RIDE_CHEATED', 'TASK_COMPLETED', 'REFERRAL_REWARD', 'DAILY_COMBO_SUBMITTED', 'DAILY_LOGIN_CLAIMED', 'STARS_PURCHASED', 'STARS_TOPPED_UP', 'ADMIN_COIN_ADJUSTMENT', 'ADMIN_BLOCK_USER', 'ADMIN_UNBLOCK_USER');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MODERATOR');

-- CreateEnum
CREATE TYPE "TaskCategory" AS ENUM ('MAIN', 'OTHER');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('CHANNEL_JOIN', 'INVITE_FRIENDS');

-- CreateEnum
CREATE TYPE "SpinTier" AS ENUM ('TIER_1', 'TIER_2', 'TIER_3', 'TIER_4', 'TIER_5');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('EN', 'RU');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "telegramId" TEXT NOT NULL,
    "username" TEXT NOT NULL DEFAULT '',
    "firstName" TEXT NOT NULL DEFAULT '',
    "lastName" TEXT NOT NULL DEFAULT '',
    "languageCode" TEXT NOT NULL DEFAULT 'en',
    "language" "Language" NOT NULL DEFAULT 'EN',
    "isBot" BOOLEAN NOT NULL DEFAULT false,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "coins" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCoinsEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "starsBalance" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "isFishing" BOOLEAN NOT NULL DEFAULT false,
    "fishingStartedAt" TIMESTAMP(3),
    "tankCoins" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tankCapacity" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "miningRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0278,
    "coinCapacityLevel" INTEGER NOT NULL DEFAULT 1,
    "miningRateLevel" INTEGER NOT NULL DEFAULT 1,
    "lastLoginDate" TIMESTAMP(3),
    "loginStreak" INTEGER NOT NULL DEFAULT 0,
    "lastComboDate" TIMESTAMP(3),
    "lastComboResult" INTEGER,
    "referredById" INTEGER,
    "rewardedLevels" TEXT NOT NULL DEFAULT '[]',
    "referralEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "musicEnabled" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSubscription" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "channelUsername" TEXT NOT NULL,
    "rewardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Withdrawal" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "amountCoins" DOUBLE PRECISION NOT NULL,
    "amountTon" DOUBLE PRECISION NOT NULL,
    "ip" TEXT NOT NULL,
    "targetAddress" TEXT NOT NULL,
    "status" "WithdrawalStatus" NOT NULL DEFAULT 'PENDING',
    "txHash" TEXT,
    "errorMessage" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Withdrawal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StarsTransaction" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "comment" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StarsTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Action" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "ActionType" NOT NULL,
    "ip" TEXT NOT NULL DEFAULT '',
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data" TEXT NOT NULL DEFAULT '{}',

    CONSTRAINT "Action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActiveBooster" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "BoosterType" NOT NULL,
    "multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.5,
    "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActiveBooster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardUpgradeRequirement" (
    "id" SERIAL NOT NULL,
    "cardName" "CardName" NOT NULL,
    "level" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "requirementType" TEXT NOT NULL,
    "requirementValue" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CardUpgradeRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpinSession" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "tier" "SpinTier" NOT NULL,
    "costStars" INTEGER NOT NULL,
    "spinsCount" INTEGER NOT NULL,
    "results" JSONB NOT NULL,
    "totalWon" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpinSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RouletteSession" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "costStars" INTEGER NOT NULL,
    "result" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RouletteSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RideSession" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "costStars" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "score" INTEGER NOT NULL DEFAULT 0,
    "coinsEarned" INTEGER NOT NULL DEFAULT 0,
    "status" "GameSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RideSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" SERIAL NOT NULL,
    "category" "TaskCategory" NOT NULL,
    "type" "TaskType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "channelUsername" TEXT,
    "requiredInvites" INTEGER,
    "rewardCoins" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskCompletion" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "taskId" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyCombo" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "correctItems" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyCombo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tournament" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "rewards" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentEntry" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tournamentId" INTEGER NOT NULL,
    "starsSpent" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER,
    "rewardClaimed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TournamentEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveWin" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "username" TEXT NOT NULL DEFAULT '',
    "firstName" TEXT NOT NULL DEFAULT '',
    "gameType" TEXT NOT NULL,
    "prizeName" TEXT NOT NULL,
    "prizeValue" TEXT NOT NULL,
    "profitMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LiveWin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "fishingDurationSeconds" INTEGER NOT NULL DEFAULT 3600,
    "cardUpgradeValues" JSONB NOT NULL,
    "boosterPrices" JSONB NOT NULL,
    "spinTiers" JSONB NOT NULL,
    "rouletteCostStars" INTEGER NOT NULL DEFAULT 5,
    "roulettePrizes" JSONB NOT NULL,
    "rideCostStars" INTEGER NOT NULL DEFAULT 1,
    "rideMaxCoinsPerSecond" INTEGER NOT NULL DEFAULT 8,
    "comboRewards" JSONB NOT NULL,
    "loginStreakRewards" JSONB NOT NULL,
    "coinToTonRate" INTEGER NOT NULL DEFAULT 100000,
    "minimumCoinWithdrawal" INTEGER NOT NULL DEFAULT 100000,
    "maximumCoinWithdrawal" INTEGER NOT NULL DEFAULT 1000000,
    "withdrawalFeeTon" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
    "referralRewards" JSONB NOT NULL,
    "tonToStarsRate" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "tonToStarsBonusPercent" INTEGER NOT NULL DEFAULT 10,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Season" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobState" (
    "name" TEXT NOT NULL,
    "lastRunAt" TIMESTAMP(3) NOT NULL,
    "nextRunAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobState_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAuditLog" (
    "id" SERIAL NOT NULL,
    "adminId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "details" JSONB,
    "ip" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");

-- CreateIndex
CREATE INDEX "User_telegramId_idx" ON "User"("telegramId");

-- CreateIndex
CREATE INDEX "User_referredById_idx" ON "User"("referredById");

-- CreateIndex
CREATE INDEX "User_level_coins_idx" ON "User"("level", "coins");

-- CreateIndex
CREATE INDEX "User_isBlocked_idx" ON "User"("isBlocked");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "UserSubscription_userId_idx" ON "UserSubscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSubscription_userId_channelUsername_key" ON "UserSubscription"("userId", "channelUsername");

-- CreateIndex
CREATE INDEX "Withdrawal_userId_idx" ON "Withdrawal"("userId");

-- CreateIndex
CREATE INDEX "Withdrawal_userId_createdAt_idx" ON "Withdrawal"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Withdrawal_status_idx" ON "Withdrawal"("status");

-- CreateIndex
CREATE INDEX "StarsTransaction_userId_idx" ON "StarsTransaction"("userId");

-- CreateIndex
CREATE INDEX "StarsTransaction_userId_createdAt_idx" ON "StarsTransaction"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Action_userId_idx" ON "Action"("userId");

-- CreateIndex
CREATE INDEX "Action_userId_type_idx" ON "Action"("userId", "type");

-- CreateIndex
CREATE INDEX "Action_time_idx" ON "Action"("time");

-- CreateIndex
CREATE INDEX "ActiveBooster_userId_idx" ON "ActiveBooster"("userId");

-- CreateIndex
CREATE INDEX "ActiveBooster_userId_expiresAt_idx" ON "ActiveBooster"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "CardUpgradeRequirement_cardName_idx" ON "CardUpgradeRequirement"("cardName");

-- CreateIndex
CREATE UNIQUE INDEX "CardUpgradeRequirement_cardName_level_key" ON "CardUpgradeRequirement"("cardName", "level");

-- CreateIndex
CREATE INDEX "SpinSession_userId_idx" ON "SpinSession"("userId");

-- CreateIndex
CREATE INDEX "SpinSession_userId_createdAt_idx" ON "SpinSession"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "RouletteSession_userId_idx" ON "RouletteSession"("userId");

-- CreateIndex
CREATE INDEX "RouletteSession_userId_createdAt_idx" ON "RouletteSession"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "RideSession_userId_idx" ON "RideSession"("userId");

-- CreateIndex
CREATE INDEX "RideSession_userId_status_idx" ON "RideSession"("userId", "status");

-- CreateIndex
CREATE INDEX "Task_category_isActive_idx" ON "Task"("category", "isActive");

-- CreateIndex
CREATE INDEX "Task_type_idx" ON "Task"("type");

-- CreateIndex
CREATE INDEX "TaskCompletion_userId_idx" ON "TaskCompletion"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskCompletion_userId_taskId_key" ON "TaskCompletion"("userId", "taskId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyCombo_date_key" ON "DailyCombo"("date");

-- CreateIndex
CREATE INDEX "DailyCombo_date_idx" ON "DailyCombo"("date");

-- CreateIndex
CREATE INDEX "Tournament_isActive_idx" ON "Tournament"("isActive");

-- CreateIndex
CREATE INDEX "Tournament_startAt_endAt_idx" ON "Tournament"("startAt", "endAt");

-- CreateIndex
CREATE INDEX "TournamentEntry_tournamentId_starsSpent_idx" ON "TournamentEntry"("tournamentId", "starsSpent");

-- CreateIndex
CREATE INDEX "TournamentEntry_userId_idx" ON "TournamentEntry"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentEntry_userId_tournamentId_key" ON "TournamentEntry"("userId", "tournamentId");

-- CreateIndex
CREATE INDEX "LiveWin_gameType_createdAt_idx" ON "LiveWin"("gameType", "createdAt");

-- CreateIndex
CREATE INDEX "LiveWin_createdAt_idx" ON "LiveWin"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Season_name_key" ON "Season"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE INDEX "AdminAuditLog_adminId_idx" ON "AdminAuditLog"("adminId");

-- CreateIndex
CREATE INDEX "AdminAuditLog_createdAt_idx" ON "AdminAuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AdminAuditLog_targetType_targetId_idx" ON "AdminAuditLog"("targetType", "targetId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StarsTransaction" ADD CONSTRAINT "StarsTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActiveBooster" ADD CONSTRAINT "ActiveBooster_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpinSession" ADD CONSTRAINT "SpinSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouletteSession" ADD CONSTRAINT "RouletteSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RideSession" ADD CONSTRAINT "RideSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskCompletion" ADD CONSTRAINT "TaskCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskCompletion" ADD CONSTRAINT "TaskCompletion_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentEntry" ADD CONSTRAINT "TournamentEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentEntry" ADD CONSTRAINT "TournamentEntry_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
