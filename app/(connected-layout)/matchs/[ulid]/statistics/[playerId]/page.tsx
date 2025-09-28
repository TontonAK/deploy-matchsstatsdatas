import HeaderPlayer from "@/components/players/header-player";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMatchPlayerStats } from "@/database/statistics/get-match-player-stats";
import { getUser } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { AlertTriangle } from "lucide-react";
import { redirect } from "next/navigation";
import { BackButton } from "./back-button";
import { MatchPlayerStatsClient } from "./match-player-stats-client";

interface PageProps {
  params: Promise<{ ulid: string; playerId: string }>;
}

const tabsMenu = [
  {
    action: "stats",
    menu: "Stats du joueur",
  },
];

export default async function DetailPlayerStatMatchPage(props: PageProps) {
  const params = await props.params;
  const currentUser = await getUser();

  // Rediriger si pas connecté
  if (!currentUser) {
    redirect("/login");
  }

  // Récupérer le match par ULID
  const match = await prisma.match.findUnique({
    where: { ulid: params.ulid },
    include: {
      homeTeam: { select: { id: true, name: true, clubId: true } },
      awayTeam: { select: { id: true, name: true, clubId: true } },
    },
  });

  // Vérifier que le match existe
  if (!match) {
    return (
      <main className="font-montserrat font-bold pt-15">
        <div className="container mx-auto p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Match non trouvé</h1>
            <BackButton />
          </div>
        </div>
      </main>
    );
  }

  // Vérifier les conditions d'accès au match
  if (match.status !== "Finish" || match.endingStatus === "Waiting_End") {
    return (
      <main className="font-montserrat font-bold pt-15">
        <div className="container mx-auto p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Accès non autorisé</h1>
            <p className="mb-4 text-muted-foreground">
              Les statistiques individuelles ne sont disponibles que pour les
              matchs terminés.
            </p>
            <BackButton />
          </div>
        </div>
      </main>
    );
  }

  // Vérifier que le joueur existe
  const player = await prisma.user.findUnique({
    where: { id: params.playerId },
    select: {
      id: true,
      firstname: true,
      lastname: true,
      clubId: true,
    },
  });

  if (!player) {
    return (
      <main className="font-montserrat font-bold pt-15">
        <div className="container mx-auto p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Aucun joueur trouvé</h1>
            <BackButton />
          </div>
        </div>
      </main>
    );
  }

  // Déterminer dans quelle équipe le joueur joue pour ce match
  let playerTeamId: number;
  if (match.homeTeam.clubId === player.clubId) {
    playerTeamId = match.homeTeam.id;
  } else if (match.awayTeam.clubId === player.clubId) {
    playerTeamId = match.awayTeam.id;
  } else {
    // Vérifier si le joueur est dans la lineup (cas d'échange, prêt, etc.)
    const lineup = await prisma.matchLineup.findFirst({
      where: {
        matchId: match.id,
        playerId: params.playerId,
      },
      select: { teamId: true },
    });

    if (!lineup) {
      return (
        <main className="font-montserrat font-bold">
          <HeaderPlayer playerSlug={params.playerId} />
          <div className="container mx-auto p-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">
                Joueur non sélectionné pour ce match
              </h1>
              <BackButton />
            </div>
          </div>
        </main>
      );
    }

    playerTeamId = lineup.teamId;
  }

  // Récupérer les statistiques du joueur pour ce match
  const playerStats = await getMatchPlayerStats(
    match.id,
    params.playerId,
    playerTeamId
  );

  if (!playerStats) {
    return (
      <main className="font-montserrat font-bold">
        <HeaderPlayer playerSlug={params.playerId} />
        <div className="container mx-auto p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Erreur de chargement</h1>
            <p className="mb-4 text-muted-foreground">
              Impossible de charger les statistiques pour ce joueur.
            </p>
            <BackButton />
          </div>
        </div>
      </main>
    );
  }

  // Vérifier les permissions d'édition
  const canEdit = currentUser.role === "admin";

  return (
    <main className="font-montserrat font-bold">
      <HeaderPlayer playerSlug={params.playerId} />
      <Tabs
        className="flex w-full justify-center relative"
        defaultValue="stats"
      >
        <TabsList className="rounded-none bg-transparent h-auto flex pt-1 overflow-x-auto text-sm md:justify-center lg:text-base border-b border-solid border-gray-200 w-full">
          {tabsMenu.map((item) => (
            <TabsTrigger
              key={item.action}
              className="flex px-4 py-4 rounded-none font-semibold uppercase text-black border-solid border-plaisir-primary hover:border-b-2 whitespace-nowrap data-[state=active]:border-b-2 data-[state=active]:font-extrabold"
              value={item.action}
            >
              {item.menu}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="stats" className="w-full">
          <div className="container mx-auto p-6 space-y-8">
            {/* Encart d'avertissement si les stats sont en cours de saisie */}
            {match.endingStatus === "Stat_Not_Sending" && (
              <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Statistiques en cours de saisie</AlertTitle>
                <AlertDescription>
                  Les statistiques individuelles sont en cours de saisies.
                  Certaines datas ne peuvent donc pas correspondre au déroulé du
                  match.
                </AlertDescription>
              </Alert>
            )}

            {/* Composant client pour la gestion des stats */}
            <MatchPlayerStatsClient
              playerStats={playerStats}
              canEdit={canEdit}
              matchId={match.id}
              teamId={playerTeamId}
              playerId={params.playerId}
            />
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
