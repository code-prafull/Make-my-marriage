import { z } from "zod";

const optionalEmail = z
  .string()
  .trim()
  .max(200, "Too long")
  .refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Enter a valid email");

const optionalPhone = z
  .string()
  .trim()
  .max(20, "Too long")
  .refine((v) => v === "" || /^[+]?[\d\s-]{5,20}$/.test(v), "Enter a valid phone number");

/** Create / edit guest form (frontend sends the full object both times). */
export const guestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Guest name must be at least 2 characters")
    .max(100, "Too long"),
  email: optionalEmail,
  phone: optionalPhone,
  familyGroup: z.string().trim().max(100).optional(),
  side: z.enum(["BRIDE", "GROOM", "COMMON"]),
  eventIds: z.array(z.string()).optional(),
  notes: z.string().trim().max(1000).optional(),
});

/** Invite form — pick which events the guest is invited to. */
export const inviteSchema = z.object({
  guestId: z.string().min(1),
  eventIds: z.array(z.string()).min(1, "Select at least one event"),
});

export const guestSideTone = { BRIDE: "amber", GROOM: "wine", COMMON: "green" };
export const guestSideLabel = { BRIDE: "Bride's side", GROOM: "Groom's side", COMMON: "Both" };
