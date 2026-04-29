// app/api/events/[slug]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(_req, context) {
  const slug = context.params.slug;

  try {
    const event = await prisma.event.findUnique({
      where: { slug },
      include: {
        organizers: {
          include: {
            organizer: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (err) {
    console.error("Error fetching event:", err);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}
