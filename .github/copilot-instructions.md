<!-- .github/copilot-instructions.md -->
# Copilot instructions for Yt-Tracker

Brief, actionable notes to get an AI coding agent productive in this repository.

- Entry point: `src/app.js` — Express server. Server loads `.env`, connects MongoDB (`src/config/database.js`) and conditionally starts scheduled jobs.
- Frontend: `youtube-dashboard/` — a Next.js + TypeScript dashboard that calls the backend API (see `youtube-dashboard/src/lib/api.ts`).

Quick start (developer):
- Install: `npm install` (root). Backend scripts live at root `package.json`.
- Run server: `npm run dev` (starts `src/app.js`). Default port is `process.env.PORT || 5001`.
- Scheduler note: scheduled jobs in `src/services/scheduler.js` only auto-start when `NODE_ENV === 'production'`. In development use POST /api/admin/jobs/start to start jobs manually.

Key architecture & responsibilities
- Services layer (`src/services/*`) contains external integrations and business logic:
  - `youtubeService.js` — YouTube API wrapper. Important helpers: `parseDuration()`, `isVideoShort()` and `requestCount` tracking. Respect quotas; the service exposes `getRequestCount()` and `resetRequestCount()`.
  - `dataProcessor.js` — orchestrates fetching, normalization, and storing video/channel documents.
  - `analyticsService.js` / `alertService.js` — compute analytics, store `VelocitySnapshot`, and trigger alerts.
- API routes (`src/routes/*`) are thin wrappers around services. Prefer changing service logic for behavior changes.
- Models (`src/models/*.js`) are Mongoose schemas for `Video`, `Channel`, `AlertSettings`, `VelocitySnapshot`, `Analytics`. Look for instance/static methods (e.g., channel average updates) rather than modifying controllers.

Scheduling & jobs
- CRON jobs are declared in `src/services/scheduler.js`:
  - Main fetch: every 15 minutes — calls `dataProcessor.fetchTrendingVideos()` and updates stats.
  - Viral alert job: every 15 minutes — `alertService.checkViralAlerts()`.
  - Hourly trending: every hour.
  - Daily cleanup: midnight — resets counters, recalculates outliers, updates channel averages.
- In dev: to trigger manually: POST http://localhost:<PORT>/api/admin/fetch/manual or POST /api/admin/jobs/start

Rate-limiting & quotas
- This app tracks YouTube usage via `youtubeService.requestCount`. The daily reset happens in the cleanup job (`scheduler`). Avoid high-volume changes that increase calls — prefer batched `videos` endpoint requests (see `youtubeService.getVideoDetails(videoIds)` which accepts comma-separated IDs).

Frontend integration points
- The Next.js dashboard calls backend endpoints in `youtube-dashboard/src/lib/api.ts`. Keep API paths stable (e.g., `/api/videos/outliers`, `/api/channels/:id`). When changing route shapes, update that file.

Tests & debugging
- API smoke tests: `npm run test:api` (runs `tests/apiTest.js`). Use `GET /health` for quick health checks.
- Logs: services print helpful logs in scheduled jobs and YouTube service errors include `error.response?.data`.

Patterns & conventions
- Business rules live in services, not routes. Routes are minimal.
- Use model instance methods for DB-related behavior (e.g., `Channel.updateAverageViews()` in daily cleanup).
- Short detection: `isVideoShort(duration, title, description)` in `youtubeService.js` — prefer using that helper for consistent short/long classification.

Where to look for common edits
- Add/change scheduled job timing: `src/services/scheduler.js`.
- Change fetch/processing logic: `src/services/dataProcessor.js`.
- Change YouTube call shape or parse rules: `src/services/youtubeService.js`.
- Adjust alert thresholds: `src/models/AlertSettings.js` and `src/services/alertService.js`.

Common dev pitfalls
- Scheduler won't start in dev automatically — tests or local debugging may assume jobs ran; use admin endpoints.
- Be careful with the YouTube API key & quota. Prefer local stubbing/mocking for heavy tests.

Minimal examples
- Check if a video is a Short (source): `src/services/youtubeService.js` -> call `isVideoShort(contentDetails.duration, snippet.title, snippet.description)`.
- Manually trigger a fetch: POST `/api/admin/fetch/manual` (calls `scheduler.triggerManualFetch()` -> `dataProcessor.fetchTrendingVideos`).

If something's unclear or you need more detail (e.g., example DB documents, model fields, or dashboard API usage), tell me which area to expand and I'll add or merge specifics.
