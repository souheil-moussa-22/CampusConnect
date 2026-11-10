import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().trim().email().max(320).transform((email) => email.toLowerCase()),
  password: z.string().min(12).max(128)
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
