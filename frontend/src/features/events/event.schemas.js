import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const time = z
  .string()
  .trim()
  .regex(timeRegex, "Time must be in HH:MM format");

const venueSchema = z.object({
  name: z.string().trim().max(200).optional().default(""),
  address: z.string().trim().max(500).optional().default(""),
  googleMapsLink: z.string().trim().max(500).optional().default(""),
});

const baseEvent = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Event name must be at least 2 characters")
    .max(100, "Too long"),
  description: z.string().trim().max(1000).optional().default(""),
  date: z
    .string()
    .min(1, "Event date is required")
    .refine((v) => !Number.isNaN(new Date(v).getTime()), "Invalid date"),
  startTime: time,
  endTime: time,
  venue: venueSchema.optional(),
  instructions: z.string().trim().max(2000).optional().default(""),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).optional().default("PUBLIC"),
});

/** End time cannot be earlier than start time. */
export const eventSchema = baseEvent.refine(
  (data) => !data.startTime || !data.endTime || data.endTime >= data.startTime,
  {
    message: "End time cannot be earlier than start time",
    path: ["endTime"],
  }
);
