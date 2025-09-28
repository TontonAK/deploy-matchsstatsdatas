import { getPlayer } from "@/database/players/get-player";
import Image from "next/image";

interface HeaderPlayerProps {
  playerSlug: string;
}

export default async function HeaderPlayer({ playerSlug }: HeaderPlayerProps) {
  const player = await getPlayer(playerSlug);

  if (!player) {
    return null;
  }

  const mainPosition = player.positions.find((p) => p.isMainPosition)?.position;

  return (
    <header className="pt-11 bg-gradient-to-r from-gradient-start to-plaisir-primary lg:bg-gradient-to-t lg:from-gradient-start lg:to-plaisir-primary flex flex-col items-center relative w-full z-0 px-6 lg:px-0 pb-6 uppercase">
      <div className="flex items-start justify-center gap-8 text-white pt-10 lg:pb-8 z-10 w-full max-w-6xl">
        {/* Photo du joueur */}
        <div className="flex-shrink-0">
          {player.image ? (
            <Image
              src={player.image}
              alt={`Photo de ${player.firstname} ${player.lastname}`}
              width={260}
              height={310}
              className="object-cover"
            />
          ) : (
            <Image
              src="/default-player.png"
              alt={`Photo de ${player.firstname} ${player.lastname}`}
              width={260}
              height={310}
              className="object-cover"
            />
          )}
        </div>

        {/* Container pour texte et logo sur le même axe vertical */}
        <div className="flex flex-col justify-between" style={{ height: "310px" }}>
          {/* Bloc de texte avec infos joueur - aligné en haut */}
          <div className="flex flex-col text-left">
            <h1 className="text-2xl font-bold mb-2">
              {player.firstname} {player.lastname}
            </h1>
            {mainPosition && <p className="text-lg">{mainPosition.name}</p>}
          </div>

          {/* Logo du club aligné en bas */}
          <div className="flex-shrink-0">
            {player.club.logo ? (
              <Image
                src={player.club.logo}
                alt={`Logo de ${player.club.name}`}
                width={150}
                height={150}
                className="object-contain"
              />
            ) : (
              <Image
                src="/default-logo.png"
                alt={`Logo de ${player.club.name}`}
                width={150}
                height={150}
                className="object-contain"
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
