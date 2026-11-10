import { z } from "zod";

export const profileUpdateSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  specialty: z.string().trim().min(1).max(120),
  academicLevel: z.string().trim().min(1).max(80),
  bio: z.string().trim().max(1000),
  availability: z.string().trim().max(500)
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
