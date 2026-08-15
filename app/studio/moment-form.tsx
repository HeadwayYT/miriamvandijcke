"use client";

import { useId, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  CheckCircle,
  FloppyDisk,
  ImageSquare,
  SpinnerGap,
  UploadSimple,
  WarningCircle,
} from "./icons";
import { saveMoment } from "./actions";
import { momentImagesBucket, momentTypes, type MomentContent } from "@/lib/studio/content";
import styles from "./studio.module.css";

const acceptedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const maxSourceSize = 20 * 1024 * 1024;
const maxUploadSize = 6 * 1024 * 1024;
const maxImageDimension = 2000;

type MomentFormProps = {
  moment?: MomentContent;
  storageConfig: {
    publishableKey: string;
    url: string;
  };
};

type UploadState = "idle" | "processing" | "uploading" | "ready" | "error";

export function MomentForm({ moment, storageConfig }: MomentFormProps) {
  const inputId = useId();
  const [mediaUrl, setMediaUrl] = useState(moment?.mediaUrl ?? "");
  const [uploadState, setUploadState] = useState<UploadState>(
    moment?.mediaUrl ? "ready" : "idle",
  );
  const [uploadMessage, setUploadMessage] = useState("");
  const supabase = useMemo(
    () => createBrowserClient(storageConfig.url, storageConfig.publishableKey),
    [storageConfig.publishableKey, storageConfig.url],
  );
  const uploadBusy = uploadState === "processing" || uploadState === "uploading";

  async function handleImageSelection(file: File | undefined) {
    if (!file) return;
    setUploadState("processing");
    setUploadMessage("Preparing photo...");

    try {
      const optimizedImage = await optimizeMomentImage(file);
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw new Error("Your Studio session has expired.");

      const path = `${userData.user.id}/${crypto.randomUUID()}.${optimizedImage.extension}`;
      setUploadState("uploading");
      setUploadMessage("Uploading photo...");

      const { error: uploadError } = await supabase.storage
        .from(momentImagesBucket)
        .upload(path, optimizedImage.file, {
          cacheControl: "31536000",
          contentType: optimizedImage.file.type,
          upsert: false,
        });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(momentImagesBucket).getPublicUrl(path);
      setMediaUrl(data.publicUrl);
      setUploadState("ready");
      setUploadMessage("Photo ready. Save the Moment to publish this change.");
    } catch (error) {
      setUploadState("error");
      setUploadMessage(
        error instanceof Error ? error.message : "The photo could not be uploaded.",
      );
    }
  }

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

      <div className={styles.imageUploadField}>
        <p>Photo</p>
        <div className={styles.imageUploadPanel}>
          {mediaUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mediaUrl} alt="Selected Moment preview" />
          ) : (
            <div className={styles.imageUploadPlaceholder} aria-hidden="true">
              <ImageSquare size={30} weight="duotone" />
            </div>
          )}
          <div>
            <label className={styles.uploadButton} htmlFor={inputId}>
              {uploadBusy ? (
                <SpinnerGap className={styles.spinner} aria-hidden="true" size={18} weight="bold" />
              ) : (
                <UploadSimple aria-hidden="true" size={18} weight="bold" />
              )}
              {mediaUrl ? "Choose another photo" : "Choose photo"}
            </label>
            <input
              className={styles.fileInput}
              id={inputId}
              type="file"
              accept={acceptedImageTypes.join(",")}
              disabled={uploadBusy}
              onChange={(event) => void handleImageSelection(event.target.files?.[0])}
            />
            <small>Choose from your phone. Large photos are resized automatically.</small>
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

async function optimizeMomentImage(file: File) {
  if (!acceptedImageTypes.includes(file.type)) {
    throw new Error("Choose a JPG, PNG, WebP or AVIF photo.");
  }
  if (file.size > maxSourceSize) {
    throw new Error("This photo is too large. Choose an image smaller than 20 MB.");
  }

  const source = await loadImage(file);
  const scale = Math.min(1, maxImageDimension / Math.max(source.width, source.height));
  const width = Math.max(1, Math.round(source.width * scale));
  const height = Math.max(1, Math.round(source.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser could not prepare the photo.");
  context.drawImage(source.image, 0, 0, width, height);
  source.cleanup();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/webp", 0.86);
  });
  if (!blob || blob.size > maxUploadSize) {
    throw new Error("The photo could not be resized. Try a smaller photo.");
  }

  return {
    extension: "webp",
    file: new File([blob], "moment.webp", { type: "image/webp" }),
  };
}

function loadImage(file: File): Promise<{
  cleanup: () => void;
  height: number;
  image: HTMLImageElement;
  width: number;
}> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => resolve({
      cleanup: () => URL.revokeObjectURL(objectUrl),
      height: image.naturalHeight,
      image,
      width: image.naturalWidth,
    });
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("This photo could not be opened."));
    };
    image.src = objectUrl;
  });
}
