-- CreateEnum
CREATE TYPE "GroundArea" AS ENUM ('Own_22_In_Goal', 'Own_40', 'Own_50', 'Opp_50', 'Opp_40', 'Opp_22_In_Goal');

-- CreateEnum
CREATE TYPE "CatchBlockAreaLineout" AS ENUM ('Block_Area_1', 'Block_Area_2', 'Block_Area_3');

-- CreateTable
CREATE TABLE "KickStatGround" (
    "id" SERIAL NOT NULL,
    "statId" INTEGER NOT NULL,
    "startAreaKick" "GroundArea" NOT NULL,
    "endAreaKick" "GroundArea" NOT NULL,
    "deadBall" BOOLEAN,
    "success" BOOLEAN,

    CONSTRAINT "KickStatGround_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineoutStatGround" (
    "id" SERIAL NOT NULL,
    "statId" INTEGER NOT NULL,
    "area" "GroundArea" NOT NULL,
    "nbPlayer" INTEGER NOT NULL,
    "catchBlockArea" "CatchBlockAreaLineout" NOT NULL,
    "success" BOOLEAN,
    "failReason" TEXT,

    CONSTRAINT "LineoutStatGround_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "KickStatGround" ADD CONSTRAINT "KickStatGround_statId_fkey" FOREIGN KEY ("statId") REFERENCES "Stat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineoutStatGround" ADD CONSTRAINT "LineoutStatGround_statId_fkey" FOREIGN KEY ("statId") REFERENCES "Stat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
