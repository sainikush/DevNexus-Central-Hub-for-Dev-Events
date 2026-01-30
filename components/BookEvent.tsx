"use client";

import { useState } from "react";

const BookEvent = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setTimeout(() => {
        setSubmitted(true);
    }, 1000)}


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

export default BookEvent
