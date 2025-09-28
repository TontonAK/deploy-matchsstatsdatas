/*
  Warnings:

  - Added the required column `valueType` to the `StatType` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MatchResult" AS ENUM ('Home_Win', 'Draw', 'Away_Win');

-- CreateEnum
CREATE TYPE "StatValueType" AS ENUM ('Value', 'Percentage');

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "result" "MatchResult";

-- AlterTable
ALTER TABLE "StatType" ADD COLUMN     "valueType" "StatValueType" NOT NULL;
