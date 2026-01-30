import BookEvent from "@/components/BookEvent";
import EventCard from "@/components/EventCard";
import { IEvent } from "@/database/event.model";
import Image from "next/image";
import { notFound } from "next/navigation";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
// Add this line at the top
import { getSimilarEventsBySlug } from "@/lib/actions/event.action";

const EventDetailItem = ({ icon, alt, label }: { icon: string; alt: string; label: string }) => (
     <div className="flex-row-gap-2 items-center">
        <Image src = {icon} alt ={alt} width = {17} height={17}></Image>
        <p>{label}</p>
    </div>
)

const EventAgenda = ({agendaItems}: {agendaItems: string[]}) => (
    <div className="agenda">
        <h2>Event Agenda</h2>
        <ul>
            {agendaItems.map((item) => (
                <li key={item}>{item}</li>
            ))}
        </ul>
    </div>
)

const EventTags = ({tags}: {tags: string[]}) => (
    <div className="flex-row-gap-1.5 flex-wrap">
        {tags.map((tag) => (
            <div key={tag} className="pill">{tag}</div>
        ))}
    </div>
)

const EventsDetails = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const request = await fetch(`${BASE_URL}/api/events/${slug}`);
  const {
    event: {
      description,
      image,
      overview,
      date,
      time,
      location,
      mode,
      agenda,
      audience,
      tags,
      Organizer
    },
  } = await request.json();

  if (!description) return notFound();

const bookings = 10

const similarEvents: IEvent[] = await getSimilarEventsBySlug(slug);

  return (
    <section id="event">
      <div className="header">
        <h1>Event Description</h1>
        <p>{description}</p>
      </div>

      <div className="details">
        {/* left side - Event Content */}

        <div className="content">
          <Image
            src={image}
            alt="Event Banner"
            width={800}
            height={800}
            className="banner"
          ></Image>
          <section className="flex-col-gap2">
            <h2>Overview</h2>
            <p>{overview}</p>
          </section>

          <section className="flex-col-gap2">
            <h2>Event Details</h2>
            <EventDetailItem icon="/icons/calendar.svg" alt="calendar" label={date} />
            <EventDetailItem icon="/icons/clock.svg" alt="clock" label={time} />
             <EventDetailItem icon="/icons/pin.svg" alt="pin" label={location} />
            <EventDetailItem icon="/icons/mode.svg" alt="mode" label={mode} />
             <EventDetailItem icon="/icons/audience.svg" alt="audience" label={audience} />
          </section>

          <EventAgenda agendaItems= {agenda} />

          <section className="flex-col-gap-2">
            <h2>About the Organizer</h2>
            <p>{Organizer}</p>
          </section>

          <EventTags tags = {tags} />
        </div>

        {/*Right side = Booking form */}
        <aside className="booking">
          <div className="signup-card">
            <h2>Book Your Spot</h2>
            {bookings > 0 ? (
                <p className="text-sm">

                    Join {bookings} others who have already booked for this event.
                  </p>
            ): (
                <p className="text-sm">Be the first to Book your Spot!</p>
            )}
            <BookEvent />
          </div>
        </aside>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Check if there are events */}
          {similarEvents.length > 0 ? (
            // TRUE: Map through them
            similarEvents.map((similarEvent: IEvent) => (
              <EventCard key={similarEvent._id.toString()} {...similarEvent} />
            ))
          ) : (
            // FALSE (The missing part): Show this message
            <p className="text-gray-500">No similar events found.</p>
          )}
        </div>
    </section>
  );
};

export default EventsDetails;

