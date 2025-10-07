"use client";

import { StatBar } from "@/components/stats/stat-bar";
import type { MatchStatsSummary } from "@/database/statistics/get-match-stats";
import { StatTypeGamePhase } from "@/generated/prisma";
import { cn } from "@/lib/utils";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

interface MatchStatsAccordionProps {
  stats: MatchStatsSummary[];
  homeTeamColor: string;
  awayTeamColor: string;
}

const GAME_PHASE_TRANSLATIONS: Record<StatTypeGamePhase, string> = {
  Score: "Score",
  Attack: "Attaque",
  Defense: "Défense",
  Static_Phase: "Phases statiques",
  Foot: "Jeu au pied",
  Contact_Area: "Zones de contact",
  Discipline: "Discipline",
};

export function MatchStatsAccordion({
  stats,
  homeTeamColor,
  awayTeamColor,
}: MatchStatsAccordionProps) {
  // Grouper les statistiques par gamePhase
  const groupedStats = stats.reduce(
    (acc, stat) => {
      const phase = stat.gamePhase || "Other";
      if (!acc[phase]) {
        acc[phase] = [];
      }
      acc[phase].push(stat);
      return acc;
    },
    {} as Record<string, MatchStatsSummary[]>
  );

  // Obtenir les phases dans l'ordre
  const phases = Object.keys(groupedStats);

  return (
    <AccordionPrimitive.Root
      type="multiple"
      defaultValue={["Score"]}
      className="w-full space-y-6"
    >
      {phases.map((phase) => {
        const phaseLabel =
          phase in GAME_PHASE_TRANSLATIONS
            ? GAME_PHASE_TRANSLATIONS[phase as StatTypeGamePhase]
            : phase;

        return (
          <AccordionPrimitive.Item
            key={phase}
            value={phase}
            className="border-none"
          >
            <AccordionPrimitive.Header className="flex">
              <AccordionPrimitive.Trigger
                className={cn(
                  "group relative flex w-full items-center justify-center py-4 outline-none transition-all"
                )}
              >
                {/* Ligne horizontale */}
                <div className="absolute inset-0 flex items-center px-4">
                  <div className="h-[1px] w-full bg-gray-300" />
                </div>

                {/* Conteneur du texte et du chevron avec fond */}
                <div className="relative flex items-center gap-2 bg-white px-4">
                  <span className="text-sm font-bold uppercase tracking-wide md:text-2xl">
                    {phaseLabel}
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </div>
              </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>
            <AccordionPrimitive.Content className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden">
              <div className="flex flex-col gap-6 px-4 pt-6 pb-2 lg:gap-4">
                {groupedStats[phase].map((stat) => (
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
            </AccordionPrimitive.Content>
          </AccordionPrimitive.Item>
        );
      })}
    </AccordionPrimitive.Root>
  );
}
