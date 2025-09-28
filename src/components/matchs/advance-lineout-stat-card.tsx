import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import {
  getLineoutMatchStats,
  type LineoutTeamStats,
} from "@/database/statistics/get-lineout-match-stats";
import { AreaLineoutName, GroundAreaName } from "@/lib/utils";
import Image from "next/image";

interface AdvanceLineoutStatCardProps {
  matchUlid: string;
}

interface TeamLineoutCardProps {
  teamStats: LineoutTeamStats;
  isHome: boolean;
}

function TeamLineoutCard({ teamStats, isHome }: TeamLineoutCardProps) {
  const {
    clubName,
    clubLogo,
    totalLineouts,
    successRate,
    topAreas,
    mostCommonNbPlayer,
    catchBlockAreaStats,
    detailedStats,
  } = teamStats;

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {/* Logo et nom du club - ligne du haut */}
        <div className="flex items-center gap-3 mb-4">
          {clubLogo ? (
            <Image
              src={clubLogo}
              alt={`Logo ${clubName}`}
              width={48}
              height={48}
              className="object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-200 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-500">
                {clubName.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-lg">{clubName}</h3>
            <p className="text-sm text-muted-foreground">
              {isHome ? "Domicile" : "Extérieur"}
            </p>
          </div>
        </div>

        {/* Stats principales - ligne du bas, pleine largeur */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center mb-4">
          {/* Total touches */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-l mb-4">Total touches</div>
            <div className="text-2xl font-bold text-blue-600">
              {totalLineouts}
            </div>
          </div>

          {/* Top zone */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-l mb-4">Zone terrain</div>
            <div className="text-xs text-muted-foreground">
              {topAreas.map((areaLineout, index) => (
                <div key={index}>
                  <span>
                    {GroundAreaName[areaLineout.area]} -{" "}
                    <span className="text-green-600">
                      {areaLineout.percentage
                        ? `${areaLineout.percentage}%`
                        : "0%"}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Nombre de joueurs le plus fréquent */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-l mb-4">Nb joueurs fréquent</div>
            <div className="text-2xl font-bold text-purple-600">
              {mostCommonNbPlayer}
            </div>
          </div>

          {/* Zone de réception principale */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-l mb-4">Zone réception</div>
            <div className="text-xs text-muted-foreground">
              {catchBlockAreaStats.map((catchBlock, index) => (
                <div key={index}>
                  <span>
                    {AreaLineoutName[catchBlock.area]} -{" "}
                    <span className="text-orange-600">
                      {catchBlock.percentage
                        ? `${catchBlock.percentage}%`
                        : "0%"}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pourcentage de réussite */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-l mb-4">% de réussite</div>
            <div className="text-2xl font-bold text-red-600">
              {successRate}%
            </div>
          </div>
        </div>

        {/* Accordion pour les détails */}
        {detailedStats.length > 0 && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="details">
              <AccordionTrigger className="text-sm font-medium">
                Détails des phases de touche ({detailedStats.length})
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {/* En-tête du tableau */}
                  <div className="grid grid-cols-6 gap-2 text-xs font-semibold text-muted-foreground border-b pb-2">
                    <div>Lanceur</div>
                    <div>Zone terrain</div>
                    <div>Nb joueurs</div>
                    <div>Zone réception</div>
                    <div>Réussite</div>
                    <div>Raison échec</div>
                  </div>

                  {/* Lignes de données */}
                  {detailedStats.map((stat, index) => (
                    <div
                      key={stat.id}
                      className={`grid grid-cols-6 gap-2 text-xs py-2 ${
                        index % 2 === 0 ? "bg-gray-50" : ""
                      }`}
                    >
                      <div className="truncate" title={stat.playerName || "-"}>
                        {stat.playerName || "-"}
                      </div>
                      <div
                        className="truncate"
                        title={GroundAreaName[stat.area]}
                      >
                        {GroundAreaName[stat.area]}
                      </div>
                      <div>{stat.nbPlayer}</div>
                      <div
                        className="truncate"
                        title={AreaLineoutName[stat.catchBlockArea]}
                      >
                        {AreaLineoutName[stat.catchBlockArea]}
                      </div>
                      <div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            stat.success === true
                              ? "bg-green-100 text-green-800"
                              : stat.success === false
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {stat.success === true
                            ? "✓"
                            : stat.success === false
                              ? "✗"
                              : "?"}
                        </span>
                      </div>
                      <div className="truncate" title={stat.failReason || "-"}>
                        {stat.failReason || "-"}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}

export async function AdvanceLineoutStatCard({
  matchUlid,
}: AdvanceLineoutStatCardProps) {
  const lineoutStats = await getLineoutMatchStats(matchUlid);

  if (!lineoutStats) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Aucune statistique de touche disponible pour ce match
      </div>
    );
  }

  const hasData =
    lineoutStats.homeTeam.totalLineouts > 0 ||
    lineoutStats.awayTeam.totalLineouts > 0;

  if (!hasData) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Aucune touche enregistrée pour ce match
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Titre avec ligne de séparation */}
      <div className="relative flex items-center">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="flex-shrink mx-4 px-4 py-2 text-2xl font-semibold text-gray-700 bg-white uppercase">
          Touches
        </span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      {/* Cartes des équipes */}
      <div className="grid gap-6 lg:grid-cols-1">
        <TeamLineoutCard teamStats={lineoutStats.homeTeam} isHome={true} />
        <TeamLineoutCard teamStats={lineoutStats.awayTeam} isHome={false} />
      </div>
    </div>
  );
}
