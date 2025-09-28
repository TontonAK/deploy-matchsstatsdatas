import { createAuthClient } from "better-auth/client";
import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";
import { auth } from "./auth";
import { getServerUrl } from "./server-url";

export const authClient = createAuthClient({
  baseURL: getServerUrl(),
  plugins: [inferAdditionalFields<typeof auth>(), adminClient()],
});

export const { useSession, signIn, signUp, signOut, admin } = authClient;
