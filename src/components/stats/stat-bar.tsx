"use client";

import { StatValueType } from "@/generated/prisma";
import { StatBarProps } from "@/lib/utils";
import { StatBarContent } from "./stat-bar-content";
import { StatBarTop } from "./stat-bar-top";

export function StatBar(statProps: StatBarProps) {
  return (
    <div>
      <StatBarTop
        statTitle={`${statProps.statTitle}`}
        statHome={statProps.statHome}
        statAway={statProps.statAway}
        percentage={
          statProps.statValueType == StatValueType.Number ? false : true
        }
      />
      <StatBarContent
        statHome={statProps.statHome}
        statAway={statProps.statAway}
        statHomeColor={`${statProps.statHomeColor}`}
        statAwayColor={`${statProps.statAwayColor}`}
      />
    </div>
  );
}
