"use client";

import { motion } from "framer-motion";
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
import { LineoutStatCreateFormSchema } from "@/schemas/lineout-stat-create.schema";

interface Step1TeamFormProps {
  control: Control<LineoutStatCreateFormSchema>;
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
}

export function Step1TeamForm({
  control,
  matchData,
  selectedTeamId,
  showErrors = false,
}: Step1TeamFormProps) {
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
        <Label htmlFor="teamId">Pour qui ?</Label>
        <Controller
          name="teamId"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <div>
              <RadioGroup
                value={field.value?.toString()}
                onValueChange={(value) => field.onChange(parseInt(value))}
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
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

      <div className="space-y-2">
        <Label htmlFor="playerId">Par qui ?</Label>
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
