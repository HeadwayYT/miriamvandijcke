"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { Language } from "@/app/translations";
import {
  getBelgiumDateKey,
  mergeFollowerSnapshot,
  parsePositiveFollowerCount,
  type FollowerSnapshot,
} from "@/lib/studio/followers";
import { saveInstagramFollowerCount } from "./actions";
import { CheckCircle, InstagramLogo, TrendUp } from "./icons";
import { useStudioLanguage } from "./studio-language";
import styles from "./studio.module.css";

type SaveState = "idle" | "invalid" | "saving" | "saved" | "error";

export function InstagramFollowerTracker({
  focusDescription,
  focusLabel,
  focusTitle,
  initialSnapshots,
}: {
  focusDescription: string;
  focusLabel: string;
  focusTitle: string;
  initialSnapshots: FollowerSnapshot[];
}) {
  const language = useStudioLanguage();
  const copy = followerCopy[language];
  const [snapshots, setSnapshots] = useState(initialSnapshots);
  const latest = snapshots.at(-1) ?? null;
  const [value, setValue] = useState(latest ? String(latest.followerCount) : "");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [isPending, startTransition] = useTransition();
  const lastSavedValue = useRef(latest?.followerCount ?? null);

  useEffect(() => {
    if (saveState !== "saved") return;
    const timeout = window.setTimeout(() => setSaveState("idle"), 2200);
    return () => window.clearTimeout(timeout);
  }, [saveState]);

  function commitValue() {
    const followerCount = parsePositiveFollowerCount(value);
    if (followerCount === null) {
      setValue(latest ? String(latest.followerCount) : "");
      setSaveState("invalid");
      return;
    }

    const today = getBelgiumDateKey(new Date());
    if (followerCount === lastSavedValue.current && latest?.date === today) {
      setSaveState("idle");
      return;
    }

    setSaveState("saving");
    startTransition(async () => {
      const result = await saveInstagramFollowerCount(followerCount);
      if (!result.ok) {
        setSaveState("error");
        return;
      }

      lastSavedValue.current = result.snapshot.followerCount;
      setValue(String(result.snapshot.followerCount));
      setSnapshots((current) => mergeFollowerSnapshot(current, result.snapshot));
      setSaveState("saved");
    });
  }

  return (
    <section className={styles.followerTracker} aria-labelledby="strategy-overview-title">
      <div className={styles.strategyFocus}>
        <p>{focusLabel}</p>
        <h2 id="strategy-overview-title">{focusTitle}</h2>
        <span>{focusDescription}</span>
      </div>

      <div className={styles.followerInputPanel}>
        <div className={styles.followerLabel}>
          <InstagramLogo aria-hidden="true" size={19} weight="bold" />
          <label htmlFor="instagram-followers">
            {copy.instagramFollowers}
          </label>
        </div>
        <input
          id="instagram-followers"
          className={styles.followerInput}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          aria-describedby="follower-save-status"
          value={value}
          disabled={isPending}
          placeholder="0"
          onBlur={commitValue}
          onChange={(event) => {
            setValue(event.target.value);
            if (saveState !== "idle") setSaveState("idle");
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              event.currentTarget.blur();
            }
          }}
        />
        <p
          className={`${styles.followerSaveStatus} ${saveState === "error" || saveState === "invalid" ? styles.followerSaveError : ""}`}
          id="follower-save-status"
          aria-live="polite"
        >
          {saveState === "saving" ? copy.saving : null}
          {saveState === "saved" ? (
            <><CheckCircle aria-hidden="true" size={15} weight="fill" />{copy.saved}</>
          ) : null}
          {saveState === "invalid" ? copy.invalid : null}
          {saveState === "error" ? copy.error : null}
        </p>
      </div>

      <FollowerGrowthChart language={language} snapshots={snapshots} />
    </section>
  );
}

function FollowerGrowthChart({
  language,
  snapshots,
}: {
  language: Language;
  snapshots: FollowerSnapshot[];
}) {
  const copy = followerCopy[language];
  const chart = useMemo(() => createChart(snapshots), [snapshots]);

  return (
    <div className={styles.followerChartPanel}>
      <div className={styles.followerChartHeading}>
        <TrendUp aria-hidden="true" size={18} weight="duotone" />
        <p>{copy.followerGrowth}</p>
      </div>
      {chart ? (
        <div className={styles.followerChart}>
          <div className={styles.followerYAxis} aria-hidden="true">
            <span>{chart.maximum.toLocaleString(language === "nl" ? "nl-BE" : "en-GB")}</span>
            <span>{chart.minimum.toLocaleString(language === "nl" ? "nl-BE" : "en-GB")}</span>
          </div>
          <div className={styles.followerPlot}>
            <svg
              role="img"
              aria-label={`${copy.followerGrowth}: ${snapshots.length} ${snapshots.length === 1 ? copy.entry : copy.entries}`}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <line className={styles.chartGridLine} x1="0" y1="10" x2="100" y2="10" />
              <line className={styles.chartGridLine} x1="0" y1="50" x2="100" y2="50" />
              <line className={styles.chartGridLine} x1="0" y1="90" x2="100" y2="90" />
              <path className={styles.chartLine} d={chart.path} />
            </svg>
            <div className={styles.followerXAxis} aria-hidden="true">
              {chart.labels.map((label) => (
                <span key={label.date}>{formatChartDate(label.date, language, snapshots)}</span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className={styles.followerEmpty}>{copy.empty}</p>
      )}
    </div>
  );
}

function createChart(snapshots: FollowerSnapshot[]) {
  if (!snapshots.length) return null;

  const counts = snapshots.map((snapshot) => snapshot.followerCount);
  const rawMinimum = Math.min(...counts);
  const rawMaximum = Math.max(...counts);
  const range = Math.max(1, rawMaximum - rawMinimum);
  const padding = Math.max(2, Math.ceil(range * 0.12));
  const minimum = Math.max(0, rawMinimum - padding);
  const maximum = rawMaximum + padding;
  const span = Math.max(1, maximum - minimum);
  const firstTime = Date.parse(`${snapshots[0].date}T00:00:00Z`);
  const lastTime = Date.parse(`${snapshots.at(-1)!.date}T00:00:00Z`);
  const timeSpan = Math.max(1, lastTime - firstTime);
  const points = snapshots.map((snapshot, index) => ({
    date: snapshot.date,
    x: snapshots.length === 1 ? 50 : ((Date.parse(`${snapshot.date}T00:00:00Z`) - firstTime) / timeSpan) * 100,
    y: 90 - ((snapshot.followerCount - minimum) / span) * 80,
    index,
  }));
  const labelIndexes = [...new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])];

  return {
    labels: labelIndexes.map((index) => points[index]),
    maximum,
    minimum,
    path: points.length === 1
      ? `M48,${points[0].y.toFixed(2)} L52,${points[0].y.toFixed(2)}`
      : points.map((point, index) => `${index ? "L" : "M"}${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" "),
    points,
  };
}

function formatChartDate(
  date: string,
  language: Language,
  snapshots: FollowerSnapshot[],
): string {
  const locale = language === "nl" ? "nl-BE" : "en-GB";
  const first = Date.parse(`${snapshots[0].date}T00:00:00Z`);
  const last = Date.parse(`${snapshots.at(-1)!.date}T00:00:00Z`);
  const spansSeveralMonths = last - first > 60 * 24 * 60 * 60 * 1000;

  return new Intl.DateTimeFormat(locale, spansSeveralMonths
    ? { month: "short", year: "2-digit", timeZone: "UTC" }
    : { day: "numeric", month: "short", timeZone: "UTC" }
  ).format(new Date(`${date}T00:00:00Z`));
}

const followerCopy = {
  en: {
    instagramFollowers: "Instagram followers",
    followerGrowth: "Follower growth",
    saving: "Saving...",
    saved: "Saved",
    invalid: "Enter a positive whole number.",
    error: "Could not save. Try again.",
    empty: "Add your current follower count to start the graph.",
    entry: "entry",
    entries: "entries",
  },
  nl: {
    instagramFollowers: "Instagramvolgers",
    followerGrowth: "Groei van volgers",
    saving: "Bewaren...",
    saved: "Bewaard",
    invalid: "Vul een positief geheel getal in.",
    error: "Bewaren is niet gelukt. Probeer opnieuw.",
    empty: "Voeg je huidige aantal volgers toe om de grafiek te starten.",
    entry: "meting",
    entries: "metingen",
  },
} satisfies Record<Language, Record<string, string>>;
