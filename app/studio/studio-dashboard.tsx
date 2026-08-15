"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import type { Language } from "@/app/translations";
import type {
  InstagramContent,
  MomentContent,
  SpotifyContent,
} from "@/lib/studio/content";
import type { MomentumAction, MomentumStatus } from "@/lib/studio/momentum";
import {
  ArrowRight,
  Camera,
  CheckCircle,
  Circle,
  Headphones,
  ImageSquare,
  InstagramLogo,
  ShareNetwork,
  SpotifyLogo,
  Target,
} from "./icons";
import styles from "./studio.module.css";

type StudioDashboardProps = {
  instagram: InstagramContent | null;
  momentum: MomentumStatus;
  moments: MomentContent[];
  spotify: SpotifyContent | null;
};

const actionDetails: Array<{
  action: MomentumAction;
  title: Record<Language, string>;
  description: Record<Language, string>;
  href: string;
  cta: Record<Language, string>;
  icon: typeof Camera;
}> = [
  {
    action: "capture",
    title: { en: "Capture", nl: "Vastleggen" },
    description: { en: "Save one strong instructor moment.", nl: "Bewaar één sterk instructeursmoment." },
    href: "/studio?editor=moments#moments",
    cta: { en: "Add a moment", nl: "Voeg een moment toe" },
    icon: Camera,
  },
  {
    action: "share",
    title: { en: "Share", nl: "Delen" },
    description: { en: "Put one relevant piece of Miriam out into the world.", nl: "Deel één relevant moment van Miriam met de wereld." },
    href: "/studio?editor=instagram#instagram",
    cta: { en: "Update featured post", nl: "Werk de uitgelichte post bij" },
    icon: ShareNetwork,
  },
  {
    action: "connect",
    title: { en: "Connect", nl: "Verbinden" },
    description: { en: "Give people something to take away from class.", nl: "Geef deelnemers iets mee na de les." },
    href: "/studio?editor=spotify#spotify",
    cta: { en: "Update latest ride", nl: "Werk de nieuwste ride bij" },
    icon: Headphones,
  },
];

export function StudioDashboard({
  instagram,
  momentum,
  moments,
  spotify,
}: StudioDashboardProps) {
  const language = useSyncExternalStore<Language>(
    subscribeToLanguage,
    getLanguage,
    getServerLanguage,
  );
  const text = studioCopy[language];

  return (
    <div className={styles.dashboard}>
      <section className={styles.momentumPanel} aria-labelledby="momentum-title">
        <div className={styles.momentumHeading}>
          <div>
            <p className={styles.eyebrow}>{text.keepMomentum}</p>
            <h2 id="momentum-title">{text.thisWeek} <span>· {momentum.completedCount} {text.of} 3</span></h2>
          </div>
          <div className={styles.streak}>
            <span>{text.currentStreak}</span>
            <strong>{momentum.currentStreak} {momentum.currentStreak === 1 ? text.week : text.weeks}</strong>
          </div>
        </div>

        <div className={styles.momentumActions}>
          {actionDetails.map((item) => {
            const complete = momentum.completed[item.action];
            const Icon = item.icon;
            return (
              <article className={`${styles.momentumAction} ${complete ? styles.complete : ""}`} key={item.action}>
                <Icon aria-hidden="true" size={22} weight="duotone" />
                <div>
                  <div className={styles.actionTitle}>
                    <h3>{item.title[language]}</h3>
                    <span>
                      {complete ? (
                        <CheckCircle aria-hidden="true" size={16} weight="fill" />
                      ) : (
                        <Circle aria-hidden="true" size={16} weight="bold" />
                      )}
                      {complete ? text.done : text.toDo}
                    </span>
                  </div>
                  <p>{item.description[language]}</p>
                </div>
                <Link href={item.href} aria-label={`${item.cta[language]}: ${item.description[language]}`}>
                  {item.cta[language]}
                  <ArrowRight aria-hidden="true" size={16} weight="bold" />
                </Link>
              </article>
            );
          })}
        </div>

        <p className={styles.momentumRule}>
          {momentum.isMomentumWeek ? text.momentumSecured : text.momentumRule}
        </p>
      </section>

      <section className={styles.focusPanel} aria-labelledby="focus-title">
        <Target aria-hidden="true" size={25} weight="duotone" />
        <div>
          <p className={styles.eyebrow}>{text.currentFocus}</p>
          <h2 id="focus-title">{text.buildFollowing}</h2>
          <p>{text.focusDescription}</p>
        </div>
      </section>

      <section className={styles.contentOverview} aria-labelledby="content-title">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>{text.growthLoop}</p>
            <h2 id="content-title">{text.contentTools}</h2>
          </div>
          <p>{text.editorsOneTap}</p>
        </div>

        <div className={styles.summaryGrid}>
          <SummaryCard
            icon={SpotifyLogo}
            category={text.latestRideCategory}
            title={spotify?.title ?? text.noPlaylist}
            published={spotify?.published ?? false}
            href="/studio?editor=spotify#spotify"
            action={text.editRide}
          />
          <SummaryCard
            icon={InstagramLogo}
            category={text.featuredPostCategory}
            title={instagram?.label ?? text.noFeaturedPost}
            published={instagram?.published ?? false}
            href="/studio?editor=instagram#instagram"
            action={text.changePost}
          />
          <SummaryCard
            icon={ImageSquare}
            category={text.momentsCategory}
            title={`${moments.length} ${moments.length === 1 ? text.savedMoment : text.savedMoments}`}
            published={moments.some((moment) => moment.published)}
            href="/studio?editor=moments#moments"
            action={moments.length ? text.manageMoments : text.addMoment}
          />
        </div>
      </section>
    </div>
  );
}

const studioCopy = {
  en: {
    keepMomentum: "Keep the momentum",
    thisWeek: "This week",
    of: "of",
    currentStreak: "Current streak",
    week: "week",
    weeks: "weeks",
    done: "Done",
    toDo: "To do",
    momentumSecured: "Momentum week secured.",
    momentumRule: "Two of three actions make a momentum week.",
    currentFocus: "Current focus",
    buildFollowing: "Build the following",
    focusDescription: "Turn people who already enjoy your classes into people who keep following what you do.",
    growthLoop: "Growth loop",
    contentTools: "Content tools",
    editorsOneTap: "The detailed editors stay one tap away.",
    latestRideCategory: "Connect / Latest Ride",
    noPlaylist: "No playlist yet",
    editRide: "Edit ride",
    featuredPostCategory: "Share / Featured Post",
    noFeaturedPost: "No featured post yet",
    changePost: "Change post",
    momentsCategory: "Capture / Miriam in Action",
    savedMoment: "saved moment",
    savedMoments: "saved moments",
    manageMoments: "Manage moments",
    addMoment: "Add a moment",
  },
  nl: {
    keepMomentum: "Hou de vaart erin",
    thisWeek: "Deze week",
    of: "van",
    currentStreak: "Huidige reeks",
    week: "week",
    weeks: "weken",
    done: "Klaar",
    toDo: "Te doen",
    momentumSecured: "Momentumweek behaald.",
    momentumRule: "Twee van de drie acties maken een momentumweek.",
    currentFocus: "Huidige focus",
    buildFollowing: "Bouw de volgersgroep op",
    focusDescription: "Maak van mensen die van je lessen genieten mensen die blijven volgen wat je doet.",
    growthLoop: "Groeilus",
    contentTools: "Contenttools",
    editorsOneTap: "De uitgebreide editors zijn één tik verwijderd.",
    latestRideCategory: "Verbinden / Nieuwste ride",
    noPlaylist: "Nog geen playlist",
    editRide: "Bewerk ride",
    featuredPostCategory: "Delen / Uitgelichte post",
    noFeaturedPost: "Nog geen uitgelichte post",
    changePost: "Wijzig post",
    momentsCategory: "Vastleggen / Miriam in Action",
    savedMoment: "bewaard moment",
    savedMoments: "bewaarde momenten",
    manageMoments: "Beheer momenten",
    addMoment: "Voeg een moment toe",
  },
} satisfies Record<Language, Record<string, string>>;

function subscribeToLanguage(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function getLanguage(): Language {
  return window.localStorage.getItem("miriam-language") === "nl" ? "nl" : "en";
}

function getServerLanguage(): Language {
  return "en";
}

function SummaryCard({
  action,
  category,
  href,
  icon: Icon,
  published,
  title,
}: {
  action: string;
  category: string;
  href: string;
  icon: typeof SpotifyLogo;
  published: boolean;
  title: string;
}) {
  return (
    <article className={styles.summaryCard}>
      <Icon aria-hidden="true" size={22} weight="duotone" />
      <div>
        <p>{category}</p>
        <h3>{title}</h3>
      </div>
      <span className={`${styles.status} ${published ? styles.published : ""}`}>
        {published ? "Published" : "Draft"}
      </span>
      <Link href={href}>
        {action}
        <ArrowRight aria-hidden="true" size={16} weight="bold" />
      </Link>
    </article>
  );
}
