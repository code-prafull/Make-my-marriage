import mongoose from "mongoose";

const venueSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    googleMapsLink: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    wedding: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wedding",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Event name is required"],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1000,
    },
    date: {
      type: Date,
      required: [true, "Event date is required"],
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Start time must be HH:MM"],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "End time must be HH:MM"],
    },
    venue: { type: venueSchema, default: () => ({}) },
    instructions: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2000,
    },
    visibility: {
      type: String,
      enum: ["PUBLIC", "PRIVATE"],
      default: "PUBLIC",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

eventSchema.index({ wedding: 1, date: 1 });

export default mongoose.model("Event", eventSchema);
