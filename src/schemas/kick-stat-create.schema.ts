import { z } from "zod";
import { GroundArea } from "@/generated/prisma";

export const KickStatCreateSchema = z.object({
  // Match info
  matchUlid: z.string().min(1, "L'identifiant du match est requis"),

  // Étape 1: Type coup de pied
  statTypeId: z.number().min(1, "Le type de coup de pied doit être sélectionné"),
  teamId: z.number().min(1, "Une équipe doit être sélectionnée"),
  playerId: z.string().nullable().optional(), // null si pas de joueur sélectionné

  // Étape 2: Zone de frappe & chute
  startAreaKick: z.nativeEnum(GroundArea, {
    required_error: "La zone de frappe doit être sélectionnée"
  }),
  endAreaKick: z.nativeEnum(GroundArea).optional(), // optionnel selon le type de coup de pied

  // Étape 3: Résultat
  deadBall: z.boolean({
    required_error: "Il faut indiquer si le ballon a fini en ballon mort"
  }),
  success: z.boolean({
    required_error: "Le résultat du coup de pied doit être indiqué"
  }),
  comment: z.string().optional(), // commentaire optionnel
});

export type KickStatCreateFormSchema = z.infer<typeof KickStatCreateSchema>;

// Schémas pour chaque étape (validation progressive)
export const KickStep1Schema = KickStatCreateSchema.pick({
  statTypeId: true,
  teamId: true,
  playerId: true,
});

export const KickStep2Schema = KickStatCreateSchema.pick({
  startAreaKick: true,
  endAreaKick: true,
});

export const KickStep3Schema = KickStatCreateSchema.pick({
  deadBall: true,
  success: true,
  comment: true,
});

export type KickStep1FormSchema = z.infer<typeof KickStep1Schema>;
export type KickStep2FormSchema = z.infer<typeof KickStep2Schema>;
export type KickStep3FormSchema = z.infer<typeof KickStep3Schema>;