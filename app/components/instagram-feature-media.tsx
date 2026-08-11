"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { ArrowSquareOut, InstagramLogo } from "@phosphor-icons/react";

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
  compact?: boolean;
};

export function InstagramFeatureMedia({
  postUrl,
  label,
  viewLabel,
  compact = false,
}: InstagramFeatureMediaProps) {
  const embedRoot = useRef<HTMLDivElement>(null);
  const [embedReady, setEmbedReady] = useState(false);

  useEffect(() => {
    const root = embedRoot.current;
    if (!root) return;

    const detectEmbed = () => {
      if (root.querySelector("iframe")) setEmbedReady(true);
    };
    const observer = new MutationObserver(detectEmbed);
    observer.observe(root, { childList: true, subtree: true });
    window.instgrm?.Embeds.process();

    return () => observer.disconnect();
  }, [postUrl]);

  return (
    <div
      className={`instagram-embed-shell${embedReady ? " is-ready" : ""}${compact ? " is-compact" : ""}`}
      ref={embedRoot}
    >
      <div className="instagram-fallback" aria-hidden={embedReady}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/miriam-headset.jpg"
          alt=""
          width={1600}
          height={1200}
          loading="lazy"
          decoding="async"
        />
        <div className="about-media-shade" aria-hidden="true" />
        <a
          href={postUrl}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={embedReady ? -1 : 0}
        >
          <InstagramLogo aria-hidden="true" size={20} weight="bold" />
          {viewLabel}
          <ArrowSquareOut aria-hidden="true" size={15} weight="bold" />
        </a>
      </div>
      <div className="instagram-native-embed" aria-hidden={!embedReady}>
        <blockquote
          className="instagram-media"
          data-instgrm-captioned=""
          data-instgrm-permalink={postUrl}
          data-instgrm-version="14"
        >
          <a
            href={postUrl}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={embedReady ? 0 : -1}
          >
            <InstagramLogo aria-hidden="true" size={20} weight="bold" />
            {label || viewLabel}
          </a>
        </blockquote>
      </div>
      <Script
        id="instagram-embed-script"
        src="https://www.instagram.com/embed.js"
        strategy="lazyOnload"
        onLoad={() => window.instgrm?.Embeds.process()}
      />
    </div>
  );
}
