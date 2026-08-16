"use client";

import { useId, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  CheckCircle,
  SpinnerGap,
  Trash,
  UploadSimple,
  VideoCamera,
  WarningCircle,
} from "./icons";
import { useStudioLanguage } from "./studio-language";
import styles from "./studio.module.css";

const acceptedVideoTypes = ["video/mp4", "video/webm"];
export const maxStudioVideoSize = 25 * 1024 * 1024;

type StudioVideoUploadProps = {
  bucket: string;
  value: string;
  posterUrl: string;
  storageConfig: {
    publishableKey: string;
    url: string;
  };
  onBusyChange: (busy: boolean) => void;
  onChange: (url: string) => void;
};

type UploadState = "idle" | "uploading" | "ready" | "error";

export function StudioVideoUpload({
  bucket,
  value,
  posterUrl,
  storageConfig,
  onBusyChange,
  onChange,
}: StudioVideoUploadProps) {
  const inputId = useId();
  const language = useStudioLanguage();
  const copy = videoUploadCopy[language];
  const [uploadState, setUploadState] = useState<UploadState>(value ? "ready" : "idle");
  const [uploadMessage, setUploadMessage] = useState("");
  const supabase = useMemo(
    () => createBrowserClient(storageConfig.url, storageConfig.publishableKey),
    [storageConfig.publishableKey, storageConfig.url],
  );
  const uploadBusy = uploadState === "uploading";

  async function handleVideoSelection(file: File | undefined) {
    if (!file) return;
    setUploadState("uploading");
    setUploadMessage(copy.uploading);
    onBusyChange(true);

    try {
      const extension = validateVideo(file, copy.invalidType, copy.tooLarge);
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw new Error(copy.expired);

      const path = `${userData.user.id}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: "31536000",
          contentType: file.type,
          upsert: false,
        });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(data.publicUrl);
      setUploadState("ready");
      setUploadMessage(copy.ready);
    } catch (error) {
      setUploadState("error");
      setUploadMessage(error instanceof Error ? error.message : copy.failed);
    } finally {
      onBusyChange(false);
    }
  }

  function removeVideo() {
    onChange("");
    setUploadState("idle");
    setUploadMessage(copy.removed);
  }

  return (
    <div className={styles.imageUploadField}>
      <p>{copy.video}</p>
      <div className={styles.imageUploadPanel}>
        {value ? (
          <video
            className={styles.studioVideoPreview}
            src={value}
            poster={posterUrl || undefined}
            controls
            muted
            playsInline
            preload="metadata"
          />
        ) : (
          <div className={styles.imageUploadPlaceholder} aria-hidden="true">
            <VideoCamera size={30} weight="duotone" />
          </div>
        )}
        <div className={styles.imageUploadActions}>
          <label className={styles.uploadButton} htmlFor={inputId}>
            {uploadBusy ? (
              <SpinnerGap className={styles.spinner} aria-hidden="true" size={18} weight="bold" />
            ) : (
              <UploadSimple aria-hidden="true" size={18} weight="bold" />
            )}
            {value ? copy.chooseAnother : copy.choose}
          </label>
          <input
            className={styles.fileInput}
            id={inputId}
            type="file"
            accept={acceptedVideoTypes.join(",")}
            disabled={uploadBusy}
            onChange={(event) => void handleVideoSelection(event.target.files?.[0])}
          />
          {value ? (
            <button className={styles.removeImageButton} type="button" onClick={removeVideo}>
              <Trash aria-hidden="true" size={16} weight="bold" />
              {copy.remove}
            </button>
          ) : null}
          <small>{copy.helper}</small>
        </div>
      </div>
      {uploadMessage ? (
        <p
          className={`${styles.uploadStatus} ${uploadState === "error" ? styles.uploadError : ""}`}
          role={uploadState === "error" ? "alert" : "status"}
        >
          {uploadState === "ready" ? <CheckCircle aria-hidden="true" size={17} weight="fill" /> : null}
          {uploadState === "error" ? <WarningCircle aria-hidden="true" size={17} weight="fill" /> : null}
          {uploadMessage}
        </p>
      ) : null}
    </div>
  );
}

function validateVideo(
  file: File,
  invalidTypeMessage: string,
  tooLargeMessage: string,
): "mp4" | "webm" {
  if (!acceptedVideoTypes.includes(file.type)) {
    throw new Error(invalidTypeMessage);
  }
  if (file.size > maxStudioVideoSize) {
    throw new Error(tooLargeMessage);
  }
  return file.type === "video/webm" ? "webm" : "mp4";
}

const videoUploadCopy = {
  en: {
    video: "Video",
    uploading: "Uploading video...",
    expired: "Your Studio session has expired.",
    ready: "Video ready. Save to publish this change.",
    failed: "The video could not be uploaded.",
    removed: "Video removed. Save to confirm this change.",
    choose: "Choose video",
    chooseAnother: "Choose another video",
    remove: "Remove video",
    helper: "Use a short 4-10 second MP4 or WebM clip. Maximum 25 MB.",
    invalidType: "Choose an MP4 or WebM video.",
    tooLarge: "This video is too large. Choose a clip smaller than 25 MB.",
  },
  nl: {
    video: "Video",
    uploading: "Video uploaden...",
    expired: "Je Studio-sessie is verlopen.",
    ready: "Video klaar. Sla op om deze wijziging te publiceren.",
    failed: "De video kon niet worden geupload.",
    removed: "Video verwijderd. Sla op om dit te bevestigen.",
    choose: "Kies video",
    chooseAnother: "Kies een andere video",
    remove: "Verwijder video",
    helper: "Gebruik een korte MP4- of WebM-clip van 4-10 seconden. Maximaal 25 MB.",
    invalidType: "Kies een MP4- of WebM-video.",
    tooLarge: "Deze video is te groot. Kies een clip kleiner dan 25 MB.",
  },
} as const;
