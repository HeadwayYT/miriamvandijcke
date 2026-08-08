"use client";

import { Fragment, type FormEvent, useRef, useState } from "react";
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
    name: "Spinning",
    detail:
      "Music-led indoor cycling with climbs, intervals and endurance work.",
    image: "/images/miriam-spinning.jpg",
  },
];

const pathways = [
  {
    title: "Join a Class",
    copy: "Find me on the schedule at the studios where I teach.",
    items: ["Regular studio classes", "Venue-managed access", "Weekly group energy"],
    href: "#schedule",
    cta: "View classes",
  },
  {
    title: "Private Experiences",
    copy: "Your group. Your music. Your workout.",
    items: ["Private Ride", "Private Group Workout", "Themed Fitness Experience"],
    href: "#contact",
    cta: "Explore experiences",
    request: "Private Ride",
  },
  {
    title: "Corporate & Events",
    copy: "Bring the energy to your team, community or event.",
    items: ["Corporate Fitness Event", "Team Building Workout", "Brand / Community Event"],
    href: "#contact",
    cta: "Book Miriam",
    request: "Corporate Fitness Event",
  },
];

const venues = [
  {
    name: "Basic-Fit Mechelen Bruul",
    location: "Bruul 107, 2800 Mechelen",
    formats: "Group fitness",
    timing: "Check the club page or Basic-Fit app for the current schedule.",
    href: "https://www.basic-fit.com/en-be/clubs/basic-fit-mechelen-bruul-bf2005d2d2594349b27bdf33aa77ac73.html",
    cta: "Check studio",
  },
  {
    name: "Pulsate Antwerp",
    location: "Van der Meydenstraat 23-25, 2140 Antwerp",
    formats: "Indoor cycling and group fitness",
    timing: "Check the Pulsate timetable for current classes and times.",
    href: "https://pulsate.be/timetable/",
    cta: "View class schedule",
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
    "Yes. Miriam adapts coaching and intensity so different levels can train in the same room with confidence.",
  ],
  [
    "Can I book Miriam directly?",
    "Yes, for private group workouts, rides, corporate sessions and fitness events. Her regular weekly studio classes are accessed through the respective venue.",
  ],
  [
    "Does Miriam offer personal training?",
    "No. Miriam is a group fitness and indoor cycling instructor, and a fitness experience coach and host. Her focus is shared energy, music, movement and community.",
  ],
];

const revealWords =
  "Energy from the studio floor. Precision from clinical regulatory affairs. Miriam brings music, movement and clear coaching together in group experiences people want to be part of."
    .split(" ");

export default function Home() {
  const root = useRef<HTMLElement>(null);
  const [requestType, setRequestType] = useState("Private Ride");

  function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const request = String(formData.get("request") ?? "").trim();
    const venue = String(formData.get("venue") ?? "").trim();
    const groupSize = String(formData.get("groupSize") ?? "").trim();
    const timing = String(formData.get("timing") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();
    const subject = `Private fitness experience request${name ? ` from ${name}` : ""}`;
    const body = [
      name ? `Name: ${name}` : "",
      email ? `Email: ${email}` : "",
      request ? `Experience type: ${request}` : "",
      venue ? `Location / venue: ${venue}` : "",
      groupSize ? `Estimated group size: ${groupSize}` : "",
      timing ? `Preferred date / timing: ${timing}` : "",
      "",
      message,
    ]
      .filter((line) => line.length > 0)
      .join("\n");

    window.location.href = `mailto:miriam.s.presas@gmail.com?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
  }

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);

      gsap.from(".hero-title span, .hero-text, .hero-actions", {
        y: 34,
        opacity: 0,
        duration: 1,
        stagger: 0.08,
        ease: "power3.out",
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

      gsap.to(".reveal-word", {
        opacity: 1,
        y: 0,
        stagger: 0.045,
        ease: "none",
        scrollTrigger: {
          trigger: ".reveal-copy",
          start: "top 78%",
          end: "bottom 45%",
          scrub: true,
        },
      });
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
        <div className="hero-wash" />
        <div className="hero-inner">
          <p className="hero-kicker">Group fitness / Indoor cycling / Fitness experiences</p>
          <h1 className="hero-title">
            <span>Move together</span>
            <span>with Miriam.</span>
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

      <section className="chapter intro-chapter">
        <div className="reveal-copy" aria-label="Miriam coaching positioning">
          {revealWords.map((word, index) => (
            <Fragment key={`${word}-${index}`}>
              <span className="reveal-word">{word}</span>
              {index < revealWords.length - 1 ? " " : ""}
            </Fragment>
          ))}
        </div>
      </section>

      <section className="chapter bento-chapter" id="classes">
        <div className="chapter-heading">
          <p className="eyebrow">Classes</p>
          <h2>Four formats built for strength, rhythm and room energy.</h2>
          <p className="chapter-intro">
            Want to work out with me? You&apos;ll find me teaching regular classes at
            selected gyms and studios. Access and booking are handled directly by
            each venue.
          </p>
        </div>
        <div className="class-bento">
          <article className="bento-lead motion-image">
            <h3>Move with purpose.</h3>
          </article>
          {classTypes.map((classType) => (
            <article
              className={`bento-card compact-card${classType.name === "Strength Development" ? " cutout-card" : ""}${classType.name === "Bodypump" ? " bodypump-card" : ""}${classType.name === "Bodyattack" ? " bodyattack-card" : ""}${classType.name === "Spinning" ? " spinning-card" : ""}`}
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
            <p className="eyebrow">Find a class</p>
            <h3>Check the schedule at each studio.</h3>
          </div>
          <div className="venue-grid">
            {venues.map((venue) => (
              <article className="venue-card" key={venue.name}>
                <div>
                  <p className="venue-format">{venue.formats}</p>
                  <h3>{venue.name}</h3>
                  <p>{venue.location}</p>
                </div>
                <div className="venue-action">
                  <p>{venue.timing}</p>
                  <a href={venue.href} target="_blank" rel="noreferrer">
                    {venue.cta}
                  </a>
                </div>
              </article>
            ))}
          </div>
          <p className="schedule-note">
            Membership or studio access may be required. Check the venue for
            current booking and trial options.
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

      <section className="chapter accordion-chapter" id="experiences">
        <div className="chapter-heading wide">
          <p className="eyebrow">Move with Miriam</p>
          <h2>
            Join her regular classes, or bring the experience to your own group.
          </h2>
        </div>
        <div className="work-options">
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

      <section className="contact-chapter" id="contact">
        <div className="contact-inner">
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
            action="mailto:miriam.s.presas@gmail.com"
            method="post"
            encType="text/plain"
            onSubmit={handleContactSubmit}
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
                <option>Private Ride</option>
                <option>Private Group Workout</option>
                <option>Corporate Fitness Event</option>
                <option>Team Building Workout</option>
                <option>Brand / Community Event</option>
                <option>Themed Fitness Experience</option>
                <option>Other</option>
              </select>
            </label>
            <label>
              Location / Venue
              <select name="venue" required defaultValue="Not sure yet">
                <option>I already have a venue</option>
                <option>I need help finding a suitable venue</option>
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
                Date / Timing
                <input type="text" name="timing" placeholder="Preferred timing" />
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
              Private rides require access to a suitable cycling studio and bikes;
              these need to be available or arranged.
            </p>
            <button type="submit">Send experience request</button>
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
