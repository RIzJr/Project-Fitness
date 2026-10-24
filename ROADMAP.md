# Project Fitness roadmap

## 📌 Pinned / flagged

### Apple Health & Android Health Connect (do this with the app-store version)
**Status:** on hold until the app is published to the App Store / Google Play.

- Wrap the web app with Capacitor (native iOS + Android shells).
- iOS: Apple Health (HealthKit). Needs an Apple Developer account (~£79/yr) and a Mac or cloud build service.
- Android: Health Connect (replaces Google Fit). Needs a Google Play account (~£20 one-off) and the Health Connect declaration form.
- Wearables (Apple Watch, Garmin, Fitbit, Oura, Whoop, smart scales) come through these two automatically.

What it unlocks:
- Recover: auto sleep hours, resting heart rate and HRV for a more accurate readiness score
- Cardio: auto-import runs, walks and rides from watches
- Habits: auto-tick the steps habit
- Body: smart-scale weigh-ins appear automatically
- Write sessions back to Apple Health / Health Connect
- Optional sleep, steps and resting HR in client reports (client's permission)

Also needed: per-permission consent prompts, privacy notice update, store health-data review.

## Programme planning (next step after coach-planned sessions)
- Multi-week programmes: build a block (e.g. 6 weeks, 4 days a week) once and assign it to a client
- Automatic progression rules (add weight when all reps are hit, deload week)
- Coach dashboard: planned vs completed across all clients, what they actually lifted vs the plan
- Client can swap a planned exercise and the coach sees why

## Later ideas
- Check-in: one question per screen, score trends, coach reply / next-week focus, goal progress
- Smarter deloads (low readiness + stalled lifts)
- Coach-assigned recovery plans
- Body map for pain logging
- Colour-coded client summary for the coach
