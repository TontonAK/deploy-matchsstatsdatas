import { getUser } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { ulid: string } }
) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { ulid } = params;

    // Récupérer les informations du match
    const match = await prisma.match.findFirst({
      where: { ulid },
      select: {
        id: true,
        status: true,
        endingStatus: true,
        scoreHomeTeam: true,
        scoreAwayTeam: true,
        result: true,
        homeTeamId: true,
        awayTeamId: true,
        homeTeam: {
          select: {
            id: true,
            name: true,
            clubId: true,
            club: {
              select: {
                name: true,
              },
            },
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            clubId: true,
            club: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match non trouvé" }, { status: 404 });
    }

    // Vérifier les permissions : Admin ou Coach
    if (user.job !== "Admin" && user.job !== "Coach") {
      return NextResponse.json(
        { error: "Seuls les administrateurs et entraîneurs peuvent accéder à cette fonction" },
        { status: 403 }
      );
    }

    // Si l'utilisateur n'est pas admin global, vérifier qu'il appartient à l'une des équipes du match
    if (user.role !== "admin") {
      const userTeams = await prisma.playerTeams.findMany({
        where: {
          playerId: user.id,
        },
        include: {
          team: {
            select: {
              clubId: true,
            },
          },
        },
      });

      const userClubIds = userTeams.map((team) => team.team.clubId);
      const matchClubIds = [match.homeTeam.clubId, match.awayTeam.clubId];

      const hasAccess = userClubIds.some((clubId) =>
        matchClubIds.includes(clubId)
      );

      if (!hasAccess) {
        return NextResponse.json(
          { error: "Vous n'avez pas accès à ce match" },
          { status: 403 }
        );
      }
    }

    // Vérifier si les scores finaux sont déjà saisis
    const hasExistingScore = match.scoreHomeTeam !== null && match.scoreAwayTeam !== null;

    // Formatter les données de réponse
    const response = {
      matchId: match.id,
      canEdit: true, // Toujours permettre la modification (création ou mise à jour)
      existingScore: hasExistingScore
        ? {
            homeScore: match.scoreHomeTeam as number,
            awayScore: match.scoreAwayTeam as number,
            result: match.result,
          }
        : null,
      teams: {
        home: {
          id: match.homeTeam.id,
          name: match.homeTeam.name,
          clubName: match.homeTeam.club.name,
        },
        away: {
          id: match.awayTeam.id,
          name: match.awayTeam.name,
          clubName: match.awayTeam.club.name,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des données de fin de match:",
      error
    );
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}