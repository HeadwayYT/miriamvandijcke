"use client";

import Link from "next/link";
import type { Language } from "@/app/translations";
import { markShareCompleted } from "./actions";
import type {
  InstagramContent,
  MomentContent,
  SpotifyContent,
} from "@/lib/studio/content";
import type { MomentumAction, MomentumStatus } from "@/lib/studio/momentum";
import type { FollowerSnapshot } from "@/lib/studio/followers";
import { InstagramFollowerTracker } from "./instagram-follower-tracker";
import { useStudioLanguage } from "./studio-language";
import {
  ArrowRight,
  Camera,
  CheckCircle,
  Circle,
  Headphones,
  ImageSquare,
  ShareNetwork,
  Target,
} from "./icons";
import styles from "./studio.module.css";

type StudioDashboardProps = {
  instagram: InstagramContent | null;
  followerSnapshots: FollowerSnapshot[];
  momentum: MomentumStatus;
  moments: MomentContent[];
  spotify: SpotifyContent | null;
};

const actionDetails: Array<{
  action: MomentumAction;
  title: Record<Language, string>;
  description: Record<Language, string>;
  href: string;
  completeCta: Record<Language, string>;
  incompleteCta: Record<Language, string>;
  icon: typeof Camera;
}> = [
  {
    action: "capture",
    title: { en: "Capture", nl: "Vastleggen" },
    description: { en: "Save one strong instructor moment.", nl: "Bewaar één sterk instructeursmoment." },
    href: "/studio?editor=moments#moments",
    completeCta: { en: "View moments", nl: "Bekijk momenten" },
    incompleteCta: { en: "Add a moment", nl: "Voeg een moment toe" },
    icon: Camera,
  },
  {
    action: "share",
    title: { en: "Share", nl: "Delen" },
    description: { en: "Put one relevant piece of Miriam out into the world.", nl: "Deel één relevant moment van Miriam met de wereld." },
    href: "#momentum-share",
    completeCta: { en: "Shared", nl: "Gedeeld" },
    incompleteCta: { en: "Mark as shared", nl: "Markeer als gedeeld" },
    icon: ShareNetwork,
  },
  {
    action: "connect",
    title: { en: "Connect", nl: "Verbinden" },
    description: { en: "Give people something to take away from class.", nl: "Geef deelnemers iets mee na de les." },
    href: "/studio?editor=spotify#spotify",
    completeCta: { en: "View latest ride", nl: "Bekijk nieuwste ride" },
    incompleteCta: { en: "Update latest ride", nl: "Werk de nieuwste ride bij" },
    icon: Headphones,
  },
];

export function StudioDashboard({
  instagram,
  followerSnapshots,
  momentum,
  moments,
  spotify,
}: StudioDashboardProps) {
  const language = useStudioLanguage();
  const text = studioCopy[language];
  const draftMoments = moments.filter((moment) => !moment.published).length;

  return (
    <div className={styles.dashboard}>
      <section className={styles.momentumPanel} aria-labelledby="momentum-title" id="momentum">
        <div className={styles.momentumHeading}>
          <div>
            <p className={styles.eyebrow}>{text.keepMomentum}</p>
            <h2 id="momentum-title">{text.thisWeek} <span>· {momentum.completedCount} {text.of} 3</span></h2>
            {momentum.isMomentumWeek ? (
              <p className={styles.momentumSecured}>
                <CheckCircle aria-hidden="true" size={17} weight="fill" />
                {text.momentumSecured}
              </p>
            ) : null}
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
                {item.action === "share" ? (
                  <ShareAction
                    complete={complete}
                    language={language}
                    shareUrl={momentum.currentShareUrl}
                  />
                ) : (
                  <Link
                    href={item.href}
                    aria-label={`${complete ? item.completeCta[language] : item.incompleteCta[language]}: ${item.description[language]}`}
                  >
                    {complete ? item.completeCta[language] : item.incompleteCta[language]}
                    <ArrowRight aria-hidden="true" size={16} weight="bold" />
                  </Link>
                )}
              </article>
            );
          })}
        </div>

        <p className={styles.momentumRule}>
          {text.momentumRule}
        </p>
      </section>

      <InstagramFollowerTracker initialSnapshots={followerSnapshots} />

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
            icon={ImageSquare}
            category={text.capture}
            title={text.momentsCategory}
            detail={`${moments.length} ${moments.length === 1 ? text.savedMoment : text.savedMoments}${draftMoments ? ` · ${draftMoments} ${draftMoments === 1 ? text.draft : text.drafts}` : ""}`}
            href="/studio?editor=moments#moments"
            action={moments.length ? text.manageMoments : text.addMoment}
          />
          <ShareSummaryCard
            complete={momentum.completed.share}
            instagram={instagram}
            language={language}
          />
          <SummaryCard
            icon={Headphones}
            category={text.connect}
            title={text.latestRideCategory}
            detail={spotify?.title ?? text.noPlaylist}
            statusLabel={spotify?.published ? text.published : text.draft}
            statusPositive={spotify?.published ?? false}
            href="/studio?editor=spotify#spotify"
            action={text.editRide}
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
    momentumSecured: "Momentum secured",
    momentumRule: "Two of three actions make a momentum week.",
    currentFocus: "Current focus",
    buildFollowing: "Build the following",
    focusDescription: "Turn people who already enjoy your classes into people who keep following what you do.",
    growthLoop: "Capture · Share · Connect",
    contentTools: "Content tools",
    editorsOneTap: "The detailed editors stay one tap away.",
    capture: "Capture",
    share: "Share",
    connect: "Connect",
    latestRideCategory: "Latest Ride",
    noPlaylist: "No playlist yet",
    editRide: "Edit ride",
    featuredPostCategory: "Featured Instagram Post",
    noFeaturedPost: "No featured post yet",
    changePost: "Change post",
    momentsCategory: "Miriam in Action",
    savedMoment: "saved moment",
    savedMoments: "saved moments",
    manageMoments: "Manage moments",
    addMoment: "Add a moment",
    draft: "draft",
    drafts: "drafts",
    published: "Published",
    weeklyAction: "Weekly action",
    sharedThisWeek: "Shared this week",
    notMarkedYet: "Not marked yet",
    featuredOnWebsite: "Featured on website",
    featuredSeparate: "Featuring a post here is separate from marking Share complete.",
    markShared: "Mark as shared",
    saveShare: "Save share",
    addLinkOptional: "Add link (optional)",
    shareLink: "Public share link",
    editShare: "View / edit share",
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
    momentumSecured: "Momentum behaald",
    momentumRule: "Twee van de drie acties maken een momentumweek.",
    currentFocus: "Huidige focus",
    buildFollowing: "Bouw de volgersgroep op",
    focusDescription: "Maak van mensen die van je lessen genieten mensen die blijven volgen wat je doet.",
    growthLoop: "Vastleggen · Delen · Verbinden",
    contentTools: "Contenttools",
    editorsOneTap: "De uitgebreide editors zijn één tik verwijderd.",
    capture: "Vastleggen",
    share: "Delen",
    connect: "Verbinden",
    latestRideCategory: "Nieuwste ride",
    noPlaylist: "Nog geen playlist",
    editRide: "Bewerk ride",
    featuredPostCategory: "Uitgelichte Instagram-post",
    noFeaturedPost: "Nog geen uitgelichte post",
    changePost: "Wijzig post",
    momentsCategory: "Miriam in Action",
    savedMoment: "bewaard moment",
    savedMoments: "bewaarde momenten",
    manageMoments: "Beheer momenten",
    addMoment: "Voeg een moment toe",
    draft: "concept",
    drafts: "concepten",
    published: "Gepubliceerd",
    weeklyAction: "Wekelijkse actie",
    sharedThisWeek: "Deze week gedeeld",
    notMarkedYet: "Nog niet gemarkeerd",
    featuredOnWebsite: "Uitgelicht op de website",
    featuredSeparate: "Een post uitlichten staat los van Delen als voltooid markeren.",
    markShared: "Markeer als gedeeld",
    saveShare: "Bewaar deelactie",
    addLinkOptional: "Voeg link toe (optioneel)",
    shareLink: "Publieke link",
    editShare: "Bekijk / bewerk deelactie",
  },
} satisfies Record<Language, Record<string, string>>;

function SummaryCard({
  action,
  category,
  detail,
  href,
  icon: Icon,
  statusLabel,
  statusPositive = false,
  title,
}: {
  action: string;
  category: string;
  detail: string;
  href: string;
  icon: typeof ImageSquare;
  statusLabel?: string;
  statusPositive?: boolean;
  title: string;
}) {
  return (
    <article className={styles.summaryCard}>
      <Icon aria-hidden="true" size={22} weight="duotone" />
      <div>
        <p>{category}</p>
        <h3>{title}</h3>
        <span className={styles.summaryDetail}>{detail}</span>
      </div>
      {statusLabel ? (
        <span className={`${styles.status} ${statusPositive ? styles.published : ""}`}>
          {statusLabel}
        </span>
      ) : null}
      <Link href={href}>
        {action}
        <ArrowRight aria-hidden="true" size={16} weight="bold" />
      </Link>
    </article>
  );
}

function ShareAction({
  complete,
  language,
  shareUrl,
}: {
  complete: boolean;
  language: Language;
  shareUrl: string | null;
}) {
  const text = studioCopy[language];

  if (!complete) {
    return (
      <form action={markShareCompleted} className={styles.shareActionForm} id="momentum-share">
        <label>
          <span>{text.addLinkOptional}</span>
          <input
            aria-label={text.shareLink}
            inputMode="url"
            name="shareUrl"
            placeholder="https://..."
            type="url"
          />
        </label>
        <button type="submit">
          {text.markShared}
          <ArrowRight aria-hidden="true" size={16} weight="bold" />
        </button>
      </form>
    );
  }

  return (
    <div className={styles.shareComplete} id="momentum-share">
      <span>
        <CheckCircle aria-hidden="true" size={16} weight="fill" />
        {text.sharedThisWeek}
      </span>
      <details>
        <summary>{text.editShare}</summary>
        <form action={markShareCompleted} className={styles.shareActionForm}>
          <label>
            <span>{text.addLinkOptional}</span>
            <input
              aria-label={text.shareLink}
              defaultValue={shareUrl ?? ""}
              inputMode="url"
              name="shareUrl"
              placeholder="https://..."
              type="url"
            />
          </label>
          <button type="submit">
            {text.saveShare}
            <ArrowRight aria-hidden="true" size={16} weight="bold" />
          </button>
        </form>
      </details>
    </div>
  );
}

function ShareSummaryCard({
  complete,
  instagram,
  language,
}: {
  complete: boolean;
  instagram: InstagramContent | null;
  language: Language;
}) {
  const text = studioCopy[language];

  return (
    <article className={`${styles.summaryCard} ${styles.shareSummaryCard}`}>
      <ShareNetwork aria-hidden="true" size={22} weight="duotone" />
      <div>
        <p>{text.share}</p>
        <h3>{text.featuredPostCategory}</h3>
        <span className={styles.summaryDetail}>{instagram?.label ?? text.noFeaturedPost}</span>
        <div className={styles.weeklyShareStatus}>
          <span>{text.weeklyAction}</span>
          <strong>
            {complete ? (
              <CheckCircle aria-hidden="true" size={14} weight="fill" />
            ) : (
              <Circle aria-hidden="true" size={14} weight="bold" />
            )}
            {complete ? text.sharedThisWeek : text.notMarkedYet}
          </strong>
        </div>
        <small>{text.featuredSeparate}</small>
      </div>
      <span className={`${styles.status} ${instagram?.published ? styles.published : ""}`}>
        {instagram?.published ? text.published : text.draft}
      </span>
      <Link href="/studio?editor=instagram#instagram">
        {text.changePost}
        <ArrowRight aria-hidden="true" size={16} weight="bold" />
      </Link>
    </article>
  );
}
