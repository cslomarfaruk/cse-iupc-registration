import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, phone, teamName, members, eventId } = body;
    
    if (!email || !eventId) {
      return NextResponse.json(
        { message: "Email and eventId are required" },
        { status: 400 }
      );
    }
    
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });
    
    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }
    
    if (new Date() > new Date(event.endDate)) {
      return NextResponse.json(
        { message: "Registration for this event has closed" },
        { status: 400 }
      );
    }
    
    const registration = await prisma.registration.create({
      data: {
        email,
        phone,
        teamName,
        members: {
          create: members.filter(m => m.name.trim() !== "").map(member => ({
            name: member.name
          }))
        },
        event: {
          connect: { id: eventId }
        }
      }
    });
    
    return NextResponse.json({ 
      message: "Registration successful",
      registrationId: registration.id
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Failed to process registration" },
      { status: 500 }
    );
  }
}