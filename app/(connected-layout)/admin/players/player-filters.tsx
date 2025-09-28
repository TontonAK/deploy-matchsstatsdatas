"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryState,
} from "nuqs";
import { useRouter } from "next/navigation";

interface Club {
  id: number;
  name: string;
  logo: string | null;
}

interface PlayerFiltersProps {
  clubs: Club[];
}

export function PlayerFilters({ clubs }: PlayerFiltersProps) {
  const router = useRouter();

  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault("").withOptions({
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

  const [sortBy, setSortBy] = useQueryState(
    "sortBy",
    parseAsStringLiteral(["name", "club"] as const).withDefault("name").withOptions({
      shallow: false,
    })
  );

  const [, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({
      shallow: false,
    })
  );

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              // Reset to page 1 when search changes
              if (e.target.value !== search) {
                setPage(1);
              }
            }}
            className="pl-10"
          />
        </div>

        {/* Club Filter */}
        <Select
          value={clubId?.toString() || "all"}
          onValueChange={(value) => {
            if (value === "all") {
              setClubId(null);
            } else {
              setClubId(parseInt(value));
            }
            // Reset to page 1 when club filter changes
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[200px]">
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
                      className="rounded"
                    />
                  )}
                  {club.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort By Filter */}
        <Select
          value={sortBy}
          onValueChange={(value) => {
            setSortBy(value as "name" | "club");
            // Reset to page 1 when sort changes
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Trier par" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Nom</SelectItem>
            <SelectItem value="club">Club</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Create Player Button */}
      <Link href="/admin/players/create">
        <Button>
          <PlusCircle className="h-4 w-4" />
          Créer un joueur
        </Button>
      </Link>
    </div>
  );
}
