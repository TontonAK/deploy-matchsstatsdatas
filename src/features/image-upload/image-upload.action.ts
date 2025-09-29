"use server";

import { getRequiredUser } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { uploadFileToS3 } from "./awss3.utils";

export const updateImageAction = async (formData: FormData) => {
  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new Error("No file provided");
  }

  // Si le fichier fait + de 5 Mb, alors erreur
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File size must be less than 5MB");
  }

  const user = await getRequiredUser();
  const player = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
  });

  if (!player) {
    throw new Error("Player not found");
  }

  const url = await uploadFileToS3({
    file,
    prefix: `players/${player.id}`,
    fileName: `${player.slug}`,
  });

  if (!url) {
    throw new Error("Failed to upload file");
  }

  await prisma.user.update({
    where: {
      id: player.id,
    },
    data: {
      image: url,
    },
  });

  return url;
};
