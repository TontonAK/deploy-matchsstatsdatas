"use server";

import { updateProfileUser } from "@/database/players/update-profile-user";
import { uploadFileToS3 } from "@/features/image-upload/awss3.utils";
import { authClient } from "@/lib/auth-client";
import { prisma } from "@/lib/prisma";
import { actionUser, SafeError } from "@/lib/safe-action-client";
import { ProfileUpdateSchema } from "@/schemas/profile-update.schema";

export const updateProfileSafeAction = actionUser
  .inputSchema(ProfileUpdateSchema)
  .action(async ({ parsedInput: input, ctx: { user } }) => {
    let imageUrl: string | undefined = undefined;

    // Upload de l'image si présente
    if (input.image && input.image instanceof File) {
      // Vérifier la taille du fichier (max 5MB)
      if (input.image.size > 5 * 1024 * 1024) {
        throw new SafeError("La taille du fichier doit être inférieure à 5MB");
      }

      imageUrl = await uploadFileToS3({
        file: input.image,
        prefix: `players`,
        fileName: `${user.slug}-profile`,
      });

      if (!imageUrl) {
        throw new SafeError("Échec de l'upload de l'image");
      }

      // Mettre à jour l'image dans la base de données
      await prisma.user.update({
        where: { id: user.id },
        data: { image: imageUrl },
      });
    }

    // Mise à jour des informations de base
    const updateResult = await updateProfileUser(user.id, {
      firstname: input.firstname,
      lastname: input.lastname,
      email: input.email,
    });

    if (!updateResult.success) {
      throw new SafeError(
        updateResult.error ??
          "Une erreur est survenue durant la mise à jour du profil"
      );
    }

    // Changement de mot de passe si nécessaire
    if (input.newPassword && input.currentPassword) {
      await authClient.changePassword({
        currentPassword: input.currentPassword,
        newPassword: input.newPassword,
      });
    }
  });
