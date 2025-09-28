import { prisma } from "@/lib/prisma";

const SELECT_QUERY = {
  id: true,
  slug: true,
  firstname: true,
  lastname: true,
  name: true,
  image: true,
  job: true,
  club: {
    select: {
      id: true,
      name: true,
      logo: true,
    },
  },
  positions: {
    select: {
      isMainPosition: true,
      position: {
        select: {
          id: true,
          name: true,
          shortName: true,
        },
      },
    },
  },
};

export const getPlayer = async (userId: string) => {
  return await prisma.user.findFirst({
    where: {
      id: userId,
    },
    select: SELECT_QUERY,
  });
};

export const getPlayerBySlug = async (userSlug: string) => {
  return await prisma.user.findFirst({
    where: {
      slug: userSlug,
    },
    select: SELECT_QUERY,
  });
};

export const getTeam = async (userId: string | undefined) => {
  return await prisma.playerTeams
    .findFirst({
      where: {
        playerId: userId,
      },
    })
    .team();
};
