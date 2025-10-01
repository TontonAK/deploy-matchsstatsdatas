"use client";

import { MenuItem } from "@/lib/utils";
import Link from "next/link";

interface NavMainProps {
  items: MenuItem[];
  onItemClick?: () => void;
}

export function NavMain({ items, onItemClick }: NavMainProps) {
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => (
        <Link
          key={item.title}
          href={item.url}
          onClick={onItemClick}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          {item.icon}
          <span>{item.title}</span>
        </Link>
      ))}
    </nav>
  );
}
