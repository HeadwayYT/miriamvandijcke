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

## Environment variables

No Vercel environment variables are required. The enquiry form submits from the
browser to the public Formspree endpoint configured in `app/page.tsx`; it does
not require a server-side API key.

## What belongs in GitHub

Push the source and lockfile, including:

- `app/`
- `public/`
- `tests/`
- `package.json` and `package-lock.json`
- `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, and ESLint config

Do not commit generated or local-only folders such as `node_modules/`, `.next/`,
`.vercel/`, `dist/`, local log files, screenshots, or `.env*` files.

Every push to the production branch creates a Vercel production deployment;
other branches and pull requests receive preview deployments.
