"use server";

import { updatePlayer } from "@/database/players/update-player";
import { uploadFileToS3 } from "@/features/image-upload/awss3.utils";
import { actionUser } from "@/lib/safe-action-client";
import { SafeActionError } from "@/lib/errors";
import { PlayerUpdateWithIdSchema } from "@/schemas/player-update.schema";

export const updatePlayerSafeAction = actionUser
  .inputSchema(PlayerUpdateWithIdSchema)
  .action(async ({ parsedInput: input, ctx: { user } }) => {
    // Verifier que l'utilisateur a les droits d'admin
    if (user.role !== "admin") {
      throw new SafeActionError("Vous n'avez pas les droits pour modifier un joueur");
    }

    let imageUrl: string | undefined = undefined;

    // Upload de l'image de profil si presente
    if (input.image && input.image instanceof File) {
      // Verifier la taille du fichier (max 5MB)
      if (input.image.size > 5 * 1024 * 1024) {
        throw new SafeActionError("La taille du fichier doit etre inferieure a 5MB");
      }

      imageUrl = await uploadFileToS3({
        file: input.image,
        prefix: `players`,
        fileName: `${input.firstname.toLowerCase()}-${input.lastname.toLowerCase()}-profile`,
      });

      if (!imageUrl) {
        throw new SafeActionError("Echec de l'upload de l'image de profil");
      }
    }

    // Mettre a jour le joueur
    const result = await updatePlayer({
      userId: input.userId,
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
      throw new SafeActionError(
        result.error ?? "Une erreur est survenue durant la mise a jour du joueur"
      );
    }

    return {
      success: true,
      user: result.user,
    };
  });
