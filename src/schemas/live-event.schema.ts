import { z } from "zod";

export const LiveEventSchema = z.object({
  matchId: z.number().positive("L'ID du match est requis"),
  eventType: z.enum([
    "Essai",
    "Transformation réussie", 
    "Transformation manquée",
    "Drop réussi",
    "Drop manqué",
    "Pénalité",
    "Coup franc",
    "Pénalité réussie",
    "Pénalité manquée", 
    "Carton jaune",
    "Carton rouge",
    "Remplacement"
  ]),
  team: z.enum(["home", "away"]),
  playerId: z.string().optional(),
  mainPlayerId: z.string().optional(), // Pour les remplacements
  secondPlayerId: z.string().optional(), // Pour les remplacements
  minute: z.number().min(0).max(200, "La minute ne peut pas dépasser 200"),
  description: z.string().optional(), // Description optionnelle
});