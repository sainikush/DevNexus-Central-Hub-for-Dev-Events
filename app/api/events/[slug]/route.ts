import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Event, type IEvent } from "@/database";

// Type for dynamic route params in Next.js App Router
type RouteParams = { params: Promise<{ slug: string }> };

// Response types for consistent API responses
interface SuccessResponse {
  message: string;
  event: IEvent;
}

interface ErrorResponse {
  message: string;
  error?: string;
}

// Slug validation: alphanumeric, hyphens allowed, 1-200 chars
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 200;

function isValidSlug(slug: string): boolean {
  return (
    slug.length > 0 &&
    slug.length <= MAX_SLUG_LENGTH &&
    SLUG_REGEX.test(slug)
  );
}

/**
 * GET /api/events/[slug]
 * Fetches a single event by its unique slug identifier.
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    // Await params (required in Next.js 15+)
    const { slug } = await params;

    // Validate slug presence
    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        { message: "Slug parameter is required" },
        { status: 400 }
      );
    }

    // Trim and normalize slug
    const normalizedSlug = slug.trim().toLowerCase();

    // Validate slug format
    if (!isValidSlug(normalizedSlug)) {
      return NextResponse.json(
        {
          message: "Invalid slug format",
          error: "Slug must contain only lowercase letters, numbers, and hyphens",
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Query event by slug
const event = await Event.findOne({ slug: normalizedSlug })
  .select("-__v")
  .lean<IEvent>();


    // Handle not found
    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Event fetched successfully", event },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /api/events/[slug]] Error:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch event",
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
