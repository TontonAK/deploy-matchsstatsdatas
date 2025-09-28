"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { ClubWithRelations } from "@/database/clubs/get-clubs";
import Image from "next/image";
import { ClubRow } from "./club-row";

interface ClubRowClientProps {
  club: ClubWithRelations;
}

export function ClubRowClient({ club }: ClubRowClientProps) {
  return (
    <TableRow>
      {/* Logo */}
      <TableCell>
        <div className="flex items-center justify-center w-5 h-5">
          {club.logo && (
            <Image src={club.logo} alt={club.name} width={20} height={20} />
          )}
        </div>
      </TableCell>

      {/* Club name */}
      <TableCell>
        <span className="font-medium">{club.name}</span>
      </TableCell>

      {/* Actions */}
      <TableCell className="text-right">
        <ClubRow clubId={club.id} />
      </TableCell>
    </TableRow>
  );
}
