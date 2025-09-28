import { z } from "zod";
import { MatchLineupNumberEnum } from "@/lib/utils";

export const MatchCreateSchema = z.object({
  // Configuration de la compétition
  leagueId: z.number().optional(),
  leaguePoolId: z.number().optional(),
  typeMatchId: z.number().min(1, "Le type de match est requis"),
  seasonLeagueId: z.number().optional(),
  
  // Assignation des équipes
  homeTeamId: z.number().min(1, "L'équipe à domicile est requise"),
  awayTeamId: z.number().min(1, "L'équipe à l'extérieur est requise"),
  
  // Configuration du match
  stadiumId: z.number().min(1, "Le stade est requis"),
  schedule: z.date({
    required_error: "La date et l'heure du match sont requises",
  }),
  nbPlayerLineup: z.nativeEnum(MatchLineupNumberEnum, {
    required_error: "Le nombre de joueurs sur la feuille de match est requis",
  }),
  periodTypeId: z.number().min(1, "Le type de période est requis"),
  
  // Statistiques à suivre
  statTypeIds: z.array(z.number()).min(1, "Au moins une statistique à suivre est requise"),
}).refine((data) => data.homeTeamId !== data.awayTeamId, {
  message: "L'équipe à domicile et l'équipe à l'extérieur doivent être différentes",
  path: ["awayTeamId"],
});

export type MatchCreateFormSchema = z.infer<typeof MatchCreateSchema>;