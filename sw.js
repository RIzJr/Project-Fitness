// Project Fitness service worker: works offline, always tries for the newest version first.
const CACHE = "pf-v8";
const CORE = ["./", "./index.html", "./privacy.html", "./manifest.json", "./demos.js", "./foods.js", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

// Network first, skipping the HTTP cache (so updates arrive straight away), cached copy when offline.
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request, { cache: "no-store" })
      .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res; })
      .catch(() => caches.match(e.request).then(m => m || caches.match("./index.html")))
  );
});

// Reminders sent from the server (works even when the app is closed)
self.addEventListener("push", e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "Project Fitness", {
    body: d.body || "", tag: d.tag || "pf", renotify: true, icon: "icon-192.png", badge: "icon-192.png", data: { url: d.url || "./" }
  }));
});

// Tapping a notification brings the app back, on the right screen.
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "./";
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(cs => {
    if (cs.length) { const c = cs[0]; return (c.navigate ? c.navigate(url).catch(() => c) : Promise.resolve(c)).then(w => (w || c).focus()); }
    return self.clients.openWindow(url);
  }));
});
