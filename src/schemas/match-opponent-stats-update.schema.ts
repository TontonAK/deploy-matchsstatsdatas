import { z } from "zod";

export const StatUpdateSchema = z.object({
  statTypeId: z.number().min(1, "L'ID du type de statistique est requis"),
  newValue: z.number().min(0, "La valeur ne peut pas être négative"),
});

export const MatchOpponentStatsUpdateSchema = z.object({
  matchId: z.number().min(1, "L'ID du match est requis"),
  opponentTeamId: z.number().min(1, "L'ID de l'équipe adverse est requis"),
  stats: z.array(StatUpdateSchema).min(1, "Au moins une statistique doit être fournie"),
});

export type MatchOpponentStatsUpdateFormSchema = z.infer<typeof MatchOpponentStatsUpdateSchema>;
