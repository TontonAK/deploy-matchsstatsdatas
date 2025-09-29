import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getClubsWithTeams } from "@/database/players/get-clubs-with-teams";
import { getPlayers } from "@/database/players/get-players";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PlayerFilters } from "./player-filters";
import { PlayerPagination } from "./player-pagination";
import { PlayerTable } from "./player-table";
import { searchParamsCache } from "./search-params";

interface AdminPlayersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminPlayersPage({
  searchParams,
}: AdminPlayersPageProps) {
  // Get current user and check permissions
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Only allow Admin and Coach roles
  if (
    !session?.user ||
    !["admin"].includes(session.user.role as string)
    //!["Admin", "Coach"].includes(session.user.job as string)
  ) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            Accès non autorisé
          </h1>
          <p className="text-muted-foreground">
            Vous n'avez pas les permissions nécessaires pour accéder à cette
            page.
          </p>
        </div>
      </div>
    );
  }

  // Parse search params
  const { search, clubId, sortBy, page } = searchParamsCache.parse(
    await searchParams
  );

  // Fetch data in parallel
  const [playersResult, clubsResult] = await Promise.all([
    getPlayers({
      search,
      clubId: clubId ?? undefined,
      sortBy,
      page,
      limit: 10,
    }),
    getClubsWithTeams(),
  ]);

  if (!playersResult.success || !clubsResult.success || !playersResult.data) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-2">
                Erreur de chargement
              </h1>
              <p className="text-muted-foreground">
                Impossible de charger les données. Veuillez réessayer.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { players, total, totalPages, currentPage } = playersResult.data;
  const { clubs } = clubsResult;

  return (
    <div className="container mx-auto py-8 space-y-6 pt-15">
      <div>
        <h1 className="text-2xl font-bold mb-2">Administration des joueurs</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtres et recherche</CardTitle>
        </CardHeader>
        <CardContent>
          <PlayerFilters clubs={clubs || []} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Joueurs ({total} résultat{total > 1 ? "s" : ""})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PlayerTable players={players} />
          <PlayerPagination
            currentPage={currentPage}
            totalPages={totalPages}
            total={total}
          />
        </CardContent>
      </Card>
    </div>
  );
}
