"use client";

import { useState } from "react";
import { FloppyDisk } from "./icons";
import { saveMoment } from "./actions";
import { momentImagesBucket, momentTypes, type MomentContent } from "@/lib/studio/content";
import { StudioImageUpload } from "./studio-image-upload";
import styles from "./studio.module.css";

type MomentFormProps = {
  moment?: MomentContent;
  storageConfig: {
    publishableKey: string;
    url: string;
  };
};

export function MomentForm({ moment, storageConfig }: MomentFormProps) {
  const [mediaUrl, setMediaUrl] = useState(moment?.mediaUrl ?? "");
  const [uploadBusy, setUploadBusy] = useState(false);

  return (
    <form action={saveMoment} className={styles.form}>
      {moment ? <input type="hidden" name="id" value={moment.id} /> : null}
      <input type="hidden" name="mediaUrl" value={mediaUrl} />
      <input type="hidden" name="previousMediaUrl" value={moment?.mediaUrl ?? ""} />
      <div className={styles.formRow}>
        <label>
          Title
          <input name="title" type="text" maxLength={80} defaultValue={moment?.title ?? ""} placeholder="Pride Ride" required />
        </label>
        <label>
          Type
          <select name="type" defaultValue={moment?.type ?? "Special ride"} required>
            {momentTypes.map((type) => <option value={type} key={type}>{type}</option>)}
          </select>
        </label>
      </div>
      <div className={styles.formRow}>
        <label>
          Date <span>optional</span>
          <input name="date" type="date" defaultValue={moment?.date ?? ""} />
        </label>
        <label>
          Location / venue
          <input name="location" type="text" maxLength={100} defaultValue={moment?.location ?? ""} placeholder="Pulsate Antwerp" required />
        </label>
      </div>
      <label>
        Short caption
        <textarea name="caption" maxLength={240} rows={3} defaultValue={moment?.caption ?? ""} placeholder="A short, factual note about this moment." required />
      </label>

      <StudioImageUpload
        bucket={momentImagesBucket}
        value={mediaUrl}
        storageConfig={storageConfig}
        previewAlt="Selected Moment preview"
        onBusyChange={setUploadBusy}
        onChange={setMediaUrl}
      />

      <label>
        External link <span>optional</span>
        <input name="externalUrl" type="url" inputMode="url" defaultValue={moment?.externalUrl ?? ""} placeholder="Instagram, event or studio page" />
      </label>
      <label className={styles.publishToggle}>
        <input name="status" type="checkbox" value="published" defaultChecked={moment?.published ?? false} />
        <span aria-hidden="true" />
        Published
      </label>
      <button className={styles.saveButton} type="submit" disabled={uploadBusy || !mediaUrl}>
        <FloppyDisk aria-hidden="true" size={19} weight="bold" />
        {moment ? "Save moment" : "Add moment"}
      </button>
    </form>
  );
}
