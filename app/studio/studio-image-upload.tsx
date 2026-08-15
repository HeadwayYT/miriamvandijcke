"use client";

import { useId, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  CheckCircle,
  ImageSquare,
  SpinnerGap,
  Trash,
  UploadSimple,
  WarningCircle,
} from "./icons";
import styles from "./studio.module.css";

const acceptedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const maxSourceSize = 20 * 1024 * 1024;
const maxUploadSize = 6 * 1024 * 1024;
export const maxStudioImageDimension = 2000;

type StudioImageUploadProps = {
  bucket: string;
  value: string;
  storageConfig: {
    publishableKey: string;
    url: string;
  };
  previewAlt: string;
  onBusyChange: (busy: boolean) => void;
  onChange: (url: string) => void;
  optional?: boolean;
};

type UploadState = "idle" | "processing" | "uploading" | "ready" | "error";

export function StudioImageUpload({
  bucket,
  value,
  storageConfig,
  previewAlt,
  onBusyChange,
  onChange,
  optional = false,
}: StudioImageUploadProps) {
  const inputId = useId();
  const [uploadState, setUploadState] = useState<UploadState>(value ? "ready" : "idle");
  const [uploadMessage, setUploadMessage] = useState("");
  const supabase = useMemo(
    () => createBrowserClient(storageConfig.url, storageConfig.publishableKey),
    [storageConfig.publishableKey, storageConfig.url],
  );
  const uploadBusy = uploadState === "processing" || uploadState === "uploading";

  function updateBusy(busy: boolean) {
    onBusyChange(busy);
  }

  async function handleImageSelection(file: File | undefined) {
    if (!file) return;
    setUploadState("processing");
    setUploadMessage("Preparing photo...");
    updateBusy(true);

    try {
      const optimizedImage = await optimizeStudioImage(file);
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw new Error("Your Studio session has expired.");

      const path = `${userData.user.id}/${crypto.randomUUID()}.${optimizedImage.extension}`;
      setUploadState("uploading");
      setUploadMessage("Uploading photo...");

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, optimizedImage.file, {
          cacheControl: "31536000",
          contentType: optimizedImage.file.type,
          upsert: false,
        });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(data.publicUrl);
      setUploadState("ready");
      setUploadMessage("Photo ready. Save to publish this change.");
    } catch (error) {
      setUploadState("error");
      setUploadMessage(
        error instanceof Error ? error.message : "The photo could not be uploaded.",
      );
    } finally {
      updateBusy(false);
    }
  }

  function removeImage() {
    onChange("");
    setUploadState("idle");
    setUploadMessage("Cover removed. Save to confirm this change.");
  }

  return (
    <div className={styles.imageUploadField}>
      <p>Photo {optional ? <span>optional</span> : null}</p>
      <div className={styles.imageUploadPanel}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt={previewAlt} />
        ) : (
          <div className={styles.imageUploadPlaceholder} aria-hidden="true">
            <ImageSquare size={30} weight="duotone" />
          </div>
        )}
        <div className={styles.imageUploadActions}>
          <label className={styles.uploadButton} htmlFor={inputId}>
            {uploadBusy ? (
              <SpinnerGap className={styles.spinner} aria-hidden="true" size={18} weight="bold" />
            ) : (
              <UploadSimple aria-hidden="true" size={18} weight="bold" />
            )}
            {value ? "Choose another photo" : "Choose photo"}
          </label>
          <input
            className={styles.fileInput}
            id={inputId}
            type="file"
            accept={acceptedImageTypes.join(",")}
            disabled={uploadBusy}
            onChange={(event) => void handleImageSelection(event.target.files?.[0])}
          />
          {optional && value ? (
            <button className={styles.removeImageButton} type="button" onClick={removeImage}>
              <Trash aria-hidden="true" size={16} weight="bold" />
              Remove cover
            </button>
          ) : null}
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
  );
}

async function optimizeStudioImage(file: File) {
  if (!acceptedImageTypes.includes(file.type)) {
    throw new Error("Choose a JPG, PNG, WebP or AVIF photo.");
  }
  if (file.size > maxSourceSize) {
    throw new Error("This photo is too large. Choose an image smaller than 20 MB.");
  }

  const source = await loadImage(file);
  const scale = Math.min(1, maxStudioImageDimension / Math.max(source.width, source.height));
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
    file: new File([blob], "studio-image.webp", { type: "image/webp" }),
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
