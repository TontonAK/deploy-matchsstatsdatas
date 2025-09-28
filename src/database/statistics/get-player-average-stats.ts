import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth-session";

export interface PlayerRadarData {
  subject: string;
  player: number;
  team: number;
  fullMark: number;
}

export const getPlayerAverageStats = async (
  playerId: string
): Promise<PlayerRadarData[] | null> => {
  try {
    // Vérifier l'utilisateur connecté et ses permissions
    const currentUser = await getUser();
    if (!currentUser) return null;

    // Récupérer le joueur cible et vérifier qu'il appartient au même club
    const targetPlayer = await prisma.user.findUnique({
      where: { id: playerId },
      select: {
        clubId: true,
        teams: {
          select: {
            teamId: true,
          },
        },
      },
    });

    if (!targetPlayer || targetPlayer.clubId !== currentUser.clubId) {
      return null;
    }

    // Récupérer l'ID de l'équipe du joueur
    const playerTeam = targetPlayer.teams[0];
    if (!playerTeam) return null;
    const teamId = playerTeam.teamId;

    // Récupérer la saison actuelle (2025-2026)
    const currentSeason = await prisma.season.findFirst({
      where: { name: "2025-2026" },
    });

    if (!currentSeason) return null;

    // Définir les statistiques à analyser pour le radar chart
    const statMappings = [
      { subject: "Essais marqués", statName: "Essais" },
      { subject: "Plaquages tentés", statName: "Plaquages tentés" },
      { subject: "Plaquages réussis", statName: "Plaquages réussis" },
      { subject: "Pénalités concédées", statName: "Pénalités concédées" },
      { subject: "Passes tentées", statName: "Passes tentées" },
      { subject: "Passes réussies", statName: "Passes réussies" },
    ];

    // Récupérer les types de statistiques
    const statTypes = await prisma.statType.findMany({
      where: {
        name: { in: statMappings.map(m => m.statName) },
      },
    });

    // Récupérer les matchs terminés de l'équipe pour la saison actuelle
    const teamMatches = await prisma.match.findMany({
      where: {
        AND: [
          { OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }] },
          { status: "Finish" },
          {
            seasonLeagueMatch: {
              seasonLeague: { seasonId: currentSeason.id },
            },
          },
        ],
      },
      select: { id: true },
    });

    const matchIds = teamMatches.map(match => match.id);

    if (matchIds.length === 0) return null;

    // Récupérer les matchs où le joueur a participé
    const playerMatchLineups = await prisma.matchLineup.findMany({
      where: {
        playerId: playerId,
        matchId: { in: matchIds },
      },
      select: { matchId: true },
    });

    const playerMatchIds = playerMatchLineups.map(lineup => lineup.matchId);
    const playerMatchCount = playerMatchIds.length;

    if (playerMatchCount === 0) return null;

    // Calculer les moyennes pour chaque statistique
    const radarData: PlayerRadarData[] = [];

    for (const mapping of statMappings) {
      const statType = statTypes.find(st => st.name === mapping.statName);
      if (!statType) continue;

      // Moyennes du joueur
      const playerStats = await prisma.stat.aggregate({
        where: {
          matchId: { in: playerMatchIds },
          playerId: playerId,
          statTypeId: statType.id,
        },
        _sum: {
          value: true,
        },
      });

      const playerTotal = playerStats._sum.value || 0;
      const playerAverage = playerMatchCount > 0 ? Math.round((playerTotal / playerMatchCount) * 10) / 10 : 0;

      // Moyennes de l'équipe entière
      const teamStats = await prisma.stat.aggregate({
        where: {
          matchId: { in: matchIds },
          teamId: teamId,
          statTypeId: statType.id,
        },
        _sum: {
          value: true,
        },
      });

      const teamTotal = teamStats._sum.value || 0;
      const teamAverage = matchIds.length > 0 ? Math.round((teamTotal / matchIds.length) * 10) / 10 : 0;

      // Déterminer la valeur maximale pour le graphique (fullMark)
      const maxValue = Math.max(playerAverage, teamAverage);
      const fullMark = Math.max(10, Math.ceil(maxValue * 1.2)); // Au moins 10, ou 120% de la valeur max

      radarData.push({
        subject: mapping.subject,
        player: playerAverage,
        team: teamAverage,
        fullMark: fullMark,
      });
    }

    return radarData;
  } catch (error) {
    console.error("Error fetching player average stats:", error);
    return null;
  }
};