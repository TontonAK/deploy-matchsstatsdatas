import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClubWithRelations } from "@/database/clubs/get-clubs";
import { ClubRowClient } from "./club-row-client";

interface ClubTableProps {
  clubs: ClubWithRelations[];
}

export function ClubTable({ clubs }: ClubTableProps) {
  if (clubs.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground text-sm">
          Aucun club trouvé
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16"></TableHead>
          <TableHead>Club</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clubs.map((club) => (
          <ClubRowClient key={club.id} club={club} />
        ))}
      </TableBody>
    </Table>
  );
}