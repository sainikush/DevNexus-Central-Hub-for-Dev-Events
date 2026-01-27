import mongoose, { Document, Schema, Types } from "mongoose";
import { Event } from "./event.model";

// Booking document interface for type safety
interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Mongoose schema definition
const bookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      validate: {
        validator: isValidEmail,
        message: "Invalid email format",
      },
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ============================
   Indexes for Performance
   ============================ */

// Faster lookups by event
bookingSchema.index({ eventId: 1 });

// Optimized queries for event bookings sorted by newest first
bookingSchema.index({ eventId: 1, createdAt: -1 });

// Faster user booking lookups
bookingSchema.index({ email: 1 });

// Enforce one booking per event per email (business rule)
bookingSchema.index(
  { eventId: 1, email: 1 },
  {
    unique: true,
    name: "uniq_event_email",
  }
);

/* ============================
   Pre-save Validation
   ============================ */

// Ensure the referenced event exists before saving booking
bookingSchema.pre("save", async function (next) {
  try {
    const eventExists = await Event.findById(this.eventId);

    if (!eventExists) {
      throw new Error(`Event with ID ${this.eventId} does not exist`);
    }

    next();
  } catch (error) {
    next(error instanceof Error ? error : new Error("Event validation failed"));
  }
});

// Create or retrieve the Booking model (Next.js safe)
const Booking =
  mongoose.models.Booking ||
  mongoose.model<IBooking>("Booking", bookingSchema);

export type { IBooking };
export { Booking };
