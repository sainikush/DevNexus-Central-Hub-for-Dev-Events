'use server';

import connectToDatabase from "@/lib/mongodb";
import { Event } from "@/database/event.model";

export const getSimilarEventsBySlug = async (slug: string) => {
    try {
        await connectToDatabase();
        
        // 1. Find the current event to get its tags
        const event = await Event.findOne({ slug });

        // Safety Check: If event isn't found, return empty array immediately
        if (!event) return [];

        // 2. Find similar events
        const similarEvents = await Event.find({
            _id: { $ne: event._id },       // Exclude current event
            tags: { $in: event.tags }      // Match ANY of the tags
        })
        .sort({ createdAt: -1 })           // Optional: Show newest first
        .limit(3)                          // Optional: Limit to 3 suggestions
        .lean();                           // Convert to plain object (Faster)

        return similarEvents;
    } catch (error) {
        console.error(error);
        return [];
    }
}