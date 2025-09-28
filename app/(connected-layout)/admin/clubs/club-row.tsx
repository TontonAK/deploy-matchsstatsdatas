import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import Link from "next/link";

interface ClubRowProps {
  clubId: number;
}

export function ClubRow({ clubId }: ClubRowProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Link href={`/admin/clubs/${clubId}/edit`}>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Modifier le club</span>
        </Button>
      </Link>
    </div>
  );
}