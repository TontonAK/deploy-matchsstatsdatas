/*
  Warnings:

  - The values [Value] on the enum `StatValueType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StatValueType_new" AS ENUM ('Number', 'Percentage');
ALTER TABLE "StatType" ALTER COLUMN "valueType" TYPE "StatValueType_new" USING ("valueType"::text::"StatValueType_new");
ALTER TYPE "StatValueType" RENAME TO "StatValueType_old";
ALTER TYPE "StatValueType_new" RENAME TO "StatValueType";
DROP TYPE "StatValueType_old";
COMMIT;
