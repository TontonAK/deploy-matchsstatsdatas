"use client";

import { MenuItem } from "@/lib/utils";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface NavStatsProps {
  item: MenuItem;
  onItemClick?: () => void;
}

export function NavStats({ item, onItemClick }: NavStatsProps) {
  return (
    <Collapsible defaultOpen={false} className="group/collapsible">
      <CollapsibleTrigger className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted">
        {item.icon}
        <span>{item.title}</span>
        <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-1">
        <div className="ml-6 flex flex-col gap-1">
          {item.items?.map((subItem) => (
            <Link
              key={subItem.title}
              href={subItem.url}
              onClick={onItemClick}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
            >
              {subItem.icon}
              <span>{subItem.title}</span>
            </Link>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
