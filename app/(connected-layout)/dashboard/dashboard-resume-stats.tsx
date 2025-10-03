import { WinRateCircular } from "@/components/dashboard/win-rate-circular";
import CalendarIcon from "@/components/svg/calendar-icon";
import RefereeCardIcon from "@/components/svg/referee-card-icon";
import TransformIcon from "@/components/svg/transform-icon";
import TryIcon from "@/components/svg/try-icon";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getTeam } from "@/database/players/get-player";
import { getPlayerDashboardStats } from "@/database/statistics/get-dashboard-stats-players";
import { getTeamDashboardStats } from "@/database/statistics/get-dashboard-stats-team";
import { getRequiredUser } from "@/lib/auth-session";
import Image from "next/image";
import { Suspense } from "react";

const WinRateSection = async () => {
  const user = await getRequiredUser();
  const team = await getTeam(user.id);
  const teamStats = await getTeamDashboardStats(team?.id);

  const { wins, draws, losses, winPercentage } = teamStats.winRate;

  return (
    <div className="flex flex-col items-center space-y-3 px-4">
      <h2 className="font-bold text-gray-800 text-sm uppercase">
        Taux victoire
      </h2>

      <div className="text-xs space-y-1 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Victoires</span>
          </div>
          <span className="font-medium">{wins}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span className="text-gray-600">Nuls</span>
          </div>
          <span className="font-medium">{draws}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600">Défaites</span>
          </div>
          <span className="font-medium">{losses}</span>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-2">
        <div className="w-full flex justify-center">
          <WinRateCircular
            wins={wins}
            draws={draws}
            losses={losses}
            winRate={winPercentage}
          />
        </div>
      </div>
    </div>
  );
};

interface PlayerStatDisplayProps {
  icon: React.ReactNode;
  title: string;
  playerName: string;
  playerImage: string | null;
  displayValue: string;
}

const PlayerStatDisplay = ({
  icon,
  title,
  playerName,
  playerImage,
  displayValue,
}: PlayerStatDisplayProps) => {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-12 h-12">
        <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg">
          {icon}
        </div>
        {playerImage && (
          <div className="absolute -bottom-1 -right-1">
            <Image
              src={playerImage}
              alt={playerName}
              width={20}
              height={20}
              className="object-cover"
            />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-800 text-sm truncate">{title}</h4>
        <p className="text-xs text-gray-600 truncate">{playerName || "-"}</p>
        <p className="text-sm font-bold text-gray-900">{displayValue}</p>
      </div>
    </div>
  );
};

const PlayerStatsSection = async () => {
  const user = await getRequiredUser();
  const team = await getTeam(user.id);
  const playerStats = await getPlayerDashboardStats(team?.id);

  return (
    <div className="flex flex-col space-y-4 px-4">
      <h2 className="font-bold text-gray-800 text-sm uppercase">
        Stats joueurs
      </h2>

      <div className="space-y-3">
        <PlayerStatDisplay
          icon={
            <div className="w-6 h-6">
              <TryIcon />
            </div>
          }
          title="Meilleur marqueur d'essais"
          playerName={playerStats.topTryScorer?.playerName || "-"}
          playerImage={playerStats.topTryScorer?.playerImage || null}
          displayValue={playerStats.topTryScorer?.displayValue || "-"}
        />

        <Separator className="max-w-[90%] mx-auto" />

        <PlayerStatDisplay
          icon={<div className="w-6 h-6">{TransformIcon(true)}</div>}
          title="Meilleur buteur"
          playerName={playerStats.topKicker?.playerName || "-"}
          playerImage={playerStats.topKicker?.playerImage || null}
          displayValue={playerStats.topKicker?.displayValue || "-"}
        />

        <Separator className="max-w-[90%] mx-auto" />

        <PlayerStatDisplay
          icon={
            <div className="w-6 h-6">
              <CalendarIcon />
            </div>
          }
          title="Meilleur passeur"
          playerName={playerStats.topPasser?.playerName || "-"}
          playerImage={playerStats.topPasser?.playerImage || null}
          displayValue={playerStats.topPasser?.displayValue || "-"}
        />

        <Separator className="max-w-[90%] mx-auto" />

        <PlayerStatDisplay
          icon={
            <div className="w-6 h-6">
              <CalendarIcon />
            </div>
          }
          title="Meilleur plaqueur"
          playerName={playerStats.topTackler?.playerName || "-"}
          playerImage={playerStats.topTackler?.playerImage || null}
          displayValue={playerStats.topTackler?.displayValue || "-"}
        />
      </div>
    </div>
  );
};

interface TeamStatDisplayProps {
  icon: React.ReactNode;
  title: string;
  value: string;
}

const TeamStatDisplay = ({ icon, title, value }: TeamStatDisplayProps) => {
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg">
        {icon}
      </div>

      <div className="flex-1">
        <h4 className="font-medium text-gray-800 text-sm">{title}</h4>
        <p className="text-lg font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

const TeamStatsSection = async () => {
  const user = await getRequiredUser();
  const team = await getTeam(user.id);
  const teamStats = await getTeamDashboardStats(team?.id);

  const averagePenalties = teamStats.averagePenaltiesConceded;
  const penaltyDisplay =
    averagePenalties !== null ? averagePenalties.toString() : "-";

  return (
    <div className="flex flex-col space-y-4 px-4">
      <h2 className="font-bold text-gray-800 text-sm uppercase">
        Stats de l'équipe
      </h2>

      <TeamStatDisplay
        icon={<div className="w-6 h-6">{RefereeCardIcon(true)}</div>}
        title="Moyenne pénalité concédée"
        value={penaltyDisplay}
      />
    </div>
  );
};

const DashboardResumeStatsSkeleton = () => (
  <div className="flex flex-col lg:flex-row gap-6 w-full py-4 px-6">
    {/* Section 1 */}
    <div className="flex flex-col items-center space-y-3 px-4 flex-1">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="w-20 h-20 rounded-full" />
      <div className="space-y-2 w-full">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>

    <Separator orientation="horizontal" className="lg:hidden" />
    <Separator orientation="vertical" className="hidden lg:block h-40" />

    {/* Section 2 */}
    <div className="flex flex-col space-y-4 px-4 flex-1">
      <Skeleton className="h-4 w-24" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-lg" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            {i < 3 && <Separator className="max-w-[90%] mx-auto mt-3" />}
          </div>
        ))}
      </div>
    </div>

    <Separator orientation="horizontal" className="lg:hidden" />
    <Separator orientation="vertical" className="hidden lg:block h-40" />

    {/* Section 3 */}
    <div className="flex flex-col space-y-4 px-4 flex-1">
      <Skeleton className="h-4 w-32" />
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-6 w-12" />
        </div>
      </div>
    </div>
  </div>
);

export const DashboardResumeStats = async () => {
  return (
    <div className="flex gap-6 w-full py-4 px-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <Suspense fallback={<DashboardResumeStatsSkeleton />}>
        <div className="flex flex-col lg:flex-row w-full h-auto gap-6 lg:gap-0">
          {/* Section 1: Taux de victoire */}
          <div className="flex-1 flex flex-col">
            <WinRateSection />
          </div>

          <Separator orientation="horizontal" className="lg:hidden" />
          <Separator orientation="vertical" className="hidden lg:block self-stretch" />

          {/* Section 2: Statistiques joueurs */}
          <div className="flex-1 flex flex-col">
            <PlayerStatsSection />
          </div>

          <Separator orientation="horizontal" className="lg:hidden" />
          <Separator orientation="vertical" className="hidden lg:block self-stretch" />

          {/* Section 3: Statistiques équipe */}
          <div className="flex-1 flex flex-col">
            <TeamStatsSection />
          </div>
        </div>
      </Suspense>
    </div>
  );
};
