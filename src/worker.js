import { Hub } from "./hub.js";
export { Hub };

const SITE = "https://tabeebi.mahmodsalah.workers.dev";
const META = {
  "/": ["طبيبي (نسخة تجريبية) | Tabeebi demo: doctor booking platform", "نسخة تجريبية من منصة حجز الأطباء: كل الأطباء والمواعيد افتراضية ولا يوجد أطباء أو حجوزات حقيقية. Demo build: all doctors are fictional, no real clinicians or appointments."],
  "/doctors": ["دليل الأطباء | طبيبي", "قارن الأطباء حسب التخصص والسعر والتقييم واحجز موعدك فورا."],
  "/for-doctors": ["للأطباء | اشتراكات طبيبي", "انضم كطبيب: جدول مواعيد ذكي، ملف احترافي، حجوزات أونلاين وباقات اشتراك مرنة."],
  "/plans": ["باقات الأطباء | طبيبي", "قارن باقات الأطباء المجانية والمدفوعة على طبيبي."],
  "/by-mahmoud": ["By Mahmoud — 23 Live Sites & Systems", "كل المواقع والأنظمة الحية التي بناها Mahmoud Salah."],
  "/compare": ["مقارنة الأطباء | طبيبي", "قارن أطباء طبيبي التجريبيين جنب بعض."],
  "/faq": ["الأسئلة الشائعة | طبيبي", "إجابات عن الحجز والإلغاء والكشف أونلاين وباقات الأطباء."],
};

const SEC = {
  "content-security-policy": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
  "x-frame-options": "DENY", "x-content-type-options": "nosniff", "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=()", "strict-transport-security": "max-age=31536000",
};
export default {
  async fetch(request, env) {
    const r = await this.handle(request, env);
    const o = new Response(r.body, r);
    for (const [k, v] of Object.entries(SEC)) o.headers.set(k, v);
    if (new URL(request.url).pathname.startsWith("/api/")) o.headers.set("cache-control", "no-store");
    return o;
  },
  async handle(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      const id = env.HUB.idFromName("main");
      return env.HUB.get(id).fetch(request);
    }
    if (url.pathname === "/robots.txt") return new Response(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /account\nDisallow: /api/\nSitemap: ${SITE}/sitemap.xml\n`, { headers: { "content-type": "text/plain" } });
    if (url.pathname === "/sitemap.xml") {
      const id = env.HUB.idFromName("main");
      const r = await env.HUB.get(id).fetch(new Request(SITE + "/api/slugs"));
      const slugs = await r.json();
      const sp = await (await env.HUB.get(env.HUB.idFromName("main")).fetch(new Request(SITE + "/api/meta"))).json();
      const urls = ["/", ...sp.specialties.map((s) => "/specialty/" + s.id), "/doctors", "/for-doctors", "/plans", "/faq", "/by-mahmoud"];
      return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((u) => `<url><loc>${SITE}${u}</loc></url>`).join("")}</urlset>`, { headers: { "content-type": "application/xml" } });
    }
    // SPA shell with per-route meta
    const shell = await env.ASSETS.fetch(new Request(url.origin + "/index.html"));
    let html = await shell.text();
    let [title, desc] = META[url.pathname] || ["طبيبي (نسخة تجريبية) | Tabeebi demo", META["/"][1]];
    let noindex = /^\/(admin|account|login|register|join|book|compare|doctor\/)/.test(url.pathname);
    let notFound = !META[url.pathname] && !/^\/(admin|account|login|register|join|book|doctor\/|specialty\/)/.test(url.pathname);
    if (url.pathname.startsWith("/doctor/")) {
      try {
        const id = env.HUB.idFromName("main");
        const r = await env.HUB.get(id).fetch(new Request(SITE + "/api/doctors/" + url.pathname.split("/")[2]));
        if (!r.ok) notFound = true;
        if (r.ok) { const d = await r.json(); title = `${d.name_ar} - ${d.specialty_ar} | طبيبي`; desc = `احجز كشف مع ${d.name_ar} (${d.specialty_ar}) في ${d.city}. الكشف ${d.fee} جنيه. التقييم ${d.rating_avg} من ${d.rating_count} تقييم.`; }
      } catch {}
    }
    if (url.pathname.startsWith("/specialty/")) {
      try {
        const m = await (await env.HUB.get(env.HUB.idFromName("main")).fetch(new Request(SITE + "/api/meta"))).json();
        const sp = m.specialties.find((x) => x.id === url.pathname.split("/")[2]);
        if (!sp) notFound = true;
        if (sp) { title = `دكتور ${sp.name_ar} | احجز كشف أونلاين | طبيبي`; desc = `أطباء ${sp.name_ar} في مصر: قارن الأسعار والتقييمات واحجز أقرب ميعاد في العيادة أو بالفيديو.`; }
      } catch {}
    }
    if (notFound) noindex = true;
    const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
    const tags = `<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${SITE}${url.pathname}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:type" content="website"><meta property="og:url" content="${SITE}${url.pathname}"><meta name="twitter:card" content="summary">${noindex ? '<meta name="robots" content="noindex">' : ""}`;
    let ld = "";
    if (url.pathname.startsWith("/specialty/")) {
      const crumbs = [["طبيبي", "/"], ["الأطباء", "/doctors"], [title.split("|")[0].trim(), url.pathname]];
      ld = `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c[0], item: SITE + c[1] })) }).replace(/</g, "\\u003c")}</script>`;
    } else if (url.pathname === "/") {
      ld = `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "WebSite", name: "طبيبي (Tabeebi) demo", url: SITE, description: "Demo doctor booking platform. All doctors are fictional." }).replace(/</g, "\\u003c")}</script>`;
    }
    html = html.replace("<!--SEO-->", tags + ld);
    return new Response(html, { status: notFound ? 404 : 200, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-cache" } });
  },
};
