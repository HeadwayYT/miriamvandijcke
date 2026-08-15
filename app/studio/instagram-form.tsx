"use client";

import { useState } from "react";
import { FloppyDisk } from "./icons";
import { saveInstagramContent } from "./actions";
import {
  aboutImagesBucket,
  type InstagramContent,
} from "@/lib/studio/content";
import { StudioImageUpload } from "./studio-image-upload";
import styles from "./studio.module.css";

type InstagramFormProps = {
  content: InstagramContent | null;
  storageConfig: {
    publishableKey: string;
    url: string;
  };
};

export function InstagramForm({ content, storageConfig }: InstagramFormProps) {
  const [coverUrl, setCoverUrl] = useState(content?.coverUrl ?? "");
  const [uploadBusy, setUploadBusy] = useState(false);

  return (
    <form action={saveInstagramContent} className={styles.form}>
      <input type="hidden" name="coverUrl" value={coverUrl} />
      <input type="hidden" name="previousCoverUrl" value={content?.coverUrl ?? ""} />
      <label>
        Instagram post / Reel URL
        <input
          id="instagram-url"
          name="postUrl"
          type="url"
          inputMode="url"
          defaultValue={content?.postUrl ?? ""}
          placeholder="https://www.instagram.com/reel/..."
          required
        />
      </label>
      <label>
        Internal label <span>optional</span>
        <input
          name="label"
          type="text"
          maxLength={80}
          defaultValue={content?.label ?? ""}
          placeholder="Saturday RIDE energy"
        />
      </label>
      <StudioImageUpload
        bucket={aboutImagesBucket}
        value={coverUrl}
        storageConfig={storageConfig}
        previewAlt="Selected About cover preview"
        onBusyChange={setUploadBusy}
        onChange={setCoverUrl}
        optional
      />
      <p className={styles.fieldGuidance}>
        A cover keeps About visually clean. Without one, the Instagram post remains the fallback.
      </p>
      <label className={styles.publishToggle}>
        <input
          name="status"
          type="checkbox"
          value="published"
          defaultChecked={content?.published ?? false}
        />
        <span aria-hidden="true" />
        Published
      </label>
      <button className={styles.saveButton} type="submit" disabled={uploadBusy}>
        <FloppyDisk aria-hidden="true" size={19} weight="bold" />
        Save featured post
      </button>
    </form>
  );
}
