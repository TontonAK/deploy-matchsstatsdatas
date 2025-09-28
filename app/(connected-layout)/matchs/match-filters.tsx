"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  parseAsInteger,
  useQueryState,
} from "nuqs";

interface Season {
  id: number;
  name: string;
}

interface Club {
  id: number;
  name: string;
  logo: string | null;
}

interface Team {
  id: number;
  name: string;
}

interface MatchFiltersProps {
  seasons: Season[];
  clubs: Club[];
  teams: Team[];
  isTeamSelectDisabled: boolean;
}

export function MatchFilters({ 
  seasons, 
  clubs, 
  teams, 
  isTeamSelectDisabled 
}: MatchFiltersProps) {
  const [seasonId, setSeasonId] = useQueryState(
    "seasonId",
    parseAsInteger.withOptions({
      clearOnDefault: true,
      shallow: false,
    })
  );

  const [clubId, setClubId] = useQueryState(
    "clubId",
    parseAsInteger.withOptions({
      clearOnDefault: true,
      shallow: false,
    })
  );

  const [teamId, setTeamId] = useQueryState(
    "teamId",
    parseAsInteger.withOptions({
      clearOnDefault: true,
      shallow: false,
    })
  );

  const [, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({
      shallow: false,
    })
  );

  const handleClubChange = (value: string) => {
    if (value === "all") {
      setClubId(null);
      setTeamId(null);
    } else {
      setClubId(parseInt(value));
      setTeamId(null);
    }
    setPage(1);
  };

  const handleTeamChange = (value: string) => {
    if (value === "all") {
      setTeamId(null);
    } else {
      setTeamId(parseInt(value));
    }
    setPage(1);
  };

  const handleSeasonChange = (value: string) => {
    if (value === "all") {
      setSeasonId(null);
    } else {
      setSeasonId(parseInt(value));
    }
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 gap-4">
        {/* Season Filter */}
        <Select
          value={seasonId?.toString() || "all"}
          onValueChange={handleSeasonChange}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Toutes les saisons" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les saisons</SelectItem>
            {seasons.map((season) => (
              <SelectItem key={season.id} value={season.id.toString()}>
                {season.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Club Filter */}
        <Select
          value={clubId?.toString() || "all"}
          onValueChange={handleClubChange}
        >
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Tous les clubs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les clubs</SelectItem>
            {clubs.map((club) => (
              <SelectItem key={club.id} value={club.id.toString()}>
                <div className="flex items-center gap-2">
                  {club.logo && (
                    <Image
                      src={club.logo}
                      alt={club.name}
                      width={20}
                      height={20}
                      className="rounded object-contain"
                    />
                  )}
                  {club.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Team Filter */}
        <Select
          value={teamId?.toString() || "all"}
          onValueChange={handleTeamChange}
          disabled={isTeamSelectDisabled}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Toutes les équipes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les équipes</SelectItem>
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.id.toString()}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Create Match Button */}
      <Link href="/matchs/create">
        <Button>
          <PlusCircle className="h-4 w-4" />
          Créer un match
        </Button>
      </Link>
    </div>
  );
}