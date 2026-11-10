import { z } from "zod";

export const helpRequestFilterSchema = z.object({
  subject: z.string().trim().min(1).max(100).optional(),
  academicLevel: z.string().trim().min(1).max(100).optional(),
  status: z.enum(["OPEN", "HELP_ACCEPTED", "COMPLETED"]).optional()
});

export const createHelpRequestSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(5000),
  subject: z.string().trim().min(1).max(100),
  academicLevel: z.string().trim().min(1).max(100),
  availability: z.string().trim().min(1).max(1000)
});

export type CreateHelpRequestInput = z.infer<typeof createHelpRequestSchema>;
