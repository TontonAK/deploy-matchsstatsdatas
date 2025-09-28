/*
  Warnings:

  - The primary key for the `PlayerTeams` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PlayersPositions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "MatchEvent" DROP CONSTRAINT "MatchEvent_mainPlayerId_fkey";

-- DropForeignKey
ALTER TABLE "MatchEvent" DROP CONSTRAINT "MatchEvent_secondPlayerId_fkey";

-- DropForeignKey
ALTER TABLE "MatchLineup" DROP CONSTRAINT "MatchLineup_playerId_fkey";

-- DropForeignKey
ALTER TABLE "PlayerTeams" DROP CONSTRAINT "PlayerTeams_playerId_fkey";

-- DropForeignKey
ALTER TABLE "PlayersPositions" DROP CONSTRAINT "PlayersPositions_playerId_fkey";

-- DropForeignKey
ALTER TABLE "Stat" DROP CONSTRAINT "Stat_playerId_fkey";

-- DropForeignKey
ALTER TABLE "account" DROP CONSTRAINT "account_userId_fkey";

-- DropForeignKey
ALTER TABLE "session" DROP CONSTRAINT "session_userId_fkey";

-- AlterTable
ALTER TABLE "MatchEvent" ALTER COLUMN "mainPlayerId" SET DATA TYPE TEXT,
ALTER COLUMN "secondPlayerId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "MatchLineup" ALTER COLUMN "playerId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "PlayerTeams" DROP CONSTRAINT "PlayerTeams_pkey",
ALTER COLUMN "playerId" SET DATA TYPE TEXT,
ADD CONSTRAINT "PlayerTeams_pkey" PRIMARY KEY ("playerId", "teamId");

-- AlterTable
ALTER TABLE "PlayersPositions" DROP CONSTRAINT "PlayersPositions_pkey",
ALTER COLUMN "playerId" SET DATA TYPE TEXT,
ADD CONSTRAINT "PlayersPositions_pkey" PRIMARY KEY ("playerId", "positionId");

-- AlterTable
ALTER TABLE "Stat" ALTER COLUMN "playerId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "account" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "session" DROP CONSTRAINT "session_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "session_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "session_id_seq";

-- AlterTable
ALTER TABLE "user" DROP CONSTRAINT "user_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "user_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "user_id_seq";

-- AddForeignKey
ALTER TABLE "PlayerTeams" ADD CONSTRAINT "PlayerTeams_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchEvent" ADD CONSTRAINT "MatchEvent_mainPlayerId_fkey" FOREIGN KEY ("mainPlayerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchEvent" ADD CONSTRAINT "MatchEvent_secondPlayerId_fkey" FOREIGN KEY ("secondPlayerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchLineup" ADD CONSTRAINT "MatchLineup_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stat" ADD CONSTRAINT "Stat_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayersPositions" ADD CONSTRAINT "PlayersPositions_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
