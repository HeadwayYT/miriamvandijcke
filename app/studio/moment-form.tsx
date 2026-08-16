"use client";

import { useState } from "react";
import { FloppyDisk } from "./icons";
import { saveMoment } from "./actions";
import {
  momentImagesBucket,
  momentTypes,
  type MomentContent,
  type MomentMediaType,
} from "@/lib/studio/content";
import { StudioImageUpload } from "./studio-image-upload";
import { StudioVideoUpload } from "./studio-video-upload";
import { useStudioLanguage } from "./studio-language";
import styles from "./studio.module.css";

type MomentFormProps = {
  moment?: MomentContent;
  storageConfig: {
    publishableKey: string;
    url: string;
  };
};

export function MomentForm({ moment, storageConfig }: MomentFormProps) {
  const language = useStudioLanguage();
  const copy = momentFormCopy[language];
  const [mediaType, setMediaType] = useState<MomentMediaType>(moment?.mediaType ?? "photo");
  const [mediaUrl, setMediaUrl] = useState(moment?.mediaUrl ?? "");
  const [posterUrl, setPosterUrl] = useState(moment?.posterUrl ?? "");
  const [uploadBusy, setUploadBusy] = useState(false);

  function chooseMediaType(nextType: MomentMediaType) {
    if (nextType === mediaType) return;
    setMediaType(nextType);
    setMediaUrl("");
    setPosterUrl("");
  }

  return (
    <form action={saveMoment} className={styles.form}>
      {moment ? <input type="hidden" name="id" value={moment.id} /> : null}
      <input type="hidden" name="mediaType" value={mediaType} />
      <input type="hidden" name="mediaUrl" value={mediaUrl} />
      <input type="hidden" name="posterUrl" value={posterUrl} />
      <input type="hidden" name="previousMediaType" value={moment?.mediaType ?? "photo"} />
      <input type="hidden" name="previousMediaUrl" value={moment?.mediaUrl ?? ""} />
      <input type="hidden" name="previousPosterUrl" value={moment?.posterUrl ?? ""} />
      <fieldset className={styles.mediaTypeField}>
        <legend>{copy.mediaType}</legend>
        <div className={styles.segmentedControl}>
          {(["photo", "video"] as const).map((type) => (
            <label key={type}>
              <input
                type="radio"
                name="mediaTypeChoice"
                value={type}
                checked={mediaType === type}
                onChange={() => chooseMediaType(type)}
              />
              <span>{type === "photo" ? copy.photo : copy.video}</span>
            </label>
          ))}
        </div>
      </fieldset>
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

      {mediaType === "photo" ? (
        <StudioImageUpload
          bucket={momentImagesBucket}
          value={mediaUrl}
          storageConfig={storageConfig}
          previewAlt={copy.photoPreview}
          label={copy.photo}
          onBusyChange={setUploadBusy}
          onChange={setMediaUrl}
        />
      ) : (
        <>
          <p className={styles.videoGuidance}>{copy.videoGuidance}</p>
          <StudioVideoUpload
            bucket={momentImagesBucket}
            value={mediaUrl}
            posterUrl={posterUrl}
            storageConfig={storageConfig}
            onBusyChange={setUploadBusy}
            onChange={setMediaUrl}
          />
          <StudioImageUpload
            bucket={momentImagesBucket}
            value={posterUrl}
            storageConfig={storageConfig}
            previewAlt={copy.coverPreview}
            label={copy.coverImage}
            onBusyChange={setUploadBusy}
            onChange={setPosterUrl}
            optional
          />
        </>
      )}

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

const momentFormCopy = {
  en: {
    mediaType: "Media type",
    photo: "Photo",
    video: "Video",
    photoPreview: "Selected Moment photo preview",
    coverPreview: "Selected video cover preview",
    coverImage: "Cover image",
    videoGuidance: "Use a short, visually strong clip showing you leading, coaching or creating energy in the room. Videos appear on the website as silent looping visuals.",
  },
  nl: {
    mediaType: "Mediatype",
    photo: "Foto",
    video: "Video",
    photoPreview: "Voorbeeld van de geselecteerde Moment-foto",
    coverPreview: "Voorbeeld van de geselecteerde videocover",
    coverImage: "Coverafbeelding",
    videoGuidance: "Gebruik een korte, visueel sterke clip waarin je leidt, coacht of energie in de zaal brengt. Video's verschijnen op de website als stille, herhalende beelden.",
  },
} as const;
