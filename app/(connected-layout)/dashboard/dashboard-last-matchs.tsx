import { Skeleton } from "@/components/ui/skeleton";
import { getLastFiveMatchs } from "@/database/matchs/get-matchs";
import { getTeam } from "@/database/players/get-player";
import { MatchResult } from "@/generated/prisma";
import { getRequiredUser } from "@/lib/auth-session";
import { format } from "date-fns";
import Image from "next/image";
import { Suspense } from "react";

const getResultDisplay = (result: MatchResult | null, isHomeTeam: boolean) => {
  if (!result) return { text: "-", color: "text-gray-600" };

  const isWin =
    (result === "Home_Win" && isHomeTeam) ||
    (result === "Away_Win" && !isHomeTeam);
  const isDraw = result === "Draw";

  if (isWin) return { text: "V", color: "text-green-600" };
  if (isDraw) return { text: "N", color: "text-gray-600" };
  return { text: "D", color: "text-red-600" };
};

export const DashboardLastMatchs = async () => {
  const user = await getRequiredUser();
  const team = await getTeam(user.id);
  const lastMatchs = await getLastFiveMatchs(team?.id);

  return (
    <>
      {lastMatchs && lastMatchs.length > 0 ? (
        <Suspense fallback={<DashboardLastMatchsSkeleton />}>
          <ul className="text-sm space-y-3">
            {lastMatchs.map((match) => {
              const isHomeTeam = match.homeTeam.name === team?.name;
              const opponentTeam = isHomeTeam ? match.awayTeam : match.homeTeam;
              const resultDisplay = getResultDisplay(match.result, isHomeTeam);
              const homeVsAway = isHomeTeam ? "D" : "E";

              const score =
                match.scoreHomeTeam !== null && match.scoreAwayTeam !== null
                  ? `${match.scoreHomeTeam}-${match.scoreAwayTeam}`
                  : "-";

              return (
                <li key={match.id} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-500 w-12">
                    {format(new Date(match.schedule), "dd/MM")}
                  </span>

                  <span className="text-xs font-bold text-gray-700 w-4 text-center">
                    {homeVsAway}
                  </span>

                  <div className="flex items-center gap-2 flex-1">
                    {opponentTeam.club.logo && (
                      <Image
                        src={opponentTeam.club.logo}
                        alt={`Logo ${opponentTeam.club.name}`}
                        width={20}
                        height={20}
                        className="object-cover"
                      />
                    )}
                    <span className="font-medium text-gray-800">
                      {opponentTeam.club.name}
                    </span>
                  </div>

                  <span
                    className={`font-bold text-sm ${resultDisplay.color} w-4 text-center`}
                  >
                    {resultDisplay.text}
                  </span>

                  <span className="font-mono text-sm text-gray-700 min-w-[3rem] text-center">
                    {score}
                  </span>
                </li>
              );
            })}
          </ul>
        </Suspense>
      ) : (
        <div className="mt-2 text-center text-gray-500 font-semibold">
          Aucun match disputé
        </div>
      )}
    </>
  );
};

const DashboardLastMatchsSkeleton = () => (
  <>
    <div className="mt-2 flex items-center gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full space-y-1" />
      ))}
    </div>
  </>
);
