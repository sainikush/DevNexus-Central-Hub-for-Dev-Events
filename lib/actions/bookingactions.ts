'use server';

import connectToDatabase from "@/lib/mongodb";
import { Booking } from "@/database/booking.model";

export const createBooking = async ({ eventId, slug, email }: { eventId: string, slug: string, email: string }) => {
  try {
    await connectToDatabase();

    // 1. Fix: Remove .lean() from .create()
    const newBooking = await Booking.create({ eventId, slug, email });

    // 2. Fix: Manually convert to plain object so it can be sent to the client
    const booking = JSON.parse(JSON.stringify(newBooking));

    return { success: true, booking };
  } catch (error: any) {
    // 3. Fix: Handle "Duplicate Key" error (Code 11000)
    if (error.code === 11000) {
        return { success: false, message: "You have already booked this event!" };
    }

    console.error('Error booking failed', error);
    return { success: false, message: "Booking failed. Please try again." };
  }
}