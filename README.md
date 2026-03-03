# Purr & Prism

Interactive multi-room cat world built with Next.js (App Router).

## Prerequisites

- Node.js `>=20.9.0`
- npm `>=10`

## Local Development

```bash
npm ci
npm run dev
```

App runs at `http://localhost:3000`.

## Quality Gates

```bash
npm run check:deploy
```

This runs lint and production build, matching what should be green before deploy.

## Vercel Deployment

This repo is configured for Vercel via [`vercel.json`](./vercel.json).

### Option 1: Vercel Dashboard (recommended)

1. Import this Git repository in Vercel.
2. Framework preset: `Next.js` (auto-detected).
3. Build command: `npm run build` (already configured).
4. Install command: `npm ci` (already configured).
5. Deploy.

### Option 2: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
vercel --prod
```

## Notes

- `.vercelignore` excludes tests, coverage, and local artifacts from CLI uploads.
- No required environment variables are currently used by the app.
