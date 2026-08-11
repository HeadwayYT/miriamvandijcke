import Link from "next/link";
import { InstagramFeatureMedia } from "@/app/components/instagram-feature-media";
import {
  ArrowLeft,
  Database,
  FloppyDisk,
  InstagramLogo,
  LockKey,
  SignOut,
  SpotifyLogo,
} from "./icons";
import { getMissingStudioEnvironment, getSupabaseRuntimeConfig } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSiteContent, isStudioAdmin } from "@/lib/studio/data";
import {
  toSpotifyEmbedUrl,
  type SpotifyContent,
} from "@/lib/studio/content";
import {
  saveInstagramContent,
  saveSpotifyContent,
  signInStudio,
  signOutStudio,
} from "./actions";
import styles from "./studio.module.css";

export const dynamic = "force-dynamic";

type StudioPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function StudioPage({ searchParams }: StudioPageProps) {
  const params = await searchParams;
  const message = getMessage(params);
  const config = getSupabaseRuntimeConfig();

  if (!config) {
    return <SetupRequired missing={getMissingStudioEnvironment()} />;
  }

  const supabase = await createServerSupabaseClient();
  const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (!data.user) {
    return <StudioLogin message={message} />;
  }

  if (!isStudioAdmin(data.user)) {
    return <AccessDenied />;
  }

  const content = await getAdminSiteContent(supabase!);
  const spotify = content.spotify;
  const instagram = content.instagram;

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Private content control</p>
          <h1>Miriam Studio</h1>
        </div>
        <div className={styles.headerActions}>
          <Link href="/" className={styles.textLink}>
            <ArrowLeft aria-hidden="true" size={17} weight="bold" />
            Public site
          </Link>
          <form action={signOutStudio}>
            <button className={styles.iconButton} type="submit" aria-label="Sign out of Miriam Studio">
              <SignOut aria-hidden="true" size={19} weight="bold" />
            </button>
          </form>
        </div>
      </header>

      <section className={styles.intro}>
        <p className={styles.eyebrow}>Content</p>
        <h2>Two things. Kept current.</h2>
        <p>Choose what visitors see without changing the rest of the website.</p>
      </section>

      {message ? <p className={`${styles.message} ${styles[message.kind]}`} role={message.kind === "error" ? "alert" : "status"}>{message.text}</p> : null}

      <div className={styles.editorGrid}>
        <section className={styles.editor} id="spotify">
          <div className={styles.editorHeading}>
            <SpotifyLogo aria-hidden="true" size={28} weight="fill" />
            <div>
              <p>Latest Ride</p>
              <h2>{spotify?.title ?? "No playlist yet"}</h2>
            </div>
            <Status published={spotify?.published ?? false} />
          </div>

          {spotify ? <StudioSpotifyPreview content={spotify} /> : null}

          <form action={saveSpotifyContent} className={styles.form}>
            <label>
              Title
              <input name="title" type="text" maxLength={80} defaultValue={spotify?.title ?? ""} placeholder="Power & Speed" required />
            </label>
            <div className={styles.formRow}>
              <label>
                Class
                <input name="className" type="text" maxLength={60} defaultValue={spotify?.className ?? ""} placeholder="RIDE: PERFORMANCE" required />
              </label>
              <label>
                Date <span>optional</span>
                <input name="date" type="date" defaultValue={spotify?.date ?? ""} />
              </label>
            </div>
            <label>
              Short focus
                <input name="focus" type="text" maxLength={120} defaultValue={spotify?.focus ?? ""} placeholder="Power / Speed / Endurance" required />
            </label>
            <label>
              Spotify playlist URL
              <input name="playlistUrl" type="url" inputMode="url" defaultValue={spotify?.playlistUrl ?? ""} placeholder="https://open.spotify.com/playlist/..." required />
            </label>
            <label className={styles.publishToggle}>
              <input
                name="status"
                type="checkbox"
                value="published"
                defaultChecked={spotify?.published ?? false}
              />
              <span aria-hidden="true" />
              Published
            </label>
            <button className={styles.saveButton} type="submit">
              <FloppyDisk aria-hidden="true" size={19} weight="bold" />
              Save playlist
            </button>
          </form>
        </section>

        <section className={styles.editor} id="instagram">
          <div className={styles.editorHeading}>
            <InstagramLogo aria-hidden="true" size={28} weight="bold" />
            <div>
              <p>About / Featured Instagram Post</p>
              <h2>{instagram?.label ?? "No featured post yet"}</h2>
            </div>
            <Status published={instagram?.published ?? false} />
          </div>

          {instagram ? (
            <div className={styles.previewPanel}>
              <div className={styles.previewHeading}>
                <div>
                  <p>Current featured post</p>
                  <strong>{instagram.label || "Instagram post"}</strong>
                </div>
                <a href="#instagram-url">Change post</a>
              </div>
              <InstagramFeatureMedia
                postUrl={instagram.postUrl}
                label={instagram.label}
                viewLabel="Open post on Instagram"
                compact
              />
            </div>
          ) : null}

          <form action={saveInstagramContent} className={styles.form}>
            <label>
              Instagram post / Reel URL
              <input id="instagram-url" name="postUrl" type="url" inputMode="url" defaultValue={instagram?.postUrl ?? ""} placeholder="https://www.instagram.com/reel/..." required />
            </label>
            <label>
              Internal label <span>optional</span>
              <input name="label" type="text" maxLength={80} defaultValue={instagram?.label ?? ""} placeholder="Saturday RIDE energy" />
            </label>
            <label className={styles.publishToggle}>
              <input
                name="status"
                type="checkbox"
                value="published"
                defaultChecked={instagram?.published ?? false}
              />
              <span aria-hidden="true" />
              Published
            </label>
            <button className={styles.saveButton} type="submit">
              <FloppyDisk aria-hidden="true" size={19} weight="bold" />
              Save featured post
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

function StudioSpotifyPreview({ content }: { content: SpotifyContent }) {
  const embedUrl = toSpotifyEmbedUrl(content.playlistUrl);
  if (!embedUrl) return null;

  return (
    <div className={styles.previewPanel}>
      <div className={styles.previewHeading}>
        <div>
          <p>Public preview</p>
          <strong>{content.title}</strong>
        </div>
        <a href={content.playlistUrl} target="_blank" rel="noopener noreferrer">
          Open in Spotify
        </a>
      </div>
      <div className={styles.ridePreviewMeta}>
        <strong>{content.className}</strong>
        <span>{content.focus}</span>
      </div>
      <iframe
        className={styles.spotifyPreview}
        src={embedUrl}
        title={`${content.title} Spotify playlist preview`}
        width="100%"
        height="152"
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      />
    </div>
  );
}

function SetupRequired({ missing }: { missing: string[] }) {
  return (
    <main className={styles.centeredShell}>
      <section className={styles.boundaryPanel}>
        <Database aria-hidden="true" size={30} weight="duotone" />
        <p className={styles.eyebrow}>Miriam Studio</p>
        <h1>Secure setup required.</h1>
        <p>The Studio is ready for a Supabase project, but editing stays disabled until secure persistence and authentication are configured.</p>
        <div className={styles.configList}>
          {missing.map((name) => <code key={name}>{name}</code>)}
        </div>
        <Link href="/" className={styles.textLink}>
          <ArrowLeft aria-hidden="true" size={17} weight="bold" />
          Return to public site
        </Link>
      </section>
    </main>
  );
}

function StudioLogin({ message }: { message: ReturnType<typeof getMessage> }) {
  return (
    <main className={styles.centeredShell}>
      <section className={styles.loginPanel}>
        <LockKey aria-hidden="true" size={30} weight="duotone" />
        <p className={styles.eyebrow}>Private access</p>
        <h1>Miriam Studio</h1>
        <p>Sign in with Miriam&apos;s administrator account.</p>
        {message ? <p className={`${styles.message} ${styles[message.kind]}`} role="alert">{message.text}</p> : null}
        <form action={signInStudio} className={styles.form}>
          <label>
            Email
            <input name="email" type="email" autoComplete="username" required />
          </label>
          <label>
            Password
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
          <button className={styles.saveButton} type="submit">
            <LockKey aria-hidden="true" size={18} weight="bold" />
            Sign in
          </button>
        </form>
        <Link href="/" className={styles.textLink}>
          <ArrowLeft aria-hidden="true" size={17} weight="bold" />
          Return to public site
        </Link>
      </section>
    </main>
  );
}

function AccessDenied() {
  return (
    <main className={styles.centeredShell}>
      <section className={styles.boundaryPanel}>
        <LockKey aria-hidden="true" size={30} weight="duotone" />
        <p className={styles.eyebrow}>Miriam Studio</p>
        <h1>Access denied.</h1>
        <p>This account is authenticated but is not authorized to manage Miriam&apos;s website.</p>
        <form action={signOutStudio}>
          <button className={styles.saveButton} type="submit">
            <SignOut aria-hidden="true" size={18} weight="bold" />
            Sign out
          </button>
        </form>
      </section>
    </main>
  );
}

function Status({ published }: { published: boolean }) {
  return <span className={`${styles.status} ${published ? styles.published : ""}`}>{published ? "Published" : "Draft"}</span>;
}

function getMessage(params: Record<string, string | string[] | undefined>) {
  const error = typeof params.error === "string" ? params.error : null;
  const success = typeof params.success === "string" ? params.success : null;

  const errors: Record<string, string> = {
    setup: "Secure persistence is not configured yet.",
    signin: "The email or password is not valid.",
    unauthorized: "This account is not authorized for Miriam Studio.",
    "spotify-validation": "Use a valid Spotify playlist URL and complete the required fields.",
    "instagram-validation": "Use a valid public Instagram post or Reel URL.",
    save: "The content could not be saved. Please try again.",
  };

  if (error && errors[error]) return { kind: "error" as const, text: errors[error] };
  if (success === "spotify") return { kind: "success" as const, text: "Playlist content saved." };
  if (success === "instagram") return { kind: "success" as const, text: "Featured Instagram post saved." };
  return null;
}
