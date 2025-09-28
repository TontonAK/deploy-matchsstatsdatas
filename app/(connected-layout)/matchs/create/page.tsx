import { getMatchFormData } from "@/database/matchs/create-match";
import { getRequiredUser } from "@/lib/auth-session";
import { MatchCreateForm } from "./match-create-form";

export default async function CreateMatchPage() {
  const user = await getRequiredUser();

  /*if (user.role !== "admin" || (user.job !== "Coach" && user.job !== "Admin")) {
    redirect("/matchs");
  }*/

  // Récupérer les données nécessaires au formulaire
  const formDataResult = await getMatchFormData();

  if (!formDataResult.success) {
    throw new Error(formDataResult.error);
  }

  const {
    teams,
    leagues,
    leaguePools,
    matchTypes,
    periodTypes,
    statTypes,
    stadiums,
  } = formDataResult.data!;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl pt-15">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Créer un nouveau match</h1>
        <p className="text-muted-foreground">
          Configurez les détails de votre prochain match et sélectionnez les
          statistiques à suivre.
        </p>
      </div>

      <MatchCreateForm
        teams={teams}
        leagues={leagues}
        leaguePools={leaguePools}
        matchTypes={matchTypes}
        periodTypes={periodTypes}
        statTypes={statTypes}
        stadiums={stadiums}
      />
    </div>
  );
}
