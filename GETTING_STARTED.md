Getting started (beginner-friendly)

Follow these steps on your Windows machine to get the project running locally.

1) Install Node.js (npm)
- Recommended: download and run the official Node.js LTS installer from https://nodejs.org
- Alternative: install nvm-windows to manage Node versions: https://github.com/coreybutler/nvm-windows/releases

After installing, open a new PowerShell terminal and verify:

```powershell
node -v
npm -v
where.exe npm
```

2) Install dependencies
- From the project root:

```powershell
# at repo root
npm install

# then for the dashboard
Set-Location -Path youtube-dashboard
npm install
```

If `npm` is not recognized, follow step 1 again or paste the error here for help.

3) Create environment variables
- Copy `.env.example` to `.env` in the root and fill values for:
  - YOUTUBE_API_KEY
  - MONGO_URI
  - PORT (optional)

4) Remove temporary type shims (after successful npm installs)
- In `youtube-dashboard/src/types/` there are temporary `.d.ts` files added to keep the TypeScript checker quiet before installing deps. After `npm install` succeeds, remove them so real types from node_modules are used:

```powershell
# from youtube-dashboard
Remove-Item src\types\*.d.ts -Force
```

5) Start servers
- Dashboard (Next.js):

```powershell
Set-Location -Path youtube-dashboard
npm run dev
```

- Backend (Express): open another terminal, go to repo root:

```powershell
Set-Location -Path C:\Users\Winston\YT-Tracker\Yt-Tracker
npm run dev
```

6) Manual scheduler start (development)
- In development the cron jobs don't auto-start. To start scheduled jobs manually:

- POST to: http://localhost:<PORT>/api/admin/jobs/start

7) Run tests

```powershell
# from repo root
npm run test:api
```

Troubleshooting tips
- If `npm` isn't found after installing Node, restart your machine or VS Code terminal to refresh PATH.
- If npm install fails, paste the full terminal output here and I'll help debug.
- Keep your YouTube API key secret. Never commit `.env`.

If you'd like, I can also:
- Add the above to the top-level `README.md` instead of a separate file.
- Create a small `scripts/env-check.js` script that warns if required env vars are missing.

Tell me which of the follow-up tasks you want me to do next:
- Add env-check script and wire a `npm run env:check` command
- Add the Getting Started text into `README.md`
- Wait while you install Node and then continue with dependency install and cleanup
