import { MatchStats } from "@/hooks/use-match-data";
import { Clock, MapPin } from "lucide-react";
import { Separator } from "../ui/separator";
import { TileTeamMatch } from "./tile-team-match";

interface HeaderMatchProps {
  matchData: MatchStats;
}

export default function HeaderMatch({ matchData }: HeaderMatchProps) {
  return (
    <header className="pt-11 bg-gradient-to-r from-gradient-start to-plaisir-primary lg:bg-gradient-to-t lg:from-gradient-start lg:to-plaisir-primary flex flex-col lg:items-center relative w-full z-0 px-6 lg:px-0 pb-6 lg:pb-20 uppercase">
      <div className="text-xs lg:text-2xl flex self-center z-10 lg:pb-4">
        <div className="rounded-b-4xl bg-white px-7 lg:px-12 py-1 flex items-center space-x-4">
          {matchData.match.seasonLeagueMatch?.seasonLeague?.league ? (
            <>
              <span>
                {matchData.match.seasonLeagueMatch.seasonLeague.league.name}
              </span>
              <Separator orientation="vertical" className="bg-black" />
              <span>
                {
                  matchData.match.seasonLeagueMatch.seasonLeague.leaguePool
                    ?.pool
                }
              </span>
            </>
          ) : (
            <span>
              {matchData.match.seasonLeagueMatch?.seasonLeague?.typeMatch?.name}
            </span>
          )}
        </div>
      </div>
      {matchData.match.seasonLeagueMatch?.seasonLeague.gameDay && (
        <div className="flex flex-row text-xs lg:text-xl text-white py-2 z-10">
          <span>
            Journée {matchData.match.seasonLeagueMatch?.seasonLeague.gameDay}
          </span>
        </div>
      )}
      <div className="flex flex-col lg:flex-row text-xs lg:text-sm text-white pb-0 pt-6 lg:pt-6 lg:pb-2 z-10 space-x-4">
        <div className="flex items-center space-x-2">
          <Clock />
          <span className="font-medium">
            {new Date(matchData.match.schedule)
              .toLocaleString("fr-FR", {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
              .replace(",", " -")}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <MapPin />
          <span className="font-medium">{matchData.match.stadium.name}</span>
        </div>
      </div>

      <div className="grid grid-rows-6 grid-cols-12 lg:flex-row lg:gap-2 text-white pt-10 lg:pb-8 z-10 lg:px-20 w-full">
        <div className="col-start-1 col-span-10 row-start-1 row-span-2 flex flex-row lg:justify-center lg:flex-col lg:col-start-1 lg:col-span-5 lg:row-start-1 lg:row-span-6 items-center uppercase">
          <TileTeamMatch
            primaryColor={matchData.homeTeam.club.primaryColor}
            secondaryColor={matchData.homeTeam.club.secondaryColor}
            logoUrl={matchData.homeTeam.club.logo}
            team={matchData.homeTeam.club.name}
          />
        </div>

        <div className="col-start-11 col-span-2 lg:col-span-2 flex row-start-1 row-span-2 lg:col-start-6 lg:justify-center lg:row-start-1 lg:row-span-6 items-center">
          <div className="flex items-center py-2 rounded-lg text-6xl font-bold">
            <span className="px-4 min-w-[40px] text-center">
              {matchData.match.scoreHomeTeam}
            </span>
            <span className="px-4 text-2xl text-gray-500">-</span>
            <span className="px-4 min-w-[40px] text-center">
              {matchData.match.scoreAwayTeam}
            </span>
          </div>
        </div>
        <div className="col-start-1 col-span-10 row-start-3 row-span-2 flex flex-row lg:justify-center lg:flex-col lg:col-start-8 lg:col-span-5 lg:row-start-1 lg:row-span-6 items-center uppercase">
          <TileTeamMatch
            primaryColor={matchData.awayTeam.club.primaryColor}
            secondaryColor={matchData.awayTeam.club.secondaryColor}
            logoUrl={matchData.awayTeam.club.logo}
            team={matchData.awayTeam.club.name}
          />
        </div>
      </div>
      {matchData.match.halfTimeScore && (
        <div className="font-light text-white col-start-1 col-span-12 row-start-5 row-span-1 lg:col-start-4 lg:col-span-6 lg:row-start-5 lg:row-span-1 text-xs lg:text-lg font-montserrat text-center pt-2 lg:pt-3">
          Mi-temps : {matchData.match.halfTimeScore?.homeScore} - {matchData.match.halfTimeScore?.awayScore}
        </div>
      )}
    </header>
  );
}
