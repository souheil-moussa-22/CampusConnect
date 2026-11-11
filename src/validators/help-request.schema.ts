import { z } from "zod";

export const helpRequestStatusSchema = z.enum(["OPEN", "HELP_ACCEPTED", "COMPLETED"]);

const requestFields = {
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(5000),
  subject: z.string().trim().min(1).max(100),
  academicLevel: z.string().trim().min(1).max(100),
  availability: z.string().trim().min(1).max(1000)
};

export const createHelpRequestSchema = z.object(requestFields);
export const updateHelpRequestSchema = z.object(requestFields);

export const helpRequestFilterSchema = z.object({
  search: z.string().trim().max(200).optional(),
  subject: z.string().trim().min(1).max(100).optional(),
  academicLevel: z.string().trim().min(1).max(100).optional(),
  status: helpRequestStatusSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  sort: z.enum(["newest", "oldest"]).default("newest")
});

export type CreateHelpRequestInput = z.infer<typeof createHelpRequestSchema>;
export type UpdateHelpRequestInput = z.infer<typeof updateHelpRequestSchema>;
export type HelpRequestFilters = Partial<z.infer<typeof helpRequestFilterSchema>> & { authorId?: string };
