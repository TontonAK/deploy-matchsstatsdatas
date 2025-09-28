import { z } from "zod";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

export const ProfileUpdateSchema = z.object({
  firstname: z.string().min(1, "Le prénom est requis"),
  lastname: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
  image: z
    .any()
    .refine(
      (file) => !file || file instanceof File,
      "L'image doit être un fichier valide"
    )
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Seuls les formats .jpg, .jpeg et .png sont supportés."
    )
    .optional(),
}).refine(
  (data) => {
    // Si un nouveau mot de passe est fourni, le mot de passe actuel est requis
    if (data.newPassword && !data.currentPassword) {
      return false;
    }
    // Si un nouveau mot de passe est fourni, la confirmation est requise et doit correspondre
    if (data.newPassword && data.newPassword !== data.confirmPassword) {
      return false;
    }
    // Si un nouveau mot de passe est fourni, il doit faire au moins 6 caractères
    if (data.newPassword && data.newPassword.length < 6) {
      return false;
    }
    return true;
  },
  {
    message: "Vérifiez les mots de passe",
    path: ["confirmPassword"],
  }
);

export type ProfileUpdateFormSchema = z.infer<typeof ProfileUpdateSchema>;