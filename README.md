# Negotiator AI

> Autonomous AI voice agent that negotiates residential moving quotes on your behalf — with human-in-the-loop approval, full audit trails, and zero fabrication.

Built on Lovable with TanStack Start (React 19 + Vite 7), Tailwind v4, Lovable Cloud (Supabase), Twilio Voice/SMS, ElevenLabs TTS + Conversational AI, and OpenAI.

---

## ✨ Features

### Core Product
- **AI Intake Wizard** (`/new`) — Guided job spec creation with file uploads (PDFs, photos, existing quotes) and mock OCR extraction with confidence badges.
- **AI Calling Agent** (`/calls`) — Places real outbound calls via Twilio, speaks with ElevenLabs voices, and negotiates in real time using GPT.
  - Multi-language speech recognition (15 languages incl. English, Urdu, Hindi, Spanish, Arabic, etc.)
  - Barge-in / interruption support
  - Silence detection so the AI doesn't monologue
  - Live transcript feed + recording playback
- **Live Voice Chat** (`/calls`) — In-browser speak-to-speak using ElevenLabs Conversational AI (WebRTC) — no phone required.
- **Negotiation Engine** — Compares provider quotes, flags high-risk offers, and produces a recommended deal.
- **Reports** (`/report`) — Side-by-side quote comparison, transcript review, per-line audio playback.
- **Dry Run** (`/dry-run`) — End-to-end simulation of intake → quote → negotiation with a full audit bundle, no real calls placed.

### Trust & Safety
- **Human-in-the-loop approval gates** — Confirm before each business is called AND before any deal is finalized.
- **Scheduled calls** — Pick a specific date/time before approving each call.
- **Audit bundles** — Downloadable JSON with SHA-256 JobSpec hash, provider quote JSON, negotiation events, transcripts, and recording links.
- **Zero-fabrication rules** — The agent never invents prices, availability, or promises.
- **Verify-number modal** — Guided flow to add destination numbers to Twilio (handles trial-account error 21219) with one-click retry.

### UX
- **Midnight Indigo** light theme + full dark mode with persisted toggle.
- **Voice controls** — Switch between 12 ElevenLabs voices for the agent and the "business" side, adjust playback speed.
- **SMS delivery status** — Live polling of Twilio message status.

---

## 🧱 Tech Stack

| Layer | Choice |
|---|---|
| Framework | TanStack Start v1 (React 19, Vite 7, SSR on Cloudflare Workers) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Backend | Lovable Cloud (Supabase — Postgres, Auth, Storage, RLS) |
| Voice (outbound) | Twilio Programmable Voice + `<Gather>` speech recognition |
| TTS | ElevenLabs (multilingual v2) |
| Live voice | ElevenLabs Conversational AI (`@elevenlabs/react`) |
| LLM | OpenAI GPT (via Lovable AI Gateway) |
| SMS | Twilio Programmable Messaging |

---

## 🗂️ Key Routes

| Path | Purpose |
|---|---|
| `/` | Overview dashboard |
| `/new` | Intake wizard + OCR preview |
| `/calls` | Call approval, live voice chat, transcripts |
| `/report` | Quote comparison + booking approval |
| `/dry-run` | Full simulation with audit bundle |
| `/api/public/twiml` | TwiML entry for outbound calls |
| `/api/public/voice-turn` | Per-turn conversation handler (GPT + `<Gather>`) |
| `/api/public/tts` | ElevenLabs TTS proxy |
| `/api/public/recording` | Recording MP3 proxy |
| `/api/public/elevenlabs-token` | Conversational-AI session token |

---

## 🔑 Required Secrets

Configured via Lovable Cloud settings — never commit these.

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER` (currently `+1 447-228-8335`)
- `ELEVENLABS_API_KEY`
- `OPENAI_API_KEY`

Lovable Cloud auto-provisions Supabase env vars (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).

---

## 🚀 Getting Started

```bash
bun install
bun run dev
```

The dev server runs on `http://localhost:8080`.

### Twilio trial-account note
Trial numbers can only call **verified** destinations. Use the "Verify this number" modal on `/calls` when you hit error `21219`, or upgrade the Twilio account.

---

## 🧪 Try It Without Real Calls

Go to `/dry-run` to simulate the entire intake → quote → negotiation flow and download an audit bundle — no telephony, no spend.

---

## 📐 Architecture Notes

- **Server functions**: `createServerFn` from `@tanstack/react-start` for typed client→server RPC (`src/lib/*.functions.ts`).
- **Public API routes**: webhooks, TwiML, and public proxies live under `src/routes/api/public/*` (auth bypassed on published domain — every handler verifies signatures / validates input).
- **Auth-scoped Supabase**: `requireSupabaseAuth` middleware for user-scoped calls; `supabaseAdmin` only inside verified webhook handlers.
- **Roles**: stored in a separate `user_roles` table with a `has_role()` SECURITY DEFINER function — never on profiles.
- **Design tokens**: all colors in `src/styles.css` via OKLCH + semantic CSS variables; components never hardcode colors.

---

## 📦 Deployment

Publish directly from Lovable — the app deploys to Cloudflare Workers with SSR. Stable URLs:

- Preview: `https://project--<id>-dev.lovable.app`
- Production: `https://project--<id>.lovable.app`

Use these stable URLs when configuring Twilio webhooks or cron jobs.

---

## 🛡️ Security

- MCP server removed (public unauthenticated finding resolved).
- All Twilio webhooks under `/api/public/*` validate the request source before processing.
- Trial-account guard rails in the UI prevent placing calls to unverified numbers.

---

## 📄 License

Proprietary — © Negotiator AI. All rights reserved.
