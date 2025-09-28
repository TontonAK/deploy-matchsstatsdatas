interface StatBarContentProps {
  statHome: number;
  statAway: number;
  statHomeColor: string;
  statAwayColor: string;
}

const percentStat = (totalStat: number, statTeam: number) => {
  const percent = Math.round((statTeam / totalStat) * 100);
  return percent;
};

export function StatBarContent(stats: StatBarContentProps) {
  const totalStat = stats.statHome + stats.statAway;
  const percentHomeStat =
    totalStat != 0 ? percentStat(totalStat, stats.statHome) : 50;
  const percentAwayStat =
    totalStat != 0 ? percentStat(totalStat, stats.statAway) : 50;

  return (
    <div className="flex">
      <div
        className={`flex justify-end h-4 md:h-8`}
        style={{
          background: `${stats.statHomeColor}`,
          width: `${percentHomeStat}%`,
        }}
      >
        <div
          className="h-full w-3 md:6"
          style={{
            background: `linear-gradient(to top left, #fff 0%, #fff 50%, ${stats.statHomeColor} 50%, ${stats.statHomeColor} 100%)`,
          }}
        ></div>
      </div>
      <div
        className={`flex justify-start h-4 md:h-8`}
        style={{
          background: `${stats.statAwayColor}`,
          width: `${percentAwayStat}%`,
        }}
      >
        <div
          className="h-full w-3 md:6"
          style={{
            background: `linear-gradient(to bottom right, #fff 0%, #fff 50%, ${stats.statAwayColor} 50%, ${stats.statAwayColor} 100%)`,
          }}
        ></div>
      </div>
    </div>
  );
}
