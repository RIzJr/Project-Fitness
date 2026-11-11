// Project Fitness reminders: sends phone notifications even when the app is closed.
// Deploy in Supabase: Edge Functions → Deploy a new function → Via editor → name it "reminders" → paste this file → Deploy.
// Then open the function's settings and turn OFF "Verify JWT" (the app and the scheduler call it without a user login).
// Runs every 15 minutes from the schedule in supabase-update-3.sql. Uses the service key Supabase gives every function; nothing secret is stored in the app.
import { createClient } from "npm:@supabase/supabase-js@2.116.0";
import webpush from "npm:web-push@3.6.7";

const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "authorization, x-client-info, apikey, content-type, x-cron-secret", "access-control-allow-methods": "GET, POST, OPTIONS" };
const CONTACT = "mailto:rizalitojrmangilit@yahoo.com";
export const DEF = { food: { on: false, time: "19:00" }, ready: { on: false, time: "09:00" }, plan: { on: false, time: "17:00" }, gym: { on: false, time: "08:00", days: null as number[] | null }, idle: { on: true, mins: 45 }, sleep: { on: false, plan: null as any } };
// the kind training nudge: same wording as the app (GYM_LINES in index.html), picked by date
const GYM_LINES = [
  ["{hi}, {n}! 💪", "{s} is ready for you. Future you is already grateful."],
  ["You've got this, {n} 🙌", "You don't need to feel ready, you just need to start. {s} is set up and waiting."],
  ["Gym time? 🏋️", "Showing up is the hardest part, and you're good at it. {s} is ready when you are."],
  ["{hi}, {n} ☀️", "Every session counts, even a short one. {s} is lined up for you."],
  ["Small steps, big change 💚", "One more session closer to your goal. Press Start and everything's set up."],
  ["Proud of you for showing up 💪", "Consistency beats perfection. {s} is waiting, see you there?"],
  ["Let's make today count, {n} ⚡", "Your body's ready for {s}. Warm-up, then one set at a time."]];
export function gymMsg(date: string, name: string, sess: string, time: string) {
  const n = String(name || "").trim().split(/\s+/)[0] || "you", h = +String(time).split(":")[0], hi = h < 12 ? "Morning" : h < 17 ? "Afternoon" : "Evening";
  const [t, b] = GYM_LINES[(+date.replace(/-/g, "")) % GYM_LINES.length];
  const f = (x: string) => x.replace("{hi}", hi).replace("{n}", n === "Me" ? "you" : n).replace("{s}", sess || "Today's session");
  return { title: f(t), body: f(b) };
}

export function localParts(tz: string, now: Date) {
  let f: Intl.DateTimeFormat;
  try { f = new Intl.DateTimeFormat("en-GB", { timeZone: tz || "Europe/London", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }); }
  catch { f = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }); }
  const p = Object.fromEntries(f.formatToParts(now).map(x => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, mins: (+p.hour % 24) * 60 + (+p.minute) };
}
const toMins = (t: string) => { const [h, m] = String(t || "").split(":").map(Number); return (h || 0) * 60 + (m || 0); };

// Which reminders are due for one person right now (pure, so it can be tested)
export function decide(o: { cfg: any; tz: string; now: Date; day: any; ready: any; plansToday: any[]; doneIds: Set<string>; active: any; sent: Set<string>; trainedToday?: boolean; usualDays?: number[]; name?: string }) {
  const L = localParts(o.tz, o.now), R = { ...DEF, ...(o.cfg || {}) }, out: any[] = [];
  const due = (c: any) => c && c.on && L.mins >= toMins(c.time) && L.mins < toMins(c.time) + 60;
  if (due(R.food) && !(o.day && o.day.foods && o.day.foods.length) && !o.sent.has("food|" + L.date))
    out.push({ kind: "food", key: L.date, title: "Log today's food 🍽️", body: "Nothing logged yet today. A quick log keeps you and your coach on track.", url: "./?go=food" });
  if (due(R.ready) && !o.ready && !o.sent.has("ready|" + L.date))
    out.push({ kind: "ready", key: L.date, title: "Morning check-in ⚡", body: "30 seconds: how did you sleep and how do you feel? Your readiness sets today's plan.", url: "./?go=ready" });
  const p = (o.plansToday || []).find(x => !o.doneIds.has(x.id));
  const G = { ...DEF.gym, ...(R.gym || {}) }, dow = new Date(L.date + "T12:00:00Z").getUTCDay();
  const days = Array.isArray(G.days) && G.days.length ? G.days : (o.usualDays && o.usualDays.length ? o.usualDays : [1, 3, 5]);
  if (G.on && due(G) && !o.trainedToday && (p || days.includes(dow)) && !o.sent.has("gym|" + L.date)) {
    const m = gymMsg(L.date, o.name || "", p ? p.name : "", G.time);
    out.push({ kind: "gym", key: L.date, title: m.title, body: m.body, url: "./?go=train" });
  }
  if (!G.on && due(R.plan) && p && !o.sent.has("plan|" + L.date))
    out.push({ kind: "plan", key: L.date, title: "Today's session is ready 💪", body: `${p.name || "Your coach's session"} is waiting. Press Start and everything is set up.`, url: "./?go=train" });
  // bedtime: the app works out the next 7 wind-down times from the person's sleep data and saves them in reminders.sleep.plan (date → {at, title, body})
  const SL = R.sleep && R.sleep.on && R.sleep.plan ? R.sleep.plan[L.date] : null;
  if (SL && SL.at && L.mins >= toMins(SL.at) && L.mins < toMins(SL.at) + 60 && !o.sent.has("sleep|" + L.date))
    out.push({ kind: "sleep", key: L.date, title: SL.title || "Wind down for bed 🌙", body: SL.body || "Time to start winding down for bed.", url: "./?go=sleep" });
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
    const { data: docs } = await sb.from("docs").select("id,data").eq("user_id", uid).in("id", ["settings", "active", "flexWeek", "day_" + L.date, "ready_" + L.date]);
    const get = (id: string) => { const r = (docs || []).find((x: any) => x.id === id); return r && !(r.data && r.data._del) ? r.data : null; };
    const { data: plans } = await sb.from("plans").select("id,data").eq("client_id", uid);
    // fixed-day sessions remind on their date; flexible-order sessions only on days the person picked in "Plan my week"
    const plansToday = (plans || []).filter((x: any) => x.data && !x.data.flex && x.data.date === L.date).map((x: any) => ({ id: x.id, name: x.data.name }));
    const flexIds = new Set((plans || []).filter((x: any) => x.data && x.data.flex).map((x: any) => x.id));
    const fw = get("flexWeek");
    if (flexIds.size && fw && Array.isArray(fw.days) && fw.days.includes(L.date)) plansToday.push({ id: "flex", name: "Your next session" });
    let doneIds = new Set<string>();
    if (plansToday.length) { const { data: wos } = await sb.from("docs").select("data").eq("user_id", uid).like("id", "wo_%").eq("data->>date", L.date); doneIds = new Set((wos || []).map((w: any) => w.data && w.data.planId).filter(Boolean)); if ([...doneIds].some(id => flexIds.has(id))) doneIds.add("flex"); }
    const { data: logs } = await sb.from("push_log").select("kind,key").eq("user_id", uid);
    const sent = new Set<string>((logs || []).map((x: any) => x.kind + "|" + x.key));
    const settings = get("settings") || {};
    // for the training nudge: did they train today, and which weekdays do they usually train (last 4 weeks, 2+ times)
    let trainedToday = false, usualDays: number[] = [];
    if (settings.reminders && settings.reminders.gym && settings.reminders.gym.on) {
      const from = new Date(new Date(L.date + "T12:00:00Z").getTime() - 28 * 864e5).toISOString().slice(0, 10);
      const { data: wd } = await sb.from("docs").select("data->>date").eq("user_id", uid).like("id", "wo_%").gte("data->>date", from).limit(200);
      const dates = (wd || []).map((x: any) => x.date).filter(Boolean), cnt: Record<number, number> = {};
      trainedToday = dates.includes(L.date);
      dates.forEach((d: string) => { const k = new Date(d + "T12:00:00Z").getUTCDay(); cnt[k] = (cnt[k] || 0) + 1; });
      usualDays = Object.keys(cnt).filter(k => cnt[+k] >= 2).map(Number);
    }
    const { data: prof } = await sb.from("docs").select("data").eq("user_id", uid).eq("id", "profile").maybeSingle();
    const due = decide({ cfg: settings.reminders, tz, now, day: get("day_" + L.date), ready: get("ready_" + L.date), plansToday, doneIds, active: get("active"), sent, trainedToday, usualDays, name: prof && prof.data ? prof.data.name : "" });
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

// "Rest over" pushes: called every 10 s by pf_rest_tick() when someone's rest period has ended
export async function runRest(sb: any, push: any, now = new Date()) {
  const cfg = await getConfig(sb);
  push.setVapidDetails(CONTACT, cfg.public_key, cfg.private_key);
  const { data: due } = await sb.from("rest_timers").select("user_id,ends_at").lte("ends_at", now.toISOString());
  let sent = 0;
  for (const t of due || []) {
    // claim it first (only delete if it still has the same end time, so a just-extended rest isn't lost)
    const { data: gone } = await sb.from("rest_timers").delete().eq("user_id", t.user_id).eq("ends_at", t.ends_at).select("user_id");
    if (!gone || !gone.length) continue;
    if (now.getTime() - new Date(t.ends_at).getTime() > 5 * 60000) continue; // too old to be useful
    const { data: subs } = await sb.from("push_subs").select("*").eq("user_id", t.user_id);
    for (const s of subs || []) {
      try { await push.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify({ title: "Rest over 💪", body: "Time for your next set.", tag: "rest", url: "./?go=train" }), { TTL: 60, urgency: "high" }); sent++; }
      catch (e: any) { if (e && (e.statusCode === 404 || e.statusCode === 410)) await sb.from("push_subs").delete().eq("user_id", t.user_id).eq("endpoint", s.endpoint); }
    }
  }
  return { due: (due || []).length, sent };
}

async function handler(req: Request) {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const json = (o: any, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...CORS, "content-type": "application/json" } });
  try {
    if (req.method === "GET") { const c = await getConfig(sb); return json({ publicKey: c.public_key }); } // the app needs this to subscribe
    const c = await getConfig(sb);
    if (!c.cron_secret || req.headers.get("x-cron-secret") !== c.cron_secret) return json({ error: "not allowed" }, 401);
    const body = await req.json().catch(() => ({}));
    if (body && body.rest) return json(await runRest(sb, webpush));
    return json(await run(sb, webpush));
  } catch (e) { return json({ error: String((e as any)?.message || e) }, 500); }
}
if (!Deno.env.get("PF_TEST")) Deno.serve(handler);
