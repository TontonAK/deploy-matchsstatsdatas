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
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { scoreHalftimeAction } from "./score-halftime.action";

const formSchema = z.object({
  homeScore: z.coerce.number().min(0, "Le score doit être positif ou nul"),
  awayScore: z.coerce.number().min(0, "Le score doit être positif ou nul"),
});

interface HalftimeData {
  matchId: number;
  canEdit: boolean;
  existingScore: {
    homeScore: number;
    awayScore: number;
  } | null;
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

interface ScoreHalftimeActionProps {
  ulid: string;
}

export function ScoreHalftimeAction({ ulid }: ScoreHalftimeActionProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [halftimeData, setHalftimeData] = useState<HalftimeData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      homeScore: 0,
      awayScore: 0,
    },
  });

  const fetchHalftimeData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/matchs/${ulid}/halftime`);
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des données");
      }
      const data = await response.json();
      setHalftimeData(data);

      // Pré-remplir le formulaire avec les scores existants
      if (data.existingScore) {
        form.setValue("homeScore", data.existingScore.homeScore);
        form.setValue("awayScore", data.existingScore.awayScore);
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la récupération des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && !halftimeData) {
      fetchHalftimeData();
    }
  }, [open, halftimeData, ulid]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!halftimeData) return;

    setIsSubmitting(true);
    try {
      const result = await scoreHalftimeAction({
        matchId: halftimeData.matchId,
        homeScore: values.homeScore,
        awayScore: values.awayScore,
      });

      if (result?.data?.success) {
        toast.success(result.data.message);
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-12" variant="outline">
          Score mi-temps
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {halftimeData?.existingScore
              ? "Modifier le score à la mi-temps"
              : "Saisir le score à la mi-temps"}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="text-sm text-muted-foreground">Chargement...</div>
          </div>
        ) : halftimeData ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="homeScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Score domicile
                        <span className="block text-sm text-muted-foreground font-normal">
                          {halftimeData.teams.home.clubName}
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          {...field}
                          className="text-center text-lg font-semibold"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="awayScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Score visiteur
                        <span className="block text-sm text-muted-foreground font-normal">
                          {halftimeData.teams.away.clubName}
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          {...field}
                          className="text-center text-lg font-semibold"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {halftimeData.existingScore && (
                <div className="p-4 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground mb-2">
                    Score actuel à la mi-temps :
                  </p>
                  <div className="flex justify-center items-center gap-4">
                    <div className="text-center">
                      <div className="font-semibold">
                        {halftimeData.teams.home.clubName}
                      </div>
                      <div className="text-2xl font-bold">
                        {halftimeData.existingScore.homeScore}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-muted-foreground">-</div>
                    <div className="text-center">
                      <div className="font-semibold">
                        {halftimeData.teams.away.clubName}
                      </div>
                      <div className="text-2xl font-bold">
                        {halftimeData.existingScore.awayScore}
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
                    : halftimeData.existingScore
                    ? "Modifier le score"
                    : "Enregistrer le score"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="flex justify-center py-8">
            <div className="text-sm text-muted-foreground">
              Impossible de charger les données du match
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}