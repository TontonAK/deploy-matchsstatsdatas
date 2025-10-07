import { prisma } from "@/lib/prisma";
import { GroundArea } from "@/generated/prisma";
import { updateKickSuccessRateForTeam } from "./create-or-update-percentage-success-stats";

export interface CreateKickStatParams {
  statId: number;
  startAreaKick: GroundArea;
  endAreaKick?: GroundArea;
  deadBall: boolean;
  success: boolean;
  comment?: string;
}

export const createKickStat = async (params: CreateKickStatParams) => {
  try {
    const kickStat = await prisma.kickStatGround.create({
      data: {
        statId: params.statId,
        startAreaKick: params.startAreaKick,
        endAreaKick: params.endAreaKick || null,
        deadBall: params.deadBall,
        success: params.success,
        comment: params.comment || null,
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

    // Vérifier si c'est une stat de tentative (drops, pénalités, transformations)
    const statTypeName = kickStat.stat.statType.name;
    const isAttemptStat = [
      "Drops tentés",
      "Pénalités tentées",
      "Transformations tentées",
    ].includes(statTypeName);

    // Mettre à jour le pourcentage de réussite au pied si c'est une tentative
    if (isAttemptStat) {
      const updateResult = await updateKickSuccessRateForTeam(
        kickStat.stat.matchId,
        kickStat.stat.teamId
      );

      if (!updateResult.success) {
        console.warn(
          "Failed to update kick success rate:",
          updateResult.error
        );
        // On continue quand même, ce n'est pas une erreur critique
      }
    }

    return {
      success: true,
      kickStat,
    };
  } catch (error) {
    console.error("Error creating kick stat:", error);
    return {
      success: false,
      error: "Erreur lors de la création de la statistique détaillée de coup de pied",
    };
  }
};