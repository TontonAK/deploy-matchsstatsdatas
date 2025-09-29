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
import { typeImageEnum, UserRole } from "@/lib/utils";
import {
  PlayerCreateFormSchema,
  PlayerCreateSchema,
} from "@/schemas/player-create.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createPlayerSafeAction } from "./player-create.action";

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

interface PlayerCreateFormProps {
  clubs: Club[] | undefined;
  positions: Position[] | undefined;
}

export const PlayerCreateForm = ({
  clubs,
  positions,
}: PlayerCreateFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [availableTeams, setAvailableTeams] = useState<
    { id: number; name: string }[]
  >([]);
  const [availableSecondaryPositions, setAvailableSecondaryPositions] =
    useState<Position[]>([]);
  const router = useRouter();

  const form = useForm<PlayerCreateFormSchema>({
    resolver: zodResolver(PlayerCreateSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: undefined,
      password: undefined,
      job: Role.Player,
      mainPositionId: undefined,
      secondaryPositionIds: [],
      clubId: 0,
      teamId: 0,
    },
  });

  const selectedClubId = form.watch("clubId");
  const selectedJob = form.watch("job");
  const selectedMainPositionId = form.watch("mainPositionId");

  // Variables pour la logique conditionnelle
  const isPlayerJob = selectedJob === Role.Player;
  const requiresAuthentication =
    selectedJob === Role.Coach || selectedJob === Role.Admin;

  // Mettre à jour les équipes disponibles quand un club est sélectionné
  useEffect(() => {
    if (selectedClubId && selectedClubId > 0 && clubs) {
      const selectedClub = clubs.find((club) => club.id === selectedClubId);
      if (selectedClub) {
        setAvailableTeams(selectedClub.teams);
        // Réinitialiser l'équipe sélectionnée
        form.setValue("teamId", 0);
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

  const { execute } = useAction(createPlayerSafeAction, {
    onError: (error) => {
      const errorMessage = typeof error.error.serverError === 'string'
        ? error.error.serverError
        : "Erreur lors de la création";
      toast.error(errorMessage);
      setIsLoading(false);
    },
    onSuccess: () => {
      router.push("/admin/players");
      toast.success("Joueur créé avec succès");
      setIsLoading(false);
    },
  });

  async function onSubmit(values: PlayerCreateFormSchema) {
    setIsLoading(true);
    execute({ ...values, image: profileImageFile });
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
    <div className="w-5/10 mx-auto p-6 pt-15">
      <h1 className="flex text-2xl font-bold mb-6 items-center justify-center">
        Créer un nouveau joueur
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Première partie : Profil */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Profil</h2>

            {/* Photo de profil */}
            <FormField
              control={form.control}
              name="image"
              render={() => (
                <FormItem>
                  <FormLabel>Photo de profil</FormLabel>
                  <FormControl>
                    <ImageUpload
                      imageUrl=""
                      objectTypeImage={typeImageEnum.PLAYER}
                      onFileSelect={setProfileImageFile}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Prénom et Nom */}
            <div className="grid grid-cols-2 gap-4">
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

            {/* Job */}
            <FormField
              control={form.control}
              name="job"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rôle de l'utilisateur</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(UserRole).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email et Mot de passe - seulement pour Coach et Admin */}
            {requiresAuthentication && (
              <>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>

          <Separator />

          {/* Deuxième partie : Position (seulement pour les joueurs) */}
          {isPlayerJob && (
            <>
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Position</h2>

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
            <h2 className="text-lg font-semibold">Assignement à un club</h2>

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

          {/* Bouton de soumission */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Création en cours..." : "Créer le joueur"}
          </Button>
        </form>
      </Form>
    </div>
  );
};
