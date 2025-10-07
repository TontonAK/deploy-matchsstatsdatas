import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMatchOpponentStats } from "@/database/statistics/get-match-opponent-stats";
import { getUser } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { AlertTriangle } from "lucide-react";
import { redirect } from "next/navigation";
import { BackButton } from "./back-button";
import { MatchOpponentStatsClient } from "./match-opponent-stats-client";

interface PageProps {
  params: Promise<{ ulid: string }>;
}

const tabsMenu = [
  {
    action: "stats",
    menu: "Stats de l'équipe adverse",
  },
];

export default async function OpponentStatsPage(props: PageProps) {
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
              Seuls les administrateurs peuvent accéder aux statistiques de l&apos;équipe adverse.
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
              Les statistiques de l&apos;équipe adverse ne sont disponibles que pour les
              matchs terminés.
            </p>
            <BackButton />
          </div>
        </div>
      </main>
    );
  }

  // Déterminer quelle est l'équipe adverse
  const userTeam = match.homeTeam.clubId === currentUser.clubId ? match.homeTeam : match.awayTeam;
  const opponentTeam = userTeam.id === match.homeTeam.id ? match.awayTeam : match.homeTeam;

  // Récupérer les statistiques de l'équipe adverse pour ce match
  const opponentStats = await getMatchOpponentStats(
    match.id,
    opponentTeam.id
  );

  if (!opponentStats) {
    return (
      <main className="font-montserrat font-bold pt-15">
        <div className="container mx-auto p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Erreur de chargement</h1>
            <p className="mb-4 text-muted-foreground">
              Impossible de charger les statistiques pour l&apos;équipe adverse.
            </p>
            <BackButton />
          </div>
        </div>
      </main>
    );
  }

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
            {/* Encart d'avertissement si les stats sont en cours de saisie */}
            {match.endingStatus === "Stat_Not_Sending" && (
              <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Statistiques en cours de saisie</AlertTitle>
                <AlertDescription>
                  Les statistiques de l&apos;équipe adverse sont en cours de saisies.
                  Certaines datas ne peuvent donc pas correspondre au déroulé du
                  match.
                </AlertDescription>
              </Alert>
            )}

            {/* Composant client pour la gestion des stats */}
            <MatchOpponentStatsClient
              opponentStats={opponentStats}
              matchId={match.id}
              opponentTeamId={opponentTeam.id}
            />
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
