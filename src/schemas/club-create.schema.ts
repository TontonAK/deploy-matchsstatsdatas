import { z } from "zod";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

export const ClubCreateSchema = z.object({
  name: z.string().min(1, "Le nom du club est requis"),
  primaryColor: z.string().min(1, "La couleur primaire est requise"),
  secondaryColor: z.string().min(1, "La couleur secondaire est requise"),
  aliases: z.array(z.string().min(1, "L'alias ne peut pas être vide")).optional().default([]),
  stadiums: z.array(z.string().min(1, "Le nom du stade est requis")).min(1, "Au moins un stade est requis"),
  logo: z
    .any()
    .refine(
      (file) => !file || file instanceof File,
      "Le logo doit être un fichier valide"
    )
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Seuls les formats .jpg, .jpeg et .png sont supportés."
    )
    .optional(),
  teams: z.array(
    z.object({
      name: z.string().min(1, "Le nom de l'équipe est requis"),
      leagueId: z.number().min(1, "La league est requise"),
      leaguePoolId: z.number().optional(),
    })
  ).min(1, "Au moins une équipe est requise"),
});

export type ClubCreateFormSchema = z.infer<typeof ClubCreateSchema>;
