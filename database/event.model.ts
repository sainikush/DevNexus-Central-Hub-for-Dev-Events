import mongoose, { Document, Schema } from "mongoose";

// Event document interface
interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: "online" | "offline" | "hybrid";
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Helper functions
function generateSlug(title: string): string {
  return title.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

function normalizeDateToISO(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) throw new Error("Invalid date format");
  return date.toISOString().split("T")[0];
}

function normalizeTimeFormat(timeString: string): string {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(timeString.trim())) throw new Error("Invalid time format. Use HH:mm format");
  return timeString.trim();
}

// Schema
const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: [true, "Title is required"], trim: true },
    slug: { type: String, unique: true, index: true, sparse: true },
    description: { type: String, required: [true, "Description is required"], trim: true },
    overview: { type: String, required: [true, "Overview is required"], trim: true },
    image: { type: String, required: [true, "Image URL is required"], trim: true },
    venue: { type: String, required: [true, "Venue is required"], trim: true },
    location: { type: String, required: [true, "Location is required"], trim: true },
    date: { type: String, required: [true, "Date is required"] },
    time: { type: String, required: [true, "Time is required"] },
    mode: {
      type: String,
      enum: { values: ["online", "offline", "hybrid"], message: "Mode must be one of: online, offline, or hybrid" },
      required: [true, "Mode is required"],
    },
    audience: { type: String, required: [true, "Audience is required"], trim: true },
    agenda: { type: [String], required: [true, "Agenda is required"] },
    organizer: { type: String, required: [true, "Organizer is required"], trim: true },
    tags: { type: [String], required: [true, "Tags is required"] },
  },
  { timestamps: true }
);

// Pre-save hook (FIXED: Removed 'next' to prevent errors)
eventSchema.pre("save", async function () {
  if (this.isModified("date")) {
    try { this.date = normalizeDateToISO(this.date); } catch (e) { throw e; }
  }
  if (this.isModified("time")) {
    try { this.time = normalizeTimeFormat(this.time); } catch (e) { throw e; }
  }
  if (this.isModified("title")) {
    this.slug = generateSlug(this.title);
  }
});

// FIXED: Export as Named Export
const Event = mongoose.models.Event || mongoose.model<IEvent>("Event", eventSchema);
export { Event, type IEvent };