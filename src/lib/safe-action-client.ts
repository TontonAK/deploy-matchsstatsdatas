import { createSafeActionClient } from "next-safe-action";
import { getRequiredUser } from "./auth-session";
import { ApplicationError, SafeActionError } from "./errors";

export const actionClient = createSafeActionClient({
  handleServerError: (error) => {
    if (error instanceof SafeActionError) {
      return { message: error.message };
    }

    if (error instanceof ApplicationError) {
      return { message: error.message, type: error.type };
    }

    console.error(error);

    return { message: "Une erreur est survenue." };
  },
});

export const actionUser = actionClient.use(async ({ next }) => {
  const user = await getRequiredUser();

  if (!user) {
    throw new SafeActionError("Invalid user");
  }

  return next({ ctx: { user } });
});
