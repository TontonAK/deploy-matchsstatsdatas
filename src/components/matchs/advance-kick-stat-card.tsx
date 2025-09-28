import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import {
  getKickMatchStats,
  type KickTeamStats,
} from "@/database/statistics/get-kick-match-stats";
import { GroundAreaName } from "@/lib/utils";
import Image from "next/image";

interface AdvanceKickStatCardProps {
  matchUlid: string;
}

interface TeamKickCardProps {
  teamStats: KickTeamStats;
  isHome: boolean;
}

function TeamKickCard({ teamStats, isHome }: TeamKickCardProps) {
  const {
    clubName,
    clubLogo,
    occupationKickStartAreas,
    occupationKickEndAreas,
    touchKickStartAreas,
    touchKickEndAreas,
    fieldKickSuccessRate,
    dropsRatio,
    penaltiesRatio,
    conversionsRatio,
    overallKickSuccessRate,
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

        {/* Stats de jeu au pied - grille de 5 colonnes (2 sur mobile) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center mb-4">
          {/* Zones de départ coup de pieds d'occupation */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs mb-2">Jeu au pied (occupation) - Départ</div>
            <div className="text-xs text-muted-foreground">
              {occupationKickStartAreas.length > 0 ? (
                occupationKickStartAreas.map((areaKick, index) => (
                  <div key={index}>
                    <span>
                      {GroundAreaName[areaKick.area]} -{" "}
                      <span className="text-blue-600">
                        {areaKick.percentage}%
                      </span>
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-gray-400">Aucune donnée</div>
              )}
            </div>
          </div>

          {/* Zones d'arrivée coup de pieds d'occupation */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs mb-2">Jeu au pied (occupation) - Arrivée</div>
            <div className="text-xs text-muted-foreground">
              {occupationKickEndAreas.length > 0 ? (
                occupationKickEndAreas.map((areaKick, index) => (
                  <div key={index}>
                    <span>
                      {GroundAreaName[areaKick.area]} -{" "}
                      <span className="text-green-600">
                        {areaKick.percentage}%
                      </span>
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-gray-400">Aucune donnée</div>
              )}
            </div>
          </div>

          {/* Zones de départ coup de pieds pour les touches */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs mb-2">Jeu au pied (touches) - Départ</div>
            <div className="text-xs text-muted-foreground">
              {touchKickStartAreas.length > 0 ? (
                touchKickStartAreas.map((areaKick, index) => (
                  <div key={index}>
                    <span>
                      {GroundAreaName[areaKick.area]} -{" "}
                      <span className="text-purple-600">
                        {areaKick.percentage}%
                      </span>
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-gray-400">Aucune donnée</div>
              )}
            </div>
          </div>

          {/* Zones d'arrivée coup de pieds pour les touches */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs mb-2">Jeu au pied (touches) - Arrivée</div>
            <div className="text-xs text-muted-foreground">
              {touchKickEndAreas.length > 0 ? (
                touchKickEndAreas.map((areaKick, index) => (
                  <div key={index}>
                    <span>
                      {GroundAreaName[areaKick.area]} -{" "}
                      <span className="text-orange-600">
                        {areaKick.percentage}%
                      </span>
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-gray-400">Aucune donnée</div>
              )}
            </div>
          </div>

          {/* Pourcentage de réussite du jeu au pied courant */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs mb-2">% réussite jeu courant</div>
            <div className="text-2xl font-bold text-indigo-600">
              {fieldKickSuccessRate}%
            </div>
          </div>
        </div>

        {/* Stats de tentatives au pied - grille de 4 colonnes (2 sur mobile) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-4">
          {/* Ratio drops */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs mb-2">Drops</div>
            <div className="text-sm font-bold text-blue-600">
              {dropsRatio.successful}/{dropsRatio.attempted}
            </div>
            <div className="text-xs text-muted-foreground">
              {dropsRatio.percentage}%
            </div>
          </div>

          {/* Ratio pénalités */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs mb-2">Pénalités</div>
            <div className="text-sm font-bold text-green-600">
              {penaltiesRatio.successful}/{penaltiesRatio.attempted}
            </div>
            <div className="text-xs text-muted-foreground">
              {penaltiesRatio.percentage}%
            </div>
          </div>

          {/* Ratio transformations */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs mb-2">Transformations</div>
            <div className="text-sm font-bold text-purple-600">
              {conversionsRatio.successful}/{conversionsRatio.attempted}
            </div>
            <div className="text-xs text-muted-foreground">
              {conversionsRatio.percentage}%
            </div>
          </div>

          {/* Pourcentage global de réussite des tentatives */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs mb-2">% réussite tentatives</div>
            <div className="text-2xl font-bold text-red-600">
              {overallKickSuccessRate}%
            </div>
          </div>
        </div>

        {/* Accordion pour les détails */}
        {detailedStats.length > 0 && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="details">
              <AccordionTrigger className="text-sm font-medium">
                Détails des phases de coups de pieds ({detailedStats.length})
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {/* En-tête du tableau */}
                  <div className="grid grid-cols-6 gap-2 text-xs font-semibold text-muted-foreground border-b pb-2">
                    <div>Botteur</div>
                    <div>Zone départ</div>
                    <div>Zone arrivée</div>
                    <div>Ballon mort</div>
                    <div>Réussite</div>
                    <div>Commentaire</div>
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
                        title={GroundAreaName[stat.startAreaKick]}
                      >
                        {GroundAreaName[stat.startAreaKick]}
                      </div>
                      <div
                        className="truncate"
                        title={stat.endAreaKick ? GroundAreaName[stat.endAreaKick] : "-"}
                      >
                        {stat.endAreaKick ? GroundAreaName[stat.endAreaKick] : "-"}
                      </div>
                      <div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            stat.deadBall === true
                              ? "bg-red-100 text-red-800"
                              : stat.deadBall === false
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {stat.deadBall === true
                            ? "Oui"
                            : stat.deadBall === false
                              ? "Non"
                              : "-"}
                        </span>
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
                      <div className="truncate" title={stat.comment || "-"}>
                        {stat.comment || "-"}
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

export async function AdvanceKickStatCard({
  matchUlid,
}: AdvanceKickStatCardProps) {
  const kickStats = await getKickMatchStats(matchUlid);

  if (!kickStats) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Aucune statistique de coup de pied disponible pour ce match
      </div>
    );
  }

  const hasData =
    kickStats.homeTeam.detailedStats.length > 0 ||
    kickStats.awayTeam.detailedStats.length > 0 ||
    kickStats.homeTeam.dropsRatio.attempted > 0 ||
    kickStats.awayTeam.dropsRatio.attempted > 0 ||
    kickStats.homeTeam.conversionsRatio.attempted > 0 ||
    kickStats.awayTeam.conversionsRatio.attempted > 0 ||
    kickStats.homeTeam.penaltiesRatio.attempted > 0 ||
    kickStats.awayTeam.penaltiesRatio.attempted > 0;

  if (!hasData) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Aucun coup de pied enregistré pour ce match
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Titre avec ligne de séparation */}
      <div className="relative flex items-center">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="flex-shrink mx-4 px-4 py-2 text-2xl font-semibold text-gray-700 bg-white uppercase">
          Coups de pieds
        </span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      {/* Cartes des équipes */}
      <div className="grid gap-6 lg:grid-cols-1">
        <TeamKickCard teamStats={kickStats.homeTeam} isHome={true} />
        <TeamKickCard teamStats={kickStats.awayTeam} isHome={false} />
      </div>
    </div>
  );
}