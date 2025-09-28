/*
  Warnings:

  - A unique constraint covering the columns `[ulid]` on the table `Match` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "ClubAlias" (
    "id" SERIAL NOT NULL,
    "clubId" INTEGER NOT NULL,
    "alias" TEXT NOT NULL,

    CONSTRAINT "ClubAlias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClubAlias_clubId_key" ON "ClubAlias"("clubId");

-- CreateIndex
CREATE UNIQUE INDEX "Match_ulid_key" ON "Match"("ulid");

-- AddForeignKey
ALTER TABLE "ClubAlias" ADD CONSTRAINT "ClubAlias_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
