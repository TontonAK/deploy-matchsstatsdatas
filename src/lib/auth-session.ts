import { headers } from "next/headers";
import { auth } from "./auth"; // path to your Better Auth server instance
import { unauthorized } from "next/navigation";

export const getUser = async () => {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });

  return session?.user;
};

export const getRequiredUser = async () => {
  const user = await getUser();

  if (!user) unauthorized();

  return user;
};
