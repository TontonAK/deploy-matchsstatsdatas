import HeaderPlayer from "@/components/players/header-player";
import { StatCard } from "@/components/stats/stat-card";
import { PlayerRadarChart } from "@/components/stats/player-radar-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPlayerSummaryStats } from "@/database/statistics/get-player-summary-stats";
import { getPlayerAverageStats } from "@/database/statistics/get-player-average-stats";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

const tabsMenu = [
  {
    action: "stats",
    menu: "Stats globale",
  },
];

export default async function DetailPlayerStatSummaryPage(props: PageProps) {
  const params = await props.params;

  // Récupérer les données du joueur
  const summaryStats = await getPlayerSummaryStats(params.id);
  const radarData = await getPlayerAverageStats(params.id);

  // Si les données ne sont pas accessibles (joueur pas du même club), rediriger
  if (!summaryStats) {
    redirect('/statistics/players');
  }

  return (
    <main className="font-montserrat font-bold">
      <HeaderPlayer playerSlug={params.id} />
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
            {/* Nombre de matchs disputés */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Saison 2025-2026</h2>
              <StatCard
                title="Matchs disputés"
                value={summaryStats.matchesPlayed}
                subtitle="Matchs joués cette saison"
              />
            </div>

            {/* Statistiques globales */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Statistiques globales</h2>
              {summaryStats.globalStats.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {summaryStats.globalStats.map((stat) => (
                    <StatCard
                      key={stat.statTypeId}
                      title={stat.statTypeName}
                      value={stat.totalValue}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Aucune statistique disponible pour ce joueur.</p>
              )}
            </div>

            {/* Statistiques de pourcentage */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Statistiques de réussite</h2>
              {summaryStats.percentageStats.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {summaryStats.percentageStats.map((stat, index) => (
                    <StatCard
                      key={index}
                      title={stat.statName}
                      value={`${stat.percentage}%`}
                      subtitle={`${stat.successful}/${stat.attempted}`}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Aucune statistique de réussite disponible.</p>
              )}
            </div>

            {/* Graphique radar */}
            {radarData && radarData.length > 0 && (
              <PlayerRadarChart data={radarData} />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
