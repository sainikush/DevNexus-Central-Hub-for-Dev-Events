import mongoose, { Document, Schema, Types } from "mongoose";
import { Event } from "./event.model"; // Fixed import

interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const bookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
      index: true, // This creates the index automatically
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      validate: { validator: isValidEmail, message: "Invalid email format" },
      index: true, // This creates the index automatically
    },
  },
  { timestamps: true }
);

// Performance Indexes (Removed duplicates, kept the compound ones)
bookingSchema.index({ eventId: 1, createdAt: -1 });
bookingSchema.index({ eventId: 1, email: 1 }, { unique: true, name: "uniq_event_email" });

// Pre-save (FIXED: Removed 'next')
bookingSchema.pre("save", async function () {
  const eventExists = await Event.findById(this.eventId);
  if (!eventExists) {
    throw new Error(`Event with ID ${this.eventId} does not exist`);
  }
});

const Booking = mongoose.models.Booking || mongoose.model<IBooking>("Booking", bookingSchema);
export { Booking, type IBooking };