import { getMatchDetails } from "@/database/matchs/get-matchs";
import { getMatchEventTypes } from "@/database/matchs/get-match-event-types";
import { getMatchLineup } from "@/database/matchs/get-match-lineup";
import { getRequiredUser } from "@/lib/auth-session";
import { notFound, unauthorized } from "next/navigation";
import { prisma } from "@/lib/prisma";
import LiveMatchContent from "./live-match-content";

interface PageProps {
  params: Promise<{ ulid: string }>;
}

export default async function LiveMatchPage(props: PageProps) {
  const params = await props.params;
  const user = await getRequiredUser();
  
  // Vérifications des permissions
  if (user.role !== "admin") {
    unauthorized();
  }

  if (user.job !== "Coach" && user.job !== "Admin") {
    unauthorized();
  }

  const matchDatas = await getMatchDetails(params.ulid);

  if (!matchDatas) {
    notFound();
  }

  // Vérifier que le match est "Planned" ou "Live"
  if (matchDatas.match.status !== "Planned" && matchDatas.match.status !== "Live") {
    notFound();
  }

  // Vérifier que l'utilisateur appartient à une des équipes du match
  const userTeams = await prisma.playerTeams.findMany({
    where: {
      playerId: user.id,
    },
  });

  const isUserInMatchTeam = userTeams.some(
    (team) => team.teamId === matchDatas.homeTeam.id || team.teamId === matchDatas.awayTeam.id
  );

  if (!isUserInMatchTeam) {
    unauthorized();
  }

  // Récupérer les données nécessaires pour le live
  const [eventTypesResult, lineupResult] = await Promise.all([
    getMatchEventTypes(),
    getMatchLineup(params.ulid),
  ]);

  if (!eventTypesResult.success) {
    throw new Error("Erreur lors de la récupération des types d'événements");
  }

  if (!lineupResult.success) {
    throw new Error("Erreur lors de la récupération de la composition");
  }

  return (
    <LiveMatchContent
      matchData={matchDatas}
      matchEventTypes={eventTypesResult.eventTypes}
      matchLineup={lineupResult.lineup}
      matchUlid={params.ulid}
    />
  );
}
