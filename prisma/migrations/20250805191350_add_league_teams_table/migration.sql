-- CreateTable
CREATE TABLE "LeagueTeams" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,
    "leagueId" INTEGER NOT NULL,
    "leaguePoolId" INTEGER,

    CONSTRAINT "LeagueTeams_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LeagueTeams_teamId_key" ON "LeagueTeams"("teamId");

-- AddForeignKey
ALTER TABLE "LeagueTeams" ADD CONSTRAINT "LeagueTeams_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueTeams" ADD CONSTRAINT "LeagueTeams_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueTeams" ADD CONSTRAINT "LeagueTeams_leaguePoolId_fkey" FOREIGN KEY ("leaguePoolId") REFERENCES "LeaguePool"("id") ON DELETE SET NULL ON UPDATE CASCADE;
