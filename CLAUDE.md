# BlueprintOS

Client-facing and internal dashboard for visualizing ad performance, down-funnel metrics (sales, ROAS, call answering), and more.

Built on [Fuse React](https://fusetheme.com/) (Next.js demo, v17). Upstream repo: `withinpixels/fuse-react` (branch `nextjs-demo`).

## Architecture

```
┌─────────────────────┐       ┌──────────────────────────────────────┐
│  Vercel (Frontend)  │       │  Mac Mini (Blueprints-Mac-mini.local)│
│                     │       │                                      │
│  Next.js app        │──────▶│  API (Fastify, port 3500)            │
│  blueprintos.       │ HTTPS │  ↕                                   │
│  vercel.app         │       │  PostgreSQL (blueprint db, port 5432)│
└─────────────────────┘       └──────────────────────────────────────┘
                                │
                         Cloudflare Tunnel
                                │
                    https://api.blueprintforscale.com
```

- **Frontend**: This repo, deployed on Vercel via GitHub (`blueprintforscale/blueprintos`)
- **API**: Fastify server on the Mac Mini at `/Users/bp/projects/apps/blueprintos-api/`
- **Database**: PostgreSQL 17 on the Mac Mini (`localhost:5432`, database `blueprint`, user `blueprint`)
- **Tunnel**: Cloudflare Tunnel exposes the API at `https://api.blueprintforscale.com`

The frontend never connects to the database directly — all data flows through the API.

## API

**Base URL**: `https://api.blueprintforscale.com`

**Auth**: All endpoints (except `/health`) require an `x-api-key` header. The key is stored in:
- Mac Mini: `/Users/bp/projects/apps/blueprintos-api/.env` (`BLUEPRINTOS_API_KEY`)
- Vercel: Set as environment variable `BLUEPRINTOS_API_KEY`

**Endpoints**:

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Health check |
| GET | `/clients` | Yes | List all clients (id, name, google_ads_id, callrail_company_id) |
| GET | `/clients/:id` | Yes | Full client detail |
| GET | `/clients/:id/calls?days=30` | Yes | Daily call stats (total, answered, legitimate, spam, first-time) |
| GET | `/clients/:id/forms?days=30` | Yes | Daily form submission stats (total, legitimate, spam) |
| GET | `/pipeline/runs?limit=20` | Yes | Lead pipeline run history |

**CORS**: Allows `*.vercel.app` and `localhost:3000`.

## API Server Management

The API runs as a launchd agent on the Mac Mini (auto-starts on boot, auto-restarts on crash):

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

The API code lives in the main code-server repo: `/Users/bp/projects/apps/blueprintos-api/`.

## Upstream Updates

The boilerplate source is tracked as the `upstream` remote:

```bash
git fetch upstream
git merge upstream/nextjs-demo
```

## Development

```bash
npm install
npm run dev        # Starts Next.js dev server on localhost:3000
```

When developing locally, the API calls go to `https://api.blueprintforscale.com` (same as production). The API allows `localhost:3000` via CORS.

## Conventions

- **Framework**: Next.js (App Router) with TypeScript, MUI, Tailwind CSS
- **Data fetching**: All data comes from the BlueprintOS API — never connect to Postgres directly from the frontend
- **API key**: Pass via `x-api-key` header on every request (except `/health`)
- **Secrets**: Never commit API keys, `.env` files, or credentials
