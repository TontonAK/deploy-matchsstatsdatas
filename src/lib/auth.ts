import { MatchStatResetPasswordEmail } from "@/components/emails/reset-password";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins/admin";
import { prisma } from "./prisma";
import { resend } from "./resend";

//const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    additionalFields: {
      lastname: {
        type: "string",
      },
      firstname: {
        type: "string",
      },
      slug: {
        type: "string",
      },
      clubId: {
        type: "number",
      },
      job: {
        type: "string",
        required: true,
        defaultValue: "Player",
      },
    },
  },
  appName: "matchs-stats-prc",
  plugins: [
    nextCookies(),
    admin({
      adminRoles: ["Admin", "Coach"],
    }),
  ],
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        to: user.email,
        from: "no-reply@mails.matchsstatslivecdn.com",
        subject: "Réinitialisation mot de passe",
        react: MatchStatResetPasswordEmail({
          user: user.name,
          resetPasswordLink: url,
        }),
      });
    },
    autoSignIn: false,
  },
});
