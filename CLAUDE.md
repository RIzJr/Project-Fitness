# Project Fitness: notes for working on this repo

- Single-page web app: everything lives in index.html (HTML, CSS, JS). Hosted on GitHub Pages at https://rizjr.github.io/Project-Fitness/
- Every release: bump `APP_VERSION` in index.html (e.g. 2026-10-23-2). Installed apps compare it with the live copy and refresh themselves.
- If files cached for offline use change (sw.js CORE list), also bump `CACHE` in sw.js.
- Cloud: Supabase project URL + publishable key in index.html (`CLOUD_URL`, `CLOUD_KEY`). Never put a secret/service_role key in this repo.
- Database changes go in a new `supabase-update-N.sql` and are appended to `supabase-setup.sql`. The owner runs them in the Supabase SQL editor.
- Server code: `supabase/functions/reminders/index.ts` (phone reminders, runs every 15 min via pg_cron). The owner deploys it in the Supabase dashboard with "Verify JWT" off. It uses the service key Supabase injects; never put that key in this repo. Test logic locally with Deno (PF_TEST=1).
- Privacy notice: privacy.html. Update its date if what we store changes.
- Pinned roadmap items: ROADMAP.md.
