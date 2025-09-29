"use server";

import { createClub } from "@/database/clubs/create-club";
import { actionUser } from "@/lib/safe-action-client";
import { SafeActionError } from "@/lib/errors";
import { ClubCreateSchema } from "@/schemas/club-create.schema";
import { uploadFileToS3 } from "@/features/image-upload/awss3.utils";

export const createClubSafeAction = actionUser
  .inputSchema(ClubCreateSchema)
  .action(async ({ parsedInput: input, ctx: { user } }) => {
    // Vérifier que l'utilisateur a les droits d'admin
    if (user.role !== "admin") {
      throw new SafeActionError("Vous n'avez pas les droits pour créer un club");
    }

    let logoUrl: string | undefined = undefined;

    // Upload du logo si présent
    if (input.logo && input.logo instanceof File) {
      // Vérifier la taille du fichier (max 5MB)
      if (input.logo.size > 5 * 1024 * 1024) {
        throw new SafeActionError("La taille du fichier doit être inférieure à 5MB");
      }

      logoUrl = await uploadFileToS3({
        file: input.logo,
        prefix: `clubs`,
        fileName: `${input.name.toLowerCase().replace(/\s+/g, '-')}-logo`,
      });

      if (!logoUrl) {
        throw new SafeActionError("Échec de l'upload du logo");
      }
    }

    // Créer le club avec les équipes
    const result = await createClub({
      name: input.name,
      primaryColor: input.primaryColor,
      secondaryColor: input.secondaryColor,
      aliases: input.aliases || [],
      stadiums: input.stadiums,
      logo: logoUrl,
      teams: input.teams,
    });

    if (!result.success) {
      throw new SafeActionError(
        result.error ?? "Une erreur est survenue durant la création du club"
      );
    }

    return {
      success: true,
      club: result.club,
      aliases: result.aliases,
      stadiums: result.stadiums,
      teams: result.teams,
    };
  });
