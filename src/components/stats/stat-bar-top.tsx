interface StatBarTopProps {
  statTitle: string;
  statHome: number;
  statAway: number;
  percentage?: boolean;
}

export function StatBarTop(stats: StatBarTopProps) {
  return (
    <div className="flex justify-between items-center uppercase text-center tracking-[0.3px] mb-2 md:mb-4">
      <span className="text-bold text-xl md:text-h4y">
        {stats.statHome}
        {stats.percentage ? "%" : ""}
      </span>
      <span className="font-montserrat text-caption md:text-body-2">
        {stats.statTitle}
      </span>
      <span className="text-bold text-xl md:text-h4">
        {stats.statAway}
        {stats.percentage ? "%" : ""}
      </span>
    </div>
  );
}
