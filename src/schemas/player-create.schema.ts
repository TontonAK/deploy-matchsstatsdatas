import { Role } from "@/generated/prisma";
import { z } from "zod";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

export const PlayerCreateSchema = z
  .object({
    // Profil
    image: z
      .any()
      .refine(
        (file) => !file || file instanceof File,
        "La photo de profil doit être un fichier valide"
      )
      .refine(
        (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
        "Seuls les formats .jpg, .jpeg et .png sont supportés."
      )
      .optional(),
    firstname: z.string().min(1, "Le prénom est requis"),
    lastname: z.string().min(1, "Le nom est requis"),
    email: z.string().email("L'adresse email doit être valide").optional(),
    password: z
      .string()
      .min(6, "Le mot de passe doit contenir au moins 6 caractères")
      .optional(),
    job: z.nativeEnum(Role, {
      errorMap: () => ({ message: "Le job sélectionné n'est pas valide" }),
    }),

    // Positions (conditionnelles selon le job)
    mainPositionId: z.number().optional(),
    secondaryPositionIds: z.array(z.number()).default([]).optional(),

    // Assignement
    clubId: z.number().min(1, "Un club doit être sélectionné"),
    teamId: z.number().min(1, "Une équipe doit être sélectionnée"),
  })
  .refine(
    (data) => {
      // Si le job est Player, le poste principal est obligatoire
      if (data.job === Role.Player) {
        return data.mainPositionId !== undefined && data.mainPositionId > 0;
      }
      return true;
    },
    {
      message: "Le poste principal est obligatoire pour un joueur",
      path: ["mainPositionId"],
    }
  )
  .refine(
    (data) => {
      // Les postes secondaires ne doivent pas inclure le poste principal
      if (data.mainPositionId && data.secondaryPositionIds) {
        return !data.secondaryPositionIds.includes(data.mainPositionId);
      }
      return true;
    },
    {
      message:
        "Le poste principal ne peut pas être également un poste secondaire",
      path: ["secondaryPositionIds"],
    }
  )
  .refine(
    (data) => {
      // Email obligatoire pour Coach et Admin
      if (data.job === Role.Coach || data.job === Role.Admin) {
        return data.email && data.email.length > 0;
      }
      return true;
    },
    {
      message: "L'adresse email est obligatoire pour les coachs et administrateurs",
      path: ["email"],
    }
  )
  .refine(
    (data) => {
      // Mot de passe obligatoire pour Coach et Admin
      if (data.job === Role.Coach || data.job === Role.Admin) {
        return data.password && data.password.length >= 6;
      }
      return true;
    },
    {
      message: "Le mot de passe est obligatoire pour les coachs et administrateurs",
      path: ["password"],
    }
  );

export type PlayerCreateFormSchema = z.infer<typeof PlayerCreateSchema>;
