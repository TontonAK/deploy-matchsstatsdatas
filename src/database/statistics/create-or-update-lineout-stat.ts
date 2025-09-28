import { prisma } from "@/lib/prisma";
import { GroundArea, CatchBlockAreaLineout } from "@/generated/prisma";

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