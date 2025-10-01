"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { TileMatchProps } from "@/lib/utils";
import Image from "next/image";

export function TileTeamMatch(tileProps: TileMatchProps) {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <div className="relative flex w-full h-full items-center">
        {/* Barre de couleurs */}
        <div className="flex w-full items-center shadow-xl/30">
          <div
            className={`h-full`}
            style={{
              background: `${tileProps.primaryColor}`,
              height: "50px",
              width: "50%",
            }}
          />
          <div
            className={`h-full`}
            style={{
              background: `${tileProps.secondaryColor}`,
              height: "50px",
              width: "50%",
            }}
          />
        </div>
        {/* Logo du club centré entre les barres */}
        <div className="absolute inset-0 top-1/2 flex flex-col items-center justify-center z-10">
          <Image
            src={tileProps.logoUrl ?? "/default-logo.png"}
            alt="Logo du club"
            width={100}
            height={100}
            className="max-w-[100px] max-h-[100px] object-contain"
          />
          <span className="text-xl pt-2">{tileProps.team}</span>
        </div>
      </div>
    );
  } else {
    return (
      <>
        <Image
          src={tileProps.logoUrl ?? "/default-logo.png"}
          alt="Logo du club"
          width={40}
          height={40}
          className="h-10 w-10 mr-4 lg:mr-0 lg:mb-6"
        />
        <span className="text-xl">{tileProps.team}</span>
      </>
    );
  }
}
