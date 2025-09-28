"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { MatchEventGroupEnum } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface MatchEventTypes {
  id: number;
  name: string;
  group: "Tries" | "Shoots" | "Fouls" | "Other";
}

interface MatchLineup {
  id: number;
  match: {
    id: number;
    ulid: string;
  };
  team: {
    id: number;
    name: string;
    club: {
      id: number;
      name: string;
    };
  };
  player: {
    id: string;
    firstname: string;
    lastname: string;
  };
  number: number;
}

interface MockMatchData {
  matchId: number;
  homeTeam: {
    id: number;
    name: string;
    club: {
      name: string;
      primaryColor: string;
      secondaryColor: string;
      logo: string | null;
    };
  };
  awayTeam: {
    id: number;
    name: string;
    club: {
      name: string;
      primaryColor: string;
      secondaryColor: string;
      logo: string | null;
    };
  };
}

interface TestLiveActionsProps {
  matchEventTypes: MatchEventTypes[];
  matchLineup: MatchLineup[];
  matchData: MockMatchData;
  onEventCreated: (eventData: {
    eventType: string;
    team: "home" | "away";
    playerId?: string;
    minute: number;
    description?: string;
  }) => void;
}

const eventFormSchema = z.object({
  eventType: z.string().min(1, "Le type d'événement est requis"),
  playerId: z.string().optional(),
  minute: z.coerce
    .number()
    .min(0, "La minute doit être positive")
    .max(200, "La minute ne peut pas dépasser 200"),
  description: z.string().optional(),
});

type EventFormData = z.infer<typeof eventFormSchema>;

export default function TestLiveActions({
  matchEventTypes,
  matchLineup,
  matchData,
  onEventCreated,
}: TestLiveActionsProps) {
  const [selectedTeam, setSelectedTeam] = useState<"home" | "away" | null>(
    null
  );
  const [selectedEventType, setSelectedEventType] = useState<string | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      eventType: "",
      playerId: "",
      minute: 0,
      description: "",
    },
  });

  // Grouper les événements par groupe
  const groupedEvents = matchEventTypes.reduce((acc, event) => {
    const groupName = event.group || "Other";
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(event);
    return acc;
  }, {} as Record<string, MatchEventTypes[]>);

  // Filtrer les joueurs par équipe
  const getPlayersForTeam = (teamType: "home" | "away") => {
    const teamId =
      teamType === "home" ? matchData.homeTeam.id : matchData.awayTeam.id;
    return matchLineup.filter((lineup) => lineup.team.id === teamId);
  };

  const handleEventButtonClick = (eventType: string, team: "home" | "away") => {
    setSelectedEventType(eventType);
    setSelectedTeam(team);
    form.setValue("eventType", eventType);
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: EventFormData) => {
    if (!selectedTeam) return;

    setIsSubmitting(true);

    // Simuler un délai d'API
    await new Promise((resolve) => setTimeout(resolve, 500));

    onEventCreated({
      eventType: data.eventType,
      team: selectedTeam,
      playerId: data.playerId || undefined,
      minute: data.minute,
      description: data.description || undefined,
    });

    setIsSubmitting(false);
    setIsDialogOpen(false);
    form.reset();
  };

  const renderEventButtons = (team: "home" | "away") => {
    const teamName =
      team === "home"
        ? matchData.homeTeam.club.name
        : matchData.awayTeam.club.name;

    return (
      <div className="w-1/2 px-4">
        <h3 className="text-lg font-bold mb-4 text-center">{teamName}</h3>

        {Object.entries(groupedEvents).map(([groupName, events]) => (
          <div key={groupName} className="mb-6">
            <h4 className="text-sm font-semibold mb-2 text-gray-600">
              {MatchEventGroupEnum[
                groupName as keyof typeof MatchEventGroupEnum
              ] || groupName}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {events.map((eventType) => (
                <Button
                  key={eventType.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleEventButtonClick(eventType.name, team)}
                  className="justify-start hover:bg-blue-50 hover:border-blue-300"
                >
                  {eventType.name}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const selectedTeamData =
    selectedTeam === "home" ? matchData.homeTeam : matchData.awayTeam;
  const teamPlayers = selectedTeam ? getPlayersForTeam(selectedTeam) : [];

  return (
    <div className="p-6">
      <div className="flex">
        {/* Équipe domicile */}
        {renderEventButtons("home")}

        {/* Séparateur */}
        <div className="flex items-center">
          <Separator orientation="vertical" className="h-96" />
        </div>

        {/* Équipe visiteur */}
        {renderEventButtons("away")}
      </div>

      {/* Dialog pour l'enregistrement d'événement */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🧪 Tester un événement</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4">
                {/* Type d'événement */}
                <div className="grid gap-3">
                  <Label>Événement</Label>
                  <span className="text-sm font-medium bg-blue-50 px-3 py-2 rounded border">
                    {selectedEventType}
                  </span>
                </div>

                {/* Équipe */}
                <div className="grid gap-3">
                  <Label>Équipe</Label>
                  <span className="text-sm font-medium bg-blue-50 px-3 py-2 rounded border">
                    {selectedTeamData?.club.name}
                  </span>
                </div>

                {/* Minute */}
                <FormField
                  control={form.control}
                  name="minute"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minute de jeu</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Ex: 25" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Joueur */}
                <FormField
                  control={form.control}
                  name="playerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Joueur</FormLabel>
                      <FormControl>
                        {teamPlayers.length > 0 ? (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un joueur" />
                            </SelectTrigger>
                            <SelectContent>
                              {teamPlayers.map((lineup) => (
                                <SelectItem
                                  key={lineup.id}
                                  value={lineup.player.id}
                                >
                                  {lineup.number} - {lineup.player.firstname}{" "}
                                  {lineup.player.lastname}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Aucune feuille de match
                          </span>
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (optionnel)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ajouter une description de l'événement..."
                          className="min-h-[80px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-xs text-yellow-700">
                  🧪 <strong>Mode Test :</strong> Cet événement sera ajouté
                  localement sans impact sur la base de données.
                </p>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Annuler</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Test en cours..." : "🧪 Tester"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
