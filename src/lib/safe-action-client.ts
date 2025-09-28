import { createSafeActionClient } from "next-safe-action";
import { getRequiredUser } from "./auth-session";

export class SafeError extends Error {
  constructor(error: string) {
    super(error);
  }
}

export const actionClient = createSafeActionClient({
  handleServerError: (error) => {
    if (error instanceof SafeError) {
      return error.message;
    }

    return "Une erreur est survenue.";
  },
});

export const actionUser = actionClient.use(async ({ next }) => {
  const user = await getRequiredUser();

  if (!user) {
    throw new SafeError("Invalid user");
  }

  return next({ ctx: { user } });
});
