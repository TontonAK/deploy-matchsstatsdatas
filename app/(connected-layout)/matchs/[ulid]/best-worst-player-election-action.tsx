"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { bestWorstPlayerElectionAction } from "./best-worst-player-election.action";

const formSchema = z.object({
  bestPlayerId: z.string().min(1, "Veuillez sélectionner le Greg of the match"),
  worstPlayerId: z.string().min(1, "Veuillez sélectionner le Boulichon"),
  worstPlayerReason: z.string().optional(),
});

interface Player {
  id: string;
  name: string;
  slug: string;
  number: number;
  team: {
    id: number;
    name: string;
    clubId: number;
  };
}

interface ElectionData {
  matchId: number;
  status: string;
  endingStatus: string;
  canElect: boolean;
  elections: {
    bestPlayer: {
      id: number;
      player: {
        id: string;
        name: string;
        slug: string;
      };
    } | null;
    worstPlayer: {
      id: number;
      player: {
        id: string;
        name: string;
        slug: string;
      };
      reason: string | null;
    } | null;
  };
  availablePlayers: Player[];
  teams: {
    home: {
      id: number;
      name: string;
      clubName: string;
    };
    away: {
      id: number;
      name: string;
      clubName: string;
    };
  };
}

interface BestWorstPlayerElectionProps {
  ulid: string;
}

export function BestWorstPlayerElection({
  ulid,
}: BestWorstPlayerElectionProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [electionData, setElectionData] = useState<ElectionData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bestPlayerId: "",
      worstPlayerId: "",
      worstPlayerReason: "",
    },
  });

  const fetchElectionData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/matchs/${ulid}/election`);
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des données");
      }
      const data = await response.json();
      setElectionData(data);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la récupération des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && !electionData) {
      fetchElectionData();
    }
  }, [open, electionData, ulid]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!electionData) return;

    if (values.bestPlayerId === values.worstPlayerId) {
      toast.error(
        "Le Greg of the match et le Boulichon ne peuvent pas être la même personne"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await bestWorstPlayerElectionAction({
        matchId: electionData.matchId,
        bestPlayerId: values.bestPlayerId,
        worstPlayerId: values.worstPlayerId,
        worstPlayerReason: values.worstPlayerReason,
      });

      if (result?.data?.success) {
        toast.success("Élections enregistrées avec succès");
        setOpen(false);
        form.reset();
        // Rafraîchir la page pour mettre à jour l'affichage
        window.location.reload();
      } else {
        const errorMessage = typeof result?.serverError === 'string'
          ? result.serverError
          : "Erreur lors de l'enregistrement";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur inattendue lors de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ne pas afficher le bouton si les données ne sont pas chargées ou si l'élection n'est pas possible
  if (electionData && !electionData.canElect) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-12" variant="secondary">
          Élection Greg of the match & Boulichon
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Élection Greg of the match & Boulichon</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="text-sm text-muted-foreground">Chargement...</div>
          </div>
        ) : electionData ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="bestPlayerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Greg of the match</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le Greg of the match" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {electionData.availablePlayers.map((player) => (
                          <SelectItem key={player.id} value={player.id}>
                            #{player.number} - {player.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <FormField
                control={form.control}
                name="worstPlayerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Boulichon</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le boulichon" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {electionData.availablePlayers.map((player) => (
                          <SelectItem key={player.id} value={player.id}>
                            #{player.number} - {player.name}
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
                name="worstPlayerReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Raison (optionnel)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Décrivez la raison pour le Boulichon..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Enregistrement..."
                    : "Enregistrer les élections"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="flex justify-center py-8">
            <div className="text-sm text-muted-foreground">
              Impossible de charger les données d'élection
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
