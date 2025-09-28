/*
  Warnings:

  - Added the required column `matchId` to the `MatchEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MatchEvent" ADD COLUMN     "matchId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "MatchEvent" ADD CONSTRAINT "MatchEvent_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
