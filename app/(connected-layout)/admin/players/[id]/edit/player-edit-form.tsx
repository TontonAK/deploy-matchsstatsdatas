"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Role } from "@/generated/prisma";
import { typeImageEnum } from "@/lib/utils";
import {
  PlayerUpdateFormSchema,
  PlayerUpdateSchema,
} from "@/schemas/player-update.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { updatePlayerSafeAction } from "./player-edit.action";

interface Club {
  id: number;
  name: string;
  logo: string | null;
  teams: { id: number; name: string }[];
}

interface Position {
  id: number;
  name: string;
  shortName: string;
  group: string;
}

interface PlayerData {
  id: string;
  firstname: string;
  lastname: string;
  image: string | null;
  job: Role;
  clubId: number;
  teams: { teamId: number }[];
  positions: {
    positionId: number;
    isMainPosition: boolean;
  }[];
}

interface PlayerEditFormProps {
  player: PlayerData;
  clubs: Club[] | undefined;
  positions: Position[] | undefined;
}

export const PlayerEditForm = ({
  player,
  clubs,
  positions,
}: PlayerEditFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [availableTeams, setAvailableTeams] = useState<
    { id: number; name: string }[]
  >([]);
  const [availableSecondaryPositions, setAvailableSecondaryPositions] =
    useState<Position[]>([]);
  const router = useRouter();

  // Extraire les informations du joueur
  const mainPosition = player.positions.find((p) => p.isMainPosition);
  const secondaryPositions = player.positions
    .filter((p) => !p.isMainPosition)
    .map((p) => p.positionId);
  const currentTeamId = player.teams[0]?.teamId || 0;

  const form = useForm<PlayerUpdateFormSchema>({
    resolver: zodResolver(PlayerUpdateSchema),
    defaultValues: {
      firstname: player.firstname,
      lastname: player.lastname,
      job: player.job,
      mainPositionId: mainPosition?.positionId || undefined,
      secondaryPositionIds: secondaryPositions,
      clubId: player.clubId,
      teamId: currentTeamId,
    },
  });

  const selectedClubId = form.watch("clubId");
  const selectedJob = form.watch("job");
  const selectedMainPositionId = form.watch("mainPositionId");

  // Variables pour la logique conditionnelle
  const isPlayerJob = selectedJob === Role.Player;

  // Mettre à jour les équipes disponibles quand un club est sélectionné
  useEffect(() => {
    if (selectedClubId && selectedClubId > 0 && clubs) {
      const selectedClub = clubs.find((club) => club.id === selectedClubId);
      if (selectedClub) {
        setAvailableTeams(selectedClub.teams);
        // Si le club change, réinitialiser l'équipe sélectionnée
        const currentTeamId = form.getValues("teamId");
        const teamExistsInNewClub = selectedClub.teams.some(
          (team) => team.id === currentTeamId
        );
        if (!teamExistsInNewClub) {
          form.setValue("teamId", 0);
        }
      }
    } else {
      setAvailableTeams([]);
      form.setValue("teamId", 0);
    }
  }, [selectedClubId, clubs, form]);

  // Mettre à jour les positions secondaires disponibles
  useEffect(() => {
    if (selectedMainPositionId && positions) {
      setAvailableSecondaryPositions(
        positions.filter((pos) => pos.id !== selectedMainPositionId)
      );
      // Supprimer le poste principal des postes secondaires s'il y est
      const currentSecondaryIds = form.getValues("secondaryPositionIds") || [];
      const filteredSecondaryIds = currentSecondaryIds.filter(
        (id) => id !== selectedMainPositionId
      );
      if (filteredSecondaryIds.length !== currentSecondaryIds.length) {
        form.setValue("secondaryPositionIds", filteredSecondaryIds);
      }
    } else if (positions) {
      setAvailableSecondaryPositions(positions);
    }
  }, [selectedMainPositionId, positions, form]);

  const { execute } = useAction(updatePlayerSafeAction, {
    onError: (error) => {
      const errorMessage =
        typeof error.error.serverError === "string"
          ? error.error.serverError
          : "Erreur lors de la mise à jour";
      toast.error(errorMessage);
      setIsLoading(false);
    },
    onSuccess: () => {
      router.push("/admin/players");
      toast.success("Joueur mis à jour avec succès");
      setIsLoading(false);
    },
  });

  async function onSubmit(values: PlayerUpdateFormSchema) {
    setIsLoading(true);
    execute({ ...values, userId: player.id, image: profileImageFile });
  }

  const handleSecondaryPositionChange = (
    positionId: number,
    checked: boolean
  ) => {
    const currentIds = form.getValues("secondaryPositionIds") || [];
    if (checked) {
      form.setValue("secondaryPositionIds", [...currentIds, positionId]);
    } else {
      form.setValue(
        "secondaryPositionIds",
        currentIds.filter((id) => id !== positionId)
      );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 pt-8 sm:pt-15">
      <h1 className="flex text-xl sm:text-2xl font-bold mb-6 items-center justify-center">
        Modifier {player.firstname} {player.lastname}
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Première partie : Profil */}
          <div className="space-y-6">
            <h2 className="text-base sm:text-lg font-semibold">Profil</h2>

            {/* Photo de profil */}
            <FormField
              control={form.control}
              name="image"
              render={() => (
                <FormItem>
                  <FormLabel>Photo de profil</FormLabel>
                  <FormControl>
                    <ImageUpload
                      imageUrl={player.image || ""}
                      objectTypeImage={typeImageEnum.PLAYER}
                      onFileSelect={setProfileImageFile}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Prénom et Nom */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator />

          {/* Deuxième partie : Position (seulement pour les joueurs) */}
          {isPlayerJob && (
            <>
              <div className="space-y-6">
                <h2 className="text-base sm:text-lg font-semibold">
                  Position
                </h2>

                {/* Poste principal */}
                <FormField
                  control={form.control}
                  name="mainPositionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Poste principal *</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        value={
                          field.value && field.value > 0
                            ? field.value.toString()
                            : ""
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un poste principal" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(positions || []).map((position) => (
                            <SelectItem
                              key={position.id}
                              value={position.id.toString()}
                            >
                              {position.name} ({position.shortName})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Postes secondaires */}
                <FormField
                  control={form.control}
                  name="secondaryPositionIds"
                  render={() => (
                    <FormItem>
                      <FormLabel>Postes secondaires (optionnel)</FormLabel>
                      <div className="space-y-3 max-h-48 overflow-y-auto border rounded-md p-3">
                        {availableSecondaryPositions.map((position) => (
                          <div
                            key={position.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`secondary-${position.id}`}
                              checked={(
                                form.getValues("secondaryPositionIds") || []
                              ).includes(position.id)}
                              onCheckedChange={(checked) =>
                                handleSecondaryPositionChange(
                                  position.id,
                                  checked as boolean
                                )
                              }
                            />
                            <label
                              htmlFor={`secondary-${position.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {position.name} ({position.shortName})
                            </label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />
            </>
          )}

          {/* Troisième partie : Assignement à un club */}
          <div className="space-y-6">
            <h2 className="text-base sm:text-lg font-semibold">
              Assignement à un club
            </h2>

            {/* Sélecteur de club */}
            <FormField
              control={form.control}
              name="clubId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Club</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={
                      field.value && field.value > 0
                        ? field.value.toString()
                        : ""
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un club" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(clubs || []).map((club) => (
                        <SelectItem key={club.id} value={club.id.toString()}>
                          <div className="flex items-center space-x-2">
                            {club.logo && (
                              <Image
                                src={club.logo}
                                alt={`Logo ${club.name}`}
                                width={20}
                                height={20}
                              />
                            )}
                            <span>{club.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sélecteur d'équipe */}
            <FormField
              control={form.control}
              name="teamId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Équipe</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={
                      field.value && field.value > 0
                        ? field.value.toString()
                        : ""
                    }
                    disabled={
                      !selectedClubId ||
                      selectedClubId === 0 ||
                      availableTeams.length === 0
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            !selectedClubId || selectedClubId === 0
                              ? "Sélectionnez d'abord un club"
                              : "Sélectionner une équipe"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableTeams.map((team) => (
                        <SelectItem key={team.id} value={team.id.toString()}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Boutons de soumission */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:flex-1"
              onClick={() => router.push("/admin/players")}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="w-full sm:flex-1"
              disabled={isLoading}
            >
              {isLoading ? "Mise à jour en cours..." : "Mettre à jour"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
