-- CreateEnum
CREATE TYPE "PositionType" AS ENUM ('Forwards', 'Backs');

-- AlterTable
ALTER TABLE "Position" ADD COLUMN     "type" "PositionType";
