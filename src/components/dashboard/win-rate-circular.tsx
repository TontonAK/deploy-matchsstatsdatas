"use client";

import { Label, Pie, PieChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";

interface WinRateCircularProps {
  wins: number;
  draws: number;
  losses: number;
  winRate: number;
}

export const WinRateCircular = ({
  wins,
  draws,
  losses,
  winRate,
}: WinRateCircularProps) => {
  const total = wins + draws + losses;
  const chartData = [
    { result: "wins", number: wins, fill: "#10b981" },
    { result: "draws", number: draws, fill: "#6b7280" },
    { result: "losses", number: losses, fill: "#ef4444" },
  ];
  const chartConfig = {
    number: {
      label: "Matchs",
    },
    wins: {
      label: "Victoires",
      color: "#10b981",
    },
    draws: {
      label: "Nuls",
      color: "#6b7280",
    },
    losses: {
      label: "Défaites",
      color: "#ef4444",
    },
  } satisfies ChartConfig;

  if (total === 0) {
    // Cas par défaut : afficahge d'un texte indiquant qu'aucun match n'a encore été disputé
    return (
      <div className="flex flex-col items-center justify-center w-full h-64">
        <span className="text-3xl font-bold text-black">Aucun</span>
        <span className="text-base text-gray-400 mt-2">match disputé</span>
      </div>
    );
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square w-full h-64"
    >
      <PieChart width={250} height={250}>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="number"
          nameKey="result"
          innerRadius={70}
          outerRadius={120}
          strokeWidth={3}
        >
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-3xl font-bold"
                    >
                      {winRate}%
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 28}
                      className="fill-muted-foreground text-sm"
                    >
                      de victoire
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  );
};
