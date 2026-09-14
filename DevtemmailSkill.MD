---
name: devtemmail-project
description: Use this skill whenever working on the DevTempMail (DTM) project — a personal developer temp-mail tool. Covers stack, architecture, UI rules, and coding conventions to keep every change consistent across sessions.
---

# DevTempMail (DTM) — Project Skill

## What this project is
A personal, non-commercial developer tool that generates disposable email addresses for testing sign-up flows during development. Not a public product — zero cost is a hard constraint, no domain purchase, no email server ownership.

## Non-negotiable constraints
- **$0 cost.** No paid services, no domain purchase, no Cloudflare Email Routing, no custom mail server.
- **No separate backend server.** Everything runs through Next.js API Routes (serverless functions). Never scaffold an Express/Fastify server.
- **Deploy target is Vercel.** Every architectural decision must be Vercel-serverless-compatible.
- **Dark mode only.** No light theme, no theme toggle, no `next-themes` provider switching logic. Dark is the only palette that exists in this app.

## Tech stack (do not substitute without being asked)
| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI components | shadcn/ui |
| Database | PostgreSQL, hosted on Neon or Supabase (serverless-friendly, pooled connections) |
| ORM | Prisma |
| Package manager | bun |
| Email source | **Mail.tm** free API (no API key, JWT-based account auth, CORS-enabled), never a self-owned domain |
| Hosting | Vercel |

## Database rules
- Always use a pooled/serverless-friendly Postgres connection string (Neon/Supabase pooler URL), never a raw long-lived connection in serverless functions.
- Prisma Client must be instantiated as a singleton (cached on `globalThis` in dev) to avoid exhausting connections on hot reload.
- Schema changes go through Prisma Migrate; never hand-edit generated SQL.

## Email API integration rules
- Provider: **Mail.tm** (`https://api.mail.tm`). No API key required; auth is per-generated-account via JWT.
- Treat Mail.tm as an external dependency behind a thin service module (e.g. `lib/mailtm.ts`) — never call the provider's API directly from components or route handlers.
- Core flow: `POST /accounts` (create address) → `POST /token` (get JWT) → `GET /messages` (poll inbox) → `GET /messages/{id}` (full message content).
- Store the JWT + generated address server-side (DB, tied to the user's session/browser), not just in client state — needed to resume the inbox on refresh.
- Inbox refresh is done via polling (short interval) from the client calling an internal API route, which in turn calls Mail.tm with the stored JWT.
- Handle provider downtime/rate-limits gracefully — this is a free third-party API with no SLA.
- Do not fall back to 1secmail; Mail.tm is the sole provider for this project unless explicitly revisited.

## UI/UX rules
- **Look and feel:** minimal, clean, modern, premium — not busy, not templated-looking. Favor whitespace, restrained color use, subtle motion over heavy decoration.
- **Usability-first ("essay use"):** every screen should be immediately understandable with no onboarding needed — generate email, copy it, watch inbox, done.
- **Component library:** shadcn/ui components as the base; customize via Tailwind, don't fight the library with overrides.
- **Theme:** single dark theme baked into Tailwind config / CSS variables. No `dark:` variants paired with light fallback — dark IS the only mode.
- No decorative complexity that doesn't serve the core flow (generate → copy → receive → read).

## Code quality bar
- Production-grade: proper error handling, loading states, empty states (no mail yet), and copy-to-clipboard feedback — this is a real tool, not a throwaway demo.
- Type everything; no `any` in API route handlers or Prisma queries.
- Keep API routes thin — business logic (provider calls, parsing) lives in `lib/`, not inline in `route.ts`.

## When generating code for this project
- Default to Next.js API Routes for any backend need — never suggest a standalone server.
- Default to the free email-provider approach — never suggest domain/DNS/Cloudflare setup unless explicitly asked to revisit that decision.
- Keep changes scoped — don't introduce new libraries or architectural patterns not listed above without flagging it first.