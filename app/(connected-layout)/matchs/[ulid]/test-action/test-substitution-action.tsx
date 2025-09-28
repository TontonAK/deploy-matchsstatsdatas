"use client";

import SubstitutionIcon from "@/components/svg/substitution-icon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface MatchLineup {
  id: number;
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

interface TestSubstitutionActionProps {
  matchLineup: MatchLineup[];
  matchData: MockMatchData;
  onEventCreated: (eventData: {
    eventType: string;
    team: "home" | "away";
    mainPlayerId: string;
    secondPlayerId: string;
    minute: number;
    description?: string;
  }) => void;
}

const substitutionFormSchema = z.object({
  team: z.enum(["home", "away"], { required_error: "Vous devez sélectionner une équipe" }),
  minute: z.coerce.number().min(0, "La minute doit être positive").max(200, "La minute ne peut pas dépasser 200"),
  mainPlayerId: z.string().min(1, "Vous devez sélectionner le joueur sortant"),
  secondPlayerId: z.string().min(1, "Vous devez sélectionner le joueur entrant"),
  description: z.string().optional(),
});

type SubstitutionFormData = z.infer<typeof substitutionFormSchema>;

export default function TestSubstitutionAction({
  matchLineup,
  matchData,
  onEventCreated,
}: TestSubstitutionActionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SubstitutionFormData>({
    resolver: zodResolver(substitutionFormSchema),
    defaultValues: {
      team: undefined,
      minute: 0,
      mainPlayerId: "",
      secondPlayerId: "",
      description: "",
    },
  });

  // Filtrer les joueurs par équipe
  const getPlayersForTeam = (teamType: "home" | "away") => {
    const teamId = teamType === "home" ? matchData.homeTeam.id : matchData.awayTeam.id;
    return matchLineup.filter(lineup => lineup.team.id === teamId);
  };

  const onSubmit = async (data: SubstitutionFormData) => {
    setIsSubmitting(true);
    
    // Simuler un délai d'API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onEventCreated({
      eventType: "Remplacement",
      team: data.team,
      mainPlayerId: data.mainPlayerId,
      secondPlayerId: data.secondPlayerId,
      minute: data.minute,
      description: data.description || undefined,
    });
    
    setIsSubmitting(false);
    setIsDialogOpen(false);
    form.reset();
  };

  const watchedTeam = form.watch("team");
  const teamPlayers = watchedTeam ? getPlayersForTeam(watchedTeam) : [];

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full hover:bg-green-50 hover:border-green-300">
          <SubstitutionIcon className="mr-2" />
          Remplacement
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>🧪 Tester un remplacement</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4">
              {/* Type d'événement */}
              <div className="grid gap-3">
                <Label>Événement</Label>
                <span className="text-sm font-medium bg-green-50 px-3 py-2 rounded border">
                  Remplacement
                </span>
              </div>

              {/* Équipe */}
              <FormField
                control={form.control}
                name="team"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Équipe</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une équipe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="home">{matchData.homeTeam.club.name}</SelectItem>
                          <SelectItem value="away">{matchData.awayTeam.club.name}</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              {/* Joueur sortant */}
              <FormField
                control={form.control}
                name="mainPlayerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Joueur sortant</FormLabel>
                    <FormControl>
                      {teamPlayers.length > 0 ? (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner le joueur sortant" />
                          </SelectTrigger>
                          <SelectContent>
                            {teamPlayers.map((lineup) => (
                              <SelectItem key={`out-${lineup.id}`} value={lineup.player.id}>
                                {lineup.number} - {lineup.player.firstname} {lineup.player.lastname}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {watchedTeam ? "Aucune feuille de match" : "Sélectionnez d'abord une équipe"}
                        </span>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Joueur entrant */}
              <FormField
                control={form.control}
                name="secondPlayerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Joueur entrant</FormLabel>
                    <FormControl>
                      {teamPlayers.length > 0 ? (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner le joueur entrant" />
                          </SelectTrigger>
                          <SelectContent>
                            {teamPlayers.map((lineup) => (
                              <SelectItem key={`in-${lineup.id}`} value={lineup.player.id}>
                                {lineup.number} - {lineup.player.firstname} {lineup.player.lastname}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {watchedTeam ? "Aucune feuille de match" : "Sélectionnez d'abord une équipe"}
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
                        placeholder="Ajouter une description du remplacement..."
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
                🧪 <strong>Mode Test :</strong> Ce remplacement sera ajouté localement sans impact sur la base de données.
              </p>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Annuler</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Test en cours..." : "🧪 Tester remplacement"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}