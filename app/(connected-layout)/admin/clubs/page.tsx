import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getClubs } from "@/database/clubs/get-clubs";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ClubFilters } from "./club-filters";
import { ClubPagination } from "./club-pagination";
import { ClubTable } from "./club-table";
import { searchParamsCache } from "./search-params";

interface AdminClubsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminClubsPage({
  searchParams,
}: AdminClubsPageProps) {
  // Get current user and check permissions
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Only allow Admin role
  if (!session?.user || !["admin"].includes(session.user.role as string)) {
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
  const { search, sortBy, page } = searchParamsCache.parse(await searchParams);

  // Fetch clubs data
  const clubsResult = await getClubs({
    search,
    sortBy,
    page,
    limit: 10,
  });

  if (!clubsResult.success) {
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

  const { clubs, total, totalPages, currentPage } = clubsResult.data;

  return (
    <div className="container mx-auto py-8 space-y-6 pt-15">
      <div>
        <h1 className="text-2xl font-bold mb-2">Administration des clubs</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtres et recherche</CardTitle>
        </CardHeader>
        <CardContent>
          <ClubFilters />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Clubs ({total} résultat{total > 1 ? "s" : ""})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ClubTable clubs={clubs} />
          <ClubPagination
            currentPage={currentPage}
            totalPages={totalPages}
            total={total}
          />
        </CardContent>
      </Card>
    </div>
  );
}
