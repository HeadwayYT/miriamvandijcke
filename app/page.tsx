"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  ArrowRight,
  ArrowSquareOut,
  CalendarDots,
  InstagramLogo,
  PaperPlaneTilt,
  SpotifyLogo,
} from "@phosphor-icons/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { siteConfig } from "@/lib/site-config";
import { InstagramFeatureMedia } from "@/app/components/instagram-feature-media";
import {
  emptyPublicSiteContent,
  toSpotifyEmbedUrl,
  type PublicSiteContent,
  type SpotifyContent,
} from "@/lib/studio/content";
import { type Language, nlTranslations } from "./translations";

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
    name: "Indoor Cycling",
    detail:
      "Music-led indoor cycling with climbs, intervals and endurance work.",
    image: "/images/miriam-spinning.jpg",
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

const formspreeEndpoint = "https://formspree.io/f/mzepdael";

export default function Home() {
  const root = useRef<HTMLElement>(null);
  const [language, setLanguage] = useState<Language>("en");
  const [requestType, setRequestType] = useState("Fitness event");
  const [siteContent, setSiteContent] = useState<PublicSiteContent>(emptyPublicSiteContent);
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle",
  );
  const t = (value: string) =>
    language === "nl" ? (nlTranslations[value] ?? value) : value;
  const publishedRide =
    siteContent.spotify?.published && toSpotifyEmbedUrl(siteContent.spotify.playlistUrl)
      ? siteContent.spotify
      : null;

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("miriam-language");
    if (savedLanguage === "en" || savedLanguage === "nl") {
      window.queueMicrotask(() => setLanguage(savedLanguage));
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/site-content", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : emptyPublicSiteContent))
      .then((content: PublicSiteContent) => setSiteContent(content))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setSiteContent(emptyPublicSiteContent);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const localizeMetadata = (value: string) =>
      language === "nl" ? (nlTranslations[value] ?? value) : value;

    document.documentElement.lang = language;
    document.title = localizeMetadata(
      "Miriam Van Dijcke | Group Fitness & Indoor Cycling",
    );

    const description = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    if (description) {
      description.content = localizeMetadata(
        "Miriam's fitness hub for group fitness, indoor cycling, weekly classes, music and current activity in Mechelen and Antwerp.",
      );
    }
  }, [language]);

  function chooseLanguage(nextLanguage: Language) {
    setLanguage(nextLanguage);
    window.localStorage.setItem("miriam-language", nextLanguage);
  }

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
      setRequestType("Fitness event");
      setFormStatus("success");
    } catch {
      setFormStatus("error");
    }
  }

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);

      ScrollTrigger.create({
        trigger: ".hero",
        start: "top -24px",
        end: "max",
        toggleClass: { targets: ".site-header", className: "is-scrolled" },
      });

      gsap.from(".hero-kicker, .hero-title span, .hero-text, .hero-context, .hero-actions", {
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

      gsap.from(".about-copy > *", {
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
        ".about-media",
        { scale: 0.94, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".about-media",
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
      <header className="site-header" aria-label={t("Main navigation")}>
        <a className="brand" href="#home" aria-label={t("Miriam Van Dijcke home")}>
          <span>Miriam Van Dijcke</span>
        </a>
        <nav>
          <a href="#classes">{t("Classes")}</a>
          {publishedRide ? (
            <a href="#rides">{t("Rides & music")}</a>
          ) : null}
          <a href="#about">{t("About")}</a>
          <a className="nav-cta" href="#contact">{t("Contact")}</a>
        </nav>
        <div className="language-toggle" role="group" aria-label={t("Choose language")}>
          {(["en", "nl"] as const).map((option) => (
            <button
              className={language === option ? "is-active" : undefined}
              type="button"
              lang={option}
              aria-pressed={language === option}
              onClick={() => chooseLanguage(option)}
              key={option}
            >
              {option.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <section className="hero" id="home">
        <div className="hero-media" aria-hidden="true" />
        <div className="hero-wash" />
        <div className="hero-inner">
          <p className="hero-kicker">
            {t("Group fitness")} <span aria-hidden="true">&middot;</span>{" "}
            {t("Indoor cycling")} <span aria-hidden="true">&middot;</span>{" "}
            {t("Events")}
          </p>
          <h1 className="hero-title">
            <span>{t("Move together.")}</span>
            <span>
              {t("With")} <em>Miriam.</em>
            </span>
          </h1>
          <p className="hero-text">
            {t(
              "High-energy group fitness and indoor cycling built around music, clear coaching and a room that moves together.",
            )}
          </p>
          <p className="hero-context">
            {t(
              "Join Miriam weekly in Mechelen and Antwerp — or bring the energy to your own group or event.",
            )}
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#schedule">
              <CalendarDots aria-hidden="true" size={20} weight="bold" />
              {t("Find a class")}
            </a>
            {publishedRide ? (
              <a className="hero-experience-link" href="#rides">
                <SpotifyLogo aria-hidden="true" size={17} weight="fill" />
                {t("Latest ride")}
                <ArrowRight aria-hidden="true" size={17} weight="bold" />
              </a>
            ) : (
              <a
                className="hero-experience-link"
                href={siteConfig.instagramProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <InstagramLogo aria-hidden="true" size={17} weight="bold" />
                {t("Follow Miriam")}
                <ArrowSquareOut aria-hidden="true" size={15} weight="bold" />
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="chapter bento-chapter">
        <div className="chapter-heading classes-heading" id="classes">
          <div>
            <p className="eyebrow">{t("What I teach")}</p>
            <h2>{t("Move with purpose.")}</h2>
          </div>
          <p className="chapter-intro">
            {t(
              "These are the formats I'm qualified and experienced to teach. Current weekly classes are listed in the schedule below.",
            )}
          </p>
        </div>
        <div className="class-bento">
          {classTypes.map((classType) => (
            <article
              className={`bento-card compact-card${classType.name === "Strength Development" ? " cutout-card" : ""}${classType.name === "Bodypump" ? " bodypump-card" : ""}${classType.name === "Bodyattack" ? " bodyattack-card" : ""}${classType.name === "Indoor Cycling" ? " cycling-card" : ""}`}
              key={classType.name}
            >
              <div
                className="class-card-image"
                style={{ backgroundImage: `url(${classType.image})` }}
              />
              <div className="class-card-shade" />
              <div className="class-card-copy">
                <h3>{t(classType.name)}</h3>
                <p>{t(classType.detail)}</p>
              </div>
              <button
                className="class-card-trigger"
                type="button"
                aria-label={
                  language === "nl"
                    ? `Bekijk details over ${t(classType.name)}`
                    : `Reveal ${classType.name} details`
                }
              />
            </article>
          ))}
        </div>

        <div className="schedule-block" id="schedule">
          <div className="schedule-heading">
            <p className="eyebrow">{t("Weekly schedule")}</p>
            <div>
              <h3>{t("Find me in class every week in Mechelen and Antwerp.")}</h3>
              <p>{t("Booking and access are handled directly through each gym or studio.")}</p>
            </div>
          </div>
          <div className="venue-grid">
            {venues.map((venue) => (
              <article className="venue-card" key={venue.name}>
                <div className="venue-card-heading">
                  <p className="venue-format">{t(venue.formats)}</p>
                  <h3>{venue.name}</h3>
                </div>
                <div className="venue-schedule">
                  {venue.days.map((day) => (
                    <div className="schedule-day" key={day.day}>
                      <p>{t(day.day)}</p>
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
                    {t(venue.cta)}
                    <ArrowSquareOut aria-hidden="true" size={16} weight="bold" />
                  </a>
                </div>
              </article>
            ))}
          </div>
          <p className="schedule-note">
            {t(
              "Schedules may change. Check the studio for the latest availability. Studio access or membership may be required.",
            )}
          </p>
        </div>
      </section>

      <section className="marquee-band" aria-label={t("Class formats")}>
        <div className="marquee-track">
          {[...classTypes, ...classTypes].map((classType, index) => (
            <span key={`${classType.name}-${index}`}>{t(classType.name)}</span>
          ))}
        </div>
      </section>

      {publishedRide ? (
        <LatestRide
          content={publishedRide}
          language={language}
          t={t}
        />
      ) : null}

      <section className="chapter about-chapter">
        <div className="about-grid" id="about">
          <div className="about-copy">
            <p className="eyebrow">{t("About Miriam")}</p>
            <h2>{t("My energy is contagious.")}</h2>
            <p className="about-lead">
              {t(
                "I'm Miriam, a group fitness and indoor cycling instructor who brings energy into every class. For me, it's not just about pushing harder — it's about motivating people, creating connection and making the whole room want to move.",
              )}
            </p>
            <p>
              {t(
                "With clear coaching, music and plenty of encouragement, I challenge people at their own level and make sure everyone feels part of the workout.",
              )}
            </p>
            <div className="about-credentials">
              <p>{t("Certified in")}</p>
              <p>{t("BODYATTACK · BODYPUMP · STRENGTH DEVELOPMENT · INDOOR CYCLING")}</p>
            </div>
            <div className="about-social-links">
              <a
                href={siteConfig.instagramProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t("Follow")} @${siteConfig.instagramHandle} ${t("on Instagram")}`}
              >
                <InstagramLogo aria-hidden="true" size={17} weight="bold" />
                {t("Follow")} @{siteConfig.instagramHandle}
                <ArrowSquareOut aria-hidden="true" size={14} weight="bold" />
              </a>
              {siteContent.instagram?.published ? (
                <a
                  href={siteContent.instagram.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("View featured post")}
                  <ArrowSquareOut aria-hidden="true" size={14} weight="bold" />
                </a>
              ) : null}
            </div>
          </div>

          <figure className="about-media">
            {siteContent.instagram?.published ? (
              <InstagramFeatureMedia
                key={siteContent.instagram.postUrl}
                postUrl={siteContent.instagram.postUrl}
                label={siteContent.instagram.label}
                viewLabel={t("View post on Instagram")}
                fallbackAlt={t(
                  "Miriam smiling in a fitness studio while wearing her instructor headset",
                )}
              />
            ) : (
              <div className="about-static-visual">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="about-photo"
                  src="/images/miriam-headset.jpg"
                  alt={t("Miriam smiling in a fitness studio while wearing her instructor headset")}
                  width={1600}
                  height={1200}
                  loading="lazy"
                  decoding="async"
                />
                <div className="about-media-shade" aria-hidden="true" />
              </div>
            )}
          </figure>
        </div>
      </section>

      <section className="chapter event-chapter" id="events">
        <div className="event-inner">
          <div className="event-copy">
            <p className="eyebrow">{t("Bring Miriam to your event")}</p>
            <h2>{t("Bring the room together.")}</h2>
            <p>
              {t(
                "Planning a special ride, group workout, team event or studio collaboration? Miriam is available for selected fitness events and group experiences.",
              )}
            </p>
            <p className="event-categories">
              {t("Special rides")} <span aria-hidden="true">&middot;</span>{" "}
              {t("Group workouts")} <span aria-hidden="true">&middot;</span>{" "}
              {t("Corporate events")} <span aria-hidden="true">&middot;</span>{" "}
              {t("Studio collaborations")}
            </p>
            <p className="event-note">
              {t(
                "Indoor cycling requires access to a suitable studio and bikes; these need to be available or arranged.",
              )}
            </p>
          </div>
          <a
            className="event-cta"
            href="#contact"
            onClick={() => setRequestType("Fitness event")}
          >
            {t("Get in touch")}
            <ArrowRight aria-hidden="true" size={18} weight="bold" />
          </a>
        </div>
      </section>

      <section className="contact-chapter">
        <div className="contact-inner" id="contact">
          <div>
            <p className="eyebrow">{t("Contact")}</p>
            <h2>{t("Get in touch.")}</h2>
            <p>
              {t(
                "Want to collaborate, plan a fitness event or simply get in touch? Send Miriam a message.",
              )}
            </p>
          </div>
          <form
            className="contact-form"
            action={formspreeEndpoint}
            method="post"
            onSubmit={handleContactSubmit}
            aria-busy={formStatus === "submitting"}
          >
            <label>
              {t("Name")}
              <input type="text" name="name" placeholder={t("Your name")} required />
            </label>
            <label>
              {t("Email")}
              <input type="email" name="email" placeholder="you@example.com" required />
            </label>
            <label>
              {t("What's this about?")}
              <select
                name="request"
                value={requestType}
                onChange={(event) => setRequestType(event.target.value)}
                required
              >
                <option value="Fitness event">{t("Fitness event")}</option>
                <option value="Private group experience">{t("Private group experience")}</option>
                <option value="Studio collaboration">{t("Studio collaboration")}</option>
                <option value="Corporate / team event">{t("Corporate / team event")}</option>
                <option value="Other">{t("Other")}</option>
              </select>
            </label>
            <label>
              {t("Location / Venue")}
              <select name="venue" required defaultValue="Not sure yet">
                <option value="I already have a venue">{t("I already have a venue")}</option>
                <option value="I need help arranging a suitable venue">
                  {t("I need help arranging a suitable venue")}
                </option>
                <option value="Not sure yet">{t("Not sure yet")}</option>
              </select>
            </label>
            <div className="form-row">
              <label>
                {t("Group size")}
                <input
                  type="number"
                  name="groupSize"
                  min="2"
                  placeholder={t("Estimated number")}
                />
              </label>
              <label>
                {t("Preferred date")}
                <input type="date" name="timing" />
              </label>
            </div>
            <label>
              {t("Message")}
              <textarea
                name="message"
                placeholder={t("Tell Miriam what you are looking for")}
                required
                rows={5}
              />
            </label>
            {formStatus === "success" ? (
              <p className="form-status success" role="status">
                {t("Thank you. Your enquiry has been sent to Miriam.")}
              </p>
            ) : null}
            {formStatus === "error" ? (
              <p className="form-status error" role="alert">
                {t("Something went wrong. Please try again in a moment.")}
              </p>
            ) : null}
            <button type="submit" disabled={formStatus === "submitting"}>
              <PaperPlaneTilt aria-hidden="true" size={19} weight="bold" />
              {formStatus === "submitting" ? t("Sending...") : t("Send enquiry")}
            </button>
          </form>
        </div>
      </section>

      <footer>
        <p>Miriam Van Dijcke</p>
        <a
          href={siteConfig.instagramProfileUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          @{siteConfig.instagramHandle}
        </a>
      </footer>
    </main>
  );
}

function LatestRide({
  content,
  language,
  t,
}: {
  content: SpotifyContent;
  language: Language;
  t: (value: string) => string;
}) {
  const embedUrl = toSpotifyEmbedUrl(content.playlistUrl);
  if (!embedUrl) return null;

  return (
    <section className="chapter latest-ride-chapter">
      <div className="latest-ride-grid" id="rides">
        <div className="latest-ride-copy">
          <div className="latest-ride-label">
            <SpotifyLogo aria-hidden="true" size={22} weight="fill" />
            <span>{t("Latest ride")}</span>
          </div>
          <h2>{content.title}</h2>
          <div className="latest-ride-meta">
            <strong>{content.className}</strong>
            <span>{content.focus}</span>
            {content.date ? (
              <time dateTime={content.date}>
                {new Intl.DateTimeFormat(language === "nl" ? "nl-BE" : "en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  timeZone: "UTC",
                }).format(new Date(`${content.date}T00:00:00Z`))}
              </time>
            ) : null}
          </div>
          <a
            className="latest-ride-link"
            href={content.playlistUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("Open in Spotify")}
            <ArrowSquareOut aria-hidden="true" size={16} weight="bold" />
          </a>
        </div>
        <div className="spotify-embed-shell">
          <iframe
            src={embedUrl}
            title={`${content.title} ${t("Spotify playlist")}`}
            width="100%"
            height="152"
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          />
        </div>
      </div>
    </section>
  );
}
