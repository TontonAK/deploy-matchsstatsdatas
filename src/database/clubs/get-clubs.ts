import { prisma } from "@/lib/prisma";

export interface GetClubsParams {
  search?: string;
  sortBy?: "name";
  page?: number;
  limit?: number;
}

export interface ClubWithRelations {
  id: number;
  name: string;
  logo: string | null;
  primaryColor: string;
  secondaryColor: string;
}

export interface GetClubsResult {
  success: boolean;
  data?: {
    clubs: ClubWithRelations[];
    total: number;
    totalPages: number;
    currentPage: number;
  };
  error?: string;
}

export const getClubs = async ({
  search = "",
  sortBy = "name",
  page = 1,
  limit = 10,
}: GetClubsParams = {}): Promise<GetClubsResult> => {
  try {
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: Record<string, unknown> = {};

    // Search filter (club name)
    if (search) {
      whereClause.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    // Build order by clause
    let orderBy: Record<string, unknown>;
    switch (sortBy) {
      case "name":
        orderBy = { name: "asc" };
        break;
      default:
        orderBy = { name: "asc" };
    }

    // Get total count
    const total = await prisma.club.count({
      where: whereClause,
    });

    // Get clubs
    const clubs = await prisma.club.findMany({
      where: whereClause,
      orderBy,
      skip: offset,
      take: limit,
      select: {
        id: true,
        name: true,
        logo: true,
        primaryColor: true,
        secondaryColor: true,
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: {
        clubs,
        total,
        totalPages,
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("Error fetching clubs:", error);
    return {
      success: false,
      error: "Erreur lors de la récupération des clubs",
    };
  }
};