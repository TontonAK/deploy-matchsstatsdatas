-- CreateTable
CREATE TABLE "MatchScoreHalfTime" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "homeScore" INTEGER NOT NULL,
    "awayScore" INTEGER NOT NULL,

    CONSTRAINT "MatchScoreHalfTime_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MatchScoreHalfTime_matchId_key" ON "MatchScoreHalfTime"("matchId");

-- AddForeignKey
ALTER TABLE "MatchScoreHalfTime" ADD CONSTRAINT "MatchScoreHalfTime_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
