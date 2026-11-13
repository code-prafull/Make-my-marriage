import { z } from "zod";

const objectId = z
  .string()
  .trim()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

// Field definitions WITHOUT defaults — reused by the update schema so a
// partial PATCH never re-applies create-time defaults (priority/status/description).
const fields = {
  title: z.string().trim().min(2, "Task title must be at least 2 characters").max(150),
  description: z.string().trim().max(2000),
  event: objectId.nullish(),
  assignee: objectId.nullish(),
  dueDate: z.coerce.date().nullish(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]),
};

/** POST /weddings/:weddingId/tasks */
export const createTaskSchema = z.object({
  title: fields.title,
  description: fields.description.optional().default(""),
  event: fields.event,
  assignee: fields.assignee,
  dueDate: fields.dueDate,
  priority: fields.priority.optional().default("MEDIUM"),
  status: fields.status.optional().default("TODO"),
});

/** PATCH /weddings/:weddingId/tasks/:taskId — every field optional, no defaults */
export const updateTaskSchema = z.object({
  title: fields.title.optional(),
  description: fields.description.optional(),
  event: fields.event,
  assignee: fields.assignee,
  dueDate: fields.dueDate,
  priority: fields.priority.optional(),
  status: fields.status.optional(),
});

export const taskParams = z.object({
  weddingId: objectId,
  taskId: objectId,
});

export const taskListQuery = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  event: objectId.optional(),
  assignee: objectId.optional(),
  overdue: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  sortBy: z.enum(["dueDate", "createdAt", "title"]).optional().default("createdAt"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
});
