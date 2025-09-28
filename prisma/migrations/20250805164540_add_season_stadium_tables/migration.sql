/*
  Warnings:

  - You are about to drop the column `stadium` on the `Club` table. All the data in the column will be lost.
  - You are about to drop the column `leagueId` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `typeMatchId` on the `Match` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_leagueId_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_typeMatchId_fkey";

-- AlterTable
ALTER TABLE "Club" DROP COLUMN "stadium";

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "leagueId",
DROP COLUMN "typeMatchId",
ADD COLUMN     "scoreAwayTeam" INTEGER,
ADD COLUMN     "scoreHomeTeam" INTEGER;

-- CreateTable
CREATE TABLE "Stadium" (
    "id" SERIAL NOT NULL,
    "clubId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Stadium_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaguePool" (
    "id" SERIAL NOT NULL,
    "pool" TEXT NOT NULL,
    "leagueId" INTEGER,

    CONSTRAINT "LeaguePool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Season" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeasonLeague" (
    "id" SERIAL NOT NULL,
    "seasonId" INTEGER NOT NULL,
    "leagueId" INTEGER,
    "leaguePoolId" INTEGER,
    "typeMatchId" INTEGER NOT NULL,
    "gameDay" INTEGER,

    CONSTRAINT "SeasonLeague_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeasonLeagueMatch" (
    "seasonLeagueId" INTEGER NOT NULL,
    "matchId" INTEGER NOT NULL,

    CONSTRAINT "SeasonLeagueMatch_pkey" PRIMARY KEY ("seasonLeagueId","matchId")
);

-- CreateIndex
CREATE UNIQUE INDEX "SeasonLeagueMatch_matchId_key" ON "SeasonLeagueMatch"("matchId");

-- AddForeignKey
ALTER TABLE "Stadium" ADD CONSTRAINT "Stadium_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaguePool" ADD CONSTRAINT "LeaguePool_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonLeague" ADD CONSTRAINT "SeasonLeague_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonLeague" ADD CONSTRAINT "SeasonLeague_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonLeague" ADD CONSTRAINT "SeasonLeague_leaguePoolId_fkey" FOREIGN KEY ("leaguePoolId") REFERENCES "LeaguePool"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonLeague" ADD CONSTRAINT "SeasonLeague_typeMatchId_fkey" FOREIGN KEY ("typeMatchId") REFERENCES "MatchType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonLeagueMatch" ADD CONSTRAINT "SeasonLeagueMatch_seasonLeagueId_fkey" FOREIGN KEY ("seasonLeagueId") REFERENCES "SeasonLeague"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonLeagueMatch" ADD CONSTRAINT "SeasonLeagueMatch_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
