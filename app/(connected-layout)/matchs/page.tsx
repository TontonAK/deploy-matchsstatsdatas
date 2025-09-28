import { getFilteredMatchs } from "@/database/matchs/get-matchs";
import { getRequiredUser } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { MatchFilters } from "./match-filters";
import { MatchPagination } from "./match-pagination";
import { MatchRow } from "./match-row";
import { searchParamsCache } from "./search-params";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function MatchsPage({ searchParams }: PageProps) {
  const user = await getRequiredUser();
  const { seasonId, clubId, teamId, page } = searchParamsCache.parse(
    await searchParams
  );

  // Fetch seasons for filter
  const seasons = await prisma.season.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "desc",
    },
  });

  // Fetch clubs for filter
  const clubs = await prisma.club.findMany({
    select: {
      id: true,
      name: true,
      logo: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  // Fetch teams for selected club
  const teams = clubId
    ? await prisma.team.findMany({
        where: {
          clubId: clubId,
        },
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          name: "asc",
        },
      })
    : [];

  // Fetch filtered matches
  const matchsResult = await getFilteredMatchs({
    page,
    seasonId,
    clubId,
    teamId,
  });

  if (!matchsResult.success || !matchsResult.data) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Recherche de matchs</h1>
        <div className="text-red-500">
          Erreur lors du chargement des matchs: {matchsResult.error}
        </div>
      </div>
    );
  }

  const { matches, total, totalPages, currentPage } = matchsResult.data;
  const isTeamSelectDisabled = !clubId;

  return (
    <div className="container mx-auto py- pt-15">
      <h1 className="text-2xl font-bold mb-6">Matchs</h1>

      {/* Filters */}
      <div className="mb-6">
        <MatchFilters
          seasons={seasons}
          clubs={clubs}
          teams={teams}
          isTeamSelectDisabled={isTeamSelectDisabled}
        />
      </div>

      {/* Match List */}
      <div className="mb-6">
        {matches.length > 0 ? (
          <div className="space-y-0">
            {matches.map((match) => (
              <MatchRow key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Aucun match trouvé avec les critères sélectionnés.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <MatchPagination
          currentPage={currentPage}
          totalPages={totalPages}
          total={total}
        />
      )}
    </div>
  );
}
