import mongoose, { Document, Schema } from "mongoose";

// Event document interface for type safety
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

// Helper function to generate URL-friendly slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Helper function to normalize date to ISO format (YYYY-MM-DD)
function normalizeDateToISO(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date format");
  }
  return date.toISOString().split("T")[0];
}

// Helper function to normalize time format (HH:mm)
function normalizeTimeFormat(timeString: string): string {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(timeString.trim())) {
    throw new Error("Invalid time format. Use HH:mm format");
  }
  return timeString.trim();
}

// Mongoose schema definition
const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
      sparse: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    overview: {
      type: String,
      required: [true, "Overview is required"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    date: {
      type: String,
      required: [true, "Date is required"],
    },
    time: {
      type: String,
      required: [true, "Time is required"],
    },
    mode: {
      type: String,
      enum: {
        values: ["online", "offline", "hybrid"],
        message: "Mode must be one of: online, offline, or hybrid",
      },
      required: [true, "Mode is required"],
    },
    audience: {
      type: String,
      required: [true, "Audience is required"],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, "Agenda is required"],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: "Agenda must contain at least one item",
      },
    },
    organizer: {
      type: String,
      required: [true, "Organizer is required"],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, "Tags are required"],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: "Tags must contain at least one tag",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook: Generate slug from title, normalize date and time, validate required fields
eventSchema.pre("save", async function (next) {
  // Validate and normalize date to ISO format if modified
  if (this.isModified("date")) {
    try {
      this.date = normalizeDateToISO(this.date);
    } catch (error) {
      return next(error instanceof Error ? error : new Error("Invalid date"));
    }
  }

  // Validate and normalize time format if modified
  if (this.isModified("time")) {
    try {
      this.time = normalizeTimeFormat(this.time);
    } catch (error) {
      return next(error instanceof Error ? error : new Error("Invalid time"));
    }
  }

  // Generate or regenerate slug only if title changes
  if (this.isModified("title")) {
    this.slug = generateSlug(this.title);
  }

  next();
});

// Create or retrieve the Event model
const Event =
  mongoose.models.Event || mongoose.model<IEvent>("Event", eventSchema);

export type { IEvent };
export { Event };
