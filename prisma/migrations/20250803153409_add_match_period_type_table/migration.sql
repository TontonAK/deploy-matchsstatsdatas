/*
  Warnings:

  - Added the required column `periodTypeId` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "periodTypeId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "MatchPeriodType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "numberPeriod" INTEGER NOT NULL,
    "durationPeriod" INTEGER NOT NULL,
    "extratimeNumberPeriod" INTEGER,
    "extratimeDurationPeriod" INTEGER,

    CONSTRAINT "MatchPeriodType_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_periodTypeId_fkey" FOREIGN KEY ("periodTypeId") REFERENCES "MatchPeriodType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
