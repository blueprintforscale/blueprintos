# BlueprintOS

Client-facing and internal dashboard for visualizing ad performance, down-funnel metrics (sales, ROAS, call answering), and more.

Built on [Fuse React](https://fusetheme.com/) v17 (Next.js App Router demo). Upstream boilerplate: `withinpixels/fuse-react` (branch `nextjs-demo`).

## Architecture

```
┌─────────────────────────────┐         ┌───────────────────────────────────────┐
│  Vercel (Frontend)          │         │  Mac Mini (Blueprints-Mac-mini.local) │
│                             │  HTTPS  │                                       │
│  Next.js App Router         │────────▶│  Fastify API (port 3500)              │
│  NextAuth v5 (Auth.js)      │         │    ↕                                  │
│                             │         │  PostgreSQL 17 (blueprint db)         │
│  blueprintos-one.vercel.app │         │    localhost:5432                      │
└─────────────────────────────┘         └───────────────────────────────────────┘
                                           │
                                    Cloudflare Tunnel
                                           │
                               https://api.blueprintforscale.com
```

**Data flow**: Frontend (Vercel) → API (Mac Mini) → PostgreSQL. The frontend never connects to the database directly.

**Repos**:
- **This repo** (`blueprintforscale/blueprintos`): Next.js frontend, deployed on Vercel
- **API** lives in the code-server repo (`blueprintforscale/code-server-mm`) at `apps/blueprintos-api/`

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16 (App Router, Turbopack), TypeScript, MUI 7, Tailwind CSS, Emotion |
| Auth | NextAuth v5 (Auth.js) with credentials provider, JWT sessions |
| Internal API client | `ky` (HTTP client used by Fuse for mock/internal API calls) |
| API | Fastify (Node.js), running on Mac Mini |
| Database | PostgreSQL 17 (Homebrew) |
| Hosting | Vercel (frontend), Mac Mini (API + DB) |
| Tunnel | Cloudflare Tunnel (free) |

## Authentication

### How it works

1. User submits email/password on `/sign-in` or `/sign-up`
2. NextAuth credentials provider (`src/@auth/authJs.ts`) calls the Mac Mini API to validate/create the user
3. On success, NextAuth issues a JWT (30-day expiry) — no server-side session storage needed
4. On each session check, the `session` callback fetches the full user object from the API via email
5. The user object is stored on `session.db` and accessible via the `useUser()` hook

### Auto-role assignment

- `@blueprintforscale.com` email signups automatically get the `admin` role
- All other signups get the `user` role

### Key auth files

| File | Purpose |
|------|---------|
| `src/@auth/authJs.ts` | NextAuth config — credentials provider, JWT + session callbacks |
| `src/@auth/authApi.ts` | Server-side API client — `authSignIn()`, `authSignUp()`, `authGetDbUserByEmail()`, `authUpdateDbUser()`. Reads env vars at call time (not module load) for Vercel serverless compatibility |
| `src/@auth/useUser.tsx` | Client-side hook — returns current user, `updateUser()`, `signOut()` |
| `src/@auth/user/index.ts` | `User` type definition |
| `src/@auth/user/models/UserModel.ts` | Default user factory |
| `src/@auth/AuthGuardRedirect.tsx` | Per-route access control (role-based). Shows `FuseLoading` while evaluating |
| `src/@auth/authRoles.ts` | Role definitions: `admin`, `staff`, `user`, `onlyGuest` |
| `src/@auth/forms/AuthJsCredentialsSignInForm.tsx` | Sign-in form component |
| `src/@auth/forms/AuthJsCredentialsSignUpForm.tsx` | Sign-up form component |

### User type

```typescript
type User = {
  id: string;          // UUID
  role: string[];      // ['admin'], ['staff'], ['user']
  displayName: string;
  photoURL?: string;
  email?: string;
  shortcuts?: string[];
  settings?: FuseSettingsConfigType;
  loginRedirectUrl?: string;
};
```

### Roles

- `admin` — full access (auto-assigned to `@blueprintforscale.com` emails)
- `staff` — internal team access
- `user` — client access (external, default for non-Blueprint signups)
- `onlyGuest` (empty array) — unauthenticated visitors only (sign-in/sign-up pages)

The `(control-panel)` layout allows `admin`, `staff`, and `user` roles. Individual routes can further restrict access using `AuthGuardRedirect`.

## Internal API Client (`src/utils/api.ts`)

The Fuse boilerplate uses `ky` for internal API calls (mock data endpoints, etc.). It is configured with a `prefixUrl` based on `NEXT_PUBLIC_BASE_URL`.

**Important**: `NEXT_PUBLIC_BASE_URL` must be set on Vercel so that `ky` builds the correct URL at build time. Without it, API calls will fail with `ERR_CONNECTION_REFUSED` pointing at `localhost`.

This client is only for the app's own Next.js API routes (e.g., mock data). External calls to the Mac Mini API use `fetch()` directly in `authApi.ts`.

## API Reference

**Base URL**: `https://api.blueprintforscale.com`

**Auth**: All endpoints except `/health` require an `x-api-key` header.

### Data endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check (no auth) |
| GET | `/clients` | List clients (id, name, google_ads_id, callrail_company_id) |
| GET | `/clients/:id` | Full client detail |
| GET | `/clients/:id/calls?days=30` | Daily call stats (total, answered, legitimate, spam, first-time) |
| GET | `/clients/:id/forms?days=30` | Daily form submission stats (total, legitimate, spam) |
| GET | `/pipeline/runs?limit=20` | Lead pipeline run history |

### Auth endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/sign-in` | Validate credentials. Body: `{ email, password }` |
| POST | `/auth/sign-up` | Create user. Body: `{ email, password, displayName }` |
| GET | `/auth/user-by-email/:email` | Get user by email (used by session callback) |
| GET | `/auth/user/:id` | Get user by ID |
| PUT | `/auth/user/:id` | Update user. Body: `{ displayName, photoURL, role, shortcuts, settings, loginRedirectUrl }` |

All auth endpoints return a user object matching the Fuse `User` type. Passwords are hashed with bcrypt (12 rounds).

### CORS

Allowed origins: `*.vercel.app`, `http://localhost:3000`.

## Database

The `blueprint` PostgreSQL database on the Mac Mini. Connection: `localhost:5432`, user `blueprint`.

### `app_users` table (auth)

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | UUID | `gen_random_uuid()` | Primary key |
| email | TEXT | — | Unique, not null |
| password_hash | TEXT | — | bcrypt hash |
| display_name | TEXT | — | |
| photo_url | TEXT | `''` | |
| role | TEXT[] | `['user']` | `['admin']` for @blueprintforscale.com |
| shortcuts | TEXT[] | `[]` | |
| settings | JSONB | `{}` | Fuse UI settings |
| login_redirect_url | TEXT | `'/'` | |
| created_at | TIMESTAMPTZ | `now()` | |
| updated_at | TIMESTAMPTZ | `now()` | |

### Other key tables (populated by ETL pipelines)

| Table | What it holds |
|-------|--------------|
| `clients` | Client config — name, Google Ads ID, CallRail IDs, conversion values |
| `calls` | All CallRail calls — source, duration, transcript, classification, upload status |
| `form_submissions` | CallRail form submissions — source, classification, upload status |
| `call_pipeline_log` | Pipeline run history with timestamps and stats |

These tables are populated by cron jobs on the Mac Mini (Google Ads ETL, CallRail fetch, AI classification). This app reads from them — it does not write to them.

## Environment Variables

### Vercel (frontend)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_BASE_URL` | **Yes** | `https://blueprintos-one.vercel.app` — used by `ky` at build time for internal API calls. Without this, the app will try to call `localhost` and fail |
| `BLUEPRINTOS_API_KEY` | Yes | API key for Mac Mini API (server-side only) |
| `BLUEPRINTOS_API_URL` | Yes | `https://api.blueprintforscale.com` (server-side only) |
| `AUTH_SECRET` | Yes | NextAuth secret (random base64 string) |
| `AUTH_URL` | Yes | `https://blueprintos-one.vercel.app` — NextAuth base URL for callbacks |

### Mac Mini API (`apps/blueprintos-api/.env`)

| Variable | Description |
|----------|-------------|
| `BLUEPRINTOS_API_KEY` | Must match the Vercel env var |

## API Server Management

The API runs as a **launchd agent** on the Mac Mini (auto-starts on boot, auto-restarts on crash).

```bash
# Check status
launchctl list | grep blueprintos

# Restart
launchctl unload ~/Library/LaunchAgents/com.blueprint.blueprintos-api.plist
launchctl load ~/Library/LaunchAgents/com.blueprint.blueprintos-api.plist

# View logs
tail -f /Users/bp/projects/apps/blueprintos-api/launchd-stdout.log
tail -f /Users/bp/projects/apps/blueprintos-api/launchd-stderr.log
```

API code: `/Users/bp/projects/apps/blueprintos-api/index.js`
Plist: `~/Library/LaunchAgents/com.blueprint.blueprintos-api.plist`

## Development

```bash
npm install
npm run dev        # Next.js dev server on localhost:3000
```

Create a `.env.local` file with:
```
BLUEPRINTOS_API_KEY=<api key from Mac Mini>
BLUEPRINTOS_API_URL=https://api.blueprintforscale.com
AUTH_SECRET=<any random string>
```

`NEXT_PUBLIC_BASE_URL` is not needed for local dev — `ky` defaults to `localhost:3000` in development mode.

The API allows `localhost:3000` via CORS, so local dev calls work against the production Mac Mini API.

## Upstream Updates

The Fuse React boilerplate is tracked as the `upstream` remote:

```bash
git fetch upstream
git merge upstream/nextjs-demo
```

## Adding New API Endpoints

1. Add the route in `/Users/bp/projects/apps/blueprintos-api/index.js`
2. Restart the API: `launchctl unload ... && launchctl load ...`
3. Call it from the frontend via `fetch()` with the `x-api-key` header
4. For new data needs, check what's available in the `blueprint` database first — most client metrics data is already there from existing ETL pipelines

## Conventions

- **TypeScript** everywhere in the frontend. The API is plain JavaScript (Node.js).
- **Data fetching**: All data flows through the BlueprintOS API. Never connect to Postgres from the frontend.
- **API key**: Pass via `x-api-key` header on every API request.
- **Secrets**: Never commit API keys, `.env` files, or credentials. `.env.local` is gitignored.
- **Auth**: Use the `useUser()` hook for current user data. Use `AuthGuardRedirect` and `authRoles` for route protection.
- **Styling**: MUI components + Tailwind utility classes. Fuse provides theme configuration.
- **Routing**: Next.js App Router. Route groups `(public)` and `(control-panel)` separate guest vs authenticated areas.

## Known Gotchas

- **`NEXT_PUBLIC_BASE_URL` is critical on Vercel** — the `ky` HTTP client in `src/utils/api.ts` uses this at build time. If missing, all internal API calls (mock data, etc.) will target `localhost:3000` and fail silently, causing an infinite loading spinner.
- **Auth env vars are server-side only** — `BLUEPRINTOS_API_KEY`, `BLUEPRINTOS_API_URL`, and `AUTH_SECRET` should NOT have the `NEXT_PUBLIC_` prefix. They are read in NextAuth callbacks which run server-side.
- **`authApi.ts` reads env vars at call time** — not at module load time. This is intentional for Vercel serverless compatibility where env vars may not be available during module initialization.
