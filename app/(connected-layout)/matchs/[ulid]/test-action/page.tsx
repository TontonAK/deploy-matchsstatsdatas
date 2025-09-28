import { getRequiredUser } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import TestActionContent from "./test-action-content";

interface PageProps {
  params: Promise<{ ulid: string }>;
}

export default async function TestActionPage(props: PageProps) {
  const params = await props.params;
  const user = await getRequiredUser();

  // Récupérer les joueurs de l'équipe de l'utilisateur
  const userTeams = await prisma.playerTeams.findMany({
    where: {
      playerId: user.id,
    },
    include: {
      team: {
        include: {
          club: true,
          players: {
            include: {
              player: true,
            },
          },
        },
      },
    },
  });

  if (userTeams.length === 0) {
    notFound();
  }

  const userTeam = userTeams[0].team;

  // Créer des données mock pour le test
  const mockMatchData = {
    matchId: 1,
    homeTeam: {
      id: userTeam.id,
      name: userTeam.name,
      club: {
        name: userTeam.club.name,
        primaryColor: userTeam.club.primaryColor,
        secondaryColor: userTeam.club.secondaryColor,
        logo: userTeam.club.logo,
      },
    },
    awayTeam: {
      id: 999,
      name: "Équipe Adverse",
      club: {
        name: "Club Adverse",
        primaryColor: "#FF0000",
        secondaryColor: "#FFFFFF",
        logo: null,
      },
    },
  };

  // Créer une lineup mock basée sur les joueurs de l'équipe
  const mockLineup = userTeam.players.map((playerTeam, index) => ({
    id: index + 1,
    match: {
      id: 1,
      ulid: params.ulid,
    },
    team: {
      id: userTeam.id,
      name: userTeam.name,
      club: {
        id: userTeam.club.id,
        name: userTeam.club.name,
      },
    },
    player: {
      id: playerTeam.player.id,
      firstname: playerTeam.player.firstname,
      lastname: playerTeam.player.lastname,
    },
    number: index + 1,
  }));

  // Ajouter quelques joueurs pour l'équipe adverse
  const mockAwayLineup = Array.from({ length: 22 }, (_, index) => ({
    id: index + 100,
    match: {
      id: 1,
      ulid: params.ulid,
    },
    team: {
      id: 999,
      name: "Équipe Adverse",
      club: {
        id: 999,
        name: "Club Adverse",
      },
    },
    player: {
      id: `away-${index + 1}`,
      firstname: `Joueur${index + 1}`,
      lastname: "Adverse",
    },
    number: index + 1,
  }));

  const allLineup = [...mockLineup, ...mockAwayLineup];

  // Types d'événements mock
  const mockEventTypes = [
    { id: 1, name: "Essai", group: "Tries" as const },
    { id: 2, name: "Transformation réussie", group: "Shoots" as const },
    { id: 3, name: "Transformation manquée", group: "Shoots" as const },
    { id: 4, name: "Drop réussi", group: "Shoots" as const },
    { id: 5, name: "Drop manqué", group: "Shoots" as const },
    { id: 6, name: "Pénalité", group: "Fouls" as const },
    { id: 7, name: "Coup franc", group: "Fouls" as const },
    { id: 8, name: "Pénalité réussie", group: "Shoots" as const },
    { id: 9, name: "Pénalité manquée", group: "Shoots" as const },
    { id: 10, name: "Carton jaune", group: "Fouls" as const },
    { id: 11, name: "Carton rouge", group: "Fouls" as const },
    { id: 12, name: "Remplacement", group: "Other" as const },
  ];

  return (
    <TestActionContent
      matchData={mockMatchData}
      matchEventTypes={mockEventTypes}
      matchLineup={allLineup}
      matchUlid={params.ulid}
    />
  );
}
