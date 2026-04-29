// API route: /api/admin/events/[id]/route.js
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  const token = request.cookies.get("authToken")?.value;
  
  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { id } = params;
    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) },
      include: {
        rules: true,
        registrations: {
          include: {
            members: true
          }
        }
      }
    });
    
    if (!event) {
      return Response.json({ error: 'Event not found' }, { status: 404 });
    }
    
    return Response.json({ event });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const token = request.cookies.get("authToken")?.value;
  
  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { id } = params;
    const data = await request.json();
    
    // Delete existing rules to replace them
    await prisma.rule.deleteMany({
      where: { eventId: parseInt(id) }
    });
    
    // Update the event with new data
    const event = await prisma.event.update({
      where: { id: parseInt(id) },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        prizeMoney: data.prizeMoney,
        fee: data.fee,
        venue: data.venue,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        image: data.image,
        rules: {
          create: data.rules || []
        }
      },
      include: {
        rules: true
      }
    });
    
    return Response.json({ event });
  } catch (error) {
    console.error('Error updating event:', error);
    return Response.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const token = request.cookies.get("authToken")?.value;
  
  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { id } = params;
    
    // Delete related records first
    await prisma.rule.deleteMany({
      where: { eventId: parseInt(id) }
    });
    
    // Delete members of registrations for this event
    const registrations = await prisma.registration.findMany({
      where: { eventId: parseInt(id) },
      select: { id: true }
    });
    
    if (registrations.length > 0) {
      await prisma.member.deleteMany({
        where: {
          registrationId: {
            in: registrations.map(reg => reg.id)
          }
        }
      });
    }
    
    // Delete registrations
    await prisma.registration.deleteMany({
      where: { eventId: parseInt(id) }
    });
    
    // Finally delete the event
    await prisma.event.delete({
      where: { id: parseInt(id) }
    });
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return Response.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}