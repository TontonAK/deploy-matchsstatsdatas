"use client";

import { ColorPicker } from "@/components/form/color-picker";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import ImageUpload from "@/features/image-upload/image-upload";
import { typeImageEnum } from "@/lib/utils";
import {
  ClubCreateFormSchema,
  ClubCreateSchema,
} from "@/schemas/club-create.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createClubSafeAction } from "./club-create.action";

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

interface ClubCreateFormProps {
  leagues: League[];
  leaguePools: LeaguePool[];
}

export const ClubCreateForm = ({
  leagues,
  leaguePools,
}: ClubCreateFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [teamInput, setTeamInput] = useState("");
  const [stadiumInput, setStadiumInput] = useState("");
  const [aliasInput, setAliasInput] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const router = useRouter();

  const form = useForm<ClubCreateFormSchema>({
    resolver: zodResolver(ClubCreateSchema),
    defaultValues: {
      name: "",
      primaryColor: "#FFFFFF",
      secondaryColor: "#000000",
      aliases: [],
      stadiums: [],
      teams: [],
    },
  });

  const { execute } = useAction(createClubSafeAction, {
    onError: (error) => {
      toast.error(error.error.serverError ?? "Erreur lors de la création");
      setIsLoading(false);
    },
    onSuccess: () => {
      router.push("/admin/clubs");
      toast.success("Club créé avec succès");
      setIsLoading(false);
    },
  });

  async function onSubmit(values: ClubCreateFormSchema) {
    setIsLoading(true);

    // Créer un FormData pour inclure le fichier image si présent
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("primaryColor", values.primaryColor);
    formData.append("secondaryColor", values.secondaryColor);
    formData.append("aliases", JSON.stringify(values.aliases));
    formData.append("stadiums", JSON.stringify(values.stadiums));
    formData.append("teams", JSON.stringify(values.teams));
    if (logoFile) formData.append("logo", logoFile);

    execute({ ...values, logo: logoFile });
  }

  const addAlias = () => {
    if (aliasInput.trim()) {
      const currentAliases = form.getValues("aliases");
      form.setValue("aliases", [...currentAliases, aliasInput.trim()]);
      setAliasInput("");
    }
  };

  const removeAlias = (index: number) => {
    const currentAliases = form.getValues("aliases");
    form.setValue(
      "aliases",
      currentAliases.filter((_, i) => i !== index)
    );
  };

  const addStadium = () => {
    if (stadiumInput.trim()) {
      const currentStadiums = form.getValues("stadiums");
      form.setValue("stadiums", [...currentStadiums, stadiumInput.trim()]);
      setStadiumInput("");
    }
  };

  const removeStadium = (index: number) => {
    const currentStadiums = form.getValues("stadiums");
    form.setValue(
      "stadiums",
      currentStadiums.filter((_, i) => i !== index)
    );
  };

  const addTeam = () => {
    if (teamInput.trim()) {
      const currentTeams = form.getValues("teams");
      form.setValue("teams", [
        ...currentTeams,
        {
          name: teamInput.trim(),
          leagueId: 0,
          leaguePoolId: undefined,
        },
      ]);
      setTeamInput("");
    }
  };

  const removeTeam = (index: number) => {
    const currentTeams = form.getValues("teams");
    form.setValue(
      "teams",
      currentTeams.filter((_, i) => i !== index)
    );
  };

  const updateTeamLeague = (index: number, leagueId: number) => {
    const currentTeams = form.getValues("teams");
    const updatedTeams = [...currentTeams];
    updatedTeams[index] = {
      ...updatedTeams[index],
      leagueId,
      leaguePoolId: undefined, // Reset pool when league changes
    };
    form.setValue("teams", updatedTeams);
  };

  const updateTeamPool = (index: number, leaguePoolId?: number) => {
    const currentTeams = form.getValues("teams");
    const updatedTeams = [...currentTeams];
    updatedTeams[index] = {
      ...updatedTeams[index],
      leaguePoolId,
    };
    form.setValue("teams", updatedTeams);
  };

  const getAvailablePoolsForLeague = (leagueId: number) => {
    return leaguePools.filter((pool) => pool.leagueId === leagueId);
  };

  return (
    <div className="w-5/10 mx-auto p-6 pt-15">
      <h1 className="flex text-2xl font-bold mb-6 items-center justify-center">
        Créer un nouveau club
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Première partie : Logo et couleurs */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Apparence du club</h2>

            {/* Logo */}
            <FormField
              control={form.control}
              name="logo"
              render={() => (
                <FormItem>
                  <FormLabel>Logo du club</FormLabel>
                  <FormControl>
                    <ImageUpload
                      imageUrl=""
                      objectTypeImage={typeImageEnum.TEAM}
                      onFileSelect={setLogoFile}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Couleurs */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="primaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Couleur primaire</FormLabel>
                    <FormControl>
                      <ColorPicker
                        color={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="secondaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Couleur secondaire</FormLabel>
                    <FormControl>
                      <ColorPicker
                        color={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator />

          {/* Deuxième partie : Informations du club */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Informations du club</h2>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du club</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Alias section */}
            <div className="space-y-4">
              <h3 className="text-md font-medium">Alias du club</h3>
              <p className="text-sm text-muted-foreground">
                Ajoutez des alias pour faciliter la reconnaissance vocale
              </p>

              <div className="flex gap-2">
                <Input
                  value={aliasInput}
                  onChange={(e) => setAliasInput(e.target.value)}
                  placeholder="Nom alternatif du club"
                />
                <Button type="button" onClick={addAlias} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Liste des alias */}
              <div className="space-y-2">
                {form.watch("aliases").map((alias, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded"
                  >
                    <span>{alias}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAlias(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <FormField
                control={form.control}
                name="aliases"
                render={() => (
                  <FormItem>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator />

          {/* Troisième partie : Stades */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Stades</h2>

            <div className="flex gap-2">
              <Input
                value={stadiumInput}
                onChange={(e) => setStadiumInput(e.target.value)}
                placeholder="Nom du stade"
              />
              <Button type="button" onClick={addStadium} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Liste des stades */}
            <div className="space-y-2">
              {form.watch("stadiums").map((stadium, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded"
                >
                  <span>{stadium}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeStadium(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <FormField
              control={form.control}
              name="stadiums"
              render={() => (
                <FormItem>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          {/* Quatrième partie : Équipes */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Équipes</h2>

            <div className="flex gap-2">
              <Input
                value={teamInput}
                onChange={(e) => setTeamInput(e.target.value)}
                placeholder="Nom de l'équipe"
              />
              <Button type="button" onClick={addTeam} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Liste des équipes */}
            <div className="space-y-4">
              {form.watch("teams").map((team, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{team.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTeam(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Sélecteur de league */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium">League *</label>
                      <Select
                        value={
                          team.leagueId > 0 ? team.leagueId.toString() : ""
                        }
                        onValueChange={(value) =>
                          updateTeamLeague(index, parseInt(value))
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Sélectionner une league" />
                        </SelectTrigger>
                        <SelectContent>
                          {leagues.map((league) => (
                            <SelectItem
                              key={league.id}
                              value={league.id.toString()}
                            >
                              {league.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sélecteur de poule */}
                    <div>
                      <label className="text-sm font-medium">
                        Poule (optionnel)
                      </label>
                      <Select
                        value={
                          team.leaguePoolId
                            ? team.leaguePoolId.toString()
                            : "none"
                        }
                        onValueChange={(value) =>
                          updateTeamPool(
                            index,
                            value === "none" ? undefined : parseInt(value)
                          )
                        }
                        disabled={!team.leagueId || team.leagueId === 0}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Sélectionner une poule" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Aucune poule</SelectItem>
                          {getAvailablePoolsForLeague(team.leagueId).map(
                            (pool) => (
                              <SelectItem
                                key={pool.id}
                                value={pool.id.toString()}
                              >
                                {pool.pool}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <FormField
              control={form.control}
              name="teams"
              render={() => (
                <FormItem>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Bouton de soumission */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Création en cours..." : "Créer le club"}
          </Button>
        </form>
      </Form>
    </div>
  );
};
