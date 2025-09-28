"use client";

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';

interface PlayerRadarData {
  subject: string;
  player: number;
  team: number;
  fullMark: number;
}

interface PlayerRadarChartProps {
  data: PlayerRadarData[];
}

export function PlayerRadarChart({ data }: PlayerRadarChartProps) {
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Comparaison avec l'équipe (moyennes par match)</h2>
      <div className="flex justify-center">
        <div className="w-full max-w-4xl h-96">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis domain={[0, 'dataMax']} />
              <Radar
                name="Joueur"
                dataKey="player"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
              <Radar
                name="Équipe"
                dataKey="team"
                stroke="#82ca9d"
                fill="#82ca9d"
                fillOpacity={0.6}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}