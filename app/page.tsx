"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const classTypes = [
  {
    name: "Bodypump",
    detail:
      "Barbell strength work with musical momentum, clean cueing and scalable options for mixed-level rooms.",
    image: "/images/miriam-group-bodypump.jpg",
    metric: "Barbell strength",
  },
  {
    name: "Strength Development",
    detail:
      "Progressive strength sessions where technique, control and confidence become visible week after week.",
    image: "/images/miriam-barbell-lunge.jpg",
    metric: "Progressive work",
  },
  {
    name: "Bodyattack",
    detail:
      "Athletic cardio with sharp transitions, big-room energy and the kind of rhythm that pulls people in.",
    image: "/images/miriam-track-lunge.jpg",
    metric: "Cardio drive",
  },
  {
    name: "Spinning",
    detail:
      "Indoor cycling built around climbs, intervals, endurance and music-led drive from first track to finish.",
    image: "/images/miriam-spinning.jpg",
    metric: "Ride energy",
  },
];

const offers = [
  {
    title: "Personal Training",
    copy:
      "A focused setting for people who want structure, accountability and a training rhythm that fits real life.",
    items: ["Goal intake", "Technique-first sessions", "Strength and conditioning"],
    image: "/images/miriam-portrait-close.jpg",
  },
  {
    title: "Group Classes",
    copy:
      "Recurring or substitute group classes for gyms, studios and community spaces that need reliable energy.",
    items: ["Basic-Fit Bruul Mechelen", "Pulsate Antwerp", "Mixed-level coaching"],
    image: "/images/miriam-spinning.jpg",
  },
  {
    title: "Projects",
    copy:
      "Fitness-led collaborations for companies, events, sport days, pop-ups and larger movement programmes.",
    items: ["Corporate wellness", "Event sessions", "Custom workshops"],
    image: "/images/miriam-portrait-wide.jpg",
  },
];

const faqItems = [
  [
    "Where does Miriam teach?",
    "She teaches at Basic-Fit Bruul in Mechelen and Pulsate in Antwerp. Personal training or projects can be discussed separately.",
  ],
  [
    "Can beginners join?",
    "Yes. Miriam adapts coaching and intensity so different levels can train in the same room with confidence.",
  ],
  [
    "Can she be booked for projects?",
    "Yes. The site is set up for requests around group classes, company sessions, events, workshops and collaborations.",
  ],
  [
    "How does the form work?",
    "The form opens an email to Miriam at miriam.s.presas@gmail.com with your request details ready to send.",
  ],
];

const revealWords =
  "Precision from clinical regulatory affairs. Energy from the studio floor. Miriam brings both into the way she coaches: composed, clear and genuinely motivating."
    .split(" ");

export default function Home() {
  const root = useRef<HTMLElement>(null);

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
          <span className="brand-mark">MVD</span>
          <span>Miriam Van Dijcke</span>
        </a>
        <nav>
          <a href="#classes">Classes</a>
          <a href="#work">Work</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <section className="hero" id="home">
        <div className="hero-wash" />
        <div className="hero-inner">
          <p className="hero-kicker">Group fitness instructor in Mechelen and Antwerp</p>
          <h1 className="hero-title">
            <span>Train stronger</span>
            <span>
              with{" "}
              <i
                className="inline-photo"
                aria-label="Fitness atmosphere placeholder"
              />{" "}
              Miriam.
            </span>
          </h1>
          <p className="hero-text">
            Bodypump, Strength Development, Bodyattack and Spinning with a
            coaching style that feels precise, powerful and welcoming.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#contact">
              Request training
            </a>
            <a className="button secondary" href="#classes">
              Explore classes
            </a>
          </div>
          <div className="hero-stats" aria-label="Miriam training highlights">
            <span>Basic-Fit Bruul</span>
            <span>Pulsate Antwerp</span>
            <span>4 class formats</span>
          </div>
        </div>
      </section>

      <section className="chapter intro-chapter">
        <div className="reveal-copy" aria-label="Miriam coaching positioning">
          {revealWords.map((word, index) => (
            <span className="reveal-word" key={`${word}-${index}`}>
              {word}
            </span>
          ))}
        </div>
      </section>

      <section className="chapter bento-chapter" id="classes">
        <div className="chapter-heading">
          <p className="eyebrow">Classes</p>
          <h2>Four formats built for strength, rhythm and room energy.</h2>
        </div>
        <div className="class-bento">
          <article className="bento-card bento-lead motion-image">
            <span className="floating-stat">Live coaching</span>
            <div>
              <p>Currently teaching at Basic-Fit Bruul Mechelen and Pulsate Antwerp.</p>
              <h3>Clear cueing. Strong tempo. No one left guessing.</h3>
            </div>
          </article>
          {classTypes.map((classType) => (
            <article
              className="bento-card compact-card"
              key={classType.name}
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(10,10,10,.22), rgba(10,10,10,.86)), url(${classType.image})`,
              }}
            >
              <span className="class-metric">{classType.metric}</span>
              <h3>{classType.name}</h3>
              <p>{classType.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="marquee-band" aria-label="Class formats">
        <div className="marquee-track">
          {[...classTypes, ...classTypes].map((classType, index) => (
            <span key={`${classType.name}-${index}`}>{classType.name}</span>
          ))}
        </div>
      </section>

      <section className="chapter accordion-chapter" id="work">
        <div className="chapter-heading wide">
          <p className="eyebrow">Work with Miriam</p>
          <h2>
            Individual coaching, group rooms and larger fitness moments can all
            start from one request.
          </h2>
        </div>
        <div className="offer-accordion">
          {offers.map((offer, index) => (
            <article className="offer-panel" key={offer.title}>
              <div
                className="panel-media motion-image"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.08), rgba(0,0,0,.68)), url(${offer.image})`,
                }}
              >
                <span className="panel-stat">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="panel-copy">
                <h3>{offer.title}</h3>
                <p>{offer.copy}</p>
                <ul>
                  {offer.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="chapter proof-chapter">
        <div className="proof-media motion-image" />
        <div className="proof-copy">
          <p className="eyebrow">Professional rhythm</p>
          <h2>Structured enough for progress. Human enough to keep people coming back.</h2>
          <p>
            Miriam also works as a Clinical Regulatory Affairs Specialist at GC
            Europe. That professional precision shows up in her fitness work:
            thoughtful preparation, safe progression and calm control in a busy
            room.
          </p>
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
            <h2>Request a session, class or project.</h2>
            <p>
              Share the type of request, timing, location and what you want the
              session to achieve. Miriam can follow up by email.
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
          >
            <label>
              Name
              <input type="text" name="name" placeholder="Your name" />
            </label>
            <label>
              Email
              <input type="email" name="email" placeholder="you@example.com" />
            </label>
            <label>
              Request type
              <select name="request">
                <option>Personal training</option>
                <option>Group class</option>
                <option>Larger project</option>
                <option>Other collaboration</option>
              </select>
            </label>
            <label>
              Message
              <textarea
                name="message"
                placeholder="Tell Miriam what you are looking for"
                rows={5}
              />
            </label>
            <button type="submit">Send request</button>
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
