"use client";

import { useState } from "react";
import { createBooking } from "../lib/actions/bookingactions";
import posthog from "posthog-js";

const BookEvent = ({
  eventId,
  slug,
}: {
  eventId: string;
  slug: string;
}) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    const { success, error } = await createBooking({
      eventId,
      slug,
      email,
    });

    if (success) {
      setSubmitted(true);
      posthog.capture("event_booked", { eventId, slug, email });
    } else {
      console.error("Booking failed", error);
      posthog.captureException(error);
    }
  };

  return (
    <div id="book-event">
      {submitted ? (
        <p className="test-sm">Thank you for signing up!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              value={email}
              id="email"
              placeholder="Enter your email Address"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button type="submit" className="button-submit">Submit</button>
        </form>
      )}
    </div>
  );
};

export default BookEvent;
