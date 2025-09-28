-- CreateEnum
CREATE TYPE "MatchEventGroup" AS ENUM ('Tries', 'Shoots', 'Fouls', 'Other');

-- AlterTable
ALTER TABLE "MatchEventType" ADD COLUMN     "group" "MatchEventGroup";
