"use client";

import { useState } from "react";
import HeaderMatchLive from "@/components/matchs/live/header-match-live";
import { MatchStats } from "@/components/matchs/match-stats";
import { MatchEvents } from "@/components/matchs/match-events";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MatchStats as MatchStatsType } from "@/hooks/use-match-data";
import { MatchEventGroup } from "@/generated/prisma";
import LiveActions from "./live-button-actions";
import SubstitutionButtonAction from "./substitution-button-action";
import { Separator } from "@/components/ui/separator";

interface MatchEventTypes {
  id: number;
  name: string;
  group: MatchEventGroup | null;
}

interface MatchLineup {
  id: number;
  match: {
    id: number;
    ulid: string;
  };
  team: {
    id: number;
    name: string;
    club: {
      id: number;
      name: string;
    };
  };
  player: {
    id: string;
    firstname: string;
    lastname: string;
  };
  number: number;
}

interface LiveMatchContentProps {
  matchData: MatchStatsType;
  matchEventTypes: MatchEventTypes[];
  matchLineup: MatchLineup[];
  matchUlid: string;
}

const tabsMenu = [
  {
    action: "actions",
    menu: "Actions",
  },
  {
    action: "stats", 
    menu: "Statistiques",
  },
  {
    action: "commentary",
    menu: "Commentaires",
  },
];

export default function LiveMatchContent({
  matchData,
  matchEventTypes,
  matchLineup,
  matchUlid,
}: LiveMatchContentProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLiveStarted = () => {
    // Rafraîchir les données après le démarrage du live
    setRefreshKey(prev => prev + 1);
  };

  const handleEventCreated = () => {
    // Rafraîchir les données après la création d'un événement
    setRefreshKey(prev => prev + 1);
  };

  const handleMatchFinished = () => {
    // Rafraîchir les données après la fin du match
    setRefreshKey(prev => prev + 1);
  };

  const isLive = matchData.match.status === "Live";

  return (
    <main className="font-montserrat font-bold">
      <HeaderMatchLive 
        matchData={matchData} 
        onLiveStarted={handleLiveStarted}
        onMatchFinished={handleMatchFinished}
      />
      
      <Tabs
        className="flex w-full justify-center relative"
        defaultValue="stats"
      >
        <TabsList className="rounded-none bg-transparent h-auto flex pt-1 overflow-x-auto text-sm md:justify-center lg:text-base border-b border-solid border-gray-200 w-full">
          {tabsMenu.map((item) => (
            <TabsTrigger
              key={item.action}
              className="flex px-4 py-4 rounded-none font-semibold uppercase text-black border-solid border-plaisir-primary hover:border-b-2 whitespace-nowrap data-[state=active]:border-b-2 data-[state=active]:font-extrabold"
              value={item.action}
            >
              {item.menu}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="actions">
          {isLive ? (
            <div>
              <LiveActions
                matchEventTypes={matchEventTypes}
                matchLineup={matchLineup}
                matchId={matchData.matchId}
                homeTeam={matchData.homeTeam}
                awayTeam={matchData.awayTeam}
                onEventCreated={handleEventCreated}
              />
              
              <Separator className="my-6" />
              
              <div className="px-6">
                <h3 className="text-lg font-bold mb-4 text-center">
                  Actions spéciales
                </h3>
                <div className="flex justify-center">
                  <div className="w-64">
                    <SubstitutionButtonAction
                      matchLineup={matchLineup}
                      matchId={matchData.matchId}
                      homeTeam={matchData.homeTeam}
                      awayTeam={matchData.awayTeam}
                      onEventCreated={handleEventCreated}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-lg text-muted-foreground">
                Démarrez le live pour accéder aux actions
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="stats">
          <div key={`stats-${refreshKey}`}>
            <MatchStats
              matchUlid={matchUlid}
              homeTeamColor={matchData.homeTeam.club.primaryColor}
              awayTeamColor={matchData.awayTeam.club.primaryColor}
            />
          </div>
        </TabsContent>

        <TabsContent value="commentary">
          <div key={`events-${refreshKey}`}>
            <MatchEvents matchUlid={matchUlid} />
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}