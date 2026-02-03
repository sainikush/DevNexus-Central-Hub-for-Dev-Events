import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import { IEvent } from "@/database"; // Ensure this import matches your types
import { getAllEvents } from "@/lib/actions/event.action"; // ✅ IMPORT THIS

// You don't need 'use cache' here for now, let's keep it simple to get the build passing.
// Next.js caches database calls by default in Server Components unless you opt-out.

const Page = async () => {
  // ❌ REMOVED: const response = await fetch(...) 
  
  // ✅ ADDED: Direct Database Call
  const events = await getAllEvents();

  return (
    <section>
      <h1 className="text-center">
        The Hub for Every Dev <br /> Event You can't Miss
      </h1>

      <p className="text-center mt-5">
        Hackathons, Meetups, and Conference, All in One place.
      </p>

      <ExploreBtn />

      <div className="mt-20 space-y-7">
        <h3>Featured Events</h3>
        <ul className="events grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events && events.length > 0 ? (
            events.map((event: IEvent) => (
              <li key={event._id as string} className="list-none">
                 <EventCard {...event} />
              </li>
            ))
          ) : (
             <p className="text-center col-span-full text-gray-500">No events found.</p>
          )}
        </ul>
      </div>
    </section>
  );
};
export default Page;