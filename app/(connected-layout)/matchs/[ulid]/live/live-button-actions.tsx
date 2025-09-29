"use client";

import { MatchEventGroup } from "@/generated/prisma";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { MatchEventGroupEnum } from "@/lib/utils";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createLiveEventAction } from "./live-event.action";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface MatchEventTypes {
  id: number;
  name: string;
  group: MatchEventGroup | null;
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

interface LiveActionsProps {
  matchEventTypes: MatchEventTypes[];
  matchLineup: MatchLineup[];
  matchId: number;
  homeTeam: {
    id: number;
    name: string;
    club: { name: string };
  };
  awayTeam: {
    id: number;
    name: string;
    club: { name: string };
  };
  onEventCreated: () => void;
}

const eventFormSchema = z.object({
  eventType: z.string().min(1, "Le type d'événement est requis"),
  playerId: z.string().optional(),
  minute: z.coerce.number().min(0, "La minute doit être positive").max(200, "La minute ne peut pas dépasser 200"),
  description: z.string().optional(),
});

type EventFormData = z.infer<typeof eventFormSchema>;

export default function LiveActions({
  matchEventTypes,
  matchLineup,
  matchId,
  homeTeam,
  awayTeam,
  onEventCreated,
}: LiveActionsProps) {
  const [selectedTeam, setSelectedTeam] = useState<"home" | "away" | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      eventType: "",
      playerId: "",
      minute: 0,
      description: "",
    },
  });

  const { execute: createEvent, isPending } = useAction(createLiveEventAction, {
    onSuccess: () => {
      toast.success("Événement enregistré avec succès !");
      setIsDialogOpen(false);
      form.reset();
      onEventCreated();
    },
    onError: (error) => {
      const errorMessage = typeof error.error.serverError === 'string'
        ? error.error.serverError
        : "Erreur lors de l'enregistrement de l'événement";
      toast.error(errorMessage);
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
    const teamId = teamType === "home" ? homeTeam.id : awayTeam.id;
    return matchLineup.filter(lineup => lineup.team.id === teamId);
  };

  const handleEventButtonClick = (eventType: string, team: "home" | "away") => {
    setSelectedEventType(eventType);
    setSelectedTeam(team);
    form.setValue("eventType", eventType);
    setIsDialogOpen(true);
  };

  const onSubmit = (data: EventFormData) => {
    if (!selectedTeam) return;
    
    createEvent({
      matchId,
      eventType: data.eventType as "Essai" | "Transformation réussie" | "Transformation manquée" | "Drop réussi" | "Drop manqué" | "Pénalité" | "Coup franc" | "Pénalité réussie" | "Pénalité manquée" | "Carton jaune" | "Carton rouge" | "Remplacement",
      team: selectedTeam,
      playerId: data.playerId || undefined,
      minute: data.minute,
      description: data.description || undefined,
    });
  };

  const renderEventButtons = (team: "home" | "away") => {
    const teamName = team === "home" ? homeTeam.club.name : awayTeam.club.name;
    
    return (
      <div className="w-1/2 px-4">
        <h3 className="text-lg font-bold mb-4 text-center">
          {teamName}
        </h3>
        
        {Object.entries(groupedEvents).map(([groupName, events]) => (
          <div key={groupName} className="mb-6">
            <h4 className="text-sm font-semibold mb-2 text-gray-600">
              {MatchEventGroupEnum[groupName as keyof typeof MatchEventGroupEnum] || groupName}
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {events.map((eventType) => (
                <Button
                  key={eventType.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleEventButtonClick(eventType.name, team)}
                  className="justify-start"
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

  const selectedTeamData = selectedTeam === "home" ? homeTeam : awayTeam;
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
            <DialogTitle>Enregistrer un événement</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4">
                {/* Type d'événement */}
                <div className="grid gap-3">
                  <Label>Événement</Label>
                  <span className="text-sm font-medium">{selectedEventType}</span>
                </div>

                {/* Équipe */}
                <div className="grid gap-3">
                  <Label>Team</Label>
                  <span className="text-sm font-medium">
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
                        <Input
                          type="number"
                          placeholder="Ex: 25"
                          {...field}
                        />
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
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un joueur" />
                            </SelectTrigger>
                            <SelectContent>
                              {teamPlayers.map((lineup) => (
                                <SelectItem key={lineup.id} value={lineup.player.id}>
                                  {lineup.number} - {lineup.player.firstname} {lineup.player.lastname}
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

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Annuler</Button>
                </DialogClose>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Validation..." : "Valider"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
