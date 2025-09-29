"use client";

import { useCallback, useState } from "react";

// Types pour les différents contextes de données
export interface MatchStats {
  matchId: number;
  homeTeam: {
    id: number;
    name: string;
    club: {
      name: string;
      primaryColor: string;
      secondaryColor: string;
      logo?: string | undefined;
    };
    stats: TeamStatsSummary;
    playerStats: PlayerStats[];
  };
  awayTeam: {
    id: number;
    name: string;
    club: {
      name: string;
      primaryColor: string;
      secondaryColor: string;
      logo?: string | undefined;
    };
    stats: TeamStatsSummary;
    playerStats: PlayerStats[];
  };
  match: {
    schedule: Date;
    status: string;
    endingStatus: string;
    result?: string | undefined | null;
    nbPlayerLineup: number;
    stadium: {
      id: number;
      name: string;
    };
    periodType: {
      id: number;
      name: string;
      numberPeriod: number;
      durationPeriod: number;
      extratimeNumberPeriod?: number | undefined | null;
      extratimeDurationPeriod?: number | undefined | null;
    };
    scoreHomeTeam?: number | undefined | null;
    scoreAwayTeam?: number | undefined | null;
    seasonLeagueMatch?: {
      seasonLeague: {
        league?: {
          name: string;
        };
        leaguePool?: {
          pool: string;
        };
        typeMatch: {
          name: string;
        };
        gameDay?: number | undefined | null;
      };
    };
    halfTimeScore?: {
      homeScore: number;
      awayScore: number;
    };
  };
}

export type TeamStatsSummary = Record<
  string,
  {
    value: number;
    statType: {
      name: string;
      valueType: string;
    };
  }
>;

export interface PlayerStats {
  playerId: string;
  playerName: string;
  playerSlug: string;
  stats: Record<
    string,
    {
      value: number;
      statType: {
        name: string;
        valueType: string;
      };
    }
  >;
}

export interface TeamGeneralStats {
  teamId: number;
  teamName: string;
  club: {
    name: string;
    primaryColor: string;
    secondaryColor: string;
    logo?: string;
  };
  totalMatches: number;
  wins: number;
  draws: number;
  losses: number;
  stats: TeamStatsSummary;
}

export interface PlayerGeneralStats {
  playerId: string;
  playerName: string;
  playerSlug: string;
  team: {
    name: string;
    club: {
      name: string;
    };
  };
  totalMatches: number;
  stats: Record<
    string,
    {
      totalValue: number;
      averageValue: number;
      statType: {
        name: string;
        valueType: string;
      };
    }
  >;
}

export interface UseMatchDataReturn {
  // État de chargement
  loading: boolean;
  error: string | null;

  // Fonctions pour récupérer les données
  getMatchData: (matchUlid: string) => Promise<MatchStats | null>;
  getTeamGeneralStats: (teamId: number) => Promise<TeamGeneralStats | null>;
  getPlayerGeneralStats: (
    playerId: string
  ) => Promise<PlayerGeneralStats | null>;

  // Cache des données
  matchDataCache: Map<string, MatchStats>;
  teamStatsCache: Map<number, TeamGeneralStats>;
  playerStatsCache: Map<string, PlayerGeneralStats>;

  // Fonction pour vider le cache
  clearCache: () => void;
}

export function useMatchData(): UseMatchDataReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cache pour éviter les appels répétés
  const [matchDataCache] = useState(new Map<string, MatchStats>());
  const [teamStatsCache] = useState(new Map<number, TeamGeneralStats>());
  const [playerStatsCache] = useState(new Map<string, PlayerGeneralStats>());

  const clearCache = useCallback(() => {
    matchDataCache.clear();
    teamStatsCache.clear();
    playerStatsCache.clear();
  }, [matchDataCache, teamStatsCache, playerStatsCache]);

  // Fonction pour récupérer les données d'un match spécifique
  const getMatchData = useCallback(
    async (matchUlid: string): Promise<MatchStats | null> => {
      // Vérifier le cache d'abord
      if (matchDataCache.has(matchUlid)) {
        const cachedData = matchDataCache.get(matchUlid);
        if (cachedData) {
          return cachedData;
        }
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/matches/${matchUlid}`);

        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          throw new Error(`API Error: ${response.statusText}`);
        }

        const matchData = await response.json();

        // Mettre en cache
        matchDataCache.set(matchUlid, matchData);
        return matchData;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [matchDataCache]
  );

  // Fonction pour récupérer les statistiques générales d'une équipe
  const getTeamGeneralStats = useCallback(
    async (teamId: number): Promise<TeamGeneralStats | null> => {
      if (teamStatsCache.has(teamId)) {
        const cachedStats = teamStatsCache.get(teamId);
        if (cachedStats) {
          return cachedStats;
        }
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/teams/${teamId}/stats`);

        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          throw new Error(`API Error: ${response.statusText}`);
        }

        const teamData = await response.json();

        teamStatsCache.set(teamId, teamData);
        return teamData;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [teamStatsCache]
  );

  // Fonction pour récupérer les statistiques générales d'un joueur
  const getPlayerGeneralStats = useCallback(
    async (playerId: string): Promise<PlayerGeneralStats | null> => {
      if (playerStatsCache.has(playerId)) {
        const cachedStats = playerStatsCache.get(playerId);
        if (cachedStats) {
          return cachedStats;
        }
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/players/${playerId}/stats`);

        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          throw new Error(`API Error: ${response.statusText}`);
        }

        const playerData = await response.json();

        playerStatsCache.set(playerId, playerData);
        return playerData;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [playerStatsCache]
  );

  return {
    loading,
    error,
    getMatchData,
    getTeamGeneralStats,
    getPlayerGeneralStats,
    matchDataCache,
    teamStatsCache,
    playerStatsCache,
    clearCache,
  };
}
