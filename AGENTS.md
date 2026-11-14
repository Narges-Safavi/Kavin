# KAVIN: instructions for coding agents

## Project
KAVIN is a coworking-space booking platform (internship project). Frontend: Next.js (App Router), React, TypeScript, Tailwind, React Hook Form + Zod. Backend: a Django REST API in `backend/`, written by a teammate (Saeed). The UI is Persian (RTL).

## About the owner
The owner is a junior front-end developer who is still learning. Always reply in Persian. Explain simply, one small step at a time. Prefer simple solutions over clever ones. If you show code in chat, show the whole changed file, not only a snippet. Before a bigger change, say in a few lines what you are going to do.

## Dev environment
- Windows, VS Code, Command Prompt (not PowerShell, not bash).
- Frontend: `npm run dev`, `npm run lint`, `npm run build`.
- Backend (separate terminal): `cd backend`, `.venv\Scripts\activate`, `python manage.py runserver`.
- API contract: `backend/API.md` and http://127.0.0.1:8000/api/docs/.
- Background docs: `HANDOFF.md`, `DESIGN_SYSTEM.md`, `QA.md`, `README.md`.

## Architecture (already built)
- `lib/api.ts`: `apiRequest` and `ApiError` (`status`, `code`, `errors`). Django paths end with a slash (`/spaces/`). Next route paths used with `baseUrl` have no trailing slash (`/login`).
- Auth: the token lives only in the HttpOnly cookie `kavin_token`. Never put a token in localStorage or client-side JS. Route handlers `app/api/auth/{login,register,logout,me}` talk to Django. `lib/auth.ts` is the client side; `lib/session.ts` is server-only.
- `app/api/kavin/[...path]/route.ts`: proxy for `spaces` and `bookings` that adds the token from the cookie. Client code calls it through `lib/bookings-api.ts`.
- Spaces: `lib/spaces.ts` (`getSpaces`, `getSpace`), used in server components; the pages use `force-dynamic`.
- Booking form: free time slots come from `/availability/`, the final total comes from the server. 401 redirects to `/login`; `409 slot_taken` refreshes the slots.
- Navbar asks `/api/auth/me` on every route change to show login state.
- The API uses Gregorian dates `YYYY-MM-DD` and times `HH:mm` in Asia/Tehran. The UI shows Jalali dates.

## Status
Done: shared API client, login/signup against Django, session cookie, navbar login state, spaces list/detail from API, availability + booking + my-bookings from API, home page from API.
Possibly done, verify with git: removing the old localStorage store (`lib/booking-store.ts`, `lib/availability.ts`, `lib/use-now.ts`) and unused fixtures from `lib/data.ts`.
Remaining:
- Rewrite the Playwright tests (`tests/booking.spec.ts`, `tests/storage.spec.ts`); they still assume the old localStorage version.
- `app/design-system/page.tsx` still imports `spaces` from `lib/data.ts`.
- Filters on `/spaces` still run in the browser; the API supports `type`, `minCapacity`, `maxPrice`, `search`, `ordering`.
- `/spaces/{id}/quote/` is unused; the price preview is computed on the frontend.
- Forgot-password has no backend endpoint.

## Rules
- One new branch per task (`feat/...`, `fix/...`, `chore/...`). Never commit directly to `main`. Small commits. The owner opens the pull requests herself.
- Before finishing, `npm run lint` and `npm run build` must pass.
- Do not edit `backend/`. It belongs to Saeed; tell the owner what to ask him instead.
- Never commit `.env.local` or any secret, and never print tokens or passwords.
- Keep the existing design system and CSS tokens (`:root` in `app/globals.css`). UI text stays Persian and RTL.
- Do not add new libraries without asking first.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
