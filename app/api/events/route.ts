import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Event } from "@/database";
import { v2 as cloudinary } from "cloudinary";

// Fix 2: Handle undefined env vars
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

    // Fix 1: Convert File to Buffer
    let tags = JSON.parse(formData.get("tags") as string || "[]");
    let agenda = JSON.parse(formData.get("agenda") as string || "[]");

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Fix 3: Add <any> type to Promise
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

    const eventData: any = Object.fromEntries(formData.entries());

    // Fix 3 continued: No need to cast 'as any' here anymore, but keeping it is fine
    eventData.image = uploadResult.secure_url;

    if (eventData.tags && typeof eventData.tags === 'string') {
        try { eventData.tags = JSON.parse(eventData.tags); } catch {}
    }
    if (eventData.agenda && typeof eventData.agenda === 'string') {
        try { eventData.agenda = JSON.parse(eventData.agenda); } catch {}
    }

    const createdEvent = await Event.create({
      ...eventData,
      tags: tags,
      agenda: agenda,
    });

    return NextResponse.json(
      { message: "Event Created Successfully", event: createdEvent },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
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