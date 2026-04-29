// API route: /api/admin/registrations/route.js
import prisma from '@/lib/prisma';

export async function GET(request) {
  const token = request.cookies.get("authToken")?.value;
  
  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const searchParams = new URL(request.url).searchParams;
  const eventId = searchParams.get('eventId');
  
  try {
    let registrations;
    
    if (eventId) {
      registrations = await prisma.registration.findMany({
        where: {
          eventId: parseInt(eventId)
        },
        include: {
          event: true,
          members: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } else {
      registrations = await prisma.registration.findMany({
        include: {
          event: true,
          members: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    }
    
    return Response.json({ registrations });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch registrations' }, { status: 500 });
  }
}