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
  icon: typeof Camera;
}> = [
  {
    action: "capture",
    title: { en: "Capture", nl: "Vastleggen" },
    icon: Camera,
  },
  {
    action: "share",
    title: { en: "Share", nl: "Delen" },
    icon: ShareNetwork,
  },
  {
    action: "connect",
    title: { en: "Connect", nl: "Verbinden" },
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
      <InstagramFollowerTracker
        focusDescription={text.focusDescription}
        focusLabel={text.currentFocus}
        focusTitle={text.buildFollowing}
        initialSnapshots={followerSnapshots}
      />

      <section className={styles.momentumPanel} aria-labelledby="momentum-title" id="momentum">
        <div className={styles.momentumHeading}>
          <div className={styles.momentumProgress}>
            <h2 id="momentum-title">{text.thisWeek}</h2>
            <strong>{momentum.completedCount} {text.of} 3</strong>
          </div>
          <p className={`${styles.momentumState} ${momentum.isMomentumWeek ? styles.secured : ""}`}>
            {momentum.isMomentumWeek ? (
              <CheckCircle aria-hidden="true" size={17} weight="fill" />
            ) : (
              <Circle aria-hidden="true" size={17} weight="bold" />
            )}
            {momentum.isMomentumWeek ? text.momentumSecured : text.inProgress}
          </p>
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
                <div className={styles.actionIdentity}>
                  <Icon aria-hidden="true" size={20} weight="duotone" />
                  <h3>{item.title[language]}</h3>
                </div>
                <span className={styles.actionStatus}>
                  {complete ? (
                    <CheckCircle aria-hidden="true" size={15} weight="fill" />
                  ) : (
                    <Circle aria-hidden="true" size={15} weight="bold" />
                  )}
                  {complete ? text.done : text.toDo}
                </span>
                {item.action === "share" ? (
                  <ShareAction
                    complete={complete}
                    language={language}
                    shareUrl={momentum.currentShareUrl}
                  />
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.contentOverview} aria-labelledby="content-title">
        <div className={styles.sectionHeading}>
          <h2 id="content-title">{text.content}</h2>
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
          <SummaryCard
            icon={ShareNetwork}
            category={text.share}
            title={text.featuredPostCategory}
            detail={instagram?.label ?? text.noFeaturedPost}
            statusLabel={instagram?.published ? text.published : text.draft}
            statusPositive={instagram?.published ?? false}
            href="/studio?editor=instagram#instagram"
            action={text.changePost}
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
    thisWeek: "This week",
    of: "of",
    currentStreak: "Current streak",
    week: "week",
    weeks: "weeks",
    done: "Done",
    toDo: "To do",
    momentumSecured: "Momentum secured",
    inProgress: "In progress",
    currentFocus: "Current focus",
    buildFollowing: "Build the following",
    focusDescription: "Turn people who already enjoy your classes into people who keep following what you do.",
    content: "Content",
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
    sharedThisWeek: "Shared this week",
    markShared: "Mark as shared",
    saveShare: "Save share",
    addLinkOptional: "Add link (optional)",
    shareLink: "Public share link",
    editShare: "View / edit share",
  },
  nl: {
    thisWeek: "Deze week",
    of: "van",
    currentStreak: "Huidige reeks",
    week: "week",
    weeks: "weken",
    done: "Klaar",
    toDo: "Te doen",
    momentumSecured: "Momentum behaald",
    inProgress: "Bezig",
    currentFocus: "Huidige focus",
    buildFollowing: "Bouw de volgersgroep op",
    focusDescription: "Maak van mensen die van je lessen genieten mensen die blijven volgen wat je doet.",
    content: "Content",
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
    sharedThisWeek: "Deze week gedeeld",
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
      <div className={styles.summaryCardHeading}>
        <Icon aria-hidden="true" size={19} weight="duotone" />
        <p>{category}</p>
      </div>
      <div className={styles.summaryCardBody}>
        <h3>{title}</h3>
        <span className={styles.summaryDetail}>{detail}</span>
      </div>
      <div className={styles.summaryCardFooter}>
        {statusLabel ? (
          <span className={`${styles.summaryStatus} ${statusPositive ? styles.summaryStatusPositive : ""}`}>
            {statusLabel}
          </span>
        ) : <span />}
        <Link href={href}>
          {action}
          <ArrowRight aria-hidden="true" size={16} weight="bold" />
        </Link>
      </div>
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
      <details className={styles.shareQuickAction} id="momentum-share">
        <summary>
          {text.markShared}
          <ArrowRight aria-hidden="true" size={16} weight="bold" />
        </summary>
        <form action={markShareCompleted} className={styles.shareActionForm}>
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
          <button type="submit">{text.markShared}</button>
        </form>
      </details>
    );
  }

  return (
    <details className={`${styles.shareQuickAction} ${styles.shareComplete}`} id="momentum-share">
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
        <button type="submit">{text.saveShare}</button>
      </form>
    </details>
  );
}
