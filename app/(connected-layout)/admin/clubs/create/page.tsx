import { getClubFormData } from "@/database/clubs/create-club";
import { ClubCreateForm } from "./club-create-form";

export default async function CreateClubPage() {
  // Récupérer les données nécessaires au formulaire
  const formDataResult = await getClubFormData();

  if (!formDataResult.success || !formDataResult.data) {
    throw new Error(formDataResult.error || "Failed to load form data");
  }

  const { leagues, leaguePools } = formDataResult.data;

  return <ClubCreateForm leagues={leagues} leaguePools={leaguePools} />;
}
