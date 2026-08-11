"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { InstagramLogo } from "@phosphor-icons/react";

declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}

type InstagramFeatureMediaProps = {
  postUrl: string;
  label: string | null;
  viewLabel: string;
  fallbackAlt: string;
  compact?: boolean;
};

type EmbedResult = {
  postUrl: string;
  status: "loading" | "ready" | "failed";
};

const embedTimeoutMs = 12_000;

export function InstagramFeatureMedia({
  postUrl,
  label,
  viewLabel,
  fallbackAlt,
  compact = false,
}: InstagramFeatureMediaProps) {
  const embedRoot = useRef<HTMLDivElement>(null);
  const [embedResult, setEmbedResult] = useState<EmbedResult>({
    postUrl,
    status: "loading",
  });
  const status = embedResult.postUrl === postUrl ? embedResult.status : "loading";

  useEffect(() => {
    const root = embedRoot.current;
    if (!root) return;

    let active = true;
    let settled = false;

    const markReady = () => {
      if (!active || settled) return;
      settled = true;
      setEmbedResult({ postUrl, status: "ready" });
    };

    const detectEmbed = () => {
      if (root.querySelector("iframe")) markReady();
    };

    const observer = new MutationObserver(detectEmbed);
    observer.observe(root, { childList: true, subtree: true });
    detectEmbed();

    const processTimer = window.setTimeout(() => {
      window.instgrm?.Embeds.process();
    }, 0);
    const failureTimer = window.setTimeout(() => {
      if (!active || settled) return;
      settled = true;
      setEmbedResult({ postUrl, status: "failed" });
    }, embedTimeoutMs);

    return () => {
      active = false;
      observer.disconnect();
      window.clearTimeout(processTimer);
      window.clearTimeout(failureTimer);
    };
  }, [postUrl]);

  if (status === "failed") {
    return (
      <div className={`about-static-visual${compact ? " is-compact" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="about-photo"
          src="/images/miriam-headset.jpg"
          alt={fallbackAlt}
          width={1600}
          height={1200}
          loading="lazy"
          decoding="async"
        />
        <div className="about-media-shade" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div
      className={`instagram-embed-shell is-${status}${compact ? " is-compact" : ""}`}
      ref={embedRoot}
    >
      <div className="instagram-native-embed" key={postUrl}>
        <blockquote
          className="instagram-media"
          data-instgrm-captioned=""
          data-instgrm-permalink={postUrl}
          data-instgrm-version="14"
        >
          <a href={postUrl} target="_blank" rel="noopener noreferrer">
            <InstagramLogo aria-hidden="true" size={20} weight="bold" />
            {label || viewLabel}
          </a>
        </blockquote>
      </div>
      <Script
        id="instagram-embed-script"
        src="https://www.instagram.com/embed.js"
        strategy="afterInteractive"
        onReady={() => window.instgrm?.Embeds.process()}
        onError={() => setEmbedResult({ postUrl, status: "failed" })}
      />
    </div>
  );
}
