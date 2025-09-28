-- CreateEnum
CREATE TYPE "StatTypeGamePhase" AS ENUM ('Score', 'Attack', 'Defense', 'Static_Phase', 'Foot', 'Contact_Area', 'Discipline');

-- AlterTable
ALTER TABLE "StatType" ADD COLUMN     "gamePhase" "StatTypeGamePhase";
