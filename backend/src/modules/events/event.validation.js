import { z } from "zod";

const objectId = z
  .string()
  .trim()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

const time = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:MM format (24h)");

const venueSchema = z.object({
  name: z.string().trim().max(200).optional().default(""),
  address: z.string().trim().max(500).optional().default(""),
  googleMapsLink: z
    .string()
    .trim()
    .max(500)
    .optional()
    .default(""),
});

// Field definitions WITHOUT defaults — reused by the update schema so a
// partial PATCH never re-applies create-time defaults (e.g. visibility).
const fields = {
  name: z.string().trim().min(2, "Event name must be at least 2 characters").max(100),
  description: z.string().trim().max(1000),
  date: z.coerce.date({ error: "A valid event date is required" }),
  startTime: time,
  endTime: time,
  venue: venueSchema,
  instructions: z.string().trim().max(2000),
  visibility: z.enum(["PUBLIC", "PRIVATE"]),
};

// Business rule: end time cannot be earlier than start time (same day event)
function validateTimeRange(data) {
  if (data.startTime && data.endTime && data.endTime < data.startTime) {
    return false;
  }
  return true;
}

/** POST /weddings/:weddingId/events */
export const createEventSchema = z
  .object({
    name: fields.name,
    description: fields.description.optional().default(""),
    date: fields.date,
    startTime: fields.startTime,
    endTime: fields.endTime,
    venue: fields.venue.optional(),
    instructions: fields.instructions.optional().default(""),
    visibility: fields.visibility.optional().default("PUBLIC"),
  })
  .refine(validateTimeRange, {
    message: "End time cannot be earlier than start time",
    path: ["endTime"],
  });

/** PATCH /weddings/:weddingId/events/:eventId — every field optional, no defaults */
export const updateEventSchema = z
  .object({
    name: fields.name.optional(),
    description: fields.description.optional(),
    date: fields.date.optional(),
    startTime: fields.startTime.optional(),
    endTime: fields.endTime.optional(),
    venue: fields.venue.optional(),
    instructions: fields.instructions.optional(),
    visibility: fields.visibility.optional(),
  })
  .refine(validateTimeRange, {
    message: "End time cannot be earlier than start time",
    path: ["endTime"],
  });

export const eventParams = z.object({
  weddingId: objectId,
  eventId: objectId,
});

export const eventListQuery = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.enum(["UPCOMING", "PAST"]).optional(),
  sortBy: z.enum(["date", "name", "createdAt"]).optional().default("date"),
  order: z.enum(["asc", "desc"]).optional().default("asc"),
});
