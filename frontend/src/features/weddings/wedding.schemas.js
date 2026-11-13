import { z } from "zod";

/** POST /api/v1/weddings request schema (mirrors backend wedding.validation.js) */
export const createWeddingSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(120, "Title must be at most 120 characters"),
  couple: z.object({
    partnerOne: z
      .string()
      .trim()
      .min(1, "Partner's name is required")
      .max(60, "Too long"),
    partnerTwo: z
      .string()
      .trim()
      .min(1, "Partner's name is required")
      .max(60, "Too long"),
  }),
  weddingDate: z
    .string()
    .min(1, "Wedding date is required")
    .refine((v) => !Number.isNaN(new Date(v).getTime()), "Invalid date"),
  location: z.object({
    venue: z.string().trim().max(200).optional().default(""),
    city: z.string().trim().max(100).optional().default(""),
    state: z.string().trim().max(100).optional().default(""),
    country: z.string().trim().max(100).optional().default("India"),
  }),
});
