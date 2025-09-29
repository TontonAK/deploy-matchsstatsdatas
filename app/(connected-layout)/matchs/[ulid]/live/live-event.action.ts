"use server";

import { createEvent } from "@/database/events/create-event";
import { updateMatchScore } from "@/database/matchs/update-match";
import { createOrUpdatePlayerStats } from "@/database/statistics/create-or-update-player-stats";
import { actionUser } from "@/lib/safe-action-client";
import { SafeActionError } from "@/lib/errors";
import { EventType } from "@/lib/utils";
import { LiveEventSchema } from "@/schemas/live-event.schema";
import { prisma } from "@/lib/prisma";

export const createLiveEventAction = actionUser
  .inputSchema(LiveEventSchema)
  .action(async ({ parsedInput: input, ctx: { user } }) => {
    // Vérifier les permissions de l'utilisateur
    if (user.role !== "admin") {
      throw new SafeActionError("Vous devez avoir le rôle admin pour enregistrer des événements");
    }

    if (user.job !== "Coach" && user.job !== "Admin") {
      throw new SafeActionError(
        "Vous n'avez pas les permissions nécessaires pour enregistrer des événements"
      );
    }

    // Récupérer les détails du match
    const match = await prisma.match.findUnique({
      where: { id: input.matchId },
      include: {
        homeTeam: {
          include: {
            club: true,
          },
        },
        awayTeam: {
          include: {
            club: true,
          },
        },
      },
    });

    if (!match) {
      throw new SafeActionError("Match non trouvé");
    }

    // Vérifier que le match est en statut "Live"
    if (match.status !== "Live") {
      throw new SafeActionError("Le match doit être en cours pour enregistrer des événements");
    }

    // Vérifier que l'utilisateur appartient à une des équipes du match
    const userTeams = await prisma.playerTeams.findMany({
      where: {
        playerId: user.id,
      },
    });

    const isUserInMatchTeam = userTeams.some(
      (team) => team.teamId === match.homeTeamId || team.teamId === match.awayTeamId
    );

    if (!isUserInMatchTeam) {
      throw new SafeActionError(
        "Vous n'avez pas l'autorisation d'enregistrer des événements pour ce match"
      );
    }

    // Déterminer l'équipe concernée
    const teamId = input.team === "home" ? match.homeTeamId : match.awayTeamId;

    // Récupérer le type d'événement
    const eventType = await prisma.matchEventType.findFirst({
      where: { name: input.eventType },
    });

    if (!eventType) {
      throw new SafeActionError("Type d'événement non trouvé");
    }

    // Gérer la description de l'événement
    let description: string | null = null;
    
    // Priorité 1 : Utiliser la description fournie par l'utilisateur
    if (input.description && input.description.trim()) {
      description = input.description.trim();
    } else {
      // Priorité 2 : Créer une description automatique si possible
      try {
        if (input.eventType === "Remplacement" && input.mainPlayerId && input.secondPlayerId) {
          const [mainPlayer, secondPlayer] = await Promise.all([
            prisma.user.findUnique({
              where: { id: input.mainPlayerId },
              select: { firstname: true, lastname: true },
            }),
            prisma.user.findUnique({
              where: { id: input.secondPlayerId },
              select: { firstname: true, lastname: true },
            }),
          ]);
          
          if (mainPlayer && secondPlayer) {
            description = `Remplacement - ${mainPlayer.firstname} ${mainPlayer.lastname} ↔ ${secondPlayer.firstname} ${secondPlayer.lastname}`;
          }
        } else if (input.playerId) {
          const player = await prisma.user.findUnique({
            where: { id: input.playerId },
            select: { firstname: true, lastname: true },
          });
          if (player) {
            description = `${input.eventType} - ${player.firstname} ${player.lastname}`;
          }
        }
        // Si aucune description automatique n'a pu être créée, on laisse description à null
      } catch (error) {
        // En cas d'erreur lors de la récupération des joueurs, on continue sans description
        console.warn("Impossible de créer la description automatique de l'événement:", error);
      }
    }

    // Créer l'événement
    const eventResult = await createEvent({
      matchId: input.matchId,
      eventTypeId: eventType.id,
      teamId,
      mainPlayerId: input.playerId || input.mainPlayerId,
      secondPlayerId: input.secondPlayerId,
      minute: input.minute,
      description,
    });

    if (!eventResult.success) {
      throw new SafeActionError(eventResult.error || "Erreur lors de la création de l'événement");
    }

    // Traitement spécifique selon le type d'événement
    const scoreUpdates: { homeTeamScoreToAdd?: number; awayTeamScoreToAdd?: number } = {};
    const statsToUpdate: { statTypeName: string; valueToAdd: number }[] = [];

    switch (input.eventType) {
      case EventType.Try:
        // Ajouter 5 points au score
        if (input.team === "home") {
          scoreUpdates.homeTeamScoreToAdd = 5;
        } else {
          scoreUpdates.awayTeamScoreToAdd = 5;
        }
        // Ajouter aux statistiques
        statsToUpdate.push(
          { statTypeName: "Essais", valueToAdd: 1 },
          { statTypeName: "Points inscrits", valueToAdd: 5 }
        );
        break;

      case EventType.Conversion:
        // Ajouter 2 points au score
        if (input.team === "home") {
          scoreUpdates.homeTeamScoreToAdd = 2;
        } else {
          scoreUpdates.awayTeamScoreToAdd = 2;
        }
        // Ajouter aux statistiques
        statsToUpdate.push(
          { statTypeName: "Transformations tentées", valueToAdd: 1 },
          { statTypeName: "Transformations réussies", valueToAdd: 1 },
          { statTypeName: "Points inscrits", valueToAdd: 2 }
        );
        break;

      case EventType.NoConversion:
        // Ajouter aux statistiques
        statsToUpdate.push(
          { statTypeName: "Transformations tentées", valueToAdd: 1 }
        );
        break;

      case EventType.Drop:
        // Ajouter 3 points au score
        if (input.team === "home") {
          scoreUpdates.homeTeamScoreToAdd = 3;
        } else {
          scoreUpdates.awayTeamScoreToAdd = 3;
        }
        // Ajouter aux statistiques
        statsToUpdate.push(
          { statTypeName: "Drops tentés", valueToAdd: 1 },
          { statTypeName: "Drops réussis", valueToAdd: 1 },
          { statTypeName: "Points inscrits", valueToAdd: 3 }
        );
        break;

      case EventType.NoDrop:
        // Ajouter aux statistiques
        statsToUpdate.push(
          { statTypeName: "Drops tentés", valueToAdd: 1 }
        );
        break;

      case EventType.Penalty:
        // Ajouter aux statistiques
        statsToUpdate.push(
          { statTypeName: "Pénalités concédées", valueToAdd: 1 }
        );
        break;

      case EventType.FreeKick:
        // Ajouter aux statistiques
        statsToUpdate.push(
          { statTypeName: "Coups francs concédés", valueToAdd: 1 }
        );
        break;

      case EventType.PenaltyGoal:
        // Ajouter 3 points au score
        if (input.team === "home") {
          scoreUpdates.homeTeamScoreToAdd = 3;
        } else {
          scoreUpdates.awayTeamScoreToAdd = 3;
        }
        // Ajouter aux statistiques
        statsToUpdate.push(
          { statTypeName: "Pénalités tentées", valueToAdd: 1 },
          { statTypeName: "Pénalités réussies", valueToAdd: 1 },
          { statTypeName: "Points inscrits", valueToAdd: 3 }
        );
        break;

      case EventType.NoPenaltyGoal:
        // Ajouter aux statistiques
        statsToUpdate.push(
          { statTypeName: "Pénalités tentées", valueToAdd: 1 }
        );
        break;

      case EventType.YellowCard:
        // Ajouter aux statistiques
        statsToUpdate.push(
          { statTypeName: "Cartons jaunes", valueToAdd: 1 }
        );
        break;

      case EventType.RedCard:
        // Ajouter aux statistiques
        statsToUpdate.push(
          { statTypeName: "Cartons rouges", valueToAdd: 1 }
        );
        break;

      case EventType.Substitution:
        // Pas de mise à jour de score ni de statistiques pour les remplacements
        break;
    }

    // Mettre à jour le score si nécessaire
    if (scoreUpdates.homeTeamScoreToAdd || scoreUpdates.awayTeamScoreToAdd) {
      await updateMatchScore({
        matchId: input.matchId,
        ...scoreUpdates,
      });
    }

    // Mettre à jour les statistiques si nécessaire
    if (statsToUpdate.length > 0) {
      await createOrUpdatePlayerStats({
        matchId: input.matchId,
        teamId,
        playerId: input.playerId,
        stats: statsToUpdate,
      });
    }

    return {
      success: true,
      event: eventResult.event,
    };
  });