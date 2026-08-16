"use client";

import Link from "next/link";
import { ArrowRight, FloppyDisk, TrendUp } from "./icons";
import { saveGrowthSignal } from "./actions";
import {
  formatGrowthMonth,
  type GrowthSignal,
} from "@/lib/studio/growth";
import { useStudioLanguage } from "./studio-language";
import styles from "./studio.module.css";

type GrowthSignalsEditorProps = {
  currentMonth: string;
  records: GrowthSignal[];
  selectedMonth: string;
};

export function GrowthSignalsEditor({
  currentMonth,
  records,
  selectedMonth,
}: GrowthSignalsEditorProps) {
  const language = useStudioLanguage();
  const copy = growthCopy[language];
  const selected = records.find((record) => record.month === selectedMonth) ?? null;

  return (
    <div className={`${styles.detailStack} ${styles.singleEditor}`}>
      <section className={styles.editor} id="growth">
        <div className={styles.editorHeading}>
          <TrendUp aria-hidden="true" size={28} weight="duotone" />
          <div>
            <p>{copy.growthSignals}</p>
            <h2>{selectedMonth === currentMonth ? copy.thisMonth : formatGrowthMonth(selectedMonth, language)}</h2>
          </div>
        </div>

        <form action={saveGrowthSignal} className={styles.form}>
          <label>
            {copy.month}
            <input name="month" type="month" defaultValue={selectedMonth} required />
          </label>
          <label>
            {copy.instagramFollowers}
            <input
              name="instagramFollowers"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              defaultValue={selected?.instagramFollowers ?? ""}
              required
            />
          </label>
          <div className={styles.formRow}>
            <label>
              {copy.invitations}
              <input name="invitations" type="number" inputMode="numeric" min="0" step="1" defaultValue={selected?.invitations ?? 0} required />
            </label>
            <label>
              {copy.collaborations}
              <input name="collaborations" type="number" inputMode="numeric" min="0" step="1" defaultValue={selected?.collaborations ?? 0} required />
            </label>
          </div>
          <label>
            {copy.optionalNote} <span>{copy.optional}</span>
            <input name="note" type="text" maxLength={160} defaultValue={selected?.note ?? ""} placeholder={copy.notePlaceholder} />
          </label>
          <button className={styles.saveButton} type="submit">
            <FloppyDisk aria-hidden="true" size={19} weight="bold" />
            {copy.saveMonth}
          </button>
        </form>
      </section>

      <section className={styles.editor} aria-labelledby="growth-history-title">
        <div className={styles.compactSectionHeading}>
          <div>
            <p className={styles.eyebrow}>{copy.history}</p>
            <h2 id="growth-history-title">{copy.monthlySnapshots}</h2>
          </div>
        </div>
        {records.length ? (
          <div className={styles.growthHistory}>
            {records.map((record) => (
              <article key={record.id}>
                <div>
                  <strong>{formatGrowthMonth(record.month, language)}</strong>
                  <span>
                    {record.instagramFollowers} {copy.followers} · {record.invitations} {record.invitations === 1 ? copy.invitation : copy.invitationsShort} · {record.collaborations} {record.collaborations === 1 ? copy.collaboration : copy.collaborationsShort}
                  </span>
                  {record.note ? <small>{record.note}</small> : null}
                </div>
                <Link href={`/studio?editor=growth&month=${record.month}#growth`}>
                  {copy.edit}
                  <ArrowRight aria-hidden="true" size={16} weight="bold" />
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className={styles.emptyState}>{copy.empty}</p>
        )}
      </section>
    </div>
  );
}

const growthCopy = {
  en: {
    growthSignals: "Growth signals",
    thisMonth: "This month",
    month: "Month",
    instagramFollowers: "Instagram followers",
    invitations: "Event / special invitations",
    collaborations: "Collaborations",
    optionalNote: "Note",
    optional: "optional",
    notePlaceholder: "First guest ride invitation.",
    saveMonth: "Save month",
    history: "History",
    monthlySnapshots: "Monthly snapshots",
    followers: "followers",
    invitation: "invitation",
    invitationsShort: "invitations",
    collaboration: "collaboration",
    collaborationsShort: "collaborations",
    edit: "Edit",
    empty: "Add your first monthly snapshot to start seeing how your following and opportunities develop over time.",
  },
  nl: {
    growthSignals: "Groeisignalen",
    thisMonth: "Deze maand",
    month: "Maand",
    instagramFollowers: "Instagramvolgers",
    invitations: "Uitnodigingen voor events / specials",
    collaborations: "Samenwerkingen",
    optionalNote: "Notitie",
    optional: "optioneel",
    notePlaceholder: "Eerste uitnodiging voor een guest ride.",
    saveMonth: "Bewaar maand",
    history: "Geschiedenis",
    monthlySnapshots: "Maandelijkse momentopnames",
    followers: "volgers",
    invitation: "uitnodiging",
    invitationsShort: "uitnodigingen",
    collaboration: "samenwerking",
    collaborationsShort: "samenwerkingen",
    edit: "Bewerk",
    empty: "Voeg je eerste maandelijkse momentopname toe om te zien hoe je volgers en kansen zich ontwikkelen.",
  },
} as const;
