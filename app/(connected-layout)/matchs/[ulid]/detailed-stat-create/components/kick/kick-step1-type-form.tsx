"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Control, Controller } from "react-hook-form";

import { Label } from "@/components/ui/label";
import { RadioCard, RadioGroup } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatType } from "@/generated/prisma";
import { KickStatCreateFormSchema } from "@/schemas/kick-stat-create.schema";
import { getKickStatTypesAction } from "../../get-kick-stat-types.action";

interface KickStep1TypeFormProps {
  control: Control<KickStatCreateFormSchema>;
  matchData: {
    homeTeam: { id: number; name: string; club: { name: string } };
    awayTeam: { id: number; name: string; club: { name: string } };
    homeLineup: {
      playerId: string;
      number: number;
      player: { firstname: string; lastname: string };
    }[];
    awayLineup: {
      playerId: string;
      number: number;
      player: { firstname: string; lastname: string };
    }[];
  };
  selectedTeamId?: number;
  showErrors?: boolean;
  onStatTypesLoaded?: (statTypes: { id: number; name: string }[]) => void;
}

export function KickStep1TypeForm({
  control,
  matchData,
  selectedTeamId,
  showErrors = false,
  onStatTypesLoaded,
}: KickStep1TypeFormProps) {
  const [statTypes, setStatTypes] = useState<StatType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les types de statistiques pour les coups de pied
  useEffect(() => {
    const loadStatTypes = async () => {
      try {
        const result = await getKickStatTypesAction();

        if (result?.data?.success && result.data.statTypes) {
          setStatTypes(result.data.statTypes);
          // Appeler le callback avec les données simplifiées
          onStatTypesLoaded?.(
            result.data.statTypes.map((st) => ({ id: st.id, name: st.name }))
          );
        }
      } catch (error) {
        console.error("Error loading stat types:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStatTypes();
  }, []);

  // Déterminer quelle équipe est sélectionnée pour afficher ses joueurs
  const selectedTeam =
    selectedTeamId === matchData.homeTeam.id
      ? "home"
      : selectedTeamId === matchData.awayTeam.id
        ? "away"
        : null;

  const lineup =
    selectedTeam === "home"
      ? matchData.homeLineup
      : selectedTeam === "away"
        ? matchData.awayLineup
        : [];

  const hasLineup = lineup.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-3">
        <Label htmlFor="statTypeId">Type de coup de pied</Label>
        <Controller
          name="statTypeId"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <div>
              {isLoading ? (
                <p className="text-sm text-muted-foreground">
                  Chargement des types...
                </p>
              ) : (
                <RadioGroup
                  value={field.value?.toString()}
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  className="grid grid-cols-2 md:grid-cols-2 gap-3"
                >
                  {statTypes.map((statType) => (
                    <RadioCard
                      key={statType.id}
                      value={statType.id.toString()}
                      text={statType.name}
                    />
                  ))}
                </RadioGroup>
              )}
              {showErrors && error && (
                <p className="text-sm text-destructive mt-1">{error.message}</p>
              )}
            </div>
          )}
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="teamId">Équipe ayant effectué le coup de pied</Label>
        <Controller
          name="teamId"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <div>
              <RadioGroup
                value={field.value?.toString()}
                onValueChange={(value) => field.onChange(parseInt(value))}
                className="grid grid-cols-2 md:grid-cols-2 gap-3"
              >
                <RadioCard
                  value={matchData.homeTeam.id.toString()}
                  text={`${matchData.homeTeam.club.name} (Domicile)`}
                />
                <RadioCard
                  value={matchData.awayTeam.id.toString()}
                  text={`${matchData.awayTeam.club.name} (Visiteur)`}
                />
              </RadioGroup>
              {showErrors && error && (
                <p className="text-sm text-destructive mt-1">{error.message}</p>
              )}
            </div>
          )}
        />
      </div>

      <div className="space-y-2 mb-5">
        <Label htmlFor="playerId">Joueur ayant effectué le coup de pied</Label>
        <Controller
          name="playerId"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <div>
              <Select
                value={field.value || ""}
                onValueChange={(value) => field.onChange(value || null)}
                disabled={!hasLineup}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      hasLineup
                        ? "Sélectionner un joueur (optionnel)"
                        : "Aucune feuille de match existante"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun joueur spécifique</SelectItem>
                  {lineup.map((player) => (
                    <SelectItem key={player.playerId} value={player.playerId}>
                      #{player.number} - {player.player.firstname}{" "}
                      {player.player.lastname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {showErrors && error && (
                <p className="text-sm text-destructive mt-1">{error.message}</p>
              )}
              {!hasLineup && (
                <p className="text-sm text-muted-foreground mt-1">
                  Aucune feuille de match disponible pour cette équipe
                </p>
              )}
            </div>
          )}
        />
      </div>
    </motion.div>
  );
}
