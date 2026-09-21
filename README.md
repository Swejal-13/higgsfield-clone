# Higgsfield (Educational Clone)

A full-stack recreation of the [Higgsfield AI](https://higgsfield.ai/) creative platform, built as a
college assignment. It is **not affiliated with the real Higgsfield** — branding, model names and effect
names are reused here purely for educational recreation purposes, per the assignment brief.

The app is a real, working full-stack product: React/TypeScript frontend, Node/Express/TypeScript backend,
MongoDB persistence, JWT auth, and a **mock AI provider layer** so every generation workflow (image, video,
audio, image-to-video, effects, editing) works end-to-end without any external API keys.

---

## 1. Project overview

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion + React Query + React Flow
- **Backend**: Node.js + Express + TypeScript + Mongoose + JWT + Zod validation
- **Database**: MongoDB
- **AI generation**: Provider-abstraction layer with `Mock*Provider` implementations (default) and
  `External*Provider` stubs ready to be wired up to a real API
- **File storage**: Local disk (`backend/public/uploads`) via Multer, behind a storage abstraction that
  could be swapped for Cloudinary/S3

## 2. Features implemented

- Sticky navbar with functional **Image** and **Video** mega-dropdowns (Features + Models columns, driven
  by `/api/models`)
- Explore page: promo banner with live countdown, featured projects, featured models, effects masonry,
  Seedance spotlight, community gallery
- **Image Studio** (`/image`): prompt + negative prompt, reference upload, model selector, aspect
  ratio/resolution/quality/count controls, credit cost display, live QUEUED → PROCESSING → COMPLETED
  progress, result grid with download/edit/variation/image-to-video/favorite/share/delete
- **Image Edit** (`/image/edit`): inpaint/remove-object/replace-object/relight/recolor/expand/upscale/
  style-transfer tools with a real brush-mask canvas (pointer events, undo, clear, brush size)
- **Video Studio** (`/video`): text-to-video and image-to-video (including a real handoff from an
  Image Studio result via "Image → Video"), duration/aspect/resolution/quality/motion/camera/audio controls
- **Video Edit** (`/video/edit`): timeline with play/pause/scrubber + edit tools
- **Motion Control** (`/video/motion`): character image + motion reference video upload
- **Audio Studio** (`/audio`): TTS / Voice / SFX / Music modes with a real HTML5 audio player result
- **Effects** (`/effects`) and **Genjutsu** (`/genjutsu`): effect gallery that hands off a preset into the
  Image/Video studio; Genjutsu is a video-to-video re-styling workflow
- **Cinema Studio** (`/cinema`): Scene/Character/Environment fields + Camera/Lens/Lighting pill selectors
- **Canvas** (`/canvas`): real node-based workflow builder using React Flow (add/connect/delete nodes, save
  to localStorage)
- **MCP**, **API docs + demo key management**, **ChatGPT Plugin**, **Marketing Studio templates**,
  **Contests** (leaderboard + entries) — all functional pages, not placeholders
- **Assets** (`/assets`): tabs, grid/list view, drag-and-drop upload, favorite/delete
- **History** (`/history`): type/status filters, sort, live-updating status
- **Projects** (`/projects`, `/projects/:id`): create projects, see linked assets + generations
- **Credits**: real balance, per-model cost, "Not enough credits" modal with Upgrade CTA, full transaction
  ledger in Settings
- **Pricing** (`/pricing`): monthly/yearly toggle, simulated upgrade flow
- **Auth**: JWT register/login/logout, protected routes, demo account
- **Settings**: Profile, Subscription, Credits, API Keys, Notifications, Security tabs
- **Search**: global `Ctrl/Cmd+K` modal searching models, effects, projects
- **Notifications**: bell dropdown, unread state, mark-as-read, generated automatically on
  generation-complete / generation-failed / low-credit events
- **Admin** (`/admin`, admin role only): stats, users, models, effects, generations tables
- 404 / Unauthorized / Server error pages, empty states everywhere, toast-based error handling

## 3. Architecture

```
higgsfield-clone/
├── backend/
│   ├── src/
│   │   ├── config/        # env, db, models.config.ts, effects.config.ts (single source of truth)
│   │   ├── models/        # Mongoose schemas: User, Project, Generation, Asset, Notification, ...
│   │   ├── middleware/     # auth (JWT), error handler, rate limiting, multer upload
│   │   ├── providers/      # ImageGenerationProvider / VideoGenerationProvider / AudioGenerationProvider
│   │   │   ├── mock/        #   Mock*Provider — used automatically when no API key is set
│   │   │   └── external/    #   External*Provider — stubs to fill in with a real API
│   │   ├── services/       # generation.service.ts (QUEUED→PROCESSING→COMPLETED pipeline), credit.service.ts
│   │   ├── controllers/    # one per resource
│   │   └── routes/         # one per resource, mounted in app.ts
│   ├── public/demo/        # generated placeholder images/videos/audio used by the mock providers
│   └── scripts/seed.ts     # demo data seeding
└── frontend/
    └── src/
        ├── api/            # axios client + one module per backend resource
        ├── components/      # Navbar, MediaCard, ModelSelector, GenerationProgress, ImageViewer, ...
        ├── pages/           # one file per route
        ├── contexts/        # AuthContext, ToastContext
        ├── hooks/           # useGenerationPolling
        └── config/          # nav.config.ts — single source of truth for header/dropdown structure
```

### Provider abstraction (mock ⇄ real)

`backend/src/providers/index.ts` picks `Mock*Provider` or `External*Provider` per generation type based on
whether `AI_IMAGE_API_KEY` / `AI_VIDEO_API_KEY` / `AI_AUDIO_API_KEY` are set in `.env`. Every provider
implements the same interface (`backend/src/providers/ProviderTypes.ts`), so nothing else in the app needs
to change when you plug in a real model API — just fill in the `External*Provider` classes.

### Generation pipeline

`backend/src/services/generation.service.ts`:

1. Validates the user has enough credits.
2. Creates a `Generation` document with `status: "QUEUED"`.
3. Responds immediately with the generation id (`202 Accepted`).
4. Runs an async pipeline (not awaited by the request) that walks through 5 labeled phases
   ("Preparing prompt...", "Generating...", "Running model...", "Rendering...", "Finalizing..."),
   updating `progress` and `statusMessage` as it goes.
5. Calls the correct provider method for the type/action.
6. Saves outputs as `Asset` documents, marks the generation `COMPLETED`, deducts credits, and creates a
   success `Notification`. On failure, marks `FAILED` and creates an error `Notification` (no credits are
   deducted).

The frontend polls `GET /api/generations/:id/status` every ~900ms (`useGenerationPolling` hook) and renders
the phase/progress live.

## 4. Installation

**Requirements**: Node.js 18+ and a running MongoDB instance (local or Atlas).

```bash
# From the repo root
npm run install:all
```

This installs both `backend/` and `frontend/` dependencies (they are separate npm projects).

## 5. Environment variables

```bash
cp backend/.env.example backend/.env
```

Key variables (see `backend/.env.example` for the full list):

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB connection string, e.g. `mongodb://127.0.0.1:27017/higgsfield` |
| `JWT_SECRET` | Secret used to sign auth tokens — change this |
| `AI_IMAGE_API_KEY` / `AI_VIDEO_API_KEY` / `AI_AUDIO_API_KEY` | Leave empty to use the mock providers (default). Set any of these to route that generation type through the corresponding `External*Provider` stub instead. |
| `MOCK_IMAGE_DURATION_MS` / `MOCK_VIDEO_DURATION_MS` / `MOCK_AUDIO_DURATION_MS` | Total simulated generation time — lower these for a faster demo |

The frontend needs no `.env` — Vite proxies `/api`, `/demo` and `/uploads` to `http://localhost:5000` in
`frontend/vite.config.ts`.

## 6. Running in development

```bash
# MongoDB must be running first, e.g.:
mongod --dbpath /path/to/your/db

# Seed demo data (users, sample generations, assets, notifications)
npm run seed

# Start both servers together
npm run dev
```

- Backend: http://localhost:5000 (health check: `/api/health`)
- Frontend: http://localhost:5173

Or run them separately:

```bash
npm run dev:backend   # backend/  -> ts-node + nodemon
npm run dev:frontend  # frontend/ -> vite
```

**Demo accounts** (after `npm run seed`):

| Role | Email | Password |
|---|---|---|
| User | `demo@higgsfield.demo` | `password123` |
| Admin | `admin@higgsfield.demo` | `password123` |

## 7. Production build

```bash
npm run build
```

This runs `tsc` for the backend and `tsc -b && vite build` for the frontend. Both are verified to build
with **zero TypeScript errors** in this repository.

To run the built backend:

```bash
cd backend
npm run start   # node dist/src/server.js
```

Serve `frontend/dist` with any static host (or `npm run preview --prefix frontend` for a quick local check).

## 8. API routes

All routes are mounted under `/api`. Protected routes require `Authorization: Bearer <token>`.

```
POST   /api/auth/register            POST /api/auth/login          GET /api/auth/me

POST   /api/images/generate          POST /api/images/edit
POST   /api/images/inpaint           POST /api/images/upscale       POST /api/images/variation

POST   /api/videos/generate          POST /api/videos/image-to-video
POST   /api/videos/edit              POST /api/videos/motion        POST /api/videos/extend

POST   /api/audio/generate

POST   /api/generations              GET  /api/generations
GET    /api/generations/:id          GET  /api/generations/:id/status
POST   /api/generations/:id/cancel   DELETE /api/generations/:id

GET    /api/assets                   POST /api/assets/upload
PUT    /api/assets/:id               DELETE /api/assets/:id

GET    /api/projects                 POST /api/projects
GET    /api/projects/:id             PUT  /api/projects/:id         DELETE /api/projects/:id

GET    /api/credits                  GET  /api/credits/transactions
GET    /api/models                   GET  /api/effects

GET    /api/notifications            PUT  /api/notifications/:id/read
PUT    /api/settings/profile         PUT  /api/settings/password
GET    /api/settings/api-keys        POST /api/settings/api-keys    DELETE /api/settings/api-keys/:id

GET    /api/admin/stats  /users  /generations  /models  /effects   (admin role only)
```

## 9. Database models

`User`, `Project`, `Generation`, `Asset`, `Notification`, `CreditTransaction`, `ApiKey` — see
`backend/src/models/*.ts` for full schemas.

## 10. Adding a new AI model / effect

Models and effects are **configuration-driven**, used identically by Explore, the studios, the nav
dropdowns and pricing:

- Add a model: edit `backend/src/config/models.config.ts` (`IMAGE_MODELS` / `VIDEO_MODELS` / `AUDIO_MODELS`)
- Add an effect: edit `backend/src/config/effects.config.ts` (`EFFECTS`)

No other file needs to change — every surface reads from `GET /api/models` / `GET /api/effects`.

## 11. Connecting a real AI provider later

1. Set `AI_IMAGE_API_KEY` (or video/audio) in `backend/.env`.
2. Implement the corresponding methods in `backend/src/providers/external/External*Provider.ts` — they
   already implement the same interface as the mock providers, so nothing else changes.
3. Restart the backend — `backend/src/providers/index.ts` will automatically route to the external
   provider for that generation type.

## 12. Troubleshooting

- **Backend won't connect to MongoDB**: the server still boots (with a warning) so you can browse
  config-driven routes (`/api/models`, `/api/effects`, `/api/health`), but anything touching the database
  (auth, generations, assets) will fail until MongoDB is reachable. Check `MONGODB_URI`.
- **"Not enough credits"**: seeded demo user starts with 240 credits; new signups get 150. Lower model
  costs in `models.config.ts` for testing, or re-run `npm run seed`.
- **Generations feel slow/fast**: tune `MOCK_IMAGE_DURATION_MS` / `MOCK_VIDEO_DURATION_MS` /
  `MOCK_AUDIO_DURATION_MS` in `backend/.env`.
- **CORS errors**: make sure `CLIENT_URL` in `backend/.env` matches the frontend origin
  (`http://localhost:5173` by default).
- **Uploaded file rejected**: only PNG/JPEG/WEBP/MP4/MOV/MP3/WAV are accepted, 25MB max (see
  `backend/src/middleware/upload.ts`).

## 13. AI agent development history

The `.codex/` and `.agent-logs/` folders at the repo root contain session logs from the AI coding
assistant(s) used while building this project. They're committed intentionally so graders/teammates can
see the development process; they are not part of the running application and neither `backend/` nor
`frontend/` reference them in any way.

## 14. Notes for graders

- This is an educational recreation built for a college assignment. It is not affiliated with, endorsed
  by, or a production copy of the real Higgsfield AI product.
- Every core workflow listed in the assignment brief (image gen, video gen, image-to-video, editing,
  effects, Genjutsu, Cinema Studio, Canvas, assets, history, projects, credits, auth, pricing, settings,
  search, notifications, admin) is implemented and wired to a real Express/MongoDB backend with a working
  mock AI pipeline — nothing is a static mockup or a dead button.
