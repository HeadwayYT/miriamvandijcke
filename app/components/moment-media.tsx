"use client";

import { useEffect, useRef, useState } from "react";
import type { MomentContent } from "@/lib/studio/content";

type MomentMediaProps = Pick<
  MomentContent,
  "mediaType" | "mediaUrl" | "posterUrl" | "title"
>;

export function MomentMedia({ mediaType, mediaUrl, posterUrl, title }: MomentMediaProps) {
  if (mediaType === "photo") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={mediaUrl} alt={title} loading="lazy" decoding="async" />;
  }

  return <ViewportVideo mediaUrl={mediaUrl} posterUrl={posterUrl} />;
}

function ViewportVideo({ mediaUrl, posterUrl }: Pick<MomentMediaProps, "mediaUrl" | "posterUrl">) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [nearViewport, setNearViewport] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const shouldLoad = nearViewport;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setReducedMotion(query.matches);
    syncPreference();
    query.addEventListener("change", syncPreference);
    return () => query.removeEventListener("change", syncPreference);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => setNearViewport(entry.isIntersecting),
      { rootMargin: "240px 0px", threshold: 0.05 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;

    if (nearViewport && !reducedMotion) {
      void video.play().catch(() => {
        // Some browsers defer autoplay until the element is fully visible.
      });
    } else {
      video.pause();
    }
  }, [nearViewport, reducedMotion, shouldLoad]);

  return (
    <video
      ref={videoRef}
      src={shouldLoad ? mediaUrl : undefined}
      poster={posterUrl ?? undefined}
      autoPlay={nearViewport && !reducedMotion}
      muted
      loop
      playsInline
      controls={false}
      disablePictureInPicture
      preload={shouldLoad ? "metadata" : "none"}
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}
