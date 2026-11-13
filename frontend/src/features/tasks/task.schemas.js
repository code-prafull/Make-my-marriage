import { z } from "zod";

/** Optional ObjectId — empty string (unselected) becomes undefined. */
const objectId = z
  .string()
  .trim()
  .refine((v) => v === "" || /^[0-9a-fA-F]{24}$/.test(v), "Invalid selection")
  .transform((v) => (v === "" ? undefined : v))
  .optional();

/** POST /api/v1/weddings/:weddingId/tasks request schema */
export const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Task title must be at least 2 characters")
    .max(150, "Too long"),
  description: z.string().trim().max(2000).optional().default(""),
  event: objectId.optional(),
  assignee: objectId.optional(),
  dueDate: z.string().optional().default(""),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional().default("MEDIUM"),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]).optional().default("TODO"),
});
