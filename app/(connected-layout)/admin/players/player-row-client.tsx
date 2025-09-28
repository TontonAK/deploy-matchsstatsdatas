"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { PlayerWithRelations } from "@/database/players/get-players";
import Image from "next/image";
import { PlayerRow } from "./player-row";

interface PlayerRowClientProps {
  player: PlayerWithRelations;
}

function getRoleLabel(job: string) {
  switch (job) {
    case "Player":
      return "Joueur";
    case "Coach":
      return "Entraineur";
    case "Admin":
      return "Administrateur";
    default:
      return job;
  }
}

function getRoleBadgeVariant(job: string) {
  switch (job) {
    case "Player":
      return "secondary" as const;
    case "Coach":
      return "default" as const;
    case "Admin":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
}

export function PlayerRowClient({ player }: PlayerRowClientProps) {
  const displayName = player.name || `${player.firstname} ${player.lastname}`;
  const mainPosition = player.positions.find((p) => p.isMainPosition);
  const secondaryPositions = player.positions.filter((p) => !p.isMainPosition);

  return (
    <TableRow>
      {/* Player info */}
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={player.image || undefined}
              alt={displayName}
              style={{
                width: player.image ? "32px" : undefined,
                height: player.image ? "32px" : undefined,
              }}
            />
            <AvatarFallback>
              {player.firstname.charAt(0)}
              {player.lastname.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{displayName}</p>
            <p className="text-muted-foreground text-xs">{player.email}</p>
          </div>
        </div>
      </TableCell>

      {/* Club */}
      <TableCell>
        <div className="flex items-center gap-2">
          {player.club.logo && (
            <Image
              src={player.club.logo}
              alt={player.club.name}
              width={20}
              height={20}
              className="rounded"
            />
          )}
          <span className="text-sm">{player.club.name}</span>
        </div>
      </TableCell>

      {/* Job */}
      <TableCell>
        <Badge variant={getRoleBadgeVariant(player.job)}>
          {getRoleLabel(player.job)}
        </Badge>
      </TableCell>

      {/* Main position */}
      <TableCell>
        {mainPosition ? (
          <span className="text-sm">{mainPosition.position.name}</span>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </TableCell>

      {/* Secondary positions */}
      <TableCell>
        {secondaryPositions.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {secondaryPositions.map((pos) => (
              <Badge key={pos.position.id} variant="outline" className="text-xs">
                {pos.position.shortName}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </TableCell>

      {/* Actions */}
      <TableCell className="text-right">
        <PlayerRow playerId={player.id} />
      </TableCell>
    </TableRow>
  );
}