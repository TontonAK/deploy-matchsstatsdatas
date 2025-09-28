import { prisma } from "@/lib/prisma";
import { GroundArea } from "@/generated/prisma";

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