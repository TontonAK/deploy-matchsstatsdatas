"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChartBar, ChevronsUpDown, UserPen } from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "./logout-button";

interface NavUserProps {
  user: {
    id: string;
    name: string;
    firstname: string;
    lastname: string;
    image: string | null;
    job: string;
  };
}

function getFirstCharacter(name: string) {
  return name.at(0);
}

export function NavUser({ user }: NavUserProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-auto py-3 px-3"
        >
          <Avatar className="h-10 w-10 rounded-lg">
            <AvatarImage src={user.image ?? "/default-player.png"} />
            <AvatarFallback className="rounded-lg">
              {getFirstCharacter(user.firstname)}
              {getFirstCharacter(user.lastname)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col items-start text-left text-sm leading-tight">
            <span className="truncate font-semibold">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {user.job}
            </span>
          </div>
          <ChevronsUpDown className="ml-auto h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 rounded-lg"
        side="top"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-2 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={user.image ?? "/default-player.png"} />
              <AvatarFallback className="rounded-lg">
                {getFirstCharacter(user.firstname)}
                {getFirstCharacter(user.lastname)}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {user.job}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-2">
            <UserPen className="size-4 opacity-60" aria-hidden="true" />
            Profil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={`/statistics/players/${user.id}`}
            className="flex items-center gap-2"
          >
            <ChartBar className="size-4 opacity-60" aria-hidden="true" />
            Mes statistiques
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <LogoutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
