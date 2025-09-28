"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import TestLiveActions from "./test-live-actions";
import TestSubstitutionAction from "./test-substitution-action";

interface TestEvent {
  id: number;
  eventType: {
    id: number;
    name: string;
    group: string | null;
  };
  team: {
    id: number;
    name: string;
    club: {
      id: number;
      name: string;
      primaryColor: string;
      secondaryColor: string;
    };
  };
  mainPlayer?: {
    id: string;
    firstname: string;
    lastname: string;
  } | null;
  secondPlayer?: {
    id: string;
    firstname: string;
    lastname: string;
  } | null;
  minute: number;
  description: string | null;
}

interface MatchEventTypes {
  id: number;
  name: string;
  group: "Tries" | "Shoots" | "Fouls" | "Other";
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

interface MockMatchData {
  matchId: number;
  homeTeam: {
    id: number;
    name: string;
    club: {
      name: string;
      primaryColor: string;
      secondaryColor: string;
      logo: string | null;
    };
  };
  awayTeam: {
    id: number;
    name: string;
    club: {
      name: string;
      primaryColor: string;
      secondaryColor: string;
      logo: string | null;
    };
  };
}

interface TestActionContentProps {
  matchData: MockMatchData;
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
    action: "events",
    menu: "Événements",
  },
];

export default function TestActionContent({
  matchData,
  matchEventTypes,
  matchLineup,
  matchUlid,
}: TestActionContentProps) {
  const [events, setEvents] = useState<TestEvent[]>([]);

  const handleEventCreated = (eventData: {
    eventType: string;
    team: "home" | "away";
    playerId?: string;
    mainPlayerId?: string;
    secondPlayerId?: string;
    minute: number;
    description?: string;
  }) => {
    const eventType = matchEventTypes.find(
      (et) => et.name === eventData.eventType
    );
    if (!eventType) return;

    const teamData =
      eventData.team === "home" ? matchData.homeTeam : matchData.awayTeam;

    let mainPlayer = null;
    let secondPlayer = null;
    let description: string | null = null;

    if (eventData.mainPlayerId && eventData.secondPlayerId) {
      const mainP = matchLineup.find(
        (p) => p.player.id === eventData.mainPlayerId
      );
      const secondP = matchLineup.find(
        (p) => p.player.id === eventData.secondPlayerId
      );
      if (mainP && secondP) {
        mainPlayer = mainP.player;
        secondPlayer = secondP.player;
      }
    } else if (eventData.playerId) {
      const player = matchLineup.find(
        (p) => p.player.id === eventData.playerId
      );
      if (player) {
        mainPlayer = player.player;
      }
    }

    // Priorité 1 : Utiliser la description fournie par l'utilisateur
    if (eventData.description && eventData.description.trim()) {
      description = eventData.description.trim();
    } else {
      // Priorité 2 : Créer une description automatique si possible
      try {
        if (eventData.mainPlayerId && eventData.secondPlayerId) {
          if (mainPlayer && secondPlayer) {
            description = `Remplacement - ${mainPlayer.firstname} ${mainPlayer.lastname} ↔ ${secondPlayer.firstname} ${secondPlayer.lastname}`;
          }
        } else if (eventData.playerId) {
          if (mainPlayer) {
            description = `${eventData.eventType} - ${mainPlayer.firstname} ${mainPlayer.lastname}`;
          }
        }
        // Si aucune description automatique n'a pu être créée, on laisse description à null
      } catch (error) {
        console.warn(
          "Impossible de créer la description automatique de l'événement:",
          error
        );
      }
    }

    const newEvent: TestEvent = {
      id: Date.now() + Math.random(),
      eventType: {
        id: eventType.id,
        name: eventType.name,
        group: eventType.group,
      },
      team: {
        id: teamData.id,
        name: teamData.name,
        club: {
          id: teamData.id,
          name: teamData.club.name,
          primaryColor: teamData.club.primaryColor,
          secondaryColor: teamData.club.secondaryColor,
        },
      },
      mainPlayer,
      secondPlayer,
      minute: eventData.minute,
      description,
    };

    setEvents((prev) => [newEvent, ...prev]);
    toast.success(`Événement "${eventData.eventType}" ajouté avec succès !`);
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "Essai":
        return "🏈";
      case "Transformation réussie":
        return "⚽";
      case "Transformation manquée":
        return "❌";
      case "Drop réussi":
        return "🎯";
      case "Drop manqué":
        return "🚫";
      case "Pénalité":
        return "⚠️";
      case "Coup franc":
        return "🆓";
      case "Pénalité réussie":
        return "🎯";
      case "Pénalité manquée":
        return "🚫";
      case "Carton jaune":
        return "🟨";
      case "Carton rouge":
        return "🟥";
      case "Remplacement":
        return "↔️";
      default:
        return "⚽";
    }
  };

  const getEventBadgeVariant = (eventType: string) => {
    if (eventType.includes("réussi") || eventType === "Essai") {
      return "default";
    }
    if (
      eventType.includes("manqué") ||
      eventType.includes("Pénalité") ||
      eventType.includes("Coup franc")
    ) {
      return "secondary";
    }
    if (eventType.includes("Carton")) {
      return "destructive";
    }
    return "outline";
  };

  // Grouper les événements par minute
  const eventsByMinute = events.reduce((acc, event) => {
    const minute = event.minute;
    if (!acc[minute]) {
      acc[minute] = [];
    }
    acc[minute].push(event);
    return acc;
  }, {} as Record<number, TestEvent[]>);

  const sortedMinutes = Object.keys(eventsByMinute)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <main className="font-montserrat font-bold">
      {/* Header simple */}
      <header className="pt-11 bg-gradient-to-r from-gradient-start to-plaisir-primary flex flex-col items-center relative w-full z-0 px-6 pb-6">
        <div className="text-white text-center py-8">
          <h1 className="text-3xl font-bold mb-2">
            🧪 Page de Test - Actions Live
          </h1>
          <p className="text-lg opacity-90">
            {matchData.homeTeam.club.name} vs {matchData.awayTeam.club.name}
          </p>
          <p className="text-sm opacity-75 mt-2">
            Testez les boutons d'actions sans impact sur la base de données
          </p>
        </div>
      </header>

      <Tabs
        className="flex w-full justify-center relative"
        defaultValue="actions"
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
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 m-6 mb-8">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🧪</span>
              <div>
                <h3 className="font-semibold text-yellow-800">Mode Test</h3>
                <p className="text-sm text-yellow-700">
                  Cette page permet de tester les actions sans impacter la base
                  de données. Les événements sont ajoutés localement et visibles
                  dans l'onglet "Événements".
                </p>
              </div>
            </div>
          </div>

          <div>
            <TestLiveActions
              matchEventTypes={matchEventTypes}
              matchLineup={matchLineup}
              matchData={matchData}
              onEventCreated={handleEventCreated}
            />

            <Separator className="my-6" />

            <div className="px-6">
              <h3 className="text-lg font-bold mb-4 text-center">
                Actions spéciales
              </h3>
              <div className="flex justify-center">
                <div className="w-64">
                  <TestSubstitutionAction
                    matchLineup={matchLineup}
                    matchData={matchData}
                    onEventCreated={handleEventCreated}
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="events">
          <div className="py-6 px-4">
            {events.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">📝</span>
                <h3 className="text-lg font-semibold mb-2">
                  Aucun événement créé
                </h3>
                <p className="text-muted-foreground">
                  Utilisez les boutons d'actions pour créer des événements de
                  test
                </p>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold mb-2">
                    Événements du match
                  </h2>
                  <p className="text-muted-foreground">
                    {events.length} événement{events.length > 1 ? "s" : ""} créé
                    {events.length > 1 ? "s" : ""}
                  </p>
                </div>

                <div className="space-y-4">
                  {sortedMinutes.map((minute) => (
                    <div key={minute} className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-6 top-8 bottom-0 w-0.5 bg-gray-200"></div>

                      <div className="relative flex items-start space-x-4">
                        {/* Minute indicator */}
                        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-plaisir-primary text-white rounded-full font-bold text-sm">
                          {minute}'
                        </div>

                        {/* Events for this minute */}
                        <div className="flex-1 space-y-2">
                          {eventsByMinute[minute].map((event) => (
                            <div
                              key={event.id}
                              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <span className="text-2xl">
                                      {getEventIcon(event.eventType.name)}
                                    </span>
                                    <Badge
                                      variant={
                                        getEventBadgeVariant(
                                          event.eventType.name
                                        ) as any
                                      }
                                    >
                                      {event.eventType.name}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      TEST
                                    </Badge>
                                  </div>

                                  {event.description && (
                                    <p className="text-sm text-gray-600 mb-2">
                                      {event.description}
                                    </p>
                                  )}

                                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                                    <div className="flex items-center space-x-1">
                                      <div
                                        className="w-3 h-3 rounded-full"
                                        style={{
                                          backgroundColor:
                                            event.team.club.primaryColor,
                                        }}
                                      ></div>
                                      <span>{event.team.club.name}</span>
                                    </div>

                                    {event.mainPlayer && (
                                      <div className="flex items-center space-x-1">
                                        <User className="w-3 h-3" />
                                        <span>
                                          {event.mainPlayer.firstname}{" "}
                                          {event.mainPlayer.lastname}
                                        </span>
                                      </div>
                                    )}

                                    {event.secondPlayer && (
                                      <div className="flex items-center space-x-1">
                                        <span>→</span>
                                        <User className="w-3 h-3" />
                                        <span>
                                          {event.secondPlayer.firstname}{" "}
                                          {event.secondPlayer.lastname}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-500">
                                    {minute}'
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
