import { getRequiredUser } from "@/lib/auth-session";
import { ProfileForm } from "./profile-form";

export default async function UserProfilePage() {
  const user = await getRequiredUser();

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl pt-15">
      <h1 className="text-3xl font-bold mb-8">Modifier mon profil</h1>

      <div className="space-y-8">
        {/* Profile Form avec Image Upload intégré */}
        <ProfileForm user={user} />
      </div>
    </div>
  );
}
