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
import Link from "next/link";
import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryState,
} from "nuqs";

export function ClubFilters() {
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault("").withOptions({
      shallow: false,
    })
  );

  const [sortBy, setSortBy] = useQueryState(
    "sortBy",
    parseAsStringLiteral(["name"] as const).withDefault("name").withOptions({
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
            placeholder="Rechercher par nom de club..."
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

        {/* Sort By Filter */}
        <Select
          value={sortBy}
          onValueChange={(value) => {
            setSortBy(value as "name");
            // Reset to page 1 when sort changes
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Trier par" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Nom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Create Club Button */}
      <Link href="/admin/clubs/create">
        <Button>
          <PlusCircle className="h-4 w-4" />
          Créer un club
        </Button>
      </Link>
    </div>
  );
}