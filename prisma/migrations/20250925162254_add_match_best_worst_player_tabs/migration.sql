/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `session` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "MatchBestPlayer" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "playerId" TEXT NOT NULL,

    CONSTRAINT "MatchBestPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchWorstPlayer" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "playerId" TEXT NOT NULL,
    "reason" TEXT,

    CONSTRAINT "MatchWorstPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MatchBestPlayer_matchId_key" ON "MatchBestPlayer"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "MatchWorstPlayer_matchId_key" ON "MatchWorstPlayer"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- AddForeignKey
ALTER TABLE "MatchBestPlayer" ADD CONSTRAINT "MatchBestPlayer_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchBestPlayer" ADD CONSTRAINT "MatchBestPlayer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchWorstPlayer" ADD CONSTRAINT "MatchWorstPlayer_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchWorstPlayer" ADD CONSTRAINT "MatchWorstPlayer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
