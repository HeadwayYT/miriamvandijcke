import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Database,
  FloppyDisk,
  ImageSquare,
  InstagramLogo,
  LockKey,
  SignOut,
  SpotifyLogo,
  Trash,
} from "./icons";
import { getMissingStudioEnvironment, getSupabaseRuntimeConfig } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSiteContent, getStudioMomentum, isStudioAdmin } from "@/lib/studio/data";
import {
  toSpotifyEmbedUrl,
  type MomentContent,
  type SpotifyContent,
} from "@/lib/studio/content";
import { MomentForm } from "./moment-form";
import { InstagramForm } from "./instagram-form";
import { StudioDashboard } from "./studio-dashboard";
import { ShareDetailAction } from "./share-detail-action";
import {
  saveSpotifyContent,
  deleteMoment,
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
  const editor = getEditor(params.editor);
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

  const [content, momentum] = await Promise.all([
    getAdminSiteContent(supabase!),
    getStudioMomentum(supabase!),
  ]);
  const spotify = content.spotify;
  const instagram = content.instagram;
  const moments = content.moments;
  const selectedMomentId = typeof params.moment === "string" ? params.moment : null;
  const selectedMoment = selectedMomentId
    ? moments.find((moment) => moment.id === selectedMomentId) ?? null
    : null;
  const storageConfig = { url: config.url, publishableKey: config.publishableKey };

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Private instructor cockpit</p>
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

      {message ? <p className={`${styles.message} ${styles[message.kind]}`} role={message.kind === "error" ? "alert" : "status"}>{message.text}</p> : null}

      {!editor ? (
        <StudioDashboard
          instagram={instagram}
          momentum={momentum}
          moments={moments}
          spotify={spotify}
        />
      ) : (
        <div className={styles.editorTopbar}>
          <Link href="/studio" className={styles.textLink}>
            <ArrowLeft aria-hidden="true" size={17} weight="bold" />
            Studio home
          </Link>
          <p>{editor === "spotify" ? "Connect" : editor === "instagram" ? "Share" : "Capture"}</p>
        </div>
      )}

      {editor === "spotify" ? (
        <div className={`${styles.detailStack} ${styles.singleEditor}`}>
          <section className={styles.editor} id="spotify">
          <div className={styles.editorHeading}>
            <SpotifyLogo aria-hidden="true" size={28} weight="fill" />
            <div>
              <p>Connect</p>
              <h2>Update Latest Ride</h2>
            </div>
          </div>

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

          <section className={styles.editor} aria-labelledby="current-ride-title">
            <div className={styles.compactSectionHeading}>
              <div>
                <p className={styles.eyebrow}>Current content</p>
                <h2 id="current-ride-title">Current Ride</h2>
              </div>
              {spotify ? <Status published={spotify.published} /> : null}
            </div>
            {spotify ? (
              <CurrentRideSummary content={spotify} />
            ) : (
              <p className={styles.emptyState}>No ride saved yet.</p>
            )}
          </section>
        </div>
      ) : null}

      {editor === "instagram" ? (
        <div className={`${styles.detailStack} ${styles.singleEditor}`}>
          <ShareDetailAction momentum={momentum} />
          <section className={styles.editor} id="instagram">
          <div className={styles.editorHeading}>
            <InstagramLogo aria-hidden="true" size={28} weight="bold" />
            <div>
              <p>Website curation</p>
              <h2>Featured on Website</h2>
            </div>
          </div>

          <InstagramForm content={instagram} storageConfig={storageConfig} />

          <div className={styles.currentContentBlock}>
            <div className={styles.compactSectionHeading}>
              <div>
                <p className={styles.eyebrow}>Current content</p>
                <h3>Featured Post</h3>
              </div>
              {instagram ? <Status published={instagram.published} /> : null}
            </div>
            {instagram ? (
              <div className={styles.compactContentSummary}>
                <div>
                  <strong>{instagram.label || "Instagram post"}</strong>
                  <span>instagram.com</span>
                </div>
                <a href={instagram.postUrl} target="_blank" rel="noopener noreferrer">
                  View post
                  <ArrowRight aria-hidden="true" size={16} weight="bold" />
                </a>
              </div>
            ) : (
              <p className={styles.emptyState}>No featured post saved yet.</p>
            )}
            <p className={styles.detailNote}>
              Featuring a post on the website is separate from marking Share complete.
            </p>
          </div>
          </section>
        </div>
      ) : null}

      {editor === "moments" ? (
        <div className={`${styles.detailStack} ${styles.momentsEditor}`}>
          <section className={styles.editor} id="moment-work">
            <div className={styles.editorHeading}>
              <ImageSquare aria-hidden="true" size={28} weight="duotone" />
              <div>
                <p>Capture / Miriam in Action</p>
                <h2>{selectedMoment ? "Edit Moment" : "Add a Moment"}</h2>
              </div>
              {selectedMoment ? <Status published={selectedMoment.published} /> : null}
            </div>

            <div className={styles.momentGuidance}>
              <p>
                Miriam in Action is your professional instructor portfolio. Add moments that show
                you teaching, leading a room, creating an experience or connecting with a fitness
                community.
              </p>
              <span>
                Classes / Special rides / Fitness events / Guest teaching / Studio collaborations /
                Brand collaborations
              </span>
            </div>

            <div className={styles.momentWorkArea}>
              <MomentForm moment={selectedMoment ?? undefined} storageConfig={storageConfig} />
              {selectedMoment ? (
                <form action={deleteMoment} className={styles.deleteForm}>
                  <input type="hidden" name="id" value={selectedMoment.id} />
                  <button type="submit">
                    <Trash aria-hidden="true" size={17} weight="bold" />
                    Delete moment
                  </button>
                </form>
              ) : null}
            </div>
          </section>

          <section className={styles.editor} id="moments" aria-labelledby="saved-moments-title">
            <div className={styles.compactSectionHeading}>
              <div>
                <p className={styles.eyebrow}>Portfolio</p>
                <h2 id="saved-moments-title">Saved Moments</h2>
              </div>
              <span className={styles.savedCount}>
                {moments.length} {moments.length === 1 ? "moment" : "moments"}
              </span>
            </div>

            {moments.length ? (
              <div className={styles.savedMomentList}>
                {moments.map((moment) => (
                  <MomentSummary key={moment.id} moment={moment} selected={moment.id === selectedMoment?.id} />
                ))}
              </div>
            ) : (
              <p className={styles.emptyState}>No saved moments yet.</p>
            )}
          </section>
        </div>
      ) : null}
    </main>
  );
}

function MomentSummary({
  moment,
  selected,
}: {
  moment: MomentContent;
  selected: boolean;
}) {
  return (
    <article className={`${styles.savedMomentRow} ${selected ? styles.selectedMoment : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={moment.mediaUrl} alt="" loading="lazy" />
      <div className={styles.savedMomentContent}>
        <p>{moment.type}</p>
        <h3>{moment.title}</h3>
        <span>{[moment.date, moment.location].filter(Boolean).join(" · ")}</span>
        <small>{moment.caption}</small>
      </div>
      <Status published={moment.published} />
      <Link href={`/studio?editor=moments&moment=${moment.id}#moment-work`}>
        Edit
        <ArrowRight aria-hidden="true" size={16} weight="bold" />
      </Link>
    </article>
  );
}

function CurrentRideSummary({ content }: { content: SpotifyContent }) {
  const embedUrl = toSpotifyEmbedUrl(content.playlistUrl);

  return (
    <div className={styles.currentContentBlock}>
      <div className={styles.compactContentSummary}>
        <div>
          <strong>{content.title}</strong>
          <span>{content.className} · {content.focus}</span>
        </div>
        <a href="#spotify">
          Edit
          <ArrowRight aria-hidden="true" size={16} weight="bold" />
        </a>
      </div>
      {embedUrl ? (
        <details className={styles.inlinePreview}>
          <summary>Preview playlist</summary>
          <iframe
            className={styles.spotifyPreview}
            src={embedUrl}
            title={`${content.title} Spotify playlist preview`}
            width="100%"
            height="152"
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          />
        </details>
      ) : null}
      <a className={styles.externalTextLink} href={content.playlistUrl} target="_blank" rel="noopener noreferrer">
          Open in Spotify
          <ArrowRight aria-hidden="true" size={16} weight="bold" />
        </a>
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
    "moment-validation": "Complete the Moment fields with valid HTTPS links.",
    "share-validation": "Use a valid HTTPS link or leave the optional link empty.",
    save: "The content could not be saved. Please try again.",
  };

  if (error && errors[error]) return { kind: "error" as const, text: errors[error] };
  if (success === "spotify") return { kind: "success" as const, text: "Playlist content saved." };
  if (success === "instagram") return { kind: "success" as const, text: "Featured Instagram post saved." };
  if (success === "moment") return { kind: "success" as const, text: "Moment saved." };
  if (success === "moment-deleted") return { kind: "success" as const, text: "Moment deleted." };
  if (success === "share") return { kind: "success" as const, text: "This week's Share is recorded." };
  return null;
}

type StudioEditor = "spotify" | "instagram" | "moments";

function getEditor(value: string | string[] | undefined): StudioEditor | null {
  return value === "spotify" || value === "instagram" || value === "moments"
    ? value
    : null;
}
