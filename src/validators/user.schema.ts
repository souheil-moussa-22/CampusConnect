import { z } from "zod";

const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters.")
  .max(128, "Password must be at most 128 characters.")
  .regex(/[a-z]/, "Password must contain a lowercase letter.")
  .regex(/[A-Z]/, "Password must contain an uppercase letter.")
  .regex(/[0-9]/, "Password must contain a number.");

export const registerUserSchema = z
  .object({
    fullName: z.string().trim().min(1).max(120),
    email: z.string().trim().email().max(320).transform((email) => email.toLowerCase()),
    password: passwordSchema,
    passwordConfirmation: z.string(),
    specialty: z.string().trim().min(1).max(120),
    academicLevel: z.string().trim().min(1).max(80)
  })
  .refine((input) => input.password === input.passwordConfirmation, {
    message: "Passwords do not match.",
    path: ["passwordConfirmation"]
  });

export const createUserSchema = z.object({
  email: z.string().trim().email().max(320).transform((email) => email.toLowerCase()),
  password: passwordSchema
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
