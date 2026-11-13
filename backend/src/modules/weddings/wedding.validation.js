import { z } from "zod";

const locationSchema = z.object({
  venue: z.string().trim().max(200).optional().default(""),
  city: z.string().trim().max(100).optional().default(""),
  state: z.string().trim().max(100).optional().default(""),
  country: z.string().trim().max(100).optional().default("India"),
});

export const createWeddingSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(120),
  couple: z.object({
    partnerOne: z.string().trim().min(1, "Partner one name is required").max(60),
    partnerTwo: z.string().trim().min(1, "Partner two name is required").max(60),
  }),
  weddingDate: z.coerce.date({ error: "Wedding date is required" }),
  location: locationSchema.optional(),
});

export const updateWeddingSchema = createWeddingSchema
  .partial()
  .omit({ couple: true })
  .extend({
    couple: z
      .object({
        partnerOne: z.string().trim().min(1).max(60).optional(),
        partnerTwo: z.string().trim().min(1).max(60).optional(),
      })
      .optional(),
  });

export const weddingIdParams = z.object({
  weddingId: z.string().trim().min(1, "Wedding id is required"),
});
