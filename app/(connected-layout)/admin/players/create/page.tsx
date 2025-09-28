import { getClubsWithTeams } from "@/database/players/get-clubs-with-teams";
import { getPositions } from "@/database/players/get-positions";
import { PlayerCreateForm } from "./player-create-form";

export default async function CreatePlayerPage() {
  // Récupérer les données nécessaires pour le formulaire
  const [clubsResult, positionsResult] = await Promise.all([
    getClubsWithTeams(),
    getPositions(),
  ]);

  if (!clubsResult.success || !positionsResult.success) {
    return (
      <div className="max-w-2xl mx-auto p-6 pt-15">
        <h1 className="text-2xl font-bold mb-6">Créer un nouveau joueur</h1>
        <p className="text-red-500">
          Erreur lors du chargement des données. Veuillez réessayer.
        </p>
      </div>
    );
  }

  return (
    <PlayerCreateForm 
      clubs={clubsResult.clubs} 
      positions={positionsResult.positions} 
    />
  );
}