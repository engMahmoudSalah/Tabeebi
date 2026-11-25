import { DurableObject } from "cloudflare:workers";
import { SPECIALTIES, PLANS, CITIES, makeDoctors, REVIEW_TEXTS, REVIEW_NAMES } from "./seed.js";

const enc = new TextEncoder();
const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64 = (s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
const J = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const err = (msg, status = 400) => J({ error: msg }, status);
const rid = () => crypto.randomUUID().replace(/-/g, "").slice(0, 16);
const ACTIVE = "('booked','confirmed','completed')";

function cairoNow() {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Cairo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date()).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, minutes: +p.hour * 60 + +p.minute };
}
const addDays = (d, n) => { const t = new Date(d + "T12:00:00Z"); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };
const dowOf = (d) => (new Date(d + "T12:00:00Z").getUTCDay() + 1) % 7; // Sat=0 .. Fri=6
const toMin = (t) => +t.slice(0, 2) * 60 + +t.slice(3, 5);
const fromMin = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || "");
const isTime = (s) => /^\d{2}:\d{2}$/.test(s || "");
const clean = (s, n = 200) => String(s ?? "").replace(/[\u0000-\u001f<>]/g, " ").trim().slice(0, n);

export class Hub extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.attempts = new Map();
    ctx.blockConcurrencyWhile(async () => { this.init(); await this.loadSecret(); await this.ensureAdmin(); });
  }
  q(text, ...p) { return this.sql.exec(text, ...p).toArray(); }
  one(text, ...p) { return this.q(text, ...p)[0] || null; }
  run(text, ...p) { this.sql.exec(text, ...p); }

  init() {
    this.run(`CREATE TABLE IF NOT EXISTS meta(k TEXT PRIMARY KEY, v TEXT)`);
    this.run(`CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY, email TEXT UNIQUE, phone TEXT, name TEXT, role TEXT, salt TEXT, hash TEXT, created_at TEXT)`);
    this.run(`CREATE TABLE IF NOT EXISTS specialties(id TEXT PRIMARY KEY, name_ar TEXT, name_en TEXT)`);
    this.run(`CREATE TABLE IF NOT EXISTS plans(id TEXT PRIMARY KEY, name_ar TEXT, name_en TEXT, price INTEGER, cap INTEGER, boost INTEGER, online INTEGER, analytics INTEGER, featured INTEGER, features TEXT)`);
    this.run(`CREATE TABLE IF NOT EXISTS doctors(id TEXT PRIMARY KEY, user_id TEXT, slug TEXT UNIQUE, name_ar TEXT, name_en TEXT, spec TEXT, title_ar TEXT, bio_ar TEXT, bio_en TEXT, female INTEGER, years INTEGER, city TEXT, area TEXT, address TEXT, fee INTEGER, fee_followup INTEGER, online_fee INTEGER, online_enabled INTEGER DEFAULT 0, services TEXT, langs TEXT, waiting INTEGER, hue INTEGER, status TEXT, base_avg REAL, base_n INTEGER, seeded INTEGER DEFAULT 0, license TEXT, created_at TEXT)`);
    this.run(`CREATE TABLE IF NOT EXISTS meta_flags(k TEXT PRIMARY KEY, v TEXT)`);
    this.run(`CREATE TABLE IF NOT EXISTS home_visits(doctor_id TEXT PRIMARY KEY, fee INTEGER)`);
    this.run(`CREATE TABLE IF NOT EXISTS schedules(id INTEGER PRIMARY KEY AUTOINCREMENT, doctor_id TEXT, dow INTEGER, start TEXT, end TEXT, slot INTEGER)`);
    this.run(`CREATE TABLE IF NOT EXISTS time_off(doctor_id TEXT, date TEXT, PRIMARY KEY(doctor_id, date))`);
    this.run(`CREATE TABLE IF NOT EXISTS appointments(id TEXT PRIMARY KEY, code TEXT UNIQUE, doctor_id TEXT, patient_id TEXT, date TEXT, time TEXT, kind TEXT, status TEXT, name TEXT, phone TEXT, reason TEXT, fee INTEGER, created_at TEXT, note TEXT)`);
    this.run(`CREATE UNIQUE INDEX IF NOT EXISTS uq_slot ON appointments(doctor_id, date, time) WHERE status IN ('booked','confirmed','completed')`);
    this.run(`CREATE INDEX IF NOT EXISTS ix_appt_patient ON appointments(patient_id)`);
    this.run(`CREATE INDEX IF NOT EXISTS ix_appt_doc ON appointments(doctor_id, date)`);
    this.run(`CREATE TABLE IF NOT EXISTS reviews(id TEXT PRIMARY KEY, appointment_id TEXT UNIQUE, doctor_id TEXT, patient_id TEXT, author TEXT, rating INTEGER, title TEXT, body TEXT, reply TEXT, created_at TEXT)`);
    this.run(`CREATE TABLE IF NOT EXISTS favorites(user_id TEXT, doctor_id TEXT, PRIMARY KEY(user_id, doctor_id))`);
    this.run(`CREATE TABLE IF NOT EXISTS subscriptions(id TEXT PRIMARY KEY, doctor_id TEXT, plan_id TEXT, status TEXT, started_at TEXT, expires_at TEXT, note TEXT, created_at TEXT)`);
    this.run(`CREATE TABLE IF NOT EXISTS notifications(id TEXT PRIMARY KEY, user_id TEXT, title TEXT, body TEXT, ts TEXT, read INTEGER DEFAULT 0)`);
    if (!this.one(`SELECT 1 x FROM meta WHERE k='seeded'`)) this.seed();
  }
  async loadSecret() {
    let r = this.one(`SELECT v FROM meta WHERE k='jwt'`);
    if (!r) { const raw = crypto.getRandomValues(new Uint8Array(32)); this.run(`INSERT INTO meta VALUES('jwt', ?)`, b64(raw)); r = { v: b64(raw) }; }
    this.key = await crypto.subtle.importKey("raw", unb64(r.v), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
  }
  seed() {
    const now = new Date().toISOString();
    for (const [id, a, e] of SPECIALTIES) this.run(`INSERT INTO specialties VALUES(?,?,?)`, id, a, e);
    for (const p of PLANS) this.run(`INSERT INTO plans VALUES(?,?,?,?,?,?,?,?,?,?)`, p.id, p.name_ar, p.name_en, p.price, p.cap, p.boost, p.online, p.analytics, p.featured, JSON.stringify(p.features));
    let k = 0;
    for (const d of makeDoctors()) {
      const id = rid();
      const plan = PLANS.find((p) => p.id === d.plan);
      this.run(`INSERT INTO doctors VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, id, null, d.slug, d.name_ar, d.name_en, d.spec, d.title_ar, d.bio_ar, d.bio_en, d.female ? 1 : 0, d.years, d.city, d.area, d.address, d.fee, d.fee_followup, d.online_fee, plan.online ? 1 : 0, JSON.stringify(d.services), JSON.stringify(d.langs), d.waiting, d.hue, "approved", d.base_avg, d.base_n, 1, null, now);
      for (const s of d.sched) this.run(`INSERT INTO schedules(doctor_id,dow,start,end,slot) VALUES(?,?,?,?,?)`, id, s.dow, s.start, s.end, s.slot);
      this.run(`INSERT INTO subscriptions VALUES(?,?,?,?,?,?,?,?)`, rid(), id, d.plan, "active", now, null, "seed", now);
      for (let i = 0; i < 2 + (k % 3); i++) {
        const t = REVIEW_TEXTS[(k + i) % REVIEW_TEXTS.length];
        this.run(`INSERT INTO reviews VALUES(?,?,?,?,?,?,?,?,?,?)`, rid(), null, id, null, REVIEW_NAMES[(k * 3 + i) % REVIEW_NAMES.length], 4 + ((k + i) % 2), t[0], t[1], null, new Date(Date.now() - (i + 1) * 9 * 864e5).toISOString());
      }
      k++;
    }
    this.run(`INSERT INTO meta VALUES('seeded','1')`);
  }
  async ensureAdmin() {
    if (!this.one(`SELECT 1 x FROM meta_flags WHERE k='home_seed'`)) {
      this.run(`INSERT INTO home_visits SELECT id, ((fee*3/2+25)/50)*50 FROM doctors WHERE user_id IS NULL AND spec IN ('pediatrics','internal','physio','nutrition','obgyn','neurology','orthopedics') AND (unicode(substr(slug,1,1))+length(slug)) % 2 = 0`);
      this.run(`INSERT INTO meta_flags VALUES('home_seed','1')`);
    }
    if (!this.one(`SELECT 1 x FROM meta_flags WHERE k='auto_confirm'`)) { this.run(`UPDATE appointments SET status='confirmed' WHERE status='booked' AND doctor_id IN (SELECT id FROM doctors WHERE user_id IS NULL)`); this.run(`INSERT INTO meta_flags VALUES('auto_confirm','1')`); }
    if (this.env.CLEANUP_TEST) {
      const us = this.q(`SELECT id FROM users WHERE email LIKE '%@example.com'`).map((u) => u.id);
      for (const id of us) { const d = this.one(`SELECT id FROM doctors WHERE user_id=?`, id); if (d) { for (const t of ['schedules','time_off','subscriptions','reviews']) this.run(`DELETE FROM ${t} WHERE doctor_id=?`, d.id); this.run(`DELETE FROM appointments WHERE doctor_id=?`, d.id); this.run(`DELETE FROM doctors WHERE id=?`, d.id); } this.run(`DELETE FROM appointments WHERE patient_id=?`, id); this.run(`DELETE FROM notifications WHERE user_id=?`, id); this.run(`DELETE FROM favorites WHERE user_id=?`, id); this.run(`DELETE FROM users WHERE id=?`, id); }
    }
    const pw = this.env.ADMIN_PASSWORD;
    if (!pw) return;
    const email = "admin@tabeebi.mahmodsalah.workers.dev";
    const h = await this.hashPw(pw, this.one(`SELECT salt FROM users WHERE email=?`, email)?.salt);
    if (this.one(`SELECT 1 x FROM users WHERE email=?`, email)) this.run(`UPDATE users SET hash=? WHERE email=?`, h.hash, email);
    else this.run(`INSERT INTO users VALUES(?,?,?,?,?,?,?,?)`, rid(), email, "", "Admin", "admin", h.salt, h.hash, new Date().toISOString());
  }

  async hashPw(pw, salt) {
    const s = salt ? unb64(salt) : crypto.getRandomValues(new Uint8Array(16));
    const key = await crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: s, iterations: 100000, hash: "SHA-256" }, key, 256);
    return { salt: b64(s), hash: b64(bits) };
  }
  async sign(payload) {
    const body = b64(enc.encode(JSON.stringify(payload)));
    const sig = await crypto.subtle.sign("HMAC", this.key, enc.encode(body));
    return body + "." + b64(sig);
  }
  async verify(tok) {
    try {
      const [body, sig] = tok.split(".");
      if (!(await crypto.subtle.verify("HMAC", this.key, unb64(sig), enc.encode(body)))) return null;
      const p = JSON.parse(new TextDecoder().decode(unb64(body)));
      return p.exp > Date.now() ? p : null;
    } catch { return null; }
  }
  async authUser(req) {
    const h = req.headers.get("authorization") || "";
    if (!h.startsWith("Bearer ")) return null;
    const p = await this.verify(h.slice(7));
    return p ? this.one(`SELECT id,email,phone,name,role FROM users WHERE id=?`, p.sub) : null;
  }
  async session(user) { return { token: await this.sign({ sub: user.id, exp: Date.now() + 30 * 864e5 }), user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } }; }
  notify(userId, title, body) { if (userId) this.run(`INSERT INTO notifications VALUES(?,?,?,?,?,0)`, rid(), userId, title, body, new Date().toISOString()); }

  // ---------- plan / rating helpers ----------
  activePlan(doctorId) {
    const now = new Date().toISOString();
    const s = this.one(`SELECT plan_id FROM subscriptions WHERE doctor_id=? AND status='active' AND (expires_at IS NULL OR expires_at>?) ORDER BY CASE plan_id WHEN 'premium' THEN 3 WHEN 'plus' THEN 2 ELSE 1 END DESC LIMIT 1`, doctorId, now);
    return this.one(`SELECT * FROM plans WHERE id=?`, s?.plan_id || "free");
  }
  rating(d) {
    const r = this.one(`SELECT COUNT(*) n, COALESCE(SUM(rating),0) s FROM reviews WHERE doctor_id=? AND (patient_id IS NOT NULL)`, d.id);
    const n = d.base_n + r.n;
    return { avg: Math.round(((d.base_avg * d.base_n + r.s) / n) * 10) / 10, count: n };
  }
  card(d, specMap, planCache) {
    const plan = planCache?.[d.id] || this.activePlan(d.id);
    const r = this.rating(d);
    return {
      id: d.id, slug: d.slug, name_ar: d.name_ar, name_en: d.name_en, spec: d.spec, specialty_ar: specMap[d.spec]?.name_ar, specialty_en: specMap[d.spec]?.name_en,
      title_ar: d.title_ar, city: d.city, area: d.area, address: d.address, fee: d.fee, fee_followup: d.fee_followup, online_fee: d.online_fee, years: d.years,
      female: !!d.female, hue: d.hue, rating_avg: r.avg, rating_count: r.count, waiting: d.waiting, services: JSON.parse(d.services || "[]"), langs: JSON.parse(d.langs || "[]"),
      online: !!(d.online_enabled && plan.online), home_fee: this.one(`SELECT fee FROM home_visits WHERE doctor_id=?`, d.id)?.fee || 0, plan: plan.id, verified: plan.boost > 0, featured: !!plan.featured,
    };
  }
  specMap() { return Object.fromEntries(this.q(`SELECT * FROM specialties`).map((s) => [s.id, s])); }

  // ---------- availability ----------
  dayOpen(doctor, date, plan) {
    const slots = [];
    if (this.one(`SELECT 1 x FROM time_off WHERE doctor_id=? AND date=?`, doctor.id, date)) return { slots, reason: "off" };
    const rows = this.q(`SELECT * FROM schedules WHERE doctor_id=? AND dow=? ORDER BY start`, doctor.id, dowOf(date));
    const taken = new Set(this.q(`SELECT time FROM appointments WHERE doctor_id=? AND date=? AND status IN ${ACTIVE}`, doctor.id, date).map((x) => x.time));
    const now = cairoNow();
    let full = false;
    if (plan.cap > 0) {
      const used = this.one(`SELECT COUNT(*) n FROM appointments WHERE doctor_id=? AND substr(date,1,7)=? AND status IN ${ACTIVE}`, doctor.id, date.slice(0, 7)).n;
      if (used >= plan.cap) full = true;
    }
    for (const r of rows) for (let m = toMin(r.start); m + r.slot <= toMin(r.end); m += r.slot) {
      const t = fromMin(m);
      if (date < now.date || (date === now.date && m < now.minutes + 30)) continue;
      slots.push({ time: t, free: !taken.has(t) && !full });
    }
    return { slots, reason: full ? "cap" : rows.length ? "" : "closed" };
  }
  nextDays(doctor, plan, days = 14) {
    const now = cairoNow(); const out = [];
    for (let i = 0; i < days; i++) {
      const date = addDays(now.date, i);
      const { slots } = this.dayOpen(doctor, date, plan);
      out.push({ date, free: slots.filter((s) => s.free).length, total: slots.length });
    }
    return out;
  }

  // ---------- router ----------
  async fetch(req) {
    // read cache: cuts rows-read for anonymous GETs (free-tier DO limit); any write clears it
    this._c = this._c || new Map();
    if (req.method !== "GET") { this._c.clear(); return this.fetch0(req); }
    const u = new URL(req.url);
    const ok = !req.headers.get("authorization") && /^\/api\/(meta|slugs|stats|doctors(\/[a-z0-9-]+)?)$/.test(u.pathname);
    if (!ok) return this.fetch0(req);
    const k = u.pathname + u.search, hit = this._c.get(k);
    if (hit && Date.now() - hit.t < 60000) return new Response(hit.b, { status: hit.s, headers: hit.h });
    const r = await this.fetch0(req);
    if (r.status === 200) { const b = await r.clone().text(); if (this._c.size > 200) this._c.clear(); this._c.set(k, { t: Date.now(), b, s: 200, h: [...r.headers] }); }
    return r;
  }
  async fetch0(req) {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/api/, "") || "/";
    const m = req.method;
    let body = {};
    if (m !== "GET" && m !== "HEAD") { try { body = await req.json(); } catch { body = {}; } }
    try {
      const user = await this.authUser(req);
      const need = (...roles) => { if (!user) throw new HttpErr("سجل الدخول أولا", 401); if (roles.length && !roles.includes(user.role)) throw new HttpErr("غير مسموح", 403); return user; };
      let x;
      // public
      if (path === "/health") return J({ ok: true, doctors: this.one(`SELECT COUNT(*) n FROM doctors`).n });
      if (path === "/slugs") return J(this.q(`SELECT slug FROM doctors WHERE status='approved'`).map((r) => r.slug));
      if (path === "/meta") return J({ specialties: this.q(`SELECT s.*, (SELECT COUNT(*) FROM doctors d WHERE d.spec=s.id AND d.status='approved') n FROM specialties s`), cities: CITIES, plans: this.q(`SELECT * FROM plans`).map((p) => ({ ...p, features: JSON.parse(p.features) })), today: cairoNow().date });
      if (path === "/stats") return J({ doctors: this.one(`SELECT COUNT(*) n FROM doctors WHERE status='approved'`).n, specialties: this.one(`SELECT COUNT(*) n FROM specialties`).n, appointments: this.one(`SELECT COUNT(*) n FROM appointments`).n + 1280, reviews: this.one(`SELECT COUNT(*) n FROM reviews`).n });
      if (path === "/auth/register" && m === "POST") return await this.register(body, "patient");
      if (path === "/auth/login" && m === "POST") return await this.login(body, req);
      if (path === "/doctors" && m === "GET") return this.listDoctors(url);
      if ((x = path.match(/^\/doctors\/([a-z0-9-]+)$/)) && m === "GET") return this.doctorProfile(x[1], user);
      if ((x = path.match(/^\/doctors\/([a-z0-9-]+)\/slots$/)) && m === "GET") {
        const d = this.one(`SELECT * FROM doctors WHERE slug=? AND status='approved'`, x[1]); if (!d) return err("غير موجود", 404);
        const date = url.searchParams.get("date"); if (!isDate(date)) return err("تاريخ غير صحيح");
        const plan = this.activePlan(d.id); const r = this.dayOpen(d, date, plan);
        return J({ date, ...r, online: !!(d.online_enabled && plan.online) });
      }
      if (path === "/doctor/apply" && m === "POST") return await this.applyDoctor(body);
      // authenticated
      if (path === "/me") { need(); if (m === "PATCH") { const n = clean(body.name, 80), p = clean(body.phone, 20); if (n.length < 2) return err("الاسم قصير"); this.run(`UPDATE users SET name=?, phone=? WHERE id=?`, n, p, user.id); } return J({ user: this.one(`SELECT id,name,email,phone,role FROM users WHERE id=?`, user.id) }); }
      if (path === "/notifications") { need(); if (m === "POST") { this.run(`UPDATE notifications SET read=1 WHERE user_id=?`, user.id); return J({ ok: true }); } return J(this.q(`SELECT * FROM notifications WHERE user_id=? ORDER BY ts DESC LIMIT 30`, user.id)); }
      if (path === "/appointments" && m === "POST") return this.book(need(), body);
      if (path === "/appointments" && m === "GET") return this.myAppointments(need());
      if ((x = path.match(/^\/appointments\/(\w+)\/cancel$/)) && m === "POST") return this.cancelMine(need(), x[1]);
      if ((x = path.match(/^\/appointments\/(\w+)\/review$/)) && m === "POST") return this.review(need(), x[1], body);
      if (path === "/favorites" && m === "GET") { need(); const sm = this.specMap(); return J(this.q(`SELECT d.* FROM favorites f JOIN doctors d ON d.id=f.doctor_id WHERE f.user_id=?`, user.id).map((d) => this.card(d, sm))); }
      if ((x = path.match(/^\/favorites\/(\w+)$/))) { need(); if (m === "POST") this.run(`INSERT OR IGNORE INTO favorites VALUES(?,?)`, user.id, x[1]); else if (m === "DELETE") this.run(`DELETE FROM favorites WHERE user_id=? AND doctor_id=?`, user.id, x[1]); return J({ ok: true }); }
      // doctor
      if (path.startsWith("/doctor/")) return await this.doctorApi(need("doctor"), path.slice(8), m, body, url);
      if (path.startsWith("/admin/")) return await this.adminApi(need("admin"), path.slice(7), m, body, url);
      return err("غير موجود", 404);
    } catch (e) {
      if (e instanceof HttpErr) return err(e.message, e.status);
      return err("خطأ في الخادم: " + (e.message || e), 500);
    }
  }

  async register(b, role) {
    const email = clean(b.email, 120).toLowerCase(), name = clean(b.name, 80), phone = clean(b.phone, 20), pw = String(b.password || "");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return err("البريد الإلكتروني غير صحيح");
    if (name.length < 2) return err("اكتب الاسم");
    if (pw.length < 8) return err("كلمة المرور 8 أحرف على الأقل");
    if (this.one(`SELECT 1 x FROM users WHERE email=?`, email)) return err("البريد مسجل بالفعل، سجل الدخول", 409);
    const { salt, hash } = await this.hashPw(pw);
    const id = rid();
    this.run(`INSERT INTO users VALUES(?,?,?,?,?,?,?,?)`, id, email, phone, name, role, salt, hash, new Date().toISOString());
    this.notify(id, "أهلا بيك في طبيبي", "حسابك جاهز. ابحث عن دكتور واحجز أول موعد.");
    return J(await this.session({ id, email, phone, name, role }), 201);
  }
  async login(b, req) {
    const ip = req.headers.get("cf-connecting-ip") || "x"; const k = ip + (b.email || "");
    const a = this.attempts.get(k) || { n: 0, t: Date.now() };
    if (Date.now() - a.t > 10 * 60e3) { a.n = 0; a.t = Date.now(); }
    if (a.n >= 8) return err("محاولات كتير. جرب بعد شوية.", 429);
    const u = this.one(`SELECT * FROM users WHERE email=?`, clean(b.email, 120).toLowerCase());
    const ok = u && (await this.hashPw(String(b.password || ""), u.salt)).hash === u.hash;
    if (!ok) { a.n++; this.attempts.set(k, a); return err("البريد أو كلمة المرور غير صحيحة", 401); }
    this.attempts.delete(k);
    return J(await this.session(u));
  }

  listDoctors(url) {
    const sp = url.searchParams, sm = this.specMap();
    let rows = this.q(`SELECT * FROM doctors WHERE status='approved'`);
    const planCache = {}; rows.forEach((d) => (planCache[d.id] = this.activePlan(d.id)));
    const qs = clean(sp.get("q"), 60).toLowerCase();
    if (qs) rows = rows.filter((d) => [d.name_ar, d.name_en, d.title_ar, d.area, d.city, sm[d.spec]?.name_ar, sm[d.spec]?.name_en, d.services].join(" ").toLowerCase().includes(qs));
    if (sp.get("spec")) rows = rows.filter((d) => d.spec === sp.get("spec"));
    if (sp.get("city")) rows = rows.filter((d) => d.city === sp.get("city"));
    if (sp.get("area")) rows = rows.filter((d) => d.area === sp.get("area"));
    if (sp.get("gender")) rows = rows.filter((d) => (sp.get("gender") === "f") === !!d.female);
    if (sp.get("max_fee")) rows = rows.filter((d) => d.fee <= +sp.get("max_fee"));
    let cards = rows.map((d) => this.card(d, sm, planCache));
    if (sp.get("online") === "1") cards = cards.filter((c) => c.online);
    if (sp.get("home") === "1") cards = cards.filter((c) => c.home_fee);
    if (sp.get("min_rating")) cards = cards.filter((c) => c.rating_avg >= +sp.get("min_rating"));
    const today = cairoNow().date;
    const byId = Object.fromEntries(rows.map((d) => [d.id, d]));
    for (const c of cards) { const pl = planCache[c.id]; const nd = this.nextDays(byId[c.id], pl, 14).find((d) => d.free > 0); c.next = nd ? nd.date : null; }
    if (sp.get("today") === "1") cards = cards.filter((c) => c.next === today);
    const sort = sp.get("sort") || "recommended";
    const boost = (c) => (c.plan === "premium" ? 2 : c.plan === "plus" ? 1 : 0);
    if (sort === "fee_asc") cards.sort((a, b) => a.fee - b.fee);
    else if (sort === "fee_desc") cards.sort((a, b) => b.fee - a.fee);
    else if (sort === "rating") cards.sort((a, b) => b.rating_avg - a.rating_avg || b.rating_count - a.rating_count);
    else if (sort === "soonest") cards.sort((a, b) => (a.next || "9") .localeCompare(b.next || "9"));
    else cards.sort((a, b) => boost(b) * 0.6 + b.rating_avg - (boost(a) * 0.6 + a.rating_avg));
    const total = cards.length, page = Math.max(1, +sp.get("page") || 1), per = 12;
    return J({ total, page, per, items: cards.slice((page - 1) * per, page * per) });
  }
  doctorProfile(slug, user) {
    const d = this.one(`SELECT * FROM doctors WHERE slug=? AND status='approved'`, slug); if (!d) return err("الدكتور غير موجود", 404);
    const sm = this.specMap(), plan = this.activePlan(d.id), c = this.card(d, sm);
    const reviews = this.q(`SELECT author, rating, title, body, reply, created_at FROM reviews WHERE doctor_id=? ORDER BY created_at DESC LIMIT 20`, d.id);
    const hours = this.q(`SELECT dow,start,end,slot FROM schedules WHERE doctor_id=? ORDER BY dow,start`, d.id);
    const similar = this.q(`SELECT * FROM doctors WHERE spec=? AND id<>? AND status='approved' LIMIT 3`, d.spec, d.id).map((x) => this.card(x, sm));
    return J({ ...c, bio_ar: d.bio_ar, bio_en: d.bio_en, reviews, hours, days: this.nextDays(d, plan, 14), similar, fav: user ? !!this.one(`SELECT 1 x FROM favorites WHERE user_id=? AND doctor_id=?`, user.id, d.id) : false });
  }

  book(user, b) {
    const d = this.one(`SELECT * FROM doctors WHERE (slug=? OR id=?) AND status='approved'`, String(b.doctor), String(b.doctor)); if (!d) return err("الدكتور غير موجود", 404);
    const date = b.date, time = b.time; if (!isDate(date) || !isTime(time)) return err("اختر يوم وميعاد");
    const kind = b.kind === "online" ? "online" : b.kind === "home" ? "home" : "clinic";
    const homeFee = kind === "home" ? this.one(`SELECT fee FROM home_visits WHERE doctor_id=?`, d.id)?.fee : 0;
    if (kind === "home" && !homeFee) return err("الزيارة المنزلية غير متاحة عند الدكتور ده");
    const addr = clean(b.address, 200); if (kind === "home" && addr.length < 8) return err("اكتب عنوانك بالتفصيل للزيارة المنزلية");
    const plan = this.activePlan(d.id);
    if (kind === "online" && !(d.online_enabled && plan.online)) return err("الكشف أونلاين غير متاح عند الدكتور ده");
    const name = clean(b.name, 80), phone = clean(b.phone, 20).replace(/[^\d+]/g, "");
    if (name.length < 2) return err("اكتب اسم المريض"); if (phone.length < 8) return err("اكتب رقم موبايل صحيح");
    const mine = this.one(`SELECT COUNT(*) n FROM appointments WHERE patient_id=? AND status IN ('booked','confirmed') AND date>=?`, user.id, cairoNow().date).n;
    if (mine >= 6) return err("وصلت للحد الأقصى من الحجوزات القادمة (6)");
    if (this.one(`SELECT 1 x FROM appointments WHERE patient_id=? AND doctor_id=? AND date=? AND status IN ('booked','confirmed')`, user.id, d.id, date)) return err("عندك حجز بالفعل مع الدكتور ده في نفس اليوم");
    if (date > addDays(cairoNow().date, 60)) return err("الحجز متاح لحد 60 يوم قدام");
    const day = this.dayOpen(d, date, plan);
    const slot = day.slots.find((s) => s.time === time);
    if (!slot) return err(day.reason === "off" ? "الدكتور في إجازة اليوم ده" : "الميعاد ده غير متاح");
    if (!slot.free) return err(day.reason === "cap" ? "اكتمل حجز الدكتور للشهر ده" : "الميعاد اتحجز من حد تاني، اختر ميعاد تاني", 409);
    const id = rid(), code = "TB-" + crypto.getRandomValues(new Uint8Array(6)).reduce((s, n) => s + "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[n % 32], "");
    const fee = kind === "online" ? d.online_fee : kind === "home" ? homeFee : d.fee;
    try { this.run(`INSERT INTO appointments VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, id, code, d.id, user.id, date, time, kind, d.user_id ? "booked" : "confirmed", name, phone, (kind === "home" ? "[زيارة منزلية] " + addr + (b.reason ? " | " : "") : "") + clean(b.reason, 300), fee, new Date().toISOString(), null); }
    catch { return err("الميعاد اتحجز من حد تاني، اختر ميعاد تاني", 409); }
    this.notify(user.id, "تم تأكيد حجزك", `${d.name_ar} يوم ${date} الساعة ${time}. كود الحجز ${code}.`);
    this.notify(d.user_id, "حجز جديد", `${name} حجز ${date} ${time} (${kind === "online" ? "أونلاين" : kind === "home" ? "زيارة منزلية" : "عيادة"}).`);
    return J({ id, code, doctor: d.name_ar, date, time, kind, fee, address: d.address }, 201);
  }
  myAppointments(user) {
    const sm = this.specMap();
    return J(this.q(`SELECT a.*, d.name_ar dname, d.slug, d.spec, d.address, d.hue, d.female, (SELECT id FROM reviews r WHERE r.appointment_id=a.id) reviewed FROM appointments a JOIN doctors d ON d.id=a.doctor_id WHERE a.patient_id=? ORDER BY a.date DESC, a.time DESC`, user.id).map((a) => ({ ...a, specialty_ar: sm[a.spec]?.name_ar })));
  }
  cancelMine(user, id) {
    const a = this.one(`SELECT * FROM appointments WHERE id=? AND patient_id=?`, id, user.id); if (!a) return err("الحجز غير موجود", 404);
    if (!["booked", "confirmed"].includes(a.status)) return err("لا يمكن إلغاء هذا الحجز");
    const now = cairoNow();
    if (a.date < now.date || (a.date === now.date && toMin(a.time) < now.minutes + 60)) return err("الإلغاء متاح قبل الميعاد بساعة على الأقل");
    this.run(`UPDATE appointments SET status='cancelled', note='cancelled_by_patient' WHERE id=?`, id);
    const d = this.one(`SELECT user_id,name_ar FROM doctors WHERE id=?`, a.doctor_id);
    this.notify(d.user_id, "إلغاء حجز", `${a.name} ألغى حجز ${a.date} ${a.time}.`);
    return J({ ok: true });
  }
  review(user, id, b) {
    const a = this.one(`SELECT * FROM appointments WHERE id=? AND patient_id=?`, id, user.id); if (!a) return err("الحجز غير موجود", 404);
    if (a.status !== "completed") return err("التقييم بعد إتمام الكشف");
    const rating = Math.round(+b.rating); if (!(rating >= 1 && rating <= 5)) return err("اختر تقييم من 1 إلى 5");
    if (this.one(`SELECT 1 x FROM reviews WHERE appointment_id=?`, id)) return err("قيمت الكشف ده قبل كده", 409);
    this.run(`INSERT INTO reviews VALUES(?,?,?,?,?,?,?,?,?,?)`, rid(), id, a.doctor_id, user.id, user.name.split(" ")[0] + " " + (user.name.split(" ")[1]?.[0] || "") + ".", rating, clean(b.title, 60), clean(b.body, 600), null, new Date().toISOString());
    this.notify(this.one(`SELECT user_id FROM doctors WHERE id=?`, a.doctor_id).user_id, "تقييم جديد", `${rating} من 5 نجوم.`);
    return J({ ok: true }, 201);
  }

  async applyDoctor(b) {
    const spec = this.one(`SELECT id FROM specialties WHERE id=?`, b.spec); if (!spec) return err("اختر التخصص");
    if (!CITIES[b.city]) return err("اختر المحافظة");
    const fee = Math.round(+b.fee); if (!(fee >= 50 && fee <= 5000)) return err("سعر الكشف بين 50 و 5000 جنيه");
    const lic = clean(b.license, 40); if (lic.length < 4) return err("اكتب رقم القيد بالنقابة");
    const reg = await this.register({ ...b, name: b.name }, "doctor");
    if (reg.status !== 201) return reg;
    const sess = await reg.clone().json();
    const id = rid(), base = clean(b.email, 60).split("@")[0].toLowerCase().replace(/[^a-z0-9]+/g, "-");
    let slug = base + "-" + id.slice(0, 4);
    this.run(`INSERT INTO doctors VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, id, sess.user.id, slug, "د. " + clean(b.name, 60).replace(/^د\.?\s*/, ""), clean(b.name, 60), b.spec, clean(b.title, 80) || "أخصائي", clean(b.bio, 800), "", b.female ? 1 : 0, Math.max(0, Math.round(+b.years || 0)), b.city, clean(b.area, 60) || b.city, clean(b.address, 160), fee, Math.round(fee / 2), Math.round(fee * 0.7), 0, "[]", '["العربية"]', 15, Math.floor(Math.random() * 360), "pending", 0, 0, 0, lic, new Date().toISOString());
    this.run(`INSERT INTO subscriptions VALUES(?,?,?,?,?,?,?,?)`, rid(), id, "free", "active", new Date().toISOString(), null, "signup", new Date().toISOString());
    for (const dow of [0, 1, 2, 3, 4]) this.run(`INSERT INTO schedules(doctor_id,dow,start,end,slot) VALUES(?,?,?,?,?)`, id, dow, "17:00", "21:00", 20);
    for (const a of this.q(`SELECT id FROM users WHERE role='admin'`)) this.notify(a.id, "طلب انضمام طبيب جديد", `${b.name} (${b.spec}) بانتظار المراجعة.`);
    this.notify(sess.user.id, "استلمنا طلبك", "هنراجع بياناتك ورقم القيد، وهيظهر ملفك في الدليل بعد الموافقة.");
    return J(sess, 201);
  }

  myDoctor(user) { const d = this.one(`SELECT * FROM doctors WHERE user_id=?`, user.id); if (!d) throw new HttpErr("ملف الدكتور غير موجود", 404); return d; }
  async doctorApi(user, p, m, b, url) {
    const d = this.myDoctor(user), plan = this.activePlan(d.id), now = cairoNow();
    if (p === "dashboard") {
      const sm = this.specMap();
      const today = this.q(`SELECT * FROM appointments WHERE doctor_id=? AND date=? ORDER BY time`, d.id, now.date);
      const upcoming = this.one(`SELECT COUNT(*) n FROM appointments WHERE doctor_id=? AND date>? AND status IN ('booked','confirmed')`, d.id, now.date).n;
      const month = now.date.slice(0, 7);
      const stat = this.one(`SELECT COUNT(*) n, COALESCE(SUM(fee),0) rev FROM appointments WHERE doctor_id=? AND substr(date,1,7)=? AND status='completed'`, d.id, month);
      const booked = this.one(`SELECT COUNT(*) n FROM appointments WHERE doctor_id=? AND substr(date,1,7)=? AND status IN ${ACTIVE}`, d.id, month).n;
      const series = [];
      for (let i = 13; i >= 0; i--) { const dd = addDays(now.date, -i); series.push({ date: dd, n: this.one(`SELECT COUNT(*) n FROM appointments WHERE doctor_id=? AND date=? AND status IN ${ACTIVE}`, d.id, dd).n }); }
      const sub = this.one(`SELECT * FROM subscriptions WHERE doctor_id=? AND status='requested' ORDER BY created_at DESC LIMIT 1`, d.id);
      return J({ doctor: { ...this.card(d, sm), status: d.status }, today, upcoming, month: { completed: stat.n, revenue: stat.rev, booked, cap: plan.cap }, series: plan.analytics ? series : null, plan, requested: sub?.plan_id || null, rating: this.rating(d) });
    }
    if (p === "profile") {
      if (m === "PUT") {
        const f = Math.round(+b.fee); if (!(f >= 50 && f <= 5000)) return err("سعر الكشف غير صحيح");
        this.run(`UPDATE doctors SET title_ar=?, bio_ar=?, address=?, area=?, fee=?, fee_followup=?, online_fee=?, online_enabled=?, services=?, langs=?, waiting=? WHERE id=?`,
          clean(b.title_ar, 80), clean(b.bio_ar, 1200), clean(b.address, 160), clean(b.area, 60), f, Math.round(+b.fee_followup) || Math.round(f / 2), Math.round(+b.online_fee) || Math.round(f * 0.7), b.online_enabled && plan.online ? 1 : 0,
          JSON.stringify((b.services || []).slice(0, 8).map((s) => clean(s, 40))), JSON.stringify((b.langs || ["العربية"]).slice(0, 5).map((s) => clean(s, 20))), Math.max(0, Math.min(120, +b.waiting || 15)), d.id);
      }
      if (m === "PUT") { const hf = Math.round(+b.home_fee) || 0; if (hf >= 50 && hf <= 8000) this.run(`INSERT OR REPLACE INTO home_visits(doctor_id, fee) VALUES(?,?)`, d.id, hf); else this.run(`DELETE FROM home_visits WHERE doctor_id=?`, d.id); }
      const x = this.one(`SELECT * FROM doctors WHERE id=?`, d.id);
      return J({ ...x, home_fee: this.one(`SELECT fee FROM home_visits WHERE doctor_id=?`, d.id)?.fee || 0, services: JSON.parse(x.services), langs: JSON.parse(x.langs), plan });
    }
    if (p === "schedule") {
      if (m === "PUT") {
        const rows = (b.rows || []).slice(0, 20);
        for (const r of rows) if (!(r.dow >= 0 && r.dow <= 6) || !isTime(r.start) || !isTime(r.end) || toMin(r.end) <= toMin(r.start) || ![10, 15, 20, 30, 45, 60].includes(+r.slot)) return err("بيانات الجدول غير صحيحة");
        this.ctx.storage.transactionSync(() => { this.run(`DELETE FROM schedules WHERE doctor_id=?`, d.id); for (const r of rows) this.run(`INSERT INTO schedules(doctor_id,dow,start,end,slot) VALUES(?,?,?,?,?)`, d.id, +r.dow, r.start, r.end, +r.slot); });
      }
      if (m === "POST" && isDate(b.off)) this.run(`INSERT OR IGNORE INTO time_off VALUES(?,?)`, d.id, b.off);
      if (m === "DELETE" && isDate(url.searchParams.get("off"))) this.run(`DELETE FROM time_off WHERE doctor_id=? AND date=?`, d.id, url.searchParams.get("off"));
      return J({ rows: this.q(`SELECT dow,start,end,slot FROM schedules WHERE doctor_id=? ORDER BY dow,start`, d.id), off: this.q(`SELECT date FROM time_off WHERE doctor_id=? AND date>=? ORDER BY date`, d.id, now.date).map((x) => x.date) });
    }
    if (p === "appointments" && m === "GET") {
      const date = url.searchParams.get("date"), st = url.searchParams.get("status");
      let sql = `SELECT * FROM appointments WHERE doctor_id=?`; const a = [d.id];
      if (isDate(date)) { sql += ` AND date=?`; a.push(date); } else if (url.searchParams.get("range") === "upcoming") { sql += ` AND date>=?`; a.push(now.date); }
      if (st) { sql += ` AND status=?`; a.push(st); }
      return J(this.q(sql + ` ORDER BY date DESC, time ASC LIMIT 200`, ...a));
    }
    let x;
    if ((x = p.match(/^appointments\/(\w+)\/status$/)) && m === "POST") {
      const a = this.one(`SELECT * FROM appointments WHERE id=? AND doctor_id=?`, x[1], d.id); if (!a) return err("غير موجود", 404);
      const st = b.status; const allowed = { booked: ["confirmed", "cancelled", "completed", "no_show"], confirmed: ["completed", "cancelled", "no_show"] };
      if (!allowed[a.status]?.includes(st)) return err("تغيير الحالة غير مسموح");
      if ((st === "completed" || st === "no_show") && a.date > now.date) return err("لا يمكن إتمام كشف في المستقبل");
      this.run(`UPDATE appointments SET status=?, note=? WHERE id=?`, st, st === "cancelled" ? "cancelled_by_doctor" : a.note, a.id);
      const msg = { confirmed: "الدكتور أكد حجزك", cancelled: "الدكتور ألغى الحجز، تقدر تحجز ميعاد تاني", completed: "تم الكشف. قيّم تجربتك", no_show: "تم تسجيل عدم الحضور" }[st];
      this.notify(a.patient_id, msg, `${d.name_ar} - ${a.date} ${a.time}`);
      return J({ ok: true });
    }
    if (p === "patients") {
      if (!plan.analytics) return err("قائمة المرضى متاحة في باقة بلس وأعلى", 402);
      return J(this.q(`SELECT name, phone, COUNT(*) visits, MAX(date) last_visit FROM appointments WHERE doctor_id=? AND status IN ('completed','booked','confirmed') GROUP BY phone, name ORDER BY last_visit DESC LIMIT 200`, d.id));
    }
    if (p === "reviews") return J(this.q(`SELECT id, author, rating, title, body, reply, created_at FROM reviews WHERE doctor_id=? ORDER BY created_at DESC LIMIT 50`, d.id));
    if ((x = p.match(/^reviews\/(\w+)\/reply$/)) && m === "POST") { this.run(`UPDATE reviews SET reply=? WHERE id=? AND doctor_id=?`, clean(b.reply, 400), x[1], d.id); return J({ ok: true }); }
    if (p === "subscription") {
      if (m === "POST") {
        const pl = this.one(`SELECT * FROM plans WHERE id=?`, b.plan); if (!pl || pl.id === "free") return err("باقة غير صحيحة");
        if (d.status !== "approved") return err("ملفك لسه قيد المراجعة");
        this.run(`UPDATE subscriptions SET status='cancelled', note='replaced' WHERE doctor_id=? AND status='requested'`, d.id);
        this.run(`INSERT INTO subscriptions VALUES(?,?,?,?,?,?,?,?)`, rid(), d.id, pl.id, "requested", null, null, clean(b.note, 200), new Date().toISOString());
        for (const a of this.q(`SELECT id FROM users WHERE role='admin'`)) this.notify(a.id, "طلب اشتراك", `${d.name_ar} طلب باقة ${pl.name_ar}.`);
        return J({ ok: true, message: "تم تسجيل طلبك. الدفع الإلكتروني قريبا، وفريقنا هيتواصل معاك لتفعيل الباقة." }, 201);
      }
      return J({ plan, history: this.q(`SELECT * FROM subscriptions WHERE doctor_id=? ORDER BY created_at DESC LIMIT 20`, d.id) });
    }
    return err("غير موجود", 404);
  }

  async adminApi(user, p, m, b, url) {
    let x;
    if (p === "stats") {
      const t = cairoNow().date;
      return J({
        users: this.one(`SELECT COUNT(*) n FROM users WHERE role='patient'`).n, doctors: this.one(`SELECT COUNT(*) n FROM doctors WHERE status='approved'`).n, pending: this.one(`SELECT COUNT(*) n FROM doctors WHERE status='pending'`).n,
        appointments: this.one(`SELECT COUNT(*) n FROM appointments`).n, today: this.one(`SELECT COUNT(*) n FROM appointments WHERE date=?`, t).n, requests: this.one(`SELECT COUNT(*) n FROM subscriptions WHERE status='requested'`).n,
        byStatus: this.q(`SELECT status, COUNT(*) n FROM appointments GROUP BY status`), bySpec: this.q(`SELECT d.spec, COUNT(*) n FROM appointments a JOIN doctors d ON d.id=a.doctor_id GROUP BY d.spec ORDER BY n DESC LIMIT 8`),
        plans: this.q(`SELECT plan_id, COUNT(*) n FROM subscriptions WHERE status='active' GROUP BY plan_id`),
      });
    }
    if (p === "doctors") return J(this.q(`SELECT id,slug,name_ar,spec,city,fee,status,license,seeded,created_at FROM doctors WHERE (?='' OR status=?) ORDER BY CASE status WHEN 'pending' THEN 0 ELSE 1 END, created_at DESC LIMIT 200`, url.searchParams.get("status") || "", url.searchParams.get("status") || "").map((d) => ({ ...d, plan: this.activePlan(d.id).id })));
    if ((x = p.match(/^doctors\/(\w+)\/status$/)) && m === "POST") {
      if (!["approved", "suspended", "pending"].includes(b.status)) return err("حالة غير صحيحة");
      const d = this.one(`SELECT * FROM doctors WHERE id=?`, x[1]); if (!d) return err("غير موجود", 404);
      this.run(`UPDATE doctors SET status=? WHERE id=?`, b.status, d.id);
      this.notify(d.user_id, b.status === "approved" ? "تمت الموافقة على ملفك" : "تحديث حالة الملف", b.status === "approved" ? "ملفك دلوقتي ظاهر في دليل الأطباء." : "حالة ملفك: " + b.status);
      return J({ ok: true });
    }
    if (p === "users") return J(this.q(`SELECT id,name,email,phone,role,created_at FROM users ORDER BY created_at DESC LIMIT 200`));
    if (p === "appointments") return J(this.q(`SELECT a.*, d.name_ar dname FROM appointments a JOIN doctors d ON d.id=a.doctor_id ORDER BY a.created_at DESC LIMIT 200`));
    if (p === "subscriptions") return J(this.q(`SELECT s.*, d.name_ar dname FROM subscriptions s JOIN doctors d ON d.id=s.doctor_id WHERE s.status IN ('requested','active') AND s.note<>'seed' ORDER BY s.created_at DESC LIMIT 100`));
    if ((x = p.match(/^subscriptions\/(\w+)\/(approve|reject)$/)) && m === "POST") {
      const s = this.one(`SELECT * FROM subscriptions WHERE id=?`, x[1]); if (!s) return err("غير موجود", 404);
      const d = this.one(`SELECT * FROM doctors WHERE id=?`, s.doctor_id);
      if (x[2] === "reject") { this.run(`UPDATE subscriptions SET status='cancelled' WHERE id=?`, s.id); this.notify(d.user_id, "طلب الاشتراك", "لم يتم قبول الطلب حاليا."); return J({ ok: true }); }
      const days = Math.max(1, Math.min(365, +b.days || 30));
      this.ctx.storage.transactionSync(() => {
        this.run(`UPDATE subscriptions SET status='cancelled', note='superseded' WHERE doctor_id=? AND status='active' AND note<>'seed'`, d.id);
        this.run(`UPDATE subscriptions SET status='cancelled', note='superseded' WHERE doctor_id=? AND status='active' AND note='seed'`, d.id);
        this.run(`UPDATE subscriptions SET status='active', started_at=?, expires_at=? WHERE id=?`, new Date().toISOString(), new Date(Date.now() + days * 864e5).toISOString(), s.id);
        this.run(`UPDATE doctors SET online_enabled=? WHERE id=?`, this.one(`SELECT online FROM plans WHERE id=?`, s.plan_id).online ? 1 : 0, d.id);
      });
      this.notify(d.user_id, "تم تفعيل باقتك", `باقة ${s.plan_id} مفعلة لمدة ${days} يوم.`);
      return J({ ok: true });
    }
    if (p === "specialties" && m === "POST") { const id = clean(b.id, 30).toLowerCase().replace(/[^a-z0-9]/g, ""); if (!id || !clean(b.name_ar) ) return err("بيانات ناقصة"); this.run(`INSERT OR REPLACE INTO specialties VALUES(?,?,?)`, id, clean(b.name_ar, 40), clean(b.name_en, 40) || id); return J({ ok: true }); }
    return err("غير موجود", 404);
  }
}
class HttpErr extends Error { constructor(msg, status) { super(msg); this.status = status; } }
