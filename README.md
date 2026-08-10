# Miriam Van Dijcke

Personal website for Miriam Van Dijcke, built with Next.js App Router, React,
TypeScript, GSAP and Tailwind CSS.

## Local development

Use Node.js 22 and install the locked dependencies:

```bash
npm ci
npm run dev
```

The local site is available at `http://localhost:3000`.

## Validation

```bash
npm run lint
npm run typecheck
npm test
```

`npm test` runs a production `next build`, checks the statically prerendered
root route, verifies the two visitor journeys, and confirms that generated
Next.js chunks and referenced public images exist.

## Deploying on Vercel

Import the GitHub repository as a new Vercel project. Vercel should detect the
project as **Next.js** and use the repository root.

Keep the auto-detected defaults:

- Framework Preset: `Next.js`
- Root Directory: repository root (`.`)
- Install Command: `npm install` or `npm ci`
- Build Command: `npm run build`
- Output Directory: leave unset (`Next.js default`)
- Node.js Version: `22.x`

No `vercel.json` file is required.

## Miriam Studio (experimental branch)

The private `/studio` route manages one featured Spotify playlist and one
featured Instagram post. The public site remains fully functional when Studio
is not configured; `/studio` then shows a setup boundary and does not expose an
editable form.

Create a small Supabase project and complete these steps:

1. Run `supabase/studio-setup.sql` in the Supabase SQL editor.
2. Disable public user registration in Supabase Auth.
3. Create Miriam's single email/password user in the Supabase dashboard.
4. Set `app_metadata.studio_admin` to `true` for that user using the Supabase
   dashboard or a one-time trusted admin script.
5. Add the variables from `.env.example` to `.env.local` for local development.

Never add a Supabase service-role key to this application or to a
`NEXT_PUBLIC_*` variable. Authorization is enforced twice: by the server actions
and by the database row-level security policies.

For a Vercel branch preview, add these variables to the **Preview** environment
only:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `STUDIO_ADMIN_EMAIL`

The existing production site does not need these variables. The enquiry form
continues to submit through the public Formspree endpoint in `app/page.tsx`.

## What belongs in GitHub

Push the source and lockfile, including:

- `app/`
- `public/`
- `tests/`
- `package.json` and `package-lock.json`
- `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, and ESLint config

Do not commit generated or local-only folders such as `node_modules/`, `.next/`,
`.vercel/`, `dist/`, local log files, screenshots, or real `.env*` files. The
blank `.env.example` is intentionally committed as configuration documentation.

Every push to the production branch creates a Vercel production deployment;
other branches and pull requests receive preview deployments.
