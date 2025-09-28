import { StatBar } from "@/components/stats/stat-bar";
import {
  getMatchStats,
  type MatchStatsSummary,
} from "@/database/statistics/get-match-stats";

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
      <div className="grow flex flex-col max-w-[1060px] mx-auto gap-6 lg:gap-4 space-y-8">
        {stats.map((stat: MatchStatsSummary) => (
          <StatBar
            key={stat.statTypeId}
            statTitle={stat.statTypeName}
            statValueType={stat.statTypeValue}
            statHome={stat.homeTeamValue}
            statAway={stat.awayTeamValue}
            statHomeColor={homeTeamColor}
            statAwayColor={awayTeamColor}
          />
        ))}
      </div>
    </div>
  );
}
