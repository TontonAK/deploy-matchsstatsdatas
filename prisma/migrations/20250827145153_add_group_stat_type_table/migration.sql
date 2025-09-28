-- CreateEnum
CREATE TYPE "StatTypeGroup" AS ENUM ('Player', 'Team', 'All');

-- AlterTable
ALTER TABLE "StatType" ADD COLUMN     "group" "StatTypeGroup" NOT NULL DEFAULT 'All';
