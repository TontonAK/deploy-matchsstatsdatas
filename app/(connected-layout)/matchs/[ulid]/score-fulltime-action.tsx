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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MatchResult } from "@/generated/prisma";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { scoreFulltimeAction } from "./score-fulltime.action";

const formSchema = z.object({
  homeScore: z.coerce.number().min(0, "Le score doit être positif ou nul"),
  awayScore: z.coerce.number().min(0, "Le score doit être positif ou nul"),
  result: z.nativeEnum(MatchResult, {
    errorMap: () => ({ message: "Le résultat du match est requis" }),
  }),
});

interface FulltimeData {
  matchId: number;
  canEdit: boolean;
  existingScore: {
    homeScore: number;
    awayScore: number;
    result: MatchResult;
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

interface ScoreFulltimeActionProps {
  ulid: string;
}

export function ScoreFulltimeAction({ ulid }: ScoreFulltimeActionProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fulltimeData, setFulltimeData] = useState<FulltimeData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      homeScore: 0,
      awayScore: 0,
      result: MatchResult.Draw,
    },
  });

  const fetchFulltimeData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/matchs/${ulid}/fulltime`);
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des données");
      }
      const data = await response.json();
      setFulltimeData(data);

      // Pré-remplir le formulaire avec les scores existants
      if (data.existingScore) {
        form.setValue("homeScore", data.existingScore.homeScore);
        form.setValue("awayScore", data.existingScore.awayScore);
        form.setValue("result", data.existingScore.result);
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la récupération des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && !fulltimeData) {
      fetchFulltimeData();
    }
  }, [open, fulltimeData, ulid]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!fulltimeData) return;

    setIsSubmitting(true);
    try {
      const result = await scoreFulltimeAction({
        matchId: fulltimeData.matchId,
        homeScore: values.homeScore,
        awayScore: values.awayScore,
        result: values.result,
      });

      if (result?.data?.success) {
        toast.success(result.data.message);
        setOpen(false);
        form.reset();
        // Rafraîchir la page pour mettre à jour l'affichage
        window.location.reload();
      } else {
        toast.error(result?.serverError || "Erreur lors de l'enregistrement");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur inattendue lors de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getResultOptions = () => {
    if (!fulltimeData) return [];

    return [
      {
        value: MatchResult.Home_Win,
        label: `Victoire ${fulltimeData.teams.home.clubName}`,
      },
      {
        value: MatchResult.Draw,
        label: "Match nul",
      },
      {
        value: MatchResult.Away_Win,
        label: `Victoire ${fulltimeData.teams.away.clubName}`,
      },
    ];
  };

  const getResultLabel = (result: MatchResult) => {
    if (!fulltimeData) return "";

    switch (result) {
      case MatchResult.Home_Win:
        return `Victoire ${fulltimeData.teams.home.clubName}`;
      case MatchResult.Away_Win:
        return `Victoire ${fulltimeData.teams.away.clubName}`;
      case MatchResult.Draw:
        return "Match nul";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-12" variant="outline">
          Score fin du match
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {fulltimeData?.existingScore
              ? "Modifier le score final"
              : "Saisir le score final"}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="text-sm text-muted-foreground">Chargement...</div>
          </div>
        ) : fulltimeData ? (
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
                          {fulltimeData.teams.home.clubName}
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
                          {fulltimeData.teams.away.clubName}
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

              <FormField
                control={form.control}
                name="result"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Résultat du match</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez le résultat" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getResultOptions().map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {fulltimeData.existingScore && (
                <div className="p-4 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground mb-2">
                    Score final actuel :
                  </p>
                  <div className="flex justify-center items-center gap-4 mb-3">
                    <div className="text-center">
                      <div className="font-semibold">
                        {fulltimeData.teams.home.clubName}
                      </div>
                      <div className="text-2xl font-bold">
                        {fulltimeData.existingScore.homeScore}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-muted-foreground">-</div>
                    <div className="text-center">
                      <div className="font-semibold">
                        {fulltimeData.teams.away.clubName}
                      </div>
                      <div className="text-2xl font-bold">
                        {fulltimeData.existingScore.awayScore}
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {getResultLabel(fulltimeData.existingScore.result)}
                    </span>
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
                    : fulltimeData.existingScore
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