import { z } from "zod";
import { GroundArea, CatchBlockAreaLineout } from "@/generated/prisma";

export const LineoutStatCreateSchema = z.object({
  // Match info
  matchUlid: z.string().min(1, "L'identifiant du match est requis"),

  // Étape 1: Équipe
  teamId: z.number().min(1, "Une équipe doit être sélectionnée"),
  playerId: z.string().nullable().optional(), // null si pas de joueur sélectionné

  // Étape 2: Zone terrain
  area: z.nativeEnum(GroundArea, {
    required_error: "La zone du terrain doit être sélectionnée"
  }),

  // Étape 3: Nombre
  nbPlayer: z.number()
    .min(2, "Au minimum 2 joueurs en touche")
    .max(15, "Maximum 15 joueurs en touche"),

  // Étape 4: Zone saut & résultat
  catchBlockArea: z.nativeEnum(CatchBlockAreaLineout, {
    required_error: "La zone de saut doit être sélectionnée"
  }),
  success: z.boolean({
    required_error: "Le résultat de la touche doit être indiqué"
  }),
  failReason: z.string().optional(), // optionnel, seulement si échec
});

export type LineoutStatCreateFormSchema = z.infer<typeof LineoutStatCreateSchema>;

// Schémas pour chaque étape (validation progressive)
export const Step1Schema = LineoutStatCreateSchema.pick({
  teamId: true,
  playerId: true,
});

export const Step2Schema = LineoutStatCreateSchema.pick({
  area: true,
});

export const Step3Schema = LineoutStatCreateSchema.pick({
  nbPlayer: true,
});

export const Step4Schema = LineoutStatCreateSchema.pick({
  catchBlockArea: true,
  success: true,
  failReason: true,
});

export type Step1FormSchema = z.infer<typeof Step1Schema>;
export type Step2FormSchema = z.infer<typeof Step2Schema>;
export type Step3FormSchema = z.infer<typeof Step3Schema>;
export type Step4FormSchema = z.infer<typeof Step4Schema>;