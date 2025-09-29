"use client";

import { Pause, Play, Square } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { finishMatchAction } from "./finish-match.action";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

interface MatchPeriodType {
  id: number;
  name: string;
  numberPeriod: number;
  durationPeriod: number;
  extratimeNumberPeriod?: number | null;
  extratimeDurationPeriod?: number | null;
}

interface StopwatchProps {
  matchPeriod: MatchPeriodType;
  matchId: number;
  onMatchFinished: () => void;
}

export default function Stopwatch({ matchPeriod, matchId, onMatchFinished }: StopwatchProps) {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [time, setTime] = useState<number>(0); // temps en millisecondes
  const [currentPeriod, setCurrentPeriod] = useState<number>(1);
  const [isMatchFinished, setIsMatchFinished] = useState<boolean>(false);

  const { execute: finishMatch, isPending } = useAction(finishMatchAction, {
    onSuccess: () => {
      toast.success("Match terminé avec succès !");
      setIsMatchFinished(true);
      setIsRunning(false);
      onMatchFinished();
    },
    onError: (error) => {
      const errorMessage = typeof error.error.serverError === 'string'
        ? error.error.serverError
        : "Erreur lors de la fin du match";
      toast.error(errorMessage);
    },
  });

  // useEffect pour gérer le timer du chrono
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && !isMatchFinished) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1000);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isMatchFinished]);

  // Calculer les minutes et secondes à partir du temps écoulé
  const minutes = Math.floor(time / 60000);
  const seconds = Math.floor((time % 60000) / 1000);

  // Déterminer le texte du bouton de fin de période
  const getPeriodEndButtonText = () => {
    if (currentPeriod < matchPeriod.numberPeriod) {
      const periodNames = ["1ère", "2ème", "3ème", "4ème", "5ème"];
      return `Fin ${periodNames[currentPeriod - 1] || `${currentPeriod}ème`} période`;
    } else {
      return "Fin du match";
    }
  };

  // Gérer la fin d'une période
  const handlePeriodEnd = () => {
    if (currentPeriod < matchPeriod.numberPeriod) {
      // Fin de période, passer à la suivante
      const newTime = currentPeriod * matchPeriod.durationPeriod * 60000;
      setTime(newTime);
      setCurrentPeriod(currentPeriod + 1);
      setIsRunning(false);
      toast.success(`Fin de la ${currentPeriod === 1 ? '1ère' : `${currentPeriod}ème`} période`);
    } else {
      // Fin du match
      const totalTime = matchPeriod.numberPeriod * matchPeriod.durationPeriod * 60000;
      setTime(totalTime);
      setIsRunning(false);
      setIsMatchFinished(true);
      toast.success("Fin du match !");
    }
  };

  // Gérer la fin définitive du match
  const handleFinishMatch = () => {
    finishMatch({ matchId });
  };

  return (
    <div className="flex flex-col items-center justify-center text-white gap-4 p-4">
      {/* Affichage du temps écoulé */}
      <div className="text-4xl font-bold">
        {minutes.toString().padStart(2, "0")}:
        {seconds.toString().padStart(2, "0")}
      </div>
      
      {/* Indicateur de période */}
      <div className="text-sm opacity-80">
        Période {currentPeriod} / {matchPeriod.numberPeriod}
      </div>

      {/* Boutons de contrôle */}
      {!isMatchFinished ? (
        <div className="flex gap-2 flex-wrap justify-center">
          <Button
            onClick={isRunning ? () => setIsRunning(false) : () => setIsRunning(true)}
            size="sm"
            className="bg-white text-plaisir-primary hover:bg-gray-100"
          >
            {isRunning ? <Pause className="mr-1 h-4 w-4" /> : <Play className="mr-1 h-4 w-4" />}
            {isRunning ? "Stop" : "Start"}
          </Button>
          
          <Button
            onClick={handlePeriodEnd}
            size="sm"
            variant="outline"
            className="bg-transparent border-white text-white hover:bg-white hover:text-plaisir-primary"
          >
            <Square className="mr-1 h-4 w-4" />
            {getPeriodEndButtonText()}
          </Button>
        </div>
      ) : (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              size="sm"
              className="bg-red-600 text-white hover:bg-red-700"
            >
              <Square className="mr-1 h-4 w-4" />
              Terminer le match
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Terminer le match</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir mettre un terme définitif à ce match ? Cette action 
                ne pourra pas être annulée.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleFinishMatch} disabled={isPending}>
                Oui, terminer le match
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
