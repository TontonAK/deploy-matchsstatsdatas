import { z } from "zod";

export const RequestResetPasswordSchema = z.object({
  email: z.string().email("Email invalide"),
});

export const ResetPasswordSchema = z.object({
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export type RequestResetPasswordFormSchema = z.infer<typeof RequestResetPasswordSchema>;
export type ResetPasswordFormSchema = z.infer<typeof ResetPasswordSchema>;