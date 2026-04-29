// API route: /api/admin/events/route.js
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

export async function GET(request) {
  const token = request.cookies.get("authToken")?.value;
  
  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const events = await prisma.event.findMany({
      include: {
        rules: true,
        registrations: {
          include: {
            members: true
          }
        }
      }
    });
    
    return Response.json({ events });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request) {
  const token = request.cookies.get("authToken")?.value;
  
  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const data = await request.json();
    
    // Ensure dates are properly formatted
    const eventData = {
      title: data.title,
      slug: data.slug || data.title.toLowerCase().replace(/\s+/g, '-'),
      description: data.description || '',
      prizeMoney: data.prizeMoney || '',
      fee: data.fee || '',
      venue: data.venue || '',
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      image: data.image || ''
    };
    
    const event = await prisma.event.create({
      data: {
        ...eventData,
        rules: {
          create: data.rules || []
        }
      }
    });
    
    return Response.json({ event }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return Response.json({ error: 'Failed to create event' }, { status: 500 });
  }
}