# YouTube Shorts & Long-Form Video Tracker Backend

This repository contains a Node.js backend that fetches trending YouTube videos, classifies Shorts vs long-form, computes outlier metrics, and exposes a REST API for analytics and administration.

## Quick start

1. Copy `.env.example` to `.env` and set the required values (YouTube API key, MongoDB URI, etc.).

   Example `.env`:

   ```env
   YOUTUBE_API_KEY=your_youtube_api_key_here
   MONGO_URI=mongodb://localhost:27017/youtube_tracker
   PORT=5000
   NODE_ENV=development
   ```

2. Install dependencies and start the server:

   ```bash
   npm install
   npm run dev
   ```

3. (Optional) Start MongoDB locally or use Atlas. Example (macOS Homebrew):

   ```bash
   brew services start mongodb-community
   ```

## API examples

- `GET /api/videos/trending`
- `GET /api/videos/outliers`
- `GET /api/videos/shorts`
- `GET /api/channels/:id`
- `GET /api/admin/status`
- `POST /api/admin/fetch/manual`

Most endpoints accept query params like `limit`, `isShort`, and `minViews`.

## Scheduler (jobs)

- Main fetch: every 15 minutes (trending + updates)
- Viral alerts: every 15 minutes
- Hourly trending: every hour
- Daily cleanup: midnight

Note: the scheduler auto-starts only when `NODE_ENV === 'production'`. In development use the admin endpoint `POST /api/admin/jobs/start` to run jobs manually.

## Tests

Run the API smoke tests (server must be running):

```bash
npm run test:api
```

## Project structure

```text
src/
├─ config/       # database + env
├─ models/       # Mongoose schemas
├─ routes/       # Express routes
├─ services/     # business logic + YouTube wrapper
└─ app.js        # server entrypoint
```

For dashboard instructions see `youtube-dashboard/README.md`.
