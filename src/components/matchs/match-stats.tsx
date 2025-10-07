import { getMatchStats } from "@/database/statistics/get-match-stats";
import { MatchStatsAccordion } from "@/components/matchs/match-stats-accordion";

interface MatchStatsProps {
  matchUlid: string;
  homeTeamColor: string;
  awayTeamColor: string;
}

export async function MatchStats({
  matchUlid,
  homeTeamColor,
  awayTeamColor,
}: MatchStatsProps) {
  const stats = await getMatchStats(matchUlid);

  if (stats.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Aucune statistique disponible pour ce match
      </div>
    );
  }

  return (
    <div className="py-6 px-4">
      <div className="grow flex flex-col max-w-[1060px] mx-auto">
        <MatchStatsAccordion
          stats={stats}
          homeTeamColor={homeTeamColor}
          awayTeamColor={awayTeamColor}
        />
      </div>
    </div>
  );
}
