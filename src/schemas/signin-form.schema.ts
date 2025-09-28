import { z } from "zod";

export const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  rememberMe: z.boolean(),
});

export type SignInFormSchema = z.infer<typeof SignInSchema>;
