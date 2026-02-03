import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Event } from "@/database";
import { v2 as cloudinary } from "cloudinary";

// Fix: Handle undefined env vars safely
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { message: "Image file is required" },
        { status: 400 }
      );
    }

    // ✅ FIX: Safe Parsing for Tags and Agenda
    // This prevents the "SyntaxError: Unexpected token" crash
    const rawTags = formData.get("tags") as string;
    const rawAgenda = formData.get("agenda") as string;

    let tags = [];
    let agenda = [];

    try {
      tags = rawTags ? JSON.parse(rawTags) : [];
    } catch (e) {
      // If parsing fails, treat it as a comma-separated string
      tags = rawTags ? rawTags.split(',').map((t) => t.trim()) : [];
    }

    try {
      agenda = rawAgenda ? JSON.parse(rawAgenda) : [];
    } catch (e) {
      // If parsing fails, treat it as a single item
      agenda = rawAgenda ? [rawAgenda] : [];
    }

    // Upload Image to Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "DevEvent",
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        )
        .end(buffer);
    });

    // Create the event object
    const eventData: any = Object.fromEntries(formData.entries());

    // Assign the Cloudinary URL
    eventData.image = uploadResult.secure_url;

    // Create in MongoDB (using the safely parsed tags/agenda)
    const createdEvent = await Event.create({
      ...eventData,
      tags: tags,
      agenda: agenda,
    });

    return NextResponse.json(
      { message: "Event Created Successfully", event: createdEvent },
      { status: 201 }
    );
  } catch (e: any) {
    console.error(e);
    
    // Handle Duplicate Slug Error
    if (e.code === 11000) {
      return NextResponse.json(
        { message: "An event with this SLUG already exists. Please use a unique slug." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        message: "Event Creation Failed",
        error: e instanceof Error ? e.message : "Unknown Error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectToDatabase();

    const events = await Event.find().sort({ createdAt: -1 });
    return NextResponse.json(
      { message: "Events fetched successfully", events },
      { status: 200 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {
        message: "Failed to fetch events",
        error: e instanceof Error ? e.message : "Unknown Error",
      },
      { status: 500 }
    );
  }
}