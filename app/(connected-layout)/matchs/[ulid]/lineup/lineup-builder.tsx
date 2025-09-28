"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type {
  PlayersGroupedByPosition,
  TeamPlayerWithPosition,
} from "@/database/players/get-players";
import { saveLineupAction } from "@/lib/actions/lineup";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  UniqueIdentifier,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";

interface LineupPlayer {
  playerId: string;
  number: number;
  player: TeamPlayerWithPosition;
}

interface LineupBuilderProps {
  matchUlid: string;
  teamId: number;
  nbPlayerLineup: number;
  playersGroupedByPosition: PlayersGroupedByPosition;
  currentLineup: {
    number: number;
    player: TeamPlayerWithPosition;
  }[];
}

const positionGroupLabels: Record<string, string> = {
  First_Line: "1ère Ligne",
  Second_Line: "2ème Ligne",
  Third_Line: "3ème Ligne",
  Scrum_Fly_Half: "Demi de mêlée / d'ouverture",
  Winger: "Ailiers",
  Center: "Centres",
  Full_Back: "Arrière",
  No_Position: "Sans position",
};

// Composant pour les joueurs déplaçables
function DraggablePlayer({
  player,
  children,
}: {
  player: TeamPlayerWithPosition;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: player.id,
    });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  );
}

// Composant pour les zones de drop du lineup
function LineupDropZone({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? "bg-accent" : ""}`}
    >
      {children}
    </div>
  );
}

export function LineupBuilder({
  matchUlid,
  teamId,
  nbPlayerLineup,
  playersGroupedByPosition,
  currentLineup,
}: LineupBuilderProps) {
  // État du lineup (numéros de 1 à nbPlayerLineup)
  const [lineup, setLineup] = useState<(LineupPlayer | null)[]>(() => {
    const initialLineup = Array(nbPlayerLineup).fill(null);

    // Remplir avec la composition actuelle si elle existe
    currentLineup.forEach((lineupPlayer) => {
      if (lineupPlayer.number >= 1 && lineupPlayer.number <= nbPlayerLineup) {
        initialLineup[lineupPlayer.number - 1] = {
          playerId: lineupPlayer.player.id,
          number: lineupPlayer.number,
          player: lineupPlayer.player,
        };
      }
    });

    return initialLineup;
  });

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over) return;

      const activeId = active.id;
      const overId = over.id;

      // Si on drop sur une position du lineup
      if (typeof overId === "string" && overId.startsWith("lineup-")) {
        const positionIndex = parseInt(overId.replace("lineup-", ""));

        if (positionIndex >= 0 && positionIndex < nbPlayerLineup) {
          // Trouver le joueur à partir de son ID
          let playerToMove: TeamPlayerWithPosition | null = null;

          // Chercher dans tous les groupes de positions
          Object.values(playersGroupedByPosition).forEach((players) => {
            const foundPlayer = players.find((p) => p.id === activeId);
            if (foundPlayer) {
              playerToMove = foundPlayer;
            }
          });

          // Ou chercher dans le lineup actuel si on déplace depuis le lineup
          const existingLineupPlayer = lineup.find(
            (lp) => lp && lp.playerId === activeId
          );
          if (existingLineupPlayer) {
            playerToMove = existingLineupPlayer.player;
          }

          if (playerToMove) {
            setLineup((prev) => {
              const newLineup = [...prev];

              // Supprimer le joueur de sa position actuelle dans le lineup
              const currentIndex = newLineup.findIndex(
                (lp) => lp && lp.playerId === activeId
              );
              if (currentIndex !== -1) {
                newLineup[currentIndex] = null;
              }

              // Placer le joueur à la nouvelle position
              if (playerToMove) {
                newLineup[positionIndex] = {
                  playerId: playerToMove.id,
                  number: positionIndex + 1,
                  player: playerToMove,
                };
              }

              return newLineup;
            });
          }
        }
      }

      // Si on drop sur la zone des joueurs disponibles (pour retirer du lineup)
      if (overId === "available-players") {
        setLineup((prev) => {
          const newLineup = [...prev];
          const playerIndex = newLineup.findIndex(
            (lp) => lp && lp.playerId === activeId
          );
          if (playerIndex !== -1) {
            newLineup[playerIndex] = null;
          }
          return newLineup;
        });
      }
    },
    [lineup, nbPlayerLineup, playersGroupedByPosition]
  );

  const getAvailablePlayers = useCallback(() => {
    const playersInLineup = new Set(
      lineup
        .filter((lp): lp is LineupPlayer => lp !== null)
        .map((lp) => lp.playerId)
    );
    const availablePlayers: TeamPlayerWithPosition[] = [];

    Object.values(playersGroupedByPosition).forEach((players) => {
      players.forEach((player) => {
        if (!playersInLineup.has(player.id)) {
          availablePlayers.push(player);
        }
      });
    });

    return availablePlayers;
  }, [lineup, playersGroupedByPosition]);

  const handleSaveLineup = async () => {
    setIsLoading(true);

    try {
      const lineupData = lineup
        .filter((lp): lp is LineupPlayer => lp !== null)
        .map((lp) => ({
          playerId: lp.playerId,
          number: lp.number,
        }));

      const result = await saveLineupAction({
        matchUlid,
        teamId,
        lineup: lineupData,
      });

      if (result?.data?.success) {
        toast.success("Composition sauvegardée avec succès!");
        router.push(`/matchs/${matchUlid}`);
      } else {
        toast.error("Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Error saving lineup:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsLoading(false);
    }
  };

  const renderPlayerCard = (player: TeamPlayerWithPosition) => (
    <div className="flex items-center gap-2 p-2 rounded-lg border bg-card hover:bg-accent/50 cursor-grab active:cursor-grabbing transition-colors">
      <div className="relative">
        <Avatar className="h-8 w-8">
          {player.image ? (
            <AvatarImage
              src={player.image}
              alt={`${player.firstname} ${player.lastname}`}
            />
          ) : null}
          <AvatarFallback className="text-xs">
            {player.firstname.charAt(0)}
            {player.lastname.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {player.name || `${player.firstname} ${player.lastname}`}
        </p>
        {player.positions.length > 0 && (
          <p className="text-xs text-muted-foreground truncate">
            {player.positions
              .filter((p) => p.isMainPosition)
              .map((p) => p.position.shortName)
              .join(", ") || player.positions[0]?.position.shortName}
          </p>
        )}
      </div>
    </div>
  );

  const availablePlayers = getAvailablePlayers();
  const groupedAvailablePlayers: PlayersGroupedByPosition = {};

  // Regrouper les joueurs disponibles par position
  availablePlayers.forEach((player) => {
    if (player.positions.length === 0) {
      if (!groupedAvailablePlayers["No_Position"]) {
        groupedAvailablePlayers["No_Position"] = [];
      }
      groupedAvailablePlayers["No_Position"].push(player);
    } else {
      const mainPosition = player.positions.find((p) => p.isMainPosition);
      const positionToUse = mainPosition || player.positions[0];
      const groupKey = positionToUse.position.group;

      if (!groupedAvailablePlayers[groupKey]) {
        groupedAvailablePlayers[groupKey] = [];
      }
      groupedAvailablePlayers[groupKey].push(player);
    }
  });

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feuille de match - Gauche */}
        <Card>
          <CardHeader>
            <CardTitle>
              Feuille de match ({lineup.filter((lp) => lp).length}/
              {nbPlayerLineup})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: nbPlayerLineup }, (_, index) => {
                const player = lineup[index];
                const positionNumber = index + 1;

                return (
                  <LineupDropZone
                    key={`lineup-${index}`}
                    id={`lineup-${index}`}
                    className="flex items-center gap-3 p-3 border rounded-lg min-h-[60px] bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 text-center">
                      <Badge
                        variant="outline"
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                      >
                        {positionNumber}
                      </Badge>
                    </div>

                    <div className="flex-1">
                      {player ? (
                        <DraggablePlayer player={player.player}>
                          {renderPlayerCard(player.player)}
                        </DraggablePlayer>
                      ) : (
                        <div className="text-muted-foreground text-sm italic py-2">
                          Glissez un joueur ici...
                        </div>
                      )}
                    </div>
                  </LineupDropZone>
                );
              })}
            </div>

            <Separator className="my-4" />

            <div className="flex gap-2">
              <Button
                onClick={handleSaveLineup}
                disabled={isLoading || lineup.filter((lp) => lp).length === 0}
                className="flex-1"
              >
                {isLoading ? "Sauvegarde..." : "Valider composition"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Joueurs disponibles - Droite */}
        <Card>
          <CardHeader>
            <CardTitle>
              Joueurs disponibles ({availablePlayers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LineupDropZone
              id="available-players"
              className="space-y-4 min-h-[200px] p-2 border-2 border-dashed border-muted-foreground/20 rounded-lg"
            >
              {Object.entries(groupedAvailablePlayers).map(
                ([groupKey, players]) => (
                  <div key={groupKey}>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">
                      {positionGroupLabels[groupKey] || groupKey}
                    </h4>

                    <div className="grid grid-cols-1 gap-2">
                      {players.map((player) => (
                        <DraggablePlayer key={player.id} player={player}>
                          {renderPlayerCard(player)}
                        </DraggablePlayer>
                      ))}
                    </div>

                    {players.length === 0 && (
                      <p className="text-muted-foreground text-xs italic">
                        Tous les joueurs de cette position sont dans la
                        composition
                      </p>
                    )}
                  </div>
                )
              )}

              {Object.keys(groupedAvailablePlayers).length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  Tous les joueurs sont dans la composition
                </p>
              )}
            </LineupDropZone>
          </CardContent>
        </Card>
      </div>

      <DragOverlay>
        {activeId
          ? (() => {
              // Chercher le joueur actif
              let activePlayer: TeamPlayerWithPosition | null = null;

              Object.values(playersGroupedByPosition).forEach((players) => {
                const foundPlayer = players.find((p) => p.id === activeId);
                if (foundPlayer) {
                  activePlayer = foundPlayer;
                }
              });

              const existingLineupPlayer = lineup.find(
                (lp) => lp && lp.playerId === activeId
              );
              if (existingLineupPlayer) {
                activePlayer = existingLineupPlayer.player;
              }

              return activePlayer ? (
                <div className="opacity-90 rotate-2 scale-105">
                  {renderPlayerCard(activePlayer)}
                </div>
              ) : null;
            })()
          : null}
      </DragOverlay>
    </DndContext>
  );
}
