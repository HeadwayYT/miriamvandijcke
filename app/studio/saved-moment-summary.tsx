"use client";

import Link from "next/link";
import type { MomentContent } from "@/lib/studio/content";
import { ArrowRight, ImageSquare, VideoCamera } from "./icons";
import { useStudioLanguage } from "./studio-language";
import styles from "./studio.module.css";

export function SavedMomentSummary({
  moment,
  selected,
}: {
  moment: MomentContent;
  selected: boolean;
}) {
  const language = useStudioLanguage();
  const mediaLabel = moment.mediaType === "video"
    ? "VIDEO"
    : language === "nl" ? "FOTO" : "PHOTO";
  const statusLabel = moment.published
    ? language === "nl" ? "Gepubliceerd" : "Published"
    : language === "nl" ? "Concept" : "Draft";

  return (
    <article className={`${styles.savedMomentRow} ${selected ? styles.selectedMoment : ""}`}>
      {moment.mediaType === "photo" || moment.posterUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={moment.mediaType === "photo" ? moment.mediaUrl : moment.posterUrl ?? ""} alt="" loading="lazy" />
      ) : (
        <div className={styles.savedMomentPlaceholder} aria-hidden="true">
          {moment.mediaType === "video"
            ? <VideoCamera size={24} weight="duotone" />
            : <ImageSquare size={24} weight="duotone" />}
        </div>
      )}
      <div className={styles.savedMomentContent}>
        <p>{moment.type}</p>
        <h3>{moment.title}</h3>
        <span>{mediaLabel} · {statusLabel}</span>
        <small>{[moment.date, moment.location].filter(Boolean).join(" · ")}</small>
      </div>
      <Link href={`/studio?editor=moments&moment=${moment.id}#moment-work`}>
        {language === "nl" ? "Bewerk" : "Edit"}
        <ArrowRight aria-hidden="true" size={16} weight="bold" />
      </Link>
    </article>
  );
}
