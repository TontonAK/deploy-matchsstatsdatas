import { prisma } from "@/lib/prisma";

export const getClubAlias = async (club: string) => {
  return await prisma.clubAlias.findFirst({
    where: {
      club: {
        name: club,
      },
    },
    select: {
      id: true,
      alias: true,
    },
  });
};
