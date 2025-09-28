/*
  Warnings:

  - The `role` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "job" "Role" NOT NULL DEFAULT 'Player',
DROP COLUMN "role",
ADD COLUMN     "role" TEXT;
