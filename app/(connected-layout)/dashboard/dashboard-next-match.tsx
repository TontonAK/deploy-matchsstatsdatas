import StadiumIcon from "@/components/svg/stadium-icon";
import { Skeleton } from "@/components/ui/skeleton";
import { getNextMatch } from "@/database/matchs/get-matchs";
import { getTeam } from "@/database/players/get-player";
import { getRequiredUser } from "@/lib/auth-session";
import Image from "next/image";
import { Suspense } from "react";

export const DashboardNextMatch = async () => {
  const user = await getRequiredUser();
  const team = await getTeam(user.id);
  const nextMatch = await getNextMatch(team?.id);

  return (
    <>
      {nextMatch ? (
        <Suspense fallback={<DashboardNextMatchSkeleton />}>
          <div className="mt-2 flex items-center gap-4 w-full relative min-h-[56px]">
            <div className="flex items-center justify-center gap-4 flex-1">
              <Image
                src={nextMatch.homeTeam?.club?.logo || "/logo.png"}
                alt={`Logo équipe domicile (${
                  nextMatch.homeTeam?.club?.name || "Équipe domicile"
                })`}
                width={56}
                height={56}
                className="object-contain"
              />
              <span className="text-lg font-bold text-gray-800 uppercase">
                {nextMatch.homeTeam?.club?.name || "Équipe domicile"}
              </span>
            </div>
            <span className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold text-gray-600 z-10">
              VS
            </span>
            <div className="flex items-center gap-4 flex-1 justify-center">
              <span className="text-lg font-bold text-gray-800 uppercase">
                {nextMatch.awayTeam?.club?.name || "Équipe extérieure"}
              </span>
              <Image
                src={nextMatch.awayTeam?.club?.logo || "/logo2.png"}
                alt={`Logo équipe extérieure (${
                  nextMatch.awayTeam?.club?.name || "Équipe extérieure"
                })`}
                width={56}
                height={56}
                className="object-contain"
              />
            </div>
          </div>
          <div className="mt-2 text-center">
            <div className="text-base text-gray-500">
              {nextMatch.seasonLeagueMatch?.seasonLeague?.league?.name
                ? `${nextMatch.seasonLeagueMatch.seasonLeague.league.name}${
                    nextMatch.seasonLeagueMatch.seasonLeague.leaguePool?.pool
                      ? " - " +
                        nextMatch.seasonLeagueMatch.seasonLeague.leaguePool.pool
                      : ""
                  }`
                : `${
                    nextMatch.seasonLeagueMatch?.seasonLeague?.typeMatch
                      ?.name || "Match"
                  }`}
            </div>
            <div className="text-sm text-gray-500">
              {nextMatch.schedule
                ? (() => {
                    const dateStr = new Date(nextMatch.schedule).toLocaleString(
                      "fr-FR",
                      {
                        weekday: "long",
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    );
                    return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
                  })()
                : ""}
            </div>
            <div className="text-xs text-gray-400 flex items-center gap-1 justify-center">
              <StadiumIcon />
              <span>{nextMatch.stadium?.name || "Stade à définir"}</span>
            </div>
          </div>
        </Suspense>
      ) : (
        <div className="mt-2 text-center text-gray-500 font-semibold">
          Aucun match prévu
        </div>
      )}
    </>
  );
};

const DashboardNextMatchSkeleton = () => (
  <>
    <div className="mt-2 flex items-center gap-4">
      <Skeleton className="h-14 max-w-1/2" />
    </div>
    <div className="mt-2 text-center">
      <Skeleton className="h-14 w-full" />
    </div>
    ;
  </>
);
