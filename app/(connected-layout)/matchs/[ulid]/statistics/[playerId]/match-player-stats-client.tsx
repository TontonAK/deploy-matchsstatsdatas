"use client";

import { StatCardEditable } from "@/components/stats/stat-card-editable";
import { Button } from "@/components/ui/button";
import { StatValueType, StatTypeGamePhase } from "@/generated/prisma";
import { MatchPlayerStatsResult } from "@/database/statistics/get-match-player-stats";
import { updateMatchPlayerStatsAction } from "./update-stats.action";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface MatchPlayerStatsClientProps {
  playerStats: MatchPlayerStatsResult;
  canEdit: boolean;
  matchId: number;
  teamId: number;
  playerId: string;
}

export function MatchPlayerStatsClient({
  playerStats,
  canEdit,
  matchId,
  teamId,
  playerId,
}: MatchPlayerStatsClientProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<number, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  // Grouper les statistiques par gamePhase et ordonner
  const groupedStats = playerStats.stats.reduce((acc, stat) => {
    const phase = stat.gamePhase || "Autres";
    if (!acc[phase]) {
      acc[phase] = [];
    }
    acc[phase].push(stat);
    return acc;
  }, {} as Record<string, typeof playerStats.stats>);

  // Ordre d'affichage des phases
  const phaseOrder: (string | StatTypeGamePhase)[] = [
    "Score",
    "Attack",
    "Defense",
    "Static_Phase",
    "Foot",
    "Contact_Area",
    "Discipline",
    "Autres",
  ];

  // Traitement spécial pour "Temps de jeu" - le placer en dernier
  const tempsDeJeuStat = playerStats.stats.find(
    (stat) => stat.statTypeName === "Temps de jeu"
  );

  // Filtrer "Temps de jeu" des groupes normaux
  Object.keys(groupedStats).forEach((phase) => {
    groupedStats[phase] = groupedStats[phase].filter(
      (stat) => stat.statTypeName !== "Temps de jeu"
    );
  });

  // Traduire les noms des phases pour l'affichage
  const phaseTranslations: Record<string, string> = {
    Score: "Score",
    Attack: "Attaque",
    Defense: "Défense",
    Static_Phase: "Phases statiques",
    Foot: "Jeu au pied",
    Contact_Area: "Zones de contact",
    Discipline: "Discipline",
    Autres: "Autres statistiques",
  };

  const handleValueChange = (statTypeId: number, newValue: number) => {
    setEditedValues((prev) => ({
      ...prev,
      [statTypeId]: newValue,
    }));
  };

  const handleEditToggle = () => {
    if (isEditMode) {
      // Si on sort du mode édition, réinitialiser les valeurs éditées
      setEditedValues({});
    } else {
      // Si on entre en mode édition, initialiser avec les valeurs actuelles
      const initialValues: Record<number, number> = {};
      playerStats.stats.forEach((stat) => {
        if (stat.valueType === StatValueType.Number) {
          initialValues[stat.statTypeId] = stat.value;
        }
      });
      setEditedValues(initialValues);
    }
    setIsEditMode(!isEditMode);
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Créer la liste des stats à sauvegarder (seulement celles modifiées)
      const statsToUpdate = Object.entries(editedValues)
        .map(([statTypeId, newValue]) => {
          const originalStat = playerStats.stats.find(
            (s) => s.statTypeId === parseInt(statTypeId)
          );
          if (originalStat && originalStat.value !== newValue) {
            return {
              statTypeId: parseInt(statTypeId),
              newValue: newValue,
            };
          }
          return null;
        })
        .filter(Boolean) as { statTypeId: number; newValue: number }[];

      if (statsToUpdate.length === 0) {
        // Aucune modification, juste sortir du mode édition
        setIsEditMode(false);
        setEditedValues({});
        return;
      }

      // Appeler l'action de mise à jour
      const result = await updateMatchPlayerStatsAction({
        matchId,
        teamId,
        playerId,
        stats: statsToUpdate,
      });

      if (result?.data?.success) {
        // Succès : sortir du mode édition et rafraîchir la page
        setIsEditMode(false);
        setEditedValues({});
        router.refresh(); // Rafraîchir la page sans rechargement complet
      } else {
        // Erreur de l'action
        console.error(
          "Erreur lors de la sauvegarde:",
          result?.serverError || result?.validationErrors
        );
        alert(
          "Erreur lors de la sauvegarde des statistiques. Veuillez réessayer."
        );
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert(
        "Erreur lors de la sauvegarde des statistiques. Veuillez réessayer."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const getDisplayValue = (stat: (typeof playerStats.stats)[0]) => {
    if (
      isEditMode &&
      stat.valueType === StatValueType.Number &&
      editedValues[stat.statTypeId] !== undefined
    ) {
      return editedValues[stat.statTypeId];
    }
    return stat.valueType === StatValueType.Percentage
      ? `${stat.value}%`
      : stat.value;
  };

  return (
    <div className="space-y-8">
      {/* Bouton Modifier/Sauvegarder */}
      {canEdit && (
        <div className="flex justify-start">
          <Button
            onClick={isEditMode ? handleSave : handleEditToggle}
            disabled={isSaving}
            variant={isEditMode ? "default" : "outline"}
            size="lg"
          >
            {isSaving
              ? "Sauvegarde..."
              : isEditMode
              ? "Sauvegarder stats"
              : "Modifier stats"}
          </Button>
        </div>
      )}

      {/* Informations du joueur */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          Statistiques de {playerStats.playerName}
        </h2>
      </div>

      {/* Affichage des statistiques regroupées par phase */}
      {phaseOrder.map((phase) => {
        const stats = groupedStats[phase];
        if (!stats || stats.length === 0) return null;

        return (
          <div key={phase}>
            <h3 className="text-lg font-semibold mb-4">
              {phaseTranslations[phase] || phase}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <StatCardEditable
                  key={stat.statTypeId}
                  title={stat.statTypeName}
                  value={getDisplayValue(stat)}
                  isEditable={isEditMode}
                  valueType={stat.valueType}
                  statTypeId={stat.statTypeId}
                  onValueChange={handleValueChange}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Temps de jeu affiché en dernier */}
      {tempsDeJeuStat && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Temps de jeu</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <StatCardEditable
              title={tempsDeJeuStat.statTypeName}
              value={getDisplayValue(tempsDeJeuStat)}
              subtitle="minutes"
              isEditable={isEditMode}
              valueType={tempsDeJeuStat.valueType}
              statTypeId={tempsDeJeuStat.statTypeId}
              onValueChange={handleValueChange}
            />
          </div>
        </div>
      )}

      {/* Message si aucune statistique */}
      {playerStats.stats.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Aucune statistique disponible pour ce joueur dans ce match.
          </p>
        </div>
      )}
    </div>
  );
}
