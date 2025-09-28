import { getMatchLineupData } from "@/database/matches/get-match-lineup-data";
import { notFound } from "next/navigation";
import { LineoutStatCreateClient } from "./lineout-stat-create-client";
import { KickStatCreateClient } from "./kick-stat-create-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface DetailedStatCreatePageProps {
  params: Promise<{ ulid: string }>;
  searchParams: Promise<{ action?: string }>;
}

export default async function DetailedStatCreatePage({
  params,
  searchParams,
}: DetailedStatCreatePageProps) {
  const { ulid } = await params;
  const { action } = await searchParams;
  
  const result = await getMatchLineupData(ulid);

  if (!result.success || !result.match) {
    notFound();
  }

  // Gérer les différents types d'action
  switch (action) {
    case "lineout":
      return <LineoutStatCreateClient matchData={result.match} matchUlid={ulid} />;
    
    case "kick":
      return <KickStatCreateClient matchData={result.match} matchUlid={ulid} />;
    
    default:
      // Si action n'est pas valide ou manquante, afficher une erreur avec boutons de retour
      return (
        <div className="container max-w-4xl mx-auto pt-15">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Type d'action non spécifié
            </h1>
            <p className="text-muted-foreground">
              Match: {result.match.homeTeam.club.name} vs{" "}
              {result.match.awayTeam.club.name}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Erreur</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Vous devez spécifier le type d'action à créer. Veuillez choisir une option :
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Button asChild>
                    <Link href={`/matchs/${ulid}/detailed-stat-create?action=lineout`}>
                      Créer une statistique de touche
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline">
                    <Link href={`/matchs/${ulid}/detailed-stat-create?action=kick`}>
                      Créer une statistique de coup de pied
                    </Link>
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <Button asChild variant="ghost">
                    <Link href={`/matchs/${ulid}`}>
                      ← Retour au détail du match
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
  }
}
