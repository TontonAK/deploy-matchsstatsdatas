import HeaderMatch from "@/components/matchs/header-match";
import { MatchStats } from "@/components/matchs/match-stats";
import { AdvanceLineoutStatCard } from "@/components/matchs/advance-lineout-stat-card";
import { AdvanceKickStatCard } from "@/components/matchs/advance-kick-stat-card";
import MatchLineup from "@/components/matchs/match-lineup";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMatchDetails } from "@/database/matchs/get-matchs";
import { getUser } from "@/lib/auth-session";
import { notFound } from "next/navigation";
import { AdminCoachActions } from "./admin-coach-actions";

interface PageProps {
  params: Promise<{ ulid: string }>;
}

const tabAdminCoach = [
  {
    action: "actions",
    menu: "Actions",
  },
];

const tabsMenu = [
  {
    action: "teams",
    menu: "Equipes",
  },
  {
    action: "stats",
    menu: "Stats du match",
  },
  {
    action: "advance_stats",
    menu: "Stats avancés",
  },
  {
    action: "commentary",
    menu: "Commentaire en direct",
  },
];

export default async function DetailsMatchPage(props: PageProps) {
  const params = await props.params;
  const matchStats = await getMatchDetails(params.ulid);
  const user = await getUser();

  if (!matchStats) {
    notFound();
  }

  // Logique de visibilité de la tab Admin/Coach
  const shouldShowAdminCoachTab =
    user &&
    (user.role === "admin" || user.job === "Coach" || user.job === "Admin") &&
    !(
      matchStats.match.status === "Finish" &&
      matchStats.match.endingStatus === "Stat_Send"
    );

  // Combine les tabs selon les permissions
  const allTabs = shouldShowAdminCoachTab
    ? [...tabsMenu, ...tabAdminCoach]
    : tabsMenu;

  return (
    <main className="font-montserrat font-bold">
      <HeaderMatch matchData={matchStats} />
      <Tabs
        className="flex w-full justify-center relative"
        defaultValue="stats"
      >
        <TabsList className="rounded-none bg-transparent h-auto flex pt-1 overflow-x-auto text-sm md:justify-center lg:text-base border-b border-solid border-gray-200 w-full">
          {allTabs.map((item) => (
            <TabsTrigger
              key={item.action}
              className="flex px-4 py-4 rounded-none font-semibold uppercase text-black border-solid border-plaisir-primary hover:border-b-2 whitespace-nowrap data-[state=active]:border-b-2 data-[state=active]:font-extrabold"
              value={item.action}
            >
              {item.menu}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="teams">
          <MatchLineup matchUlid={params.ulid} userClubId={user?.clubId} />
        </TabsContent>
        <TabsContent value="stats">
          <MatchStats
            matchUlid={params.ulid}
            homeTeamColor={matchStats.homeTeam.club.primaryColor}
            awayTeamColor={matchStats.awayTeam.club.primaryColor}
          />
        </TabsContent>
        <TabsContent value="advance_stats">
          <div className="py-6 px-4">
            <div className="max-w-[1200px] mx-auto space-y-8">
              <AdvanceLineoutStatCard matchUlid={params.ulid} />
              <AdvanceKickStatCard matchUlid={params.ulid} />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="commentary">
          <p className="p-4 text-center text-xs text-muted-foreground">
            Commentaires du match (à implémenter)
          </p>
        </TabsContent>
        {shouldShowAdminCoachTab && (
          <TabsContent value="actions">
            <AdminCoachActions
              matchData={matchStats}
              user={user}
              ulid={params.ulid}
            />
          </TabsContent>
        )}
      </Tabs>
    </main>
  );
}
