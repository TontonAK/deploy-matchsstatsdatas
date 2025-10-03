import { Separator } from "@/components/ui/separator";
import { MatchWithRelations } from "@/database/matchs/get-matchs";
import { cn } from "@/lib/utils";
import { MapPinned, Shirt } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface MatchClientProps {
  match: MatchWithRelations;
}

export const MatchRow = ({ match }: MatchClientProps) => {
  return (
    <Link href={`/matchs/${match.ulid}`}>
      <div className="mb-10">
        <div className="relative rounded-md border border-gray-400">
          <div className="flex flex-row text-xs md:text-base items-center justify-center py-4 gap-4">
            <div className="flex items-center gap-2">
              <Shirt className="size-4" />
              <span>
                {match.seasonLeagueMatch?.seasonLeague?.league?.name
                  ? `${match.seasonLeagueMatch.seasonLeague.league.name}${
                      match.seasonLeagueMatch.seasonLeague.leaguePool?.pool
                        ? " - " +
                          match.seasonLeagueMatch.seasonLeague.leaguePool.pool
                        : ""
                    }${
                      match.seasonLeagueMatch?.seasonLeague?.typeMatch?.name
                        ? " - " +
                          match.seasonLeagueMatch?.seasonLeague?.typeMatch?.name
                        : ""
                    }`
                  : `${
                      match.seasonLeagueMatch?.seasonLeague?.typeMatch?.name ||
                      "Match"
                    }`}
              </span>
            </div>
            <div className="flex items-center gap-2 lg:ml-4">
              <MapPinned className="size-4" />
              <span>{match.stadium.name}</span>
            </div>
          </div>
          <div className="flex flex-row items-center justify-center">
            <Separator className={cn("max-w-9/10")} />
          </div>
          <div className="py-4 px-2 md:px-0 flex items-center gap-4 w-full relative">
            <div className="flex items-center justify-center gap-4 flex-1">
              <Image
                src={match.homeTeam?.club?.logo || "/logo.png"}
                alt={`Logo équipe domicile (${
                  match.homeTeam?.club?.name || "Équipe domicile"
                })`}
                width={32}
                height={32}
                className="object-contain"
              />
              <span className="text-sm md:text-lgtext-sm md:text-lg font-bold text-gray-800 uppercase">
                {match.homeTeam?.club?.name || "Équipe domicile"}
              </span>
            </div>
            <div className="flex items-center text-lg md:text-2xl font-bold text-gray-600 gap-4">
              <span className="min-w-[32px] text-center">
                {match.scoreHomeTeam !== undefined &&
                match.scoreHomeTeam !== null
                  ? match.scoreHomeTeam
                  : ""}
              </span>
              <span className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold text-gray-600 z-10">
                -
              </span>
              <span className="min-w-[32px] text-center">
                {match.scoreAwayTeam !== undefined &&
                match.scoreAwayTeam !== null
                  ? match.scoreAwayTeam
                  : ""}
              </span>
            </div>
            <div className="flex items-center gap-4 flex-1 justify-center">
              <span className="text-sm md:text-lg font-bold text-gray-800 uppercase">
                {match.awayTeam?.club?.name || "Équipe extérieure"}
              </span>
              <Image
                src={match.awayTeam?.club?.logo || "/logo2.png"}
                alt={`Logo équipe extérieure (${
                  match.awayTeam?.club?.name || "Équipe extérieure"
                })`}
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
          </div>
          <h2 className="absolute flex top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <span className="bg-white px-2 text-sm font-medium text-gray-400">
              {(() => {
                const date = new Date(match.schedule);
                const day = String(date.getDate()).padStart(2, "0");
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const year = date.getFullYear();
                const hours = String(date.getHours()).padStart(2, "0");
                const minutes = String(date.getMinutes()).padStart(2, "0");
                return `${day}/${month}/${year} - ${hours}:${minutes}`;
              })()}
            </span>
          </h2>
        </div>
      </div>
    </Link>
  );
};
