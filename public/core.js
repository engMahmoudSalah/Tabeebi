export const S = { lang: localStorage.tb_lang || "ar", theme: localStorage.tb_theme || "light", token: localStorage.tb_token || "", user: JSON.parse(localStorage.tb_user || "null"), meta: null, unread: 0 };
export const T = (ar, en) => (S.lang === "ar" ? ar : en ?? ar);
export const h = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const P = {
  search: "M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-4.5-4.5", pin: "M12 21s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12zM12 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z", star: "M12 3l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 16.9 6.6 19.8l1.1-6.1L3.2 9.4l6.1-.8z",
  clock: "M12 3a9 9 0 100 18 9 9 0 000-18zM12 7v5l3 2", video: "M3 7h11a2 2 0 012 2v6a2 2 0 01-2 2H3zM16 11l5-3v8l-5-3", shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z", heart: "M12 20s-8-5-8-11a4.5 4.5 0 018-2.7A4.5 4.5 0 0120 9c0 6-8 11-8 11z",
  user: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 3.5-6 8-6s8 2 8 6", cal: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4", check: "M5 12.5l4.5 4.5L19 7.5", plus: "M12 5v14M5 12h14", arrow: "M5 12h14M13 6l6 6-6 6", bell: "M6 16V11a6 6 0 1112 0v5l2 2H4zM10 21h4", menu: "M4 7h16M4 12h16M4 17h16", x: "M6 6l12 12M18 6L6 18",
  sun: "M12 16a4 4 0 100-8 4 4 0 000 8zM12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5", moon: "M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z", globe: "M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z", out: "M9 4H5a1 1 0 00-1 1v14a1 1 0 001 1h4M16 8l4 4-4 4M20 12H9", chart: "M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-3", gear: "M12 15a3 3 0 100-6 3 3 0 000 6zM19 12l2-1-1-3-2 .5-1.5-1.5L17 4l-3-1-1 2h-2L10 3 7 4l.5 2.5L6 8l-2-.5-1 3 2 1v2l-2 1 1 3 2-.5 1.5 1.5L7 20l3 1 1-2h2l1 2 3-1-.5-2.5L18 16l2 .5 1-3z",
  list: "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01", lock: "M6 11h12v9H6zM8 11V8a4 4 0 118 0v3", filter: "M4 5h16l-6 8v6l-4-2v-4z", home: "M4 11l8-7 8 7v9h-5v-6H9v6H4z", gh: "M12 2a10 10 0 00-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.4 1.1 3 .8.1-.7.4-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.6 9.6 0 015 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.8v2.7c0 .3.2.6.7.5A10 10 0 0012 2z",
  in: "M5 9v11M5 4.5v.01M10 20v-7a3 3 0 016 0v7M10 9v11", brief: "M4 8h16v11H4zM9 8V5h6v3M4 13h16", info: "M12 3a9 9 0 100 18 9 9 0 000-18zM12 11v5M12 8v.01",
  internal: "M6 3v6a4 4 0 008 0V3M10 13v2a5 5 0 0010 0v-1M20 12a2 2 0 100-4 2 2 0 000 4z", dentistry: "M7 4c-2 0-3.5 1.6-3.5 4 0 3 1.5 4 2 7 .3 2 .8 5 2 5 1.4 0 1.2-4 2.5-4s1.1 4 2.5 4c1.2 0 1.7-3 2-5 .5-3 2-4 2-7 0-2.4-1.5-4-3.5-4-1.5 0-2.2.8-3 .8S8.5 4 7 4z", dermatology: "M12 3s6 6.5 6 11a6 6 0 01-12 0c0-4.5 6-11 6-11z", obgyn: "M12 4a4 4 0 100 8 4 4 0 000-8zM12 12v8M9 17h6", pediatrics: "M12 3a9 9 0 100 18 9 9 0 000-18zM9 10v.01M15 10v.01M8.5 14.5c1 1.5 2.2 2 3.5 2s2.5-.5 3.5-2", orthopedics: "M5 5a2 2 0 013.5 1.5L17.5 15.5A2 2 0 1119 19a2 2 0 01-3.5-1.5L6.5 8.5A2 2 0 015 5z", ophthalmology: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 100 6 3 3 0 000-6z", ent: "M7 9a5 5 0 1110 0c0 3-3 3.5-3 6.5a2.5 2.5 0 01-5 0M10 9a2 2 0 014 0", cardiology: "M12 20s-8-5-8-11a4.5 4.5 0 018-2.7A4.5 4.5 0 0120 9c0 6-8 11-8 11zM7 11h3l1.5-2.5L13 13l1-2h3", neurology: "M9 4a3 3 0 00-3 3 3 3 0 00-2 3 3 3 0 002 3 3 3 0 003 4h1V4H9zM15 4a3 3 0 013 3 3 3 0 012 3 3 3 0 01-2 3 3 3 0 01-3 4h-1V4h1z", psychiatry: "M12 3a7 7 0 00-4 12.7V20h7v-3h2v-4l-1.5-2 1.5-1a7 7 0 00-5-7zM12 8v4", urology: "M8 4c-3 0-4 3-4 6s2 7 5 7c2 0 2-2 1-4s0-3 2-3 3 1 3 3-1 5-3 6", nutrition: "M12 7c-2-2-7-1-7 4s3 9 7 9 7-4 7-9-5-6-7-4zM12 7c0-2 1-3 3-4", physio: "M12 5a2 2 0 100-4 2 2 0 000 4zM6 21l3-8 3 2 3-2 3 8M9 13l-3-3M15 13l3-3",
};
export const ic = (n, c = "") => `<svg class="ic ${c}" viewBox="0 0 24 24" aria-hidden="true"><path d="${P[n] || P.plus}"/></svg>`;
export const money = (n) => `${Number(n).toLocaleString(S.lang === "ar" ? "ar-EG" : "en-US")} ${T("ج.م", "EGP")}`;
export const num = (n) => Number(n).toLocaleString(S.lang === "ar" ? "ar-EG" : "en-US");
export function toast(m) { const e = document.createElement("div"); e.className = "toast"; e.textContent = m; document.body.append(e); setTimeout(() => e.remove(), 3200); }
export async function api(path, opt = {}) {
  const r = await fetch("/api" + path, { method: opt.method || "GET", headers: { "content-type": "application/json", ...(S.token ? { authorization: "Bearer " + S.token } : {}) }, body: opt.body ? JSON.stringify(opt.body) : undefined });
  const d = await r.json().catch(() => ({}));
  if (r.status === 401 && S.token) { logout(false); }
  if (!r.ok) { const e = new Error(d.error || "حدث خطأ"); e.status = r.status; throw e; }
  return d;
}
export function setSession(d) { S.token = d.token; S.user = d.user; localStorage.tb_token = d.token; localStorage.tb_user = JSON.stringify(d.user); }
export function logout(go = true) { S.token = ""; S.user = null; localStorage.removeItem("tb_token"); localStorage.removeItem("tb_user"); if (go) nav("/"); else render(); }
export const dayName = (d, long) => new Date(d + "T12:00:00Z").toLocaleDateString(S.lang === "ar" ? "ar-EG" : "en-US", { weekday: long ? "long" : "short", timeZone: "UTC" });
export const dayNum = (d) => Number(d.slice(8));
export const monthName = (d) => new Date(d + "T12:00:00Z").toLocaleDateString(S.lang === "ar" ? "ar-EG" : "en-US", { month: "long", timeZone: "UTC" });
export const fmtDate = (d) => new Date(d + "T12:00:00Z").toLocaleDateString(S.lang === "ar" ? "ar-EG" : "en-US", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
export const fmtTime = (t) => { const [H, M] = t.split(":").map(Number); const pm = H >= 12; const hh = H % 12 || 12; return `${num(hh)}:${String(M).padStart(2, "0").replace(/\d/g, (x) => (S.lang === "ar" ? "٠١٢٣٤٥٦٧٨٩"[x] : x))} ${pm ? T("م", "PM") : T("ص", "AM")}`; };
export const stars = (n) => `<span class="rate">${ic("star")}${num(n)}</span>`;
const SKIN=["#f1c9a5","#e0ac84","#c68a5e","#a86f48"],HAIR=["#1d1a1a","#3a2a20","#5b4636","#2a2f3a"];
export const avatar = (d, cls = "") => { const k = d.hue % 4, sk = SKIN[k], hr = HAIR[(d.hue >> 2) % 4], f = d.female, id = "g" + d.slug.replace(/[^a-z0-9]/g, "").slice(0, 12);
  const hair = f ? `<path d="M30 46c-2-22 10-30 20-30s22 8 20 30c0 14 4 22 2 30-6-4-8-14-8-22H36c0 8-2 18-8 22-2-8 2-16 2-30z" fill="${hr}"/>` : `<path d="M32 44c-1-18 8-26 18-26s19 8 18 26c-4-8-10-12-18-12s-14 4-18 12z" fill="${hr}"/>`;
  return `<div class="av ${cls}" style="background:linear-gradient(140deg,hsl(${d.hue} 55% 42%),hsl(${(d.hue + 50) % 360} 60% 32%))"><svg viewBox="0 0 100 100" role="img" aria-label="${h(d.name_en)}"><defs><clipPath id="${id}"><rect width="100" height="100"/></clipPath></defs><g clip-path="url(#${id})">${f ? hair : ""}<path d="M14 104c2-20 16-26 36-26s34 6 36 26z" fill="#f4f7f6"/><path d="M42 78l8 14 8-14" fill="none" stroke="#c9d5d1" stroke-width="2"/><path d="M36 80c-2 10 2 18 8 20M64 80c2 10-2 18-8 20" fill="none" stroke="#2c3b36" stroke-width="2.4" stroke-linecap="round"/><circle cx="44" cy="101" r="2.6" fill="#62d8b3"/><rect x="43" y="64" width="14" height="16" rx="6" fill="${sk}"/><ellipse cx="50" cy="48" rx="15.5" ry="18" fill="${sk}"/>${f ? "" : ""}${f ? `<path d="M34 44c4-9 12-12 16-12s12 3 16 12c-6-4-10-5-16-5s-10 1-16 5z" fill="${hr}"/>` : hair}<circle cx="44" cy="49" r="1.6" fill="#2a1d17"/><circle cx="56" cy="49" r="1.6" fill="#2a1d17"/><path d="M45 57c3 3 7 3 10 0" fill="none" stroke="#7a4a35" stroke-width="1.8" stroke-linecap="round"/></g></svg></div>`; };
export const specName = (id) => { const s = S.meta?.specialties.find((x) => x.id === id); return s ? (S.lang === "ar" ? s.name_ar : s.name_en) : id; };
export const dname = (d) => (S.lang === "ar" ? d.name_ar : d.name_en);

export function doctorCard(d) {
  return `<article class="dc"><button class="fav ${d.fav ? "on" : ""}" data-fav="${d.id}" aria-label="${T("حفظ", "Save")}">${ic("heart")}</button>
  <a class="dc-top" href="/doctor/${d.slug}" data-link>${avatar(d)}<div><h3>${h(dname(d))}</h3><div class="sub">${h(specName(d.spec))}${S.lang === "ar" ? " · " + h(d.title_ar) : ""}</div>
  <div style="margin-top:6px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">${stars(d.rating_avg)}<small style="color:var(--mute)">(${num(d.rating_count)})</small>${d.home_fee ? `<span class="badge warm">${T("زيارة منزلية", "Home visit")}</span>` : ""}${d.verified ? `<span class="badge">${ic("shield", "sm")}${T("ملف تجريبي", "Sample profile")}</span>` : ""}${d.featured ? `<span class="badge warm">${T("مميز", "Featured")}</span>` : ""}${d.online ? `<span class="badge lav">${ic("video", "sm")}${T("أونلاين", "Online")}</span>` : ""}</div></div></a>
  <div class="meta"><span>${ic("pin", "sm")}${h(d.area)}، ${h(d.city)}</span><span>${ic("clock", "sm")}${T("انتظار " + num(d.waiting) + " د", "Wait " + d.waiting + " min")}</span></div>
  <div class="dc-foot"><div><div class="price">${money(d.fee)} <small>${T("الكشف", "visit")}</small></div><div class="next">${d.next ? ic("cal", "sm") + nextLabel(d.next) : `<span style="color:var(--mute)">${T("لا مواعيد قريبة", "No upcoming slots")}</span>`}</div></div>
  <a class="btn sm" href="/doctor/${d.slug}#book" data-link>${T("احجز", "Book")}</a></div></article>`;
}
export const nextLabel = (d) => { const t = S.meta?.today; if (d === t) return T("متاح اليوم", "Available today"); const tm = new Date(t + "T12:00:00Z"); tm.setUTCDate(tm.getUTCDate() + 1); if (d === tm.toISOString().slice(0, 10)) return T("متاح بكرة", "Available tomorrow"); return T("أقرب موعد ", "Next ") + dayName(d); };

// router
const routes = [];
export const route = (re, fn) => routes.push([re, fn]);
export function nav(path) { history.pushState({}, "", path); render(); window.scrollTo(0, 0); }
let rendering = 0;
export async function render() {
  const id = ++rendering;
  const app = $("#app"); const path = location.pathname.replace(/\/+$/, "") || "/";
  if (!S.meta) { try { S.meta = await api("/meta"); } catch {} }
  document.documentElement.lang = S.lang; document.documentElement.dir = S.lang === "ar" ? "rtl" : "ltr"; document.documentElement.dataset.theme = S.theme;
  $("#hdr").innerHTML = header(path); $("#ftr").innerHTML = footer();
  setTimeout(reveal, 60);
  for (const [re, fn] of routes) { const m = path.match(re); if (m) { app.innerHTML = `<div class="wrap" style="padding-block:40px"><div class="grid"><div class="skel"></div><div class="skel"></div><div class="skel"></div></div></div>`; try { await fn(app, m, new URLSearchParams(location.search)); } catch (e) { if (id === rendering) app.innerHTML = `<div class="wrap"><div class="empty">${ic("info")}<p>${h(e.message || "")}</p><a class="btn" style="margin-top:14px" href="/" data-link>${T("الرئيسية", "Home")}</a></div></div>`; } return; } }
  app.innerHTML = `<div class="wrap"><div class="empty">${ic("info")}<p>${T("الصفحة غير موجودة", "Page not found")}</p><a class="btn" style="margin-top:14px" href="/" data-link>${T("الرئيسية", "Home")}</a></div></div>`;
}
function logo() { return `<a class="logo" href="/" data-link><svg viewBox="0 0 40 40"><rect width="40" height="40" rx="13" fill="var(--brand)"/><path d="M6 21h8l3-8 5 15 3-9 2 2h7" fill="none" stroke="var(--brand-ink)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span>${T("طبيبي", "Tabeebi")}</span></a>`; }
export const demoNote = (strong) => `<div class="demo-card${strong ? " strong" : ""}"><b>${T("نسخة تجريبية", "Demo")}</b> ${T("لا يوجد أطباء أو مواعيد حقيقية. لا تدخل بيانات حقيقية (عنوان، موبايل، حالة طبية).", "No real clinicians or appointments. Do not enter real details (address, phone, medical info).")}</div>`;
function header(path) {
  const u = S.user, on = (p) => (path === p || (p !== "/" && path.startsWith(p)) ? "on" : "");
  const home = u ? (u.role === "admin" ? "/admin" : u.role === "doctor" ? "/account/doctor" : "/account") : "/login";
  return `<div class="demo-top">${T("نسخة تجريبية: لا يوجد أطباء أو مواعيد حقيقية", "Demo: no real clinicians or appointments")}</div><div class="wrap">${logo()}<nav class="nav" id="nav"><a href="/doctors" data-link class="${on("/doctors")}">${T("الأطباء", "Doctors")}</a><a href="/doctors?online=1" data-link>${T("كشف أونلاين", "Online visit")}</a><a href="/for-doctors" data-link class="${on("/for-doctors")}">${T("للأطباء", "For doctors")}</a><a href="/faq" data-link class="${on("/faq")}">${T("الأسئلة", "FAQ")}</a></nav><div class="sp"></div>
  <div class="tools"><button class="ibtn" data-act="lang" title="Language">${ic("globe")}</button><button class="ibtn" data-act="theme" title="Theme">${ic(S.theme === "dark" ? "sun" : "moon")}</button>
  ${u ? `<a class="ibtn" href="${home === "/login" ? "/login" : home + (u.role === "patient" ? "/notifications" : "")}" data-link title="${T("الإشعارات", "Notifications")}">${ic("bell")}${S.unread ? '<i class="dot"></i>' : ""}</a><a class="btn sm ghost hide-m" href="${home}" data-link>${ic("user", "sm")}${h(u.name.split(" ")[0])}</a>` : `<a class="btn sm ghost hide-m" href="/login" data-link>${T("دخول", "Log in")}</a><a class="btn sm hide-m" href="/register" data-link>${T("حساب جديد", "Sign up")}</a>`}
  <button class="ibtn menu-btn" data-act="menu">${ic("menu")}</button></div></div>`;
}
const SITES_NOTE = "";
function footer() {
  return `<div class="demo">${T("نسخة تجريبية: بيانات الأطباء المعروضة افتراضية لعرض النظام، والدفع الإلكتروني للاشتراكات قريبا.", "Demo build: doctors shown are fictional sample data, and online subscription payments are coming soon.")}</div>
  <div class="wrap ftr-main"><div>${logo()}<p>${T("منصة حجز الأطباء: ابحث، قارن، واحجز كشفك في دقيقة، في العيادة أو أونلاين.", "Doctor booking made simple: search, compare and book in a minute, at the clinic or online.")}</p></div>
  <div><h4>${T("للمرضى", "Patients")}</h4><ul><li><a href="/doctors" data-link>${T("دليل الأطباء", "Find doctors")}</a></li><li><a href="/doctors?online=1" data-link>${T("كشف أونلاين", "Online visits")}</a></li><li><a href="/account" data-link>${T("حجوزاتي", "My bookings")}</a></li><li><a href="/faq" data-link>${T("الأسئلة الشائعة", "FAQ")}</a></li></ul></div>
  <div><h4>${T("للأطباء", "Doctors")}</h4><ul><li><a href="/join" data-link>${T("انضم كطبيب", "Join as a doctor")}</a></li><li><a href="/for-doctors#plans" data-link>${T("الباقات", "Plans")}</a></li><li><a href="/account/doctor" data-link>${T("لوحة الطبيب", "Doctor panel")}</a></li></ul></div>
  <div><h4>${T("الإدارة", "Admin")}</h4><ul><li><a href="/admin" data-link>${T("دخول الإدارة", "Admin access")}</a></li></ul></div></div>
  <div class="ftr-me"><div class="wrap"><div class="ic-row"><a class="ibtn" href="https://github.com/engMahmoudSalah" target="_blank" rel="noopener" aria-label="GitHub">${ic("gh")}</a><a class="ibtn" href="https://www.linkedin.com/in/mahmod-salah/" target="_blank" rel="noopener" aria-label="LinkedIn">${ic("in")}</a><a class="ibtn" href="https://md.mahmodsalah.workers.dev/" target="_blank" rel="noopener" aria-label="Portfolio">${ic("brief")}</a></div>
  <a class="by" href="/by-mahmoud" data-link>${T("By Mahmoud", "By Mahmoud")} ${ic("arrow", "sm")}</a><span>© ${new Date().getFullYear()} Mahmoud Salah</span></div></div>`;
}
// global events
document.addEventListener("click", async (e) => {
  const a = e.target.closest("a[data-link]");
  if (a && !e.metaKey && !e.ctrlKey && a.target !== "_blank") { e.preventDefault(); const u = new URL(a.href); const same = u.pathname === location.pathname && u.search === location.search; history.pushState({}, "", u.pathname + u.search + u.hash); if (same && u.hash) { document.getElementById(u.hash.slice(1))?.scrollIntoView({ behavior: "smooth" }); } else { await render(); if (u.hash) setTimeout(() => document.getElementById(u.hash.slice(1))?.scrollIntoView({ behavior: "smooth" }), 50); else window.scrollTo(0, 0); } return; }
  const b = e.target.closest("[data-act]"); if (b) {
    const k = b.dataset.act;
    if (k === "lang") { S.lang = S.lang === "ar" ? "en" : "ar"; localStorage.tb_lang = S.lang; render(); }
    if (k === "theme") { S.theme = S.theme === "dark" ? "light" : "dark"; localStorage.tb_theme = S.theme; render(); }
    if (k === "menu") $("#nav").classList.toggle("open");
  }
  const f = e.target.closest("[data-fav]"); if (f) {
    e.preventDefault(); if (!S.user) return nav("/login?next=" + encodeURIComponent(location.pathname));
    const on = f.classList.toggle("on"); try { await api("/favorites/" + f.dataset.fav, { method: on ? "POST" : "DELETE" }); toast(on ? T("اتحفظ في المفضلة", "Saved") : T("اتشال من المفضلة", "Removed")); } catch (er) { toast(er.message); }
  }
});
window.addEventListener("popstate", render);

const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
export function reveal() {
  const sel = ".spec,.dc,.step,.box,.plan,.byc,.kpi,.cta,.stats>div";
  const run = () => { const els = $$(sel).filter((e) => !e.dataset.rv); if (RM || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((es) => es.forEach((x) => { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }), { rootMargin: "0px 0px -6% 0px" });
    els.forEach((e, i) => { e.dataset.rv = 1; e.classList.add("rv"); e.style.transitionDelay = (i % 6) * 40 + "ms"; io.observe(e); }); };
  run(); new MutationObserver(() => { clearTimeout(reveal.t); reveal.t = setTimeout(run, 80); }).observe($("#app"), { childList: true });
}
export function countUp(el) { if (RM) return; const to = +el.dataset.to; const t0 = performance.now(); const f = (t) => { const p = Math.min(1, (t - t0) / 1200); el.textContent = num(Math.round(to * (1 - Math.pow(1 - p, 3)))) + (el.dataset.suf || ""); if (p < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); }
export const helix = () => `<div class="helix" aria-hidden="true">${Array.from({ length: 18 }, (_, i) => `<div class="hr" style="top:${i * 5.2}%;animation-delay:${-i * 0.22}s"><i class="a" style="animation-delay:${-i * 0.22}s"></i><i class="b" style="animation-delay:${-i * 0.22 - 1.6}s"></i><u style="animation-delay:${-i * 0.22}s"></u></div>`).join("")}</div>`;
