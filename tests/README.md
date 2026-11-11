# Browser tests

Playwright scripts that load the app on a phone-sized screen with simulated data and check the main flows.
`mocksb.js` is a fake Supabase (cloud) used by the coach/client tests; the Apple Health tests (`twatch`, `tconnect`, `tconn2`, `thealth`, `tlivehr`)
fake the iPhone app (Capacitor) and Apple Health with generated watch data.

Run from the repo root: `node tests/run.mjs` (all) or `node tests/run.mjs twatch tconnect` (some). It serves the app on
http://localhost:8767, runs each test, and writes logs and screenshots to `tests/shots/` (not committed).

Some older tests were written for earlier versions of a screen; if one fails, check whether the app is wrong or the test is out of date before changing the app.
These can't cover the real iPhone: Apple Health data, Bluetooth heart-rate monitors, notifications and haptics need a TestFlight build.
