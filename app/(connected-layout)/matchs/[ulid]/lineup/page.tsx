import { getMatchLineup } from "@/database/matchs/create-or-update-lineup";
import { getMatchDetails } from "@/database/matchs/get-matchs";
import { getTeamPlayersGroupedByPosition } from "@/database/players/get-players";
import { getRequiredUser } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { LineupBuilder } from "./lineup-builder";

interface PageProps {
  params: Promise<{ ulid: string }>;
}

export default async function MatchLineupPage(props: PageProps) {
  const user = await getRequiredUser();

  /*if (user.role !== "admin" || (user.job !== "Coach" && user.job !== "Admin")) {
    redirect("/matchs");
  }*/

  const params = await props.params;
  const matchStats = await getMatchDetails(params.ulid);

  if (!matchStats) {
    notFound();
  }

  if (matchStats.match.status !== "Planned") {
    redirect(`/matchs/${params.ulid}`);
  }

  // Récupérer les équipes de l'utilisateur
  const userTeams = await prisma.playerTeams.findMany({
    where: {
      playerId: user.id,
    },
    include: {
      team: true,
    },
  });

  // Déterminer quelle équipe l'utilisateur peut gérer
  let teamId: number;
  let isHomeTeam: boolean;

  const homeTeamInUserTeams = userTeams.find(
    (ut) => ut.teamId === matchStats.homeTeam.id
  );
  const awayTeamInUserTeams = userTeams.find(
    (ut) => ut.teamId === matchStats.awayTeam.id
  );

  if (homeTeamInUserTeams) {
    teamId = matchStats.homeTeam.id;
    isHomeTeam = true;
  } else if (awayTeamInUserTeams) {
    teamId = matchStats.awayTeam.id;
    isHomeTeam = false;
  } else {
    redirect("/matchs");
  }

  // Récupérer les joueurs disponibles groupés par position
  const playersGroupedByPosition = await getTeamPlayersGroupedByPosition(
    teamId
  );

  // Récupérer la composition actuelle si elle existe
  const currentLineup = await getMatchLineup(matchStats.matchId, teamId);

  return (
    <div className="container mx-auto px-4 py-6 pt-15">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          Composition -{" "}
          {isHomeTeam
            ? matchStats.homeTeam.club.name
            : matchStats.awayTeam.club.name}
        </h1>
        <p className="text-muted-foreground">
          Match: {matchStats.homeTeam.club.name} vs{" "}
          {matchStats.awayTeam.club.name} •{" "}
          {new Date(matchStats.match.schedule).toLocaleDateString("fr-FR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      <LineupBuilder
        matchUlid={params.ulid}
        teamId={teamId}
        nbPlayerLineup={matchStats.match.nbPlayerLineup}
        playersGroupedByPosition={playersGroupedByPosition}
        currentLineup={currentLineup}
      />
    </div>
  );
}
