import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    venue: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, default: "" },
    country: { type: String, trim: true, default: "India" },
  },
  { _id: false }
);

const settingsSchema = new mongoose.Schema(
  {
    timezone: { type: String, default: "Asia/Kolkata" },
    currency: { type: String, default: "INR" },
    language: { type: String, default: "en" },
  },
  { _id: false }
);

const weddingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Wedding title is required"],
      trim: true,
      maxlength: 120,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    couple: {
      partnerOne: { type: String, trim: true, required: true },
      partnerTwo: { type: String, trim: true, required: true },
    },
    weddingDate: {
      type: Date,
      required: [true, "Wedding date is required"],
    },
    location: { type: locationSchema, default: () => ({}) },
    settings: { type: settingsSchema, default: () => ({}) },
    status: {
      type: String,
      enum: ["PLANNING", "ACTIVE", "COMPLETED", "ARCHIVED"],
      default: "PLANNING",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

/** URL-friendly slug: "Rahul & Priya Wedding" → "rahul-priya-wedding-a1b2c3" */
weddingSchema.statics.generateSlug = function generateSlug(title) {
  const base = title
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base || "wedding"}-${suffix}`;
};

export default mongoose.model("Wedding", weddingSchema);
