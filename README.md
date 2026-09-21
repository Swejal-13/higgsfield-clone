# Higgsfield Clone - 8x Assignment

A full-stack educational recreation of the Higgsfield AI creative platform, built as a 8x assignment.

## Live Demo

**Live URL:** [[frontend-khlutp67c-swejal-s-projects1.vercel.app](https://frontend-eight-plum-uliqqflh7j.vercel.app/)](https://frontend-swejal-s-projects1.vercel.app/)

The application is designed to work without external AI API keys by using local mock generation providers. This allows the core image, video, audio, editing, effects, and workflow experiences to be demonstrated end-to-end.

## Repository

**GitHub:** https://github.com/Swejal-13/higgsfield-clone

---

## 1. Project Overview

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion + React Query + React Flow
- **Backend:** Node.js + Express + TypeScript + Mongoose + JWT + Zod validation
- **Database:** MongoDB
- **AI generation:** Provider-abstraction layer with mock providers and external-provider stubs
- **File storage:** Local disk via Multer, with the storage layer structured so it can be replaced by Cloudinary/S3

The application is a functional full-stack product rather than a static UI mockup. Authentication, projects, assets, generations, credits, notifications, and generation workflows are connected to the Express/MongoDB backend.

---

## 2. Features Implemented

### Creative Studios

- **Image Studio** (`/image`)
  - Prompt and negative prompt
  - Reference image upload
  - Model selection
  - Aspect ratio, resolution, quality, and count controls
  - Credit cost display
  - QUEUED → PROCESSING → COMPLETED generation flow
  - Download, edit, variation, image-to-video, favorite, share, and delete actions

- **Image Edit** (`/image/edit`)
  - Inpaint
  - Remove object
  - Replace object
  - Relight
  - Recolor
  - Expand
  - Upscale
  - Style transfer
  - Brush-mask canvas with pointer events, undo, clear, and brush-size controls

- **Video Studio** (`/video`)
  - Text-to-video
  - Image-to-video
  - Image Studio → Video handoff
  - Duration, aspect ratio, resolution, quality, motion, camera, and audio controls

- **Video Edit** (`/video/edit`)
  - Timeline
  - Play/pause
  - Scrubber
  - Editing controls

- **Motion Control** (`/video/motion`)
  - Character image upload
  - Motion reference video upload

- **Audio Studio** (`/audio`)
  - TTS
  - Voice
  - SFX
  - Music
  - HTML5 audio playback

- **Effects** (`/effects`)
  - Effect gallery
  - Preset handoff into image/video workflows

- **Genjutsu** (`/genjutsu`)
  - Video-to-video restyling workflow

- **Cinema Studio** (`/cinema`)
  - Scene
  - Character
  - Environment
  - Camera
  - Lens
  - Lighting controls

- **Canvas** (`/canvas`)
  - Node-based workflow builder using React Flow
  - Add, connect, and delete nodes
  - LocalStorage persistence

### Product Experience

- Sticky navbar with Image and Video mega-dropdowns
- Explore page
- Featured projects and models
- Effects masonry
- Community gallery
- Assets management
- Generation history
- Projects
- Credits and transaction history
- Pricing
- Notifications
- Global search (`Ctrl/Cmd + K`)
- Settings
- API documentation
- Demo API key management
- MCP page
- ChatGPT Plugin page
- Marketing Studio templates
- Contests and leaderboard
- Admin dashboard
- 404 / Unauthorized / Server Error pages
- Toast-based error handling
- Empty states and loading states

### Authentication

- JWT registration
- JWT login/logout
- Protected routes
- Demo account
- Admin role
- Password management

---

## 3. Architecture

```text
higgsfield-clone/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.ts
│   │   │   ├── db.ts
│   │   │   ├── models.config.ts
│   │   │   └── effects.config.ts
│   │   │
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── providers/
│   │   │   ├── mock/
│   │   │   └── external/
│   │   ├── services/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── utils/
│   │
│   ├── public/
│   │   └── demo/
│   │
│   └── scripts/
│       └── seed.ts
│
├── frontend/
│   ├── public/
│   │   └── demo/
│   │
│   └── src/
│       ├── api/
│       ├── components/
│       ├── pages/
│       ├── contexts/
│       ├── hooks/
│       ├── layouts/
│       ├── config/
│       ├── types/
│       └── utils/
│
├── .agent-logs/
├── .gitignore
├── package.json
└── README.md
