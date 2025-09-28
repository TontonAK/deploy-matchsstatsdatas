import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlayerWithRelations } from "@/database/players/get-players";
import { PlayerRowClient } from "./player-row-client";

interface PlayerTableProps {
  players: PlayerWithRelations[];
}

export function PlayerTable({ players }: PlayerTableProps) {
  if (players.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground text-sm">
          Aucun joueur trouvé
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Joueur</TableHead>
          <TableHead>Club</TableHead>
          <TableHead>Job</TableHead>
          <TableHead>Poste principal</TableHead>
          <TableHead>Postes secondaires</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {players.map((player) => (
          <PlayerRowClient key={player.id} player={player} />
        ))}
      </TableBody>
    </Table>
  );
}