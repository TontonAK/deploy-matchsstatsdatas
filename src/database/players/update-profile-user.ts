import { prisma } from "@/lib/prisma";

interface UpdateProfileUserData {
  firstname: string;
  lastname: string;
  email: string;
}

export async function updateProfileUser(
  userId: string,
  data: UpdateProfileUserData
) {
  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        name: `${data.firstname} ${data.lastname}`,
        slug: `${data.firstname.toLowerCase()}-${data.lastname.toLowerCase()}`,
      },
    });

    return {
      success: true,
      user: updatedUser,
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour du profil",
    };
  }
}
