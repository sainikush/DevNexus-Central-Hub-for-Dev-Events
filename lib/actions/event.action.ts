'use server';

import connectToDatabase from "@/lib/mongodb";
import { Event } from "@/database"; // ⚠️ Check this path matches your file structure

// 1. Get ALL events (for Home Page)
export const getAllEvents = async () => {
    try {
        await connectToDatabase();
        const events = await Event.find().sort({ createdAt: -1 });
        return JSON.parse(JSON.stringify(events));
    } catch (error) {
        console.error(error);
        return [];
    }
}

// 2. Get SINGLE event (for Details Page)
export const getEventBySlug = async (slug: string) => {
    try {
        await connectToDatabase();
        const event = await Event.findOne({ slug });
        return JSON.parse(JSON.stringify(event)); // Fixes "Plain Object" warning
    } catch (error) {
        console.error(error);
        return null;
    }
}

// 3. Get SIMILAR events (Your code!)
export const getSimilarEventsBySlug = async (slug: string) => {
    try {
        await connectToDatabase();
        
        const event = await Event.findOne({ slug });
        if (!event) return [];

        const similarEvents = await Event.find({
            _id: { $ne: event._id },       // Exclude current event
            tags: { $in: event.tags }      // Match ANY of the tags
        })
        .sort({ createdAt: -1 })
        .limit(3)
        .lean();

        return JSON.parse(JSON.stringify(similarEvents));
    } catch (error) {
        console.error(error);
        return [];
    }
}