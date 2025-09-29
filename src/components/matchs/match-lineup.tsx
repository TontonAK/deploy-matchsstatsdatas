"use client";

import {
  type MatchLineupPlayer,
  type TeamLineup,
} from "@/database/matchs/get-matchs";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface MatchLineupProps {
  matchUlid: string;
  userClubId?: number;
}

interface PlayerCardProps {
  player: MatchLineupPlayer;
  matchUlid: string;
  isOnPitch?: boolean;
}

interface PitchPlayerCardProps {
  player: MatchLineupPlayer | undefined;
}

const PlayerCard = ({
  player,
  matchUlid,
  isOnPitch = false,
}: PlayerCardProps) => {
  return (
    <Link
      href={`/matchs/${matchUlid}/statistics/${player.id}`}
      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
    >
      <div className="flex-shrink-0">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
            isOnPitch ? "bg-plaisir-primary" : "bg-gray-600"
          }`}
        >
          {player.number}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {player.firstname} {player.lastname}
        </p>
      </div>
    </Link>
  );
};

const PitchPlayerCard = ({ player }: PitchPlayerCardProps) => {
  if (player) {
    return (
      <>
        <div className="has-image pitch-player-card-image relative overflow-hidden hidden sm:block mx-1">
          <Image
            src={player.image || "/default-player.png"}
            alt={`${player.firstname} ${player.lastname}`}
            fill={true}
            className="object-contain absolute top-0"
          />
        </div>
        <div className="w-full flex flex-col relative z-1 sm:-mt-6">
          <ul className="flex h-4 md:h-6 space-x-0.5 md:space-x-1">
            <li className="flex items-center justify-center min-w-[24px] px-1 rounded-t bg-white text-mono-50 text-body-2 leading-[1.2] font-bold">
              {player.number}
            </li>
          </ul>
          <div className="px-1 py-1 sm:px-3 bg-white font-bold text-xl md:text-caption tracking-[0.4px] md:tracking-[0.48px] leading-[12px] md:leading-5 rounded rounded-tl-none text-center overflow-hidden overflow-ellipsis shadow-md">
            {player.firstname} {player.lastname}
          </div>
        </div>
      </>
    );
  } else {
    return (
      <>
        <div className="has-image pitch-player-card-image relative overflow-hidden hidden sm:block mx-1">
          <Image
            src={"/default-player.png"}
            alt="Joueur par défaut"
            fill={true}
            className="object-contain absolute top-0"
          />
        </div>
        <div className="w-full flex flex-col relative z-1 sm:-mt-6">
          <ul className="flex h-4 md:h-6 space-x-0.5 md:space-x-1">
            <li className="flex items-center justify-center min-w-[24px] px-1 rounded-t bg-white text-mono-50 text-body-2 leading-[1.2] font-bold">
              0
            </li>
          </ul>
          <div className="px-1 py-1 sm:px-3 bg-white font-bold text-xl md:text-caption tracking-[0.4px] md:tracking-[0.48px] leading-[12px] md:leading-5 rounded rounded-tl-none text-center overflow-hidden overflow-ellipsis shadow-md">
            Joueur inconnu
          </div>
        </div>
      </>
    );
  }
};

export default function MatchLineup({
  matchUlid,
  userClubId,
}: MatchLineupProps) {
  const [lineup, setLineup] = useState<TeamLineup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLineup = async () => {
      try {
        setLoading(true);

        // Fetch lineup via API route
        const response = await fetch(
          `/api/matchs/${matchUlid}/lineup${userClubId ? `?clubId=${userClubId}` : ""}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const lineupData = await response.json();
        setLineup(lineupData);
      } catch (err) {
        setError("Erreur lors du chargement du lineup");
        console.error("Error fetching lineup:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLineup();
  }, [matchUlid, userClubId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-plaisir-primary"></div>
      </div>
    );
  }

  if (error || !lineup || lineup.players.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        {error || "Aucun lineup disponible pour ce match"}
      </div>
    );
  }

  // Separate starting players (1-15) and substitutes (16+)
  const startingPlayers = lineup.players.filter((p) => p.number <= 15);
  const substitutes = lineup.players.filter((p) => p.number >= 16);

  // Map players to their grid positions (rugby 15s positions)
  const getPlayerByNumber = (number: number) =>
    startingPlayers.find((p) => p.number === number);

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 p-2 sm:p-4 max-w-7xl mx-auto">
      {/* Left side - Player list */}
      <div className="w-full lg:w-1/3 space-y-3 lg:space-y-4">
        {/* Team header */}
        <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm border">
          {lineup.club.logo && (
            <div className="w-12 h-12 relative">
              <Image
                src={lineup.club.logo}
                alt={`${lineup.club.name} logo`}
                fill
                className="object-contain"
              />
            </div>
          )}
          <div>
            <h3 className="font-bold text-lg text-gray-900">
              {lineup.club.name}
            </h3>
            <p className="text-sm text-gray-600">{lineup.teamName}</p>
          </div>
        </div>

        {/* Starting players */}
        <div className="bg-white rounded-lg shadow-sm border">
          <h4 className="font-semibold text-md p-4 border-b bg-gray-50 rounded-t-lg">
            Titulaires (1-15)
          </h4>
          <div className="p-2 space-y-1">
            {startingPlayers.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                matchUlid={matchUlid}
                isOnPitch={true}
              />
            ))}
          </div>
        </div>

        {/* Substitutes */}
        {substitutes.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border">
            <h4 className="font-semibold text-md p-4 border-b bg-gray-50 rounded-t-lg">
              Remplaçants
            </h4>
            <div className="p-2 space-y-1">
              {substitutes.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  matchUlid={matchUlid}
                  isOnPitch={false}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right side - Rugby pitch */}
      <div className="lg:w-2/3">
        <div className="bg-green-600 z-0 rounded-lg shadow-lg mb-4 lg:mb-0 relative overflow-hidden">
          <div className="p-4 sm:p-7 bg-dark">
            <div className="pitch-grid grid grid-cols-12 relative gap-y-6 sm:gap-y-3 p-6 sm:p-4 sm:pt-12">
              <Image
                src="/pitch.svg"
                alt="Rugby pitch"
                fill
                className="absolute top-0 left-0 h-full w-full"
              />
              {/* Front row - 1, 2, 3 */}
              {getPlayerByNumber(1) && (
                <div className="sm:-mt-16 -mx-2" style={{ gridArea: "p1" }}>
                  <PitchPlayerCard player={getPlayerByNumber(1)} />
                </div>
              )}
              {getPlayerByNumber(2) && (
                <div className="sm:-mt-16 -mx-2" style={{ gridArea: "p2" }}>
                  <PitchPlayerCard player={getPlayerByNumber(2)} />
                </div>
              )}
              {getPlayerByNumber(3) && (
                <div className="sm:-mt-16 -mx-2" style={{ gridArea: "p3" }}>
                  <PitchPlayerCard player={getPlayerByNumber(3)} />
                </div>
              )}

              {/* Second row - 4, 5 */}
              {getPlayerByNumber(4) && (
                <div className="sm:-mt-16 -mx-2" style={{ gridArea: "p4" }}>
                  <PitchPlayerCard player={getPlayerByNumber(4)} />
                </div>
              )}
              {getPlayerByNumber(5) && (
                <div className="sm:-mt-16 -mx-2" style={{ gridArea: "p5" }}>
                  <PitchPlayerCard player={getPlayerByNumber(5)} />
                </div>
              )}

              {/* Back row - 6, 7, 8 */}
              {getPlayerByNumber(6) && (
                <div className="sm:-mt-16 -mx-2" style={{ gridArea: "p6" }}>
                  <PitchPlayerCard player={getPlayerByNumber(6)} />
                </div>
              )}
              {getPlayerByNumber(7) && (
                <div className="sm:-mt-16 -mx-2" style={{ gridArea: "p7" }}>
                  <PitchPlayerCard player={getPlayerByNumber(7)} />
                </div>
              )}
              {getPlayerByNumber(8) && (
                <div className="sm:-mt-16 -mx-2" style={{ gridArea: "p8" }}>
                  <PitchPlayerCard player={getPlayerByNumber(8)} />
                </div>
              )}

              {/* Half backs - 9, 10 */}
              {getPlayerByNumber(9) && (
                <div className="-mx-2" style={{ gridArea: "p9" }}>
                  <PitchPlayerCard player={getPlayerByNumber(9)} />
                </div>
              )}
              {getPlayerByNumber(10) && (
                <div className="sm:-mt-16 -mx-2" style={{ gridArea: "p10" }}>
                  <PitchPlayerCard player={getPlayerByNumber(10)} />
                </div>
              )}

              {/* Centres - 12, 13 */}
              {getPlayerByNumber(12) && (
                <div className="sm:-mt-16 -mx-2" style={{ gridArea: "p12" }}>
                  <PitchPlayerCard player={getPlayerByNumber(12)} />
                </div>
              )}
              {getPlayerByNumber(13) && (
                <div className="sm:-mt-16 -mx-2" style={{ gridArea: "p13" }}>
                  <PitchPlayerCard player={getPlayerByNumber(13)} />
                </div>
              )}

              {/* Wings - 11, 14 */}
              {getPlayerByNumber(11) && (
                <div className="sm:-mt-16 -mx-2" style={{ gridArea: "p11" }}>
                  <PitchPlayerCard player={getPlayerByNumber(11)} />
                </div>
              )}
              {getPlayerByNumber(14) && (
                <div className="sm:-mt-16 -mx-2" style={{ gridArea: "p14" }}>
                  <PitchPlayerCard player={getPlayerByNumber(14)} />
                </div>
              )}

              {/* Full back - 15 */}
              {getPlayerByNumber(15) && (
                <div
                  className="mt-10 sm:-mt-4 -mx-2"
                  style={{ gridArea: "p15" }}
                >
                  <PitchPlayerCard player={getPlayerByNumber(15)} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
