"use server";

import { createPlayer } from "@/database/players/create-player";
import { uploadFileToS3 } from "@/features/image-upload/awss3.utils";
import { actionUser, SafeError } from "@/lib/safe-action-client";
import { PlayerCreateSchema } from "@/schemas/player-create.schema";

export const createPlayerSafeAction = actionUser
  .inputSchema(PlayerCreateSchema)
  .action(async ({ parsedInput: input, ctx: { user } }) => {
    // Vérifier que l'utilisateur a les droits d'admin et le bon job
    if (user.role !== "admin") {
      throw new SafeError("Vous n'avez pas les droits pour créer un joueur");
    }

    /* if (user.job !== "Coach" && user.job !== "Admin") {
      throw new SafeError(
        "Seuls les entraîneurs et administrateurs peuvent créer des joueurs"
      );
    } */

    let imageUrl: string | undefined = undefined;

    // Upload de l'image de profil si présente
    if (input.image && input.image instanceof File) {
      // Vérifier la taille du fichier (max 5MB)
      if (input.image.size > 5 * 1024 * 1024) {
        throw new SafeError("La taille du fichier doit être inférieure à 5MB");
      }

      imageUrl = await uploadFileToS3({
        file: input.image,
        prefix: `players`,
        fileName: `${input.firstname.toLowerCase()}-${input.lastname.toLowerCase()}-profile`,
      });

      if (!imageUrl) {
        throw new SafeError("Échec de l'upload de l'image de profil");
      }
    }

    // Créer le joueur
    const result = await createPlayer({
      email: input.email || undefined,
      password: input.password || undefined,
      firstname: input.firstname,
      lastname: input.lastname,
      job: input.job,
      clubId: input.clubId,
      teamId: input.teamId,
      image: imageUrl,
      mainPositionId: input.mainPositionId,
      secondaryPositionIds: input.secondaryPositionIds,
    });

    if (!result.success) {
      throw new SafeError(
        result.error ?? "Une erreur est survenue durant la création du joueur"
      );
    }

    return {
      success: true,
      user: result.user,
    };
  });
