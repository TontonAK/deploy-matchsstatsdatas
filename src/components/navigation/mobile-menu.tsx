"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { MenuItem } from "@/lib/utils";
import { Menu } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { NavAdmin } from "./nav-admin";
import { NavMain } from "./nav-main";
import { NavStats } from "./nav-stats";
import { NavUser } from "./nav-user";

interface MobileMenuProps {
  clubLogo: string | null;
  clubName: string;
  mainMenuItems: MenuItem[];
  statsMenuItem?: MenuItem;
  adminMenuItem?: MenuItem;
  isAdmin: boolean;
  user: {
    id: string;
    name: string;
    firstname: string;
    lastname: string;
    image: string | null;
    job: string;
  };
}

export function MobileMenu({
  clubLogo,
  clubName,
  mainMenuItems,
  statsMenuItem,
  adminMenuItem,
  isAdmin,
  user,
}: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleClose = () => setOpen(false);

  if (isMobile) {
    return (
      <>
        <nav className="flex justify-between items-center md:hidden mx-4 py-3">
          <div className="flex items-center gap-2">
            <Image
              src={clubLogo ?? "/default-logo.png"}
              alt="Logo"
              width={32}
              height={32}
              className="object-cover"
            />
            <span className="text-lg font-semibold tracking-tighter">
              {clubName}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </nav>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="right" className="w-80 flex flex-col">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Image
                  src={clubLogo ?? "/default-logo.png"}
                  alt="Logo"
                  width={32}
                  height={32}
                  className="object-cover"
                />
                <span className="text-lg font-semibold tracking-tighter">
                  {clubName}
                </span>
              </SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto py-4">
              <div className="space-y-4">
                <NavMain items={mainMenuItems} onItemClick={handleClose} />

                {statsMenuItem && (
                  <>
                    <Separator />
                    <NavStats item={statsMenuItem} onItemClick={handleClose} />
                  </>
                )}

                {isAdmin && adminMenuItem && (
                  <>
                    <Separator />
                    <NavAdmin item={adminMenuItem} onItemClick={handleClose} />
                  </>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <NavUser user={user} />
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  }
}
