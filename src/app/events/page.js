import EventCard from "@/components/EventCard";
import prisma from "@/lib/prisma.js";

export default async function Home() {
  let events = [];

  try {
    events = await prisma.event.findMany();
  } catch (error) {
    console.error("Database error:", error);
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <header className="text-center py-20 px-4">
        <h1 className="text-5xl font-bold text-white mb-4 animate-fade-in">
          CSE IUJPC 2025
        </h1>
        <p className="text-xl text-gray-300 animate-fade-in-up">
          Annual Inter University Programming Contest
        </p>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          Events
        </h2>
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12 pt-8"
        >
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>
    </div>
  );
}
