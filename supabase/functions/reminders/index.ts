// Project Fitness reminders: sends phone notifications even when the app is closed.
// Deploy in Supabase: Edge Functions → Deploy a new function → Via editor → name it "reminders" → paste this file → Deploy.
// Then open the function's settings and turn OFF "Verify JWT" (the app and the scheduler call it without a user login).
// Runs every 15 minutes from the schedule in supabase-update-3.sql. Uses the service key Supabase gives every function; nothing secret is stored in the app.
import { createClient } from "npm:@supabase/supabase-js@2.116.0";
import webpush from "npm:web-push@3.6.7";

const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "authorization, x-client-info, apikey, content-type, x-cron-secret", "access-control-allow-methods": "GET, POST, OPTIONS" };
const CONTACT = "mailto:rizalitojrmangilit@yahoo.com";
export const DEF = { food: { on: false, time: "19:00" }, ready: { on: false, time: "09:00" }, plan: { on: false, time: "17:00" }, idle: { on: true, mins: 45 } };

export function localParts(tz: string, now: Date) {
  let f: Intl.DateTimeFormat;
  try { f = new Intl.DateTimeFormat("en-GB", { timeZone: tz || "Europe/London", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }); }
  catch { f = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }); }
  const p = Object.fromEntries(f.formatToParts(now).map(x => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, mins: (+p.hour % 24) * 60 + (+p.minute) };
}
const toMins = (t: string) => { const [h, m] = String(t || "").split(":").map(Number); return (h || 0) * 60 + (m || 0); };

// Which reminders are due for one person right now (pure, so it can be tested)
export function decide(o: { cfg: any; tz: string; now: Date; day: any; ready: any; plansToday: any[]; doneIds: Set<string>; active: any; sent: Set<string> }) {
  const L = localParts(o.tz, o.now), R = { ...DEF, ...(o.cfg || {}) }, out: any[] = [];
  const due = (c: any) => c && c.on && L.mins >= toMins(c.time) && L.mins < toMins(c.time) + 60;
  if (due(R.food) && !(o.day && o.day.foods && o.day.foods.length) && !o.sent.has("food|" + L.date))
    out.push({ kind: "food", key: L.date, title: "Log today's food 🍽️", body: "Nothing logged yet today. A quick log keeps you and your coach on track.", url: "./?go=food" });
  if (due(R.ready) && !o.ready && !o.sent.has("ready|" + L.date))
    out.push({ kind: "ready", key: L.date, title: "Morning check-in ⚡", body: "30 seconds: how did you sleep and how do you feel? Your readiness sets today's plan.", url: "./?go=ready" });
  const p = (o.plansToday || []).find(x => !o.doneIds.has(x.id));
  if (due(R.plan) && p && !o.sent.has("plan|" + L.date))
    out.push({ kind: "plan", key: L.date, title: "Today's session is ready 💪", body: `${p.name || "Your coach's session"} is waiting. Press Start and everything is set up.`, url: "./?go=train" });
  if (R.idle && R.idle.on && o.active && o.active.last && o.now.getTime() - o.active.last > (+R.idle.mins || 45) * 60000 && !o.sent.has("idle|" + o.active.started))
    out.push({ kind: "idle", key: String(o.active.started), title: "Still training?", body: `Your workout has had no activity for ${Math.round((o.now.getTime() - o.active.last) / 60000)} min. Tap to finish and save it, or keep going.`, url: "./?go=train" });
  return out;
}

export async function getConfig(sb: any) {
  const { data } = await sb.from("push_config").select("*").eq("id", 1).maybeSingle();
  if (data && data.public_key) return data;
  const k = webpush.generateVAPIDKeys(), row = { id: 1, public_key: k.publicKey, private_key: k.privateKey, cron_secret: (data && data.cron_secret) || crypto.randomUUID() };
  await sb.from("push_config").upsert(row);
  return row;
}

// One run: check everyone who turned on notifications
export async function run(sb: any, push: any, now = new Date()) {
  const cfg = await getConfig(sb);
  push.setVapidDetails(CONTACT, cfg.public_key, cfg.private_key);
  const { data: subs } = await sb.from("push_subs").select("*");
  const byUser = new Map<string, any[]>();
  (subs || []).forEach((s: any) => { if (!byUser.has(s.user_id)) byUser.set(s.user_id, []); byUser.get(s.user_id)!.push(s); });
  let sentCount = 0;
  for (const [uid, list] of byUser) {
    const tz = list[0].tz || "Europe/London", L = localParts(tz, now);
    const { data: docs } = await sb.from("docs").select("id,data").eq("user_id", uid).in("id", ["settings", "active", "day_" + L.date, "ready_" + L.date]);
    const get = (id: string) => { const r = (docs || []).find((x: any) => x.id === id); return r && !(r.data && r.data._del) ? r.data : null; };
    const { data: plans } = await sb.from("plans").select("id,data").eq("client_id", uid);
    const plansToday = (plans || []).filter((x: any) => x.data && x.data.date === L.date).map((x: any) => ({ id: x.id, name: x.data.name }));
    let doneIds = new Set<string>();
    if (plansToday.length) { const { data: wos } = await sb.from("docs").select("data").eq("user_id", uid).like("id", "wo_%").eq("data->>date", L.date); doneIds = new Set((wos || []).map((w: any) => w.data && w.data.planId).filter(Boolean)); }
    const { data: logs } = await sb.from("push_log").select("kind,key").eq("user_id", uid);
    const sent = new Set((logs || []).map((x: any) => x.kind + "|" + x.key));
    const settings = get("settings") || {};
    const due = decide({ cfg: settings.reminders, tz, now, day: get("day_" + L.date), ready: get("ready_" + L.date), plansToday, doneIds, active: get("active"), sent });
    for (const d of due) {
      for (const s of list) {
        try { await push.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify({ title: d.title, body: d.body, tag: d.kind, url: d.url }), { TTL: 3600 }); sentCount++; }
        catch (e: any) { if (e && (e.statusCode === 404 || e.statusCode === 410)) await sb.from("push_subs").delete().eq("user_id", uid).eq("endpoint", s.endpoint); }
      }
      await sb.from("push_log").upsert({ user_id: uid, kind: d.kind, key: d.key });
    }
  }
  return { users: byUser.size, sent: sentCount };
}

async function handler(req: Request) {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const json = (o: any, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...CORS, "content-type": "application/json" } });
  try {
    if (req.method === "GET") { const c = await getConfig(sb); return json({ publicKey: c.public_key }); } // the app needs this to subscribe
    const c = await getConfig(sb);
    if (!c.cron_secret || req.headers.get("x-cron-secret") !== c.cron_secret) return json({ error: "not allowed" }, 401);
    return json(await run(sb, webpush));
  } catch (e) { return json({ error: String((e as any)?.message || e) }, 500); }
}
if (!Deno.env.get("PF_TEST")) Deno.serve(handler);
