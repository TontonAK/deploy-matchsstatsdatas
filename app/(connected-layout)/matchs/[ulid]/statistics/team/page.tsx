import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMatchTeamStats } from "@/database/statistics/get-match-team-stats";
import { getUser } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { AlertTriangle } from "lucide-react";
import { redirect } from "next/navigation";
import { BackButton } from "./back-button";
import { MatchTeamStatsClient } from "./match-team-stats-client";

interface PageProps {
  params: Promise<{ ulid: string }>;
}

const tabsMenu = [
  {
    action: "stats",
    menu: "Stats de l'équipe",
  },
];

export default async function TeamStatsMatchPage(props: PageProps) {
  const params = await props.params;
  const currentUser = await getUser();

  // Rediriger si pas connecté
  if (!currentUser) {
    redirect("/login");
  }

  // Vérifier que l'utilisateur est admin
  if (currentUser.role !== "admin") {
    return (
      <main className="font-montserrat font-bold pt-15">
        <div className="container mx-auto p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Accès non autorisé</h1>
            <p className="mb-4 text-muted-foreground">
              Seuls les administrateurs peuvent accéder à cette page.
            </p>
            <BackButton />
          </div>
        </div>
      </main>
    );
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
              Les statistiques d&apos;équipe ne sont disponibles que pour les
              matchs terminés.
            </p>
            <BackButton />
          </div>
        </div>
      </main>
    );
  }

  // Déterminer quelle est l'équipe du club de l'utilisateur
  let userTeamId: number;
  let userTeamName: string;

  if (match.homeTeam.clubId === currentUser.clubId) {
    userTeamId = match.homeTeam.id;
    userTeamName = match.homeTeam.name;
  } else if (match.awayTeam.clubId === currentUser.clubId) {
    userTeamId = match.awayTeam.id;
    userTeamName = match.awayTeam.name;
  } else {
    return (
      <main className="font-montserrat font-bold pt-15">
        <div className="container mx-auto p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">
              Équipe non trouvée pour ce match
            </h1>
            <p className="mb-4 text-muted-foreground">
              Aucune équipe de votre club ne participe à ce match.
            </p>
            <BackButton />
          </div>
        </div>
      </main>
    );
  }

  // Récupérer les statistiques de l'équipe pour ce match
  const teamStats = await getMatchTeamStats(match.id, userTeamId);

  if (!teamStats) {
    return (
      <main className="font-montserrat font-bold pt-15">
        <div className="container mx-auto p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Erreur de chargement</h1>
            <p className="mb-4 text-muted-foreground">
              Impossible de charger les statistiques pour cette équipe.
            </p>
            <BackButton />
          </div>
        </div>
      </main>
    );
  }

  // Vérifier les permissions d'édition (déjà vérifié qu'il est admin plus haut)
  const canEdit = true;

  return (
    <main className="font-montserrat font-bold pt-15">
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
            {/* En-tête avec le nom de l'équipe */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">
                Statistiques d&apos;équipe
              </h1>
              <p className="text-lg text-muted-foreground">{userTeamName}</p>
            </div>

            {/* Encart d'avertissement si les stats sont en cours de saisie */}
            {match.endingStatus === "Stat_Not_Sending" && (
              <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Statistiques en cours de saisie</AlertTitle>
                <AlertDescription>
                  Les statistiques d&apos;équipe sont en cours de saisies.
                  Certaines datas ne peuvent donc pas correspondre au déroulé du
                  match.
                </AlertDescription>
              </Alert>
            )}

            {/* Composant client pour la gestion des stats */}
            <MatchTeamStatsClient
              teamStats={teamStats}
              canEdit={canEdit}
              matchId={match.id}
              teamId={userTeamId}
            />
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
