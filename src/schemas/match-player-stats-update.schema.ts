import { z } from "zod";

export const StatUpdateSchema = z.object({
  statTypeId: z.number().min(1, "L'ID du type de statistique est requis"),
  newValue: z.number().min(0, "La valeur ne peut pas être négative"),
});

export const MatchPlayerStatsUpdateSchema = z.object({
  matchId: z.number().min(1, "L'ID du match est requis"),
  teamId: z.number().min(1, "L'ID de l'équipe est requis"),
  playerId: z.string().min(1, "L'ID du joueur est requis"),
  stats: z.array(StatUpdateSchema).min(1, "Au moins une statistique doit être fournie"),
});

export type MatchPlayerStatsUpdateFormSchema = z.infer<typeof MatchPlayerStatsUpdateSchema>;