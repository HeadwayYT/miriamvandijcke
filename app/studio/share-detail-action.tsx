"use client";

import { useSyncExternalStore } from "react";
import type { Language } from "@/app/translations";
import type { MomentumStatus } from "@/lib/studio/momentum";
import { markShareCompleted } from "./actions";
import { ArrowRight, CheckCircle, ShareNetwork } from "./icons";
import styles from "./studio.module.css";

export function ShareDetailAction({ momentum }: { momentum: MomentumStatus }) {
  const language = useSyncExternalStore<Language>(
    subscribeToLanguage,
    getLanguage,
    getServerLanguage,
  );
  const text = copy[language];
  const complete = momentum.completed.share;

  return (
    <section className={styles.detailAction} aria-labelledby="weekly-share-title" id="weekly-share">
      <div className={styles.detailActionHeading}>
        <ShareNetwork aria-hidden="true" size={25} weight="duotone" />
        <div>
          <p className={styles.eyebrow}>{text.weeklyAction}</p>
          <h2 id="weekly-share-title">{text.shareThisWeek}</h2>
          <p>{text.description}</p>
        </div>
        {complete ? (
          <span className={`${styles.status} ${styles.published}`}>
            <CheckCircle aria-hidden="true" size={14} weight="fill" />
            {text.shared}
          </span>
        ) : null}
      </div>

      <form action={markShareCompleted} className={styles.detailShareForm}>
        <label>
          {text.link} <span>{text.optional}</span>
          <input
            defaultValue={momentum.currentShareUrl ?? ""}
            inputMode="url"
            name="shareUrl"
            placeholder="https://..."
            type="url"
          />
        </label>
        <button className={styles.saveButton} type="submit">
          {complete ? text.update : text.mark}
          <ArrowRight aria-hidden="true" size={17} weight="bold" />
        </button>
      </form>
    </section>
  );
}

const copy = {
  en: {
    weeklyAction: "Weekly action",
    shareThisWeek: "Share this week",
    description: "Put one meaningful piece of Miriam out into the world.",
    shared: "Shared this week",
    link: "Public share link",
    optional: "optional",
    update: "Update share",
    mark: "Mark as shared",
  },
  nl: {
    weeklyAction: "Wekelijkse actie",
    shareThisWeek: "Deel deze week",
    description: "Breng één betekenisvol moment van Miriam naar buiten.",
    shared: "Deze week gedeeld",
    link: "Publieke link",
    optional: "optioneel",
    update: "Werk deelactie bij",
    mark: "Markeer als gedeeld",
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
