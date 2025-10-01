import { getPlayerForEdit } from "@/database/players/get-player-edit";
import { getClubsWithTeams } from "@/database/players/get-clubs-with-teams";
import { getPositions } from "@/database/players/get-positions";
import { notFound } from "next/navigation";
import { PlayerEditForm } from "./player-edit-form";

export default async function PlayerEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Recuperer les donnees du joueur
  const playerResult = await getPlayerForEdit(id);

  if (!playerResult.success || !playerResult.player) {
    notFound();
  }

  // Recuperer les clubs avec leurs equipes
  const clubsResult = await getClubsWithTeams();
  const clubs = clubsResult.success ? clubsResult.clubs : undefined;

  // Recuperer les positions
  const positionsResult = await getPositions();
  const positions = positionsResult.success
    ? positionsResult.positions
    : undefined;

  return (
    <PlayerEditForm
      player={playerResult.player}
      clubs={clubs}
      positions={positions}
    />
  );
}
