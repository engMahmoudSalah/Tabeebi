import { Hub } from "./hub.js";
export { Hub };

const SITE = "https://tabeebi.mahmodsalah.workers.dev";
const META = {
  "/": ["طبيبي | احجز دكتورك أونلاين في دقيقة", "ابحث عن أفضل الأطباء في مصر حسب التخصص والمنطقة، شوف المواعيد المتاحة واحجز كشف في العيادة أو أونلاين."],
  "/doctors": ["دليل الأطباء | طبيبي", "قارن الأطباء حسب التخصص والسعر والتقييم واحجز موعدك فورا."],
  "/for-doctors": ["للأطباء | اشتراكات طبيبي", "انضم كطبيب: جدول مواعيد ذكي، ملف احترافي، حجوزات أونلاين وباقات اشتراك مرنة."],
  "/plans": ["باقات الأطباء | طبيبي", "قارن باقات الأطباء المجانية والمدفوعة على طبيبي."],
  "/by-mahmoud": ["By Mahmoud | كل مواقع وأنظمة محمود صلاح", "كل المواقع والأنظمة الحية التي بناها Mahmoud Salah."],
  "/faq": ["الأسئلة الشائعة | طبيبي", "إجابات عن الحجز والإلغاء والكشف أونلاين وباقات الأطباء."],
};

export default {
  async fetch(request, env) {
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
      const urls = ["/", "/doctors", "/for-doctors", "/plans", "/faq", "/by-mahmoud", ...slugs.map((s) => "/doctor/" + s)];
      return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((u) => `<url><loc>${SITE}${u}</loc></url>`).join("")}</urlset>`, { headers: { "content-type": "application/xml" } });
    }
    // SPA shell with per-route meta
    const shell = await env.ASSETS.fetch(new Request(url.origin + "/index.html"));
    let html = await shell.text();
    let [title, desc] = META[url.pathname] || ["طبيبي | احجز دكتورك أونلاين", META["/"][1]];
    let noindex = /^\/(admin|account|login|register|book)/.test(url.pathname);
    if (url.pathname.startsWith("/doctor/")) {
      try {
        const id = env.HUB.idFromName("main");
        const r = await env.HUB.get(id).fetch(new Request(SITE + "/api/doctors/" + url.pathname.split("/")[2]));
        if (r.ok) { const d = await r.json(); title = `${d.name_ar} - ${d.specialty_ar} | طبيبي`; desc = `احجز كشف مع ${d.name_ar} (${d.specialty_ar}) في ${d.city}. الكشف ${d.fee} جنيه. التقييم ${d.rating_avg} من ${d.rating_count} تقييم.`; }
      } catch {}
    }
    const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
    const tags = `<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${SITE}${url.pathname}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:type" content="website"><meta property="og:url" content="${SITE}${url.pathname}"><meta name="twitter:card" content="summary">${noindex ? '<meta name="robots" content="noindex">' : ""}`;
    html = html.replace("<!--SEO-->", tags);
    return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-cache" } });
  },
};
