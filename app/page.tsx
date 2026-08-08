"use client";

import { type FormEvent, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const classTypes = [
  {
    name: "Bodypump",
    detail:
      "Full-body barbell training with high repetitions, music and options for every level.",
    image: "/images/miriam-track-lunge.jpg",
  },
  {
    name: "Strength Development",
    detail:
      "Progressive strength blocks that build technique, control and measurable progress.",
    image: "/images/miriam-strength-development-cutout.png",
  },
  {
    name: "Bodyattack",
    detail:
      "Athletic cardio combining running, lunging, jumping and strength moves.",
    image: "/images/miriam-bodyattack-card.jpg",
  },
  {
    name: "Spinning / Ride",
    detail:
      "Music-led indoor cycling with climbs, intervals and endurance work.",
    image: "/images/miriam-spinning.jpg",
  },
];

const pathways = [
  {
    title: "Private Indoor Cycling Experience",
    copy:
      "A custom indoor cycling experience for your private group. A suitable studio and bikes must be available or arranged.",
    items: ["Friends and celebrations", "Themed rides", "Special occasions"],
    href: "#contact",
    cta: "Enquire about an experience",
    request: "Private Indoor Cycling Experience",
  },
  {
    title: "Private Group Workout",
    copy: "A music-driven strength and cardio workout shaped around the occasion and group.",
    items: ["Strength and cardio", "Adapted to the occasion", "Group-focused coaching"],
    href: "#contact",
    cta: "Enquire about an experience",
    request: "Private Group Workout",
  },
  {
    title: "Corporate & Events",
    copy: "Bring movement, music and shared energy to your team, community or event.",
    items: ["Corporate wellness", "Team building", "Brand and community events"],
    href: "#contact",
    cta: "Enquire about an experience",
    request: "Corporate / Team Event",
  },
];

type Venue = {
  name: string;
  location: string;
  formats: string;
  days: Array<{
    day: string;
    classes: Array<{ time: string; name: string; meta?: string }>;
  }>;
  href: string;
  cta: string;
};

const venues: Venue[] = [
  {
    name: "Basic-Fit Mechelen Bruul",
    location: "Bruul 107, 2800 Mechelen",
    formats: "Group fitness",
    days: [
      {
        day: "Thu",
        classes: [
          { time: "19:00 - 20:00", name: "BODYATTACK" },
          { time: "20:00 - 21:00", name: "BODYPUMP" },
        ],
      },
      {
        day: "Sun",
        classes: [
          { time: "10:00 - 11:00", name: "BODYPUMP" },
          { time: "11:00 - 12:00", name: "BODYATTACK" },
        ],
      },
    ],
    href: "https://www.basic-fit.com/en-be/clubs/basic-fit-mechelen-bruul-bf2005d2d2594349b27bdf33aa77ac73.html",
    cta: "View Basic-Fit schedule",
  },
  {
    name: "Pulsate Antwerp",
    location: "Van der Meydenstraat 23/25, 2140 Antwerpen",
    formats: "Indoor cycling",
    days: [
      {
        day: "Sat",
        classes: [
          { time: "10:00 - 10:50", name: "RIDE: PERFORMANCE" },
        ],
      },
    ],
    href: "https://pulsate.be/timetable/",
    cta: "View Pulsate schedule",
  },
];

const faqItems = [
  [
    "Which certifications does Miriam have?",
    "Miriam is Les Mills certified in Strength Development, Bodypump and Bodyattack. She earned her Spinning certificate at Fitness NRG.",
  ],
  [
    "Where does Miriam teach?",
    "She teaches regular classes at Basic-Fit Mechelen Bruul and Pulsate Antwerp. Access and booking are handled directly by each venue.",
  ],
  [
    "Can beginners join?",
    "Yes. Miriam coaches different levels in the same room and consistently offers lighter or lower-impact options, as is typical in Les Mills classes, so beginners can move with confidence.",
  ],
  [
    "Can I book Miriam directly?",
    "Yes, for private group workouts, indoor cycling experiences, corporate sessions and fitness events. Her regular weekly studio classes are accessed through the respective venue.",
  ],
  [
    "Does Miriam offer personal training?",
    "No. Miriam is a group fitness and indoor cycling instructor, and a fitness experience coach and host. Her focus is shared energy, music, movement and community.",
  ],
];

const formspreeEndpoint = "https://formspree.io/f/mzepdael";

export default function Home() {
  const root = useRef<HTMLElement>(null);
  const [requestType, setRequestType] = useState("Private Indoor Cycling Experience");
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle",
  );

  async function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setFormStatus("submitting");

    try {
      const response = await fetch(formspreeEndpoint, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      if (!response.ok) throw new Error("Formspree rejected the submission");

      form.reset();
      setRequestType("Private Indoor Cycling Experience");
      setFormStatus("success");
    } catch {
      setFormStatus("error");
    }
  }

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);

      gsap.from(".hero-kicker, .hero-title span, .hero-text, .hero-actions", {
        y: 34,
        opacity: 0,
        filter: "blur(10px)",
        duration: 1.15,
        stagger: 0.08,
        ease: "power3.out",
        clearProps: "filter",
      });

      gsap.to(".hero-media", {
        scale: 1.05,
        filter: "blur(14px) brightness(0.58)",
        opacity: 0.86,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.utils.toArray<HTMLElement>(".motion-image").forEach((image) => {
        gsap.fromTo(
          image,
          { scale: 0.82, opacity: 0.42, filter: "grayscale(1) contrast(1.2)" },
          {
            scale: 1,
            opacity: 1,
            filter: "grayscale(0.15) contrast(1.12)",
            ease: "none",
            scrollTrigger: {
              trigger: image,
              start: "top 90%",
              end: "bottom 20%",
              scrub: true,
            },
          },
        );
      });

      gsap.from(".about-copy > *, .about-fact", {
        y: 28,
        opacity: 0,
        stagger: 0.09,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".about-chapter",
          start: "top 72%",
        },
      });

      gsap.fromTo(
        ".about-portrait-wrap",
        { scale: 0.9, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".about-visual",
            start: "top 88%",
            end: "top 54%",
            scrub: true,
          },
        },
      );
    },
    { scope: root },
  );

  return (
    <main ref={root} className="site-shell">
      <header className="site-header" aria-label="Main navigation">
        <a className="brand" href="#home" aria-label="Miriam Van Dijcke home">
          <span>Miriam Van Dijcke</span>
        </a>
        <nav>
          <a href="#classes">Classes</a>
          <a href="#experiences">Experiences</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <section className="hero" id="home">
        <div className="hero-media" aria-hidden="true" />
        <div className="hero-wash" />
        <div className="hero-inner">
          <p className="hero-kicker">Group fitness / Indoor cycling / Fitness experiences</p>
          <h1 className="hero-title">
            <span>Move together.</span>
            <span>
              With <em>Miriam.</em>
            </span>
          </h1>
          <p className="hero-text">
            Join Miriam in a regular studio class, or book her to create a private
            fitness experience for your group, team or event.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#schedule">
              Find a class
            </a>
            <a className="button secondary" href="#experiences">
              Book an experience
            </a>
          </div>
        </div>
      </section>

      <section className="chapter about-chapter" id="about">
        <div className="about-grid">
          <div className="about-copy">
            <p className="eyebrow">About Miriam</p>
            <h2>Movement is more than a class.</h2>
            <p className="about-lead">
              Miriam Van Dijcke is a group fitness and indoor cycling instructor who
              brings music, clear coaching and genuine energy to every room.
            </p>
            <p>
              Join her regular classes at Basic-Fit Mechelen Bruul and Pulsate Antwerp,
              or book her to shape a private group workout, cycling experience or event.
              Her focus is always the shared experience: people moving together with
              confidence, options and a strong sense of community.
            </p>
          </div>

          <div className="about-facts" aria-label="Miriam's background and credentials">
            <div className="about-fact">
              <span>Certified</span>
              <strong>Les Mills Bodypump, Bodyattack &amp; Strength Development</strong>
            </div>
            <div className="about-fact">
              <span>Indoor cycling</span>
              <strong>Spinning certified through Fitness NRG</strong>
            </div>
            <div className="about-fact">
              <span>Beyond the studio</span>
              <strong>Clinical Regulatory Affairs Specialist at GC Europe</strong>
            </div>
          </div>

          <figure className="about-visual">
            <div className="about-image-glow" aria-hidden="true" />
            <div className="about-portrait-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="about-portrait"
                src="/images/miriam-runner-cutout.png"
                alt="Miriam smiling after a run, wearing sports sunglasses and a hydration vest"
                width={1448}
                height={1086}
                loading="lazy"
                decoding="async"
              />
            </div>
          </figure>
        </div>
      </section>

      <section className="chapter bento-chapter">
        <div className="chapter-heading">
          <p className="eyebrow">Classes</p>
          <h2>Four formats built for strength, rhythm and room energy.</h2>
          <p className="chapter-intro">
            Want to work out with me? You&apos;ll find me teaching regular classes at
            selected gyms and studios. Access and booking are handled directly by
            each venue.
          </p>
        </div>
        <div className="class-bento" id="classes">
          <article className="bento-lead motion-image">
            <h3>Move with purpose.</h3>
          </article>
          {classTypes.map((classType) => (
            <article
              className={`bento-card compact-card${classType.name === "Strength Development" ? " cutout-card" : ""}${classType.name === "Bodypump" ? " bodypump-card" : ""}${classType.name === "Bodyattack" ? " bodyattack-card" : ""}${classType.name === "Spinning / Ride" ? " spinning-card" : ""}`}
              key={classType.name}
            >
              <div
                className="class-card-image"
                style={{ backgroundImage: `url(${classType.image})` }}
              />
              <div className="class-card-shade" />
              <div className="class-card-copy">
                <h3>{classType.name}</h3>
                <p>{classType.detail}</p>
              </div>
              <button
                className="class-card-trigger"
                type="button"
                aria-label={`Reveal ${classType.name} details`}
              />
            </article>
          ))}
        </div>

        <div className="schedule-block" id="schedule">
          <div className="schedule-heading">
            <p className="eyebrow">Weekly schedule</p>
            <div>
              <h3>Find me in class every week in Mechelen and Antwerp.</h3>
              <p>Booking and access are handled directly through each gym or studio.</p>
            </div>
          </div>
          <div className="venue-grid">
            {venues.map((venue) => (
              <article className="venue-card" key={venue.name}>
                <div className="venue-card-heading">
                  <p className="venue-format">{venue.formats}</p>
                  <h3>{venue.name}</h3>
                </div>
                <div className="venue-schedule">
                  {venue.days.map((day) => (
                    <div className="schedule-day" key={day.day}>
                      <p>{day.day}</p>
                      <div className="session-list">
                        {day.classes.map((classItem) => (
                          <div className="class-session" key={`${day.day}-${classItem.time}`}>
                            <time>{classItem.time}</time>
                            <strong>{classItem.name}</strong>
                            {classItem.meta ? <span>{classItem.meta}</span> : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="venue-action">
                  <address>{venue.location}</address>
                  <a href={venue.href} target="_blank" rel="noreferrer">
                    {venue.cta}
                  </a>
                </div>
              </article>
            ))}
          </div>
          <p className="schedule-note">
            Schedules may change. Check the studio for the latest availability.
            Studio access or membership may be required.
          </p>
        </div>
      </section>

      <section className="marquee-band" aria-label="Class formats">
        <div className="marquee-track">
          {[...classTypes, ...classTypes].map((classType, index) => (
            <span key={`${classType.name}-${index}`}>{classType.name}</span>
          ))}
        </div>
      </section>

      <section className="chapter accordion-chapter">
        <div className="chapter-heading wide">
          <p className="eyebrow">Private experiences</p>
          <h2>Your group. Your music. Your workout.</h2>
          <p className="chapter-intro">
            Planning something different? Miriam can create and lead a high-energy
            fitness experience for your group, team or event.
          </p>
        </div>
        <div className="work-options" id="experiences">
          {pathways.map((pathway) => (
            <a
              className="work-option"
              href={pathway.href}
              key={pathway.title}
              aria-label={`${pathway.cta}: ${pathway.title}`}
              onClick={() => {
                if (pathway.request) setRequestType(pathway.request);
              }}
            >
              <div>
                <h3>{pathway.title}</h3>
                <p>{pathway.copy}</p>
              </div>
              <ul>
                {pathway.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <span className="work-option-cta">{pathway.cta}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="chapter faq-chapter">
        <div className="chapter-heading">
          <p className="eyebrow">Practical questions</p>
          <h2>Before you send a request.</h2>
        </div>
        <div className="faq-grid">
          {faqItems.map(([question, answer]) => (
            <article key={question}>
              <h3>{question}</h3>
              <p>{answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="contact-chapter">
        <div className="contact-inner" id="contact">
          <div>
            <p className="eyebrow">Contact</p>
            <h2>Book a private fitness experience.</h2>
            <p>
              Tell Miriam about your group, preferred format, timing and venue.
              Regular studio classes are booked directly through the venue.
            </p>
            <a
              className="instagram-link"
              href="https://www.instagram.com/mir.i.am_vd/"
              target="_blank"
              rel="noreferrer"
            >
              Instagram @mir.i.am_vd
            </a>
          </div>
          <form
            className="contact-form"
            action={formspreeEndpoint}
            method="post"
            onSubmit={handleContactSubmit}
            aria-busy={formStatus === "submitting"}
          >
            <label>
              Name
              <input type="text" name="name" placeholder="Your name" required />
            </label>
            <label>
              Email
              <input type="email" name="email" placeholder="you@example.com" required />
            </label>
            <label>
              Experience type
              <select
                name="request"
                value={requestType}
                onChange={(event) => setRequestType(event.target.value)}
                required
              >
                <option>Private Indoor Cycling Experience</option>
                <option>Private Group Workout</option>
                <option>Corporate / Team Event</option>
                <option>Brand / Community Event</option>
                <option>Other</option>
              </select>
            </label>
            <label>
              Location / Venue
              <select name="venue" required defaultValue="Not sure yet">
                <option>I already have a venue</option>
                <option>I need help arranging a suitable venue</option>
                <option>Not sure yet</option>
              </select>
            </label>
            <div className="form-row">
              <label>
                Group size
                <input
                  type="number"
                  name="groupSize"
                  min="2"
                  placeholder="Estimated number"
                />
              </label>
              <label>
                Preferred date
                <input type="date" name="timing" />
              </label>
            </div>
            <label>
              Message
              <textarea
                name="message"
                placeholder="Tell Miriam what you are looking for"
                required
                rows={5}
              />
            </label>
            <p className="form-note">
              Indoor cycling experiences require access to a suitable studio and
              bikes; these need to be available or arranged.
            </p>
            {formStatus === "success" ? (
              <p className="form-status success" role="status">
                Thank you. Your enquiry has been sent to Miriam.
              </p>
            ) : null}
            {formStatus === "error" ? (
              <p className="form-status error" role="alert">
                Something went wrong. Please try again in a moment.
              </p>
            ) : null}
            <button type="submit" disabled={formStatus === "submitting"}>
              {formStatus === "submitting" ? "Sending..." : "Send enquiry"}
            </button>
          </form>
        </div>
      </section>

      <footer>
        <p>Miriam Van Dijcke</p>
        <a
          href="https://www.instagram.com/mir.i.am_vd/"
          target="_blank"
          rel="noreferrer"
        >
          @mir.i.am_vd
        </a>
      </footer>
    </main>
  );
}
