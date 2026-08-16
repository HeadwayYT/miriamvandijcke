"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  ArrowRight,
  ArrowSquareOut,
  CalendarDots,
  ImageSquare,
  InstagramLogo,
  List,
  PaperPlaneTilt,
  SpotifyLogo,
  X,
} from "@phosphor-icons/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { InstagramFeatureMedia } from "@/app/components/instagram-feature-media";
import { MomentMedia } from "@/app/components/moment-media";
import {
  emptyPublicSiteContent,
  momentGridClassName,
  toSpotifyEmbedUrl,
  type MomentContent,
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
const eventRequestTypes = new Set([
  "Fitness event",
  "Studio collaboration",
  "Corporate / team event",
  "Special / themed ride",
  "Guest class",
  "Private group request",
]);

export default function Home() {
  const root = useRef<HTMLElement>(null);
  const [language, setLanguage] = useState<Language>("en");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [requestType, setRequestType] = useState("");
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
  const isEventRequest = eventRequestTypes.has(requestType);

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
    if (!mobileNavOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };
    const desktopQuery = window.matchMedia("(min-width: 801px)");
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setMobileNavOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    desktopQuery.addEventListener("change", closeOnDesktop);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      desktopQuery.removeEventListener("change", closeOnDesktop);
    };
  }, [mobileNavOpen]);

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
      setRequestType("");
      setFormStatus("success");
    } catch {
      setFormStatus("error");
    }
  }

  useEffect(() => {
    const header = root.current?.querySelector<HTMLElement>(".site-header");
    if (!header) return;

    const syncHeaderMode = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    };

    syncHeaderMode();
    window.addEventListener("scroll", syncHeaderMode, { passive: true });

    return () => window.removeEventListener("scroll", syncHeaderMode);
  }, []);

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);

      gsap.from(".hero-title span, .hero-text, .hero-context, .hero-actions", {
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
      <header
        className={`site-header${mobileNavOpen ? " is-menu-open" : ""}`}
        aria-label={t("Main navigation")}
      >
        <div className="site-nav-container">
          <Link
            className="brand"
            href="/#home"
            aria-label={t("Miriam Van Dijcke home")}
            onClick={() => setMobileNavOpen(false)}
          >
            MV
          </Link>
          <button
            className="mobile-nav-toggle"
            type="button"
            aria-controls="site-navigation"
            aria-expanded={mobileNavOpen}
            aria-label={t(mobileNavOpen ? "Close navigation" : "Open navigation")}
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            {mobileNavOpen ? (
              <X aria-hidden="true" size={22} weight="bold" />
            ) : (
              <List aria-hidden="true" size={24} weight="bold" />
            )}
          </button>
          <nav id="site-navigation" aria-label={t("Main navigation")}>
            <a href="#classes" onClick={() => setMobileNavOpen(false)}>
              {t("Classes")}
            </a>
            {siteContent.moments.length ? (
              <a href="#moments" onClick={() => setMobileNavOpen(false)}>
                {t("In action")}
              </a>
            ) : null}
            <a href="#about" onClick={() => setMobileNavOpen(false)}>
              {t("About")}
            </a>
            <a href="#contact" onClick={() => setMobileNavOpen(false)}>
              {t("Collaborate")}
            </a>
            <a
              className="nav-cta"
              href={siteConfig.instagramProfileUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`${t("Follow Miriam")} ${t("on Instagram")}`}
              onClick={() => setMobileNavOpen(false)}
            >
              <InstagramLogo aria-hidden="true" size={15} weight="bold" />
              {t("Follow Miriam")}
            </a>
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
          </nav>
        </div>
      </header>

      <section className="hero" id="home">
        <div className="hero-media" aria-hidden="true" />
        <div className="hero-wash" />
        <div className="hero-inner">
          <h1 className="hero-title">
            <span>{t("Move together.")}</span>
            <span>
              {t("With")} <em>Miriam.</em>
            </span>
          </h1>
          <p className="hero-text">
            {t(
              "High-energy group fitness and indoor cycling powered by music, clear coaching and contagious energy.",
            )}
          </p>
          <p className="hero-context">
            {t(
              "Join Miriam every week in Mechelen and Antwerp.",
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
            ) : siteContent.moments.length ? (
              <a className="hero-experience-link" href="#moments">
                <ImageSquare aria-hidden="true" size={17} weight="bold" />
                {t("See Miriam in action")}
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

      <section className="chapter bento-chapter schedule-chapter">
        <div className="chapter-heading classes-heading" id="classes">
          <p className="eyebrow">{t("What I teach")}</p>
          <h2>{t("4 Classes")}</h2>
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
                <div className="class-card-detail">
                  <p id={`class-detail-${classType.name.toLowerCase().replaceAll(" ", "-")}`}>
                    {t(classType.detail)}
                  </p>
                </div>
              </div>
              <button
                className="class-card-trigger"
                type="button"
                aria-label={language === "nl" ? `Details over ${t(classType.name)}` : `${classType.name} details`}
                aria-describedby={`class-detail-${classType.name.toLowerCase().replaceAll(" ", "-")}`}
              />
            </article>
          ))}
        </div>

        <div className="schedule-block" id="schedule">
          <div className="schedule-heading">
            <p className="eyebrow">{t("Weekly schedule")}</p>
            <div>
              <h3>{t("Find me in class every week.")}</h3>
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

      {publishedRide ? (
        <LatestRide
          content={publishedRide}
          language={language}
          t={t}
        />
      ) : null}

      {siteContent.moments.length ? (
        <Moments moments={siteContent.moments} language={language} t={t} />
      ) : null}

      <section className="chapter about-chapter">
        <div className="about-grid" id="about">
          <div className="about-copy">
            <p className="eyebrow">{t("About Miriam")}</p>
            <h2>
              <em>{t("My energy")}</em>
              {t(" is contagious.")}
            </h2>
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
            </div>
          </div>

          <figure className="about-media">
            {siteContent.instagram?.published ? (
              <InstagramFeatureMedia
                key={siteContent.instagram.postUrl}
                postUrl={siteContent.instagram.postUrl}
                label={siteContent.instagram.label}
                coverUrl={siteContent.instagram.coverUrl}
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
                className={requestType ? undefined : "is-placeholder"}
                onChange={(event) => {
                  setRequestType(event.target.value);
                  setFormStatus("idle");
                }}
                required
              >
                <option value="" disabled>
                  {t("Select an option")}
                </option>
                <option value="Studio collaboration">{t("Studio collaboration")}</option>
                <option value="Fitness event">{t("Fitness event")}</option>
                <option value="Special / themed ride">{t("Special / themed ride")}</option>
                <option value="Guest class">{t("Guest class")}</option>
                <option value="Corporate / team event">{t("Corporate / team event")}</option>
                <option value="Private group request">{t("Private group request")}</option>
                <option value="Potential partnership">{t("Potential partnership")}</option>
                <option value="General question">{t("General question")}</option>
                <option value="Other">{t("Other")}</option>
              </select>
            </label>
            {isEventRequest ? (
              <div className="conditional-fields">
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
                    {t("Approximate group size")}
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
              </div>
            ) : null}
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

function Moments({
  moments,
  language,
  t,
}: {
  moments: MomentContent[];
  language: Language;
  t: (value: string) => string;
}) {
  const [featuredMoment, ...additionalMoments] = moments;

  return (
    <section className="chapter moments-chapter" id="moments">
      <div className="moments-editorial">
        <article className="moment-feature">
          <div className="moments-heading">
            <h2>{t("Miriam in Action")}</h2>
            <p>{t("Energy, movement and moments from the room.")}</p>
          </div>
          <div className="moment-media motion-image">
            <MomentMedia
              mediaType={featuredMoment.mediaType}
              mediaUrl={featuredMoment.mediaUrl}
              posterUrl={featuredMoment.posterUrl}
              title={featuredMoment.title}
            />
          </div>
          <MomentDetails
            className="moment-feature-details"
            language={language}
            moment={featuredMoment}
            t={t}
          />
        </article>

        {additionalMoments.length ? (
          <div className={momentGridClassName(additionalMoments.length)}>
            {additionalMoments.map((moment) => (
              <article className="moment-card" key={moment.id}>
                <div className="moment-media motion-image">
                  <MomentMedia
                    mediaType={moment.mediaType}
                    mediaUrl={moment.mediaUrl}
                    posterUrl={moment.posterUrl}
                    title={moment.title}
                  />
                </div>
                <MomentDetails language={language} moment={moment} t={t} />
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function MomentDetails({
  className,
  language,
  moment,
  t,
}: {
  className?: string;
  language: Language;
  moment: MomentContent;
  t: (value: string) => string;
}) {
  return (
    <div className={`moment-copy${className ? ` ${className}` : ""}`}>
      <p className="moment-type">{t(moment.type)}</p>
      <h3>{moment.title}</h3>
      <div className="moment-meta">
        <span>{moment.location}</span>
        {moment.date ? (
          <time dateTime={moment.date}>
            {new Intl.DateTimeFormat(language === "nl" ? "nl-BE" : "en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
              timeZone: "UTC",
            }).format(new Date(`${moment.date}T00:00:00Z`))}
          </time>
        ) : null}
      </div>
      <p>{moment.caption}</p>
      {moment.externalUrl ? (
        <a href={moment.externalUrl} target="_blank" rel="noopener noreferrer">
          {t("View moment")}
          <ArrowSquareOut aria-hidden="true" size={15} weight="bold" />
        </a>
      ) : null}
    </div>
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
