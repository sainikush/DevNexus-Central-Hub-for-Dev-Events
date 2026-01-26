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
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook: Validate that the referenced event exists
bookingSchema.pre("save", async function (next) {
  try {
    // Check if the referenced event exists in the database
    const eventExists = await Event.findById(this.eventId);

    if (!eventExists) {
      throw new Error(`Event with ID ${this.eventId} does not exist`);
    }

    next();
  } catch (error) {
    next(error instanceof Error ? error : new Error("Event validation failed"));
  }
});

// Create or retrieve the Booking model
const Booking =
  mongoose.models.Booking ||
  mongoose.model<IBooking>("Booking", bookingSchema);

export type { IBooking };
export { Booking };
