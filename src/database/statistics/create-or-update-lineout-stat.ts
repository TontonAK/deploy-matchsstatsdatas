import { prisma } from "@/lib/prisma";
import { GroundArea, CatchBlockAreaLineout } from "@/generated/prisma";
import { updateLineoutSuccessRateForTeam } from "./create-or-update-percentage-success-stats";

export interface CreateLineoutStatParams {
  statId: number;
  area: GroundArea;
  nbPlayer: number;
  catchBlockArea: CatchBlockAreaLineout;
  success: boolean;
  failReason?: string;
}

export const createLineoutStat = async (params: CreateLineoutStatParams) => {
  try {
    const lineoutStat = await prisma.lineoutStatGround.create({
      data: {
        statId: params.statId,
        area: params.area,
        nbPlayer: params.nbPlayer,
        catchBlockArea: params.catchBlockArea,
        success: params.success,
        failReason: params.failReason || null,
      },
      include: {
        stat: {
          include: {
            statType: true,
            team: true,
            player: true,
          },
        },
      },
    });

    // Mettre à jour le pourcentage de réussite en touche pour l'équipe
    const updateResult = await updateLineoutSuccessRateForTeam(
      lineoutStat.stat.matchId,
      lineoutStat.stat.teamId
    );

    if (!updateResult.success) {
      console.warn(
        "Failed to update lineout success rate:",
        updateResult.error
      );
      // On continue quand même, ce n'est pas une erreur critique
    }

    return {
      success: true,
      lineoutStat,
    };
  } catch (error) {
    console.error("Error creating lineout stat:", error);
    return {
      success: false,
      error: "Erreur lors de la création de la statistique détaillée de touche",
    };
  }
};