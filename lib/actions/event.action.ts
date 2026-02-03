'use server';

import connectToDatabase from "@/lib/mongodb";
// ✅ FIX: Pointing directly to the model file to avoid import errors
import { Event } from "@/database/event.model"; 

export const getAllEvents = async () => {
    try {
        await connectToDatabase();
        const events = await Event.find().sort({ createdAt: -1 });
        return JSON.parse(JSON.stringify(events));
    } catch (error) {
        console.error("Error fetching all events:", error);
        return [];
    }
}

export const getEventBySlug = async (slug: string) => {
    try {
        await connectToDatabase();
        const event = await Event.findOne({ slug });
        if (!event) return null;
        return JSON.parse(JSON.stringify(event));
    } catch (error) {
        console.error("Error fetching event by slug:", error);
        return null;
    }
}

export const getSimilarEventsBySlug = async (slug: string) => {
    try {
        await connectToDatabase();
        
        const event = await Event.findOne({ slug });
        if (!event) return [];

        const similarEvents = await Event.find({
            _id: { $ne: event._id },
            tags: { $in: event.tags }
        })
        .sort({ createdAt: -1 })
        .limit(3)
        .lean();

        return JSON.parse(JSON.stringify(similarEvents));
    } catch (error) {
        console.error("Error fetching similar events:", error);
        return [];
    }
}