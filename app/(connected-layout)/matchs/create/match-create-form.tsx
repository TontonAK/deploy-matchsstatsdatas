"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { MatchLineupNumberEnum } from "@/lib/utils";
import {
  MatchCreateFormSchema,
  MatchCreateSchema,
} from "@/schemas/match-create.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createMatchSafeAction } from "./match-create.action";

interface Team {
  id: number;
  name: string;
  club: {
    id: number;
    name: string;
    logo: string | null;
    stadiums: {
      id: number;
      name: string;
    }[];
  };
  league: {
    id: number;
    teamId: number;
    leagueId: number;
    leaguePoolId: number | null;
    league: {
      id: number;
      name: string;
    };
    leaguePool: {
      id: number;
      pool: string;
    } | null;
  } | null;
}

interface League {
  id: number;
  name: string;
}

interface LeaguePool {
  id: number;
  pool: string;
  leagueId: number | null;
  league: {
    id: number;
    name: string;
  } | null;
}

interface MatchType {
  id: number;
  name: string;
}

interface PeriodType {
  id: number;
  name: string;
}

interface StatType {
  id: number;
  name: string;
}

interface Stadium {
  id: number;
  name: string;
  club: {
    id: number;
    name: string;
  };
}

interface SeasonLeagueGameDay {
  id: number;
  gameDay: number | null;
}

interface MatchCreateFormProps {
  teams: Team[];
  leagues: League[];
  leaguePools: LeaguePool[];
  matchTypes: MatchType[];
  periodTypes: PeriodType[];
  statTypes: StatType[];
  stadiums: Stadium[];
}

export const MatchCreateForm = ({
  teams,
  leagues,
  leaguePools,
  matchTypes,
  periodTypes,
  statTypes,
  stadiums: _stadiums,
}: MatchCreateFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<number | undefined>();
  const [selectedPool, setSelectedPool] = useState<number | undefined>();
  const [selectedMatchType, setSelectedMatchType] = useState<
    number | undefined
  >();
  const [homeTeamId, setHomeTeamId] = useState<number | undefined>();
  const [availableGameDays, setAvailableGameDays] = useState<
    SeasonLeagueGameDay[]
  >([]);
  const [isLoadingGameDays, setIsLoadingGameDays] = useState(false);

  const router = useRouter();

  const form = useForm<MatchCreateFormSchema>({
    resolver: zodResolver(MatchCreateSchema),
    defaultValues: {
      leagueId: undefined,
      leaguePoolId: undefined,
      typeMatchId: undefined,
      seasonLeagueId: undefined,
      homeTeamId: undefined,
      awayTeamId: undefined,
      stadiumId: undefined,
      schedule: undefined,
      nbPlayerLineup: MatchLineupNumberEnum.TWENTY_TWO,
      periodTypeId: undefined,
      statTypeIds: [],
    },
  });

  const { execute, isPending } = useAction(createMatchSafeAction, {
    onError: (error) => {
      toast.error(
        error.error.serverError ?? "Erreur lors de la création du match"
      );
      setIsLoading(false);
    },
    onSuccess: () => {
      router.push("/matchs");
      toast.success("Match créé avec succès");
      setIsLoading(false);
    },
  });

  async function onSubmit(values: MatchCreateFormSchema) {
    setIsLoading(true);
    execute({ ...values });
  }

  // Obtenir les équipes disponibles selon la league/poule sélectionnée
  const getAvailableTeams = () => {
    if (selectedMatchType) {
      const matchType = matchTypes.find((mt) => mt.id === selectedMatchType);
      if (matchType?.name === "Amical") {
        return teams; // Toutes les équipes disponibles pour les amicaux
      }
    }

    if (selectedLeague) {
      return teams.filter(
        (team) =>
          team.league &&
          team.league.leagueId === selectedLeague &&
          (!selectedPool || team.league.leaguePoolId === selectedPool)
      );
    }

    return []; // Aucune équipe disponible si pas de league sélectionnée et pas amical
  };

  // Obtenir les poules disponibles pour la league sélectionnée
  const getAvailablePoolsForLeague = (leagueId: number) => {
    return leaguePools.filter((pool) => pool.leagueId === leagueId);
  };

  // Obtenir les stades disponibles pour l'équipe à domicile
  const getAvailableStadiums = () => {
    if (!homeTeamId) return [];
    const homeTeam = teams.find((team) => team.id === homeTeamId);
    return homeTeam?.club.stadiums || [];
  };

  // Filtrer les types de match selon la sélection de league
  const availableMatchTypes = matchTypes.filter((type) => {
    if (selectedLeague) {
      // Si une league est sélectionnée, désactiver "Amical"
      return type.name !== "Amical";
    } else {
      // Si aucune league n'est sélectionnée, activer seulement "Amical"
      return type.name === "Amical";
    }
  });

  const isAmicalMatch =
    selectedMatchType &&
    matchTypes.find((mt) => mt.id === selectedMatchType)?.name === "Amical";

  const isChampionnatMatch =
    selectedMatchType &&
    matchTypes.find((mt) => mt.id === selectedMatchType)?.name ===
      "Championnat";

  // Fonction pour récupérer les journées disponibles
  const fetchAvailableGameDays = async (
    leagueId: number,
    leaguePoolId: number | undefined,
    typeMatchId: number
  ) => {
    setIsLoadingGameDays(true);
    try {
      // Utiliser l'ID de la saison courante (2025-2026)
      // Note: On pourrait améliorer ceci en récupérant dynamiquement la saison
      const currentSeasonId = 1; // Assumé basé sur la logique existante dans createMatch

      const searchParams = new URLSearchParams({
        seasonId: currentSeasonId.toString(),
        leagueId: leagueId.toString(),
        typeMatchId: typeMatchId.toString(),
      });

      if (leaguePoolId) {
        searchParams.append("leaguePoolId", leaguePoolId.toString());
      }

      const response = await fetch(
        `/api/season-leagues/game-days?${searchParams.toString()}`
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des journées");
      }

      const result = await response.json();

      if (result.success) {
        setAvailableGameDays(result.seasonLeagues);
      } else {
        setAvailableGameDays([]);
        toast.error(
          result.error || "Erreur lors de la récupération des journées"
        );
      }
    } catch (error) {
      console.error("Erreur:", error);
      setAvailableGameDays([]);
      toast.error("Erreur lors de la récupération des journées");
    } finally {
      setIsLoadingGameDays(false);
    }
  };

  // Fonction pour déterminer si le sélecteur de journée doit être affiché
  const shouldShowGameDaySelector = () => {
    return (
      selectedLeague && selectedPool && isChampionnatMatch && !isAmicalMatch
    );
  };

  // useEffect pour récupérer les journées quand les conditions sont remplies
  useEffect(() => {
    if (shouldShowGameDaySelector() && selectedMatchType) {
      if (selectedLeague) {
        fetchAvailableGameDays(selectedLeague, selectedPool, selectedMatchType);
      }
    } else {
      setAvailableGameDays([]);
      form.resetField("seasonLeagueId");
    }
  }, [selectedLeague, selectedPool, selectedMatchType]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* 1ère partie - Configuration de la compétition */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">
            Configuration de la compétition
          </h2>

          <FormField
            control={form.control}
            name="leagueId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ligue (optionnel)</FormLabel>
                <Select
                  onValueChange={(value) => {
                    const leagueId =
                      value === "none" ? undefined : parseInt(value);
                    field.onChange(leagueId);
                    setSelectedLeague(leagueId);
                    // Reset des champs dépendants
                    form.resetField("leaguePoolId");
                    form.resetField("typeMatchId");
                    form.resetField("seasonLeagueId");
                    setSelectedPool(undefined);
                    setSelectedMatchType(undefined);
                  }}
                  value={field.value?.toString() ?? "none"}
                  disabled={isAmicalMatch}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une ligue" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Aucune ligue</SelectItem>
                    {leagues.map((league) => (
                      <SelectItem key={league.id} value={league.id.toString()}>
                        {league.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="leaguePoolId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Poule (optionnel)</FormLabel>
                <Select
                  onValueChange={(value) => {
                    const poolId =
                      value === "none" ? undefined : parseInt(value);
                    field.onChange(poolId);
                    setSelectedPool(poolId);
                    // Reset du champ journée
                    form.resetField("seasonLeagueId");
                  }}
                  value={field.value?.toString() ?? "none"}
                  disabled={!selectedLeague || isAmicalMatch}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une poule" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Aucune poule</SelectItem>
                    {selectedLeague &&
                      getAvailablePoolsForLeague(selectedLeague).map((pool) => (
                        <SelectItem key={pool.id} value={pool.id.toString()}>
                          {pool.pool}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="typeMatchId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type de match</FormLabel>
                <Select
                  onValueChange={(value) => {
                    if (value === "none") {
                      field.onChange(undefined);
                      setSelectedMatchType(undefined);
                      return;
                    }

                    const typeId = parseInt(value);
                    field.onChange(typeId);
                    setSelectedMatchType(typeId);

                    // Si "Amical" est sélectionné, reset league et poule
                    const matchType = matchTypes.find((mt) => mt.id === typeId);
                    if (matchType?.name === "Amical") {
                      form.resetField("leagueId");
                      form.resetField("leaguePoolId");
                      form.resetField("seasonLeagueId");
                      setSelectedLeague(undefined);
                      setSelectedPool(undefined);
                    } else {
                      // Reset du champ journée pour les autres types
                      form.resetField("seasonLeagueId");
                    }
                  }}
                  value={field.value?.toString() ?? "none"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type de match" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Aucun type sélectionné</SelectItem>
                    {availableMatchTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Sélecteur de journée - affiché uniquement pour les matchs de Championnat */}
          {shouldShowGameDaySelector() && (
            <FormField
              control={form.control}
              name="seasonLeagueId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Journée</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      const seasonLeagueId =
                        value === "none" ? undefined : parseInt(value);
                      field.onChange(seasonLeagueId);
                    }}
                    value={field.value?.toString() ?? "none"}
                    disabled={
                      isLoadingGameDays || availableGameDays.length === 0
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingGameDays
                              ? "Chargement des journées..."
                              : availableGameDays.length === 0
                              ? "Aucune journée disponible"
                              : "Sélectionner une journée"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">
                        Aucune journée sélectionnée
                      </SelectItem>
                      {availableGameDays.map((seasonLeague) => (
                        <SelectItem
                          key={seasonLeague.id}
                          value={seasonLeague.id.toString()}
                        >
                          Journée {seasonLeague.gameDay}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <Separator />

        {/* 2ème partie - Assignation des équipes */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Assignation des équipes</h2>

          <FormField
            control={form.control}
            name="homeTeamId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Équipe à domicile</FormLabel>
                <Select
                  onValueChange={(value) => {
                    const teamId = parseInt(value);
                    field.onChange(teamId);
                    setHomeTeamId(teamId);
                    // Reset stadium when home team changes
                    form.resetField("stadiumId");
                  }}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner l'équipe à domicile" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {getAvailableTeams().map((team) => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        <div className="flex items-center gap-2">
                          {team.club.logo && (
                            <Image
                              src={team.club.logo}
                              alt={`Logo ${team.club.name}`}
                              width={20}
                              height={20}
                            />
                          )}
                          <div className="flex flex-col items-start">
                            <span className="font-medium">
                              {team.club.name}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {team.name}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="awayTeamId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Équipe à l'extérieur</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner l'équipe à l'extérieur" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {getAvailableTeams()
                      .filter((team) => team.id !== homeTeamId)
                      .map((team) => (
                        <SelectItem key={team.id} value={team.id.toString()}>
                          <div className="flex items-center gap-2">
                            {team.club.logo && (
                              <Image
                                src={team.club.logo}
                                alt={`Logo ${team.club.name}`}
                                width={20}
                                height={20}
                              />
                            )}
                            <div className="flex flex-col items-start">
                              <span className="font-medium">
                                {team.club.name}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {team.name}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* 3ème partie - Configuration du match */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Configuration du match</h2>

          <FormField
            control={form.control}
            name="stadiumId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stade</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value?.toString()}
                  disabled={!homeTeamId}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le stade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {getAvailableStadiums().map((stadium) => (
                      <SelectItem
                        key={stadium.id}
                        value={stadium.id.toString()}
                      >
                        {stadium.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="schedule"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date et heure du match</FormLabel>
                <FormControl>
                  <DateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Sélectionner la date et l'heure"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nbPlayerLineup"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de joueurs sur la feuille de match</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le nombre de joueurs" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(MatchLineupNumberEnum)
                      .filter((value) => typeof value === "number")
                      .map((number) => (
                        <SelectItem key={number} value={number.toString()}>
                          {number} joueurs
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="periodTypeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type de période</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type de période" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {periodTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* 4ème partie - Statistiques à suivre */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Statistiques à suivre</h2>

          <FormField
            control={form.control}
            name="statTypeIds"
            render={() => (
              <FormItem>
                <FormLabel>Sélectionner les statistiques à suivre</FormLabel>

                {/* Checkbox pour sélectionner/désélectionner tout */}
                <div className="flex items-center space-x-3 mb-4">
                  <Checkbox
                    checked={
                      form.watch("statTypeIds")?.length === statTypes.length
                    }
                    onCheckedChange={(checked) => {
                      if (checked) {
                        form.setValue(
                          "statTypeIds",
                          statTypes.map((stat) => stat.id)
                        );
                      } else {
                        form.setValue("statTypeIds", []);
                      }
                    }}
                  />
                  <label className="text-sm font-medium">
                    Sélectionner toutes les statistiques
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {statTypes.map((stat) => (
                    <FormField
                      key={stat.id}
                      control={form.control}
                      name="statTypeIds"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={stat.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(stat.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, stat.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== stat.id
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {stat.name}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Bouton de soumission */}
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || isPending}
        >
          {isLoading || isPending ? "Création en cours..." : "Créer le match"}
        </Button>
      </form>
    </Form>
  );
};
