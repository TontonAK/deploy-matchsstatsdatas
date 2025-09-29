"use client";

import { Button } from "@/components/ui/button";
import { MatchStats } from "@/hooks/use-match-data";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { BestWorstPlayerElection } from "./best-worst-player-election-action";
import { ScoreFulltimeAction } from "./score-fulltime-action";
import { ScoreHalftimeAction } from "./score-halftime-action";
import { validateMatchStatsAction } from "./validate-stats.action";

interface AdminCoachActionsProps {
  matchData: MatchStats;
  user: {
    id: string;
    role?: string | null;
    job: string;
  };
  ulid: string;
}

export function AdminCoachActions({
  matchData,
  user,
  ulid,
}: AdminCoachActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [isValidating, setIsValidating] = useState(false);

  const matchStatus = matchData.match.status;
  const matchEndingStatus = matchData.match.endingStatus;
  const isAdmin = user.job === "Admin" || user.role === "admin";

  const handleValidateStats = async () => {
    if (isValidating) return;

    setIsValidating(true);
    startTransition(async () => {
      try {
        const result = await validateMatchStatsAction({
          matchId: matchData.matchId,
        });

        if (result?.data?.success) {
          toast.success("Statistiques validées avec succès");
          // Rafraîchir la page pour mettre à jour l'état
          window.location.reload();
        } else {
          const errorMessage = typeof result?.serverError === 'string'
            ? result.serverError
            : "Erreur lors de la validation";
          toast.error(errorMessage);
        }
      } catch {
        toast.error("Erreur inattendue lors de la validation");
      } finally {
        setIsValidating(false);
      }
    });
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold text-center mb-6">
        Actions de gestion
      </h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Status: Planned */}
        {matchStatus === "Planned" && (
          <>
            {/* Bouton Composition (visible pour tous les utilisateurs autorisés) */}
            <Button asChild className="h-12">
              <Link href={`/matchs/${ulid}/lineup`}>Composition</Link>
            </Button>

            {/* Bouton Modifier match (uniquement pour Admin) */}
            {isAdmin && (
              <Button asChild variant="outline" className="h-12">
                <Link href={`/matchs/${ulid}/edit`}>Modifier match</Link>
              </Button>
            )}

            {/* Bouton Live (uniquement pour Admin) */}
            {isAdmin && (
              <Button asChild variant="secondary" className="h-12">
                <Link href={`/matchs/${ulid}/live`}>Live</Link>
              </Button>
            )}
          </>
        )}

        {/* Status: Live */}
        {matchStatus === "Live" && isAdmin && (
          <Button asChild variant="secondary" className="h-12">
            <Link href={`/matchs/${ulid}/live`}>Live</Link>
          </Button>
        )}

        {/* Status: Finish ET endingStatus: Stat_Not_Sending */}
        {matchStatus === "Finish" &&
          matchEndingStatus === "Stat_Not_Sending" &&
          isAdmin && (
            <Button
              onClick={handleValidateStats}
              disabled={isPending || isValidating}
              variant="default"
              className="h-12"
            >
              {isValidating
                ? "Validation en cours..."
                : "Valider les statistiques"}
            </Button>
          )}

        <Button asChild className="h-12">
          <Link href={`/matchs/${ulid}/detailed-stat-create?action=lineout`}>
            Créer stat touche
          </Link>
        </Button>

        <Button asChild className="h-12">
          <Link href={`/matchs/${ulid}/detailed-stat-create?action=kick`}>
            Créer stat coup de pied
          </Link>
        </Button>

        {/* Score mi-temps */}
        <ScoreHalftimeAction ulid={ulid} />

        {/* Score fin du match */}
        <ScoreFulltimeAction ulid={ulid} />

        {/* Élection Greg of the match & Boulichon */}
        {matchStatus === "Finish" &&
          matchEndingStatus === "Stat_Not_Sending" && (
            <BestWorstPlayerElection ulid={ulid} />
          )}
      </div>

      {/* Message d'information si aucune action disponible */}
      {matchStatus === "Finish" && matchEndingStatus === "Stat_Send" && (
        <div className="text-center text-muted-foreground">
          <p>Les statistiques de ce match ont été validées.</p>
        </div>
      )}

      {matchStatus === "Live" && !isAdmin && (
        <div className="text-center text-muted-foreground">
          <p>Seuls les administrateurs peuvent gérer le live du match.</p>
        </div>
      )}
    </div>
  );
}
