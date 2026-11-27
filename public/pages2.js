import { S, T, h, $, ic, num, api, route, doctorCard, specName, money, dname, avatar, nextLabel, cmpGet } from "./core.js";
const COND = {
  internal: [["سكر وضغط", "Diabetes & blood pressure"], ["مشاكل الهضم", "Digestive issues"], ["تعب وإرهاق مزمن", "Chronic fatigue"], ["فحص دوري", "Check-ups"]],
  dentistry: [["حشو وعلاج عصب", "Fillings & root canals"], ["تقويم الأسنان", "Braces"], ["تنظيف وتبييض", "Cleaning & whitening"], ["زراعة الأسنان", "Implants"]],
  dermatology: [["حب الشباب", "Acne"], ["تساقط الشعر", "Hair loss"], ["الأكزيما والحساسية", "Eczema & allergies"], ["الليزر والتجميل", "Laser & aesthetics"]],
  obgyn: [["متابعة الحمل", "Pregnancy follow-up"], ["الولادة", "Delivery"], ["تأخر الإنجاب", "Fertility"], ["اضطراب الدورة", "Cycle problems"]],
  pediatrics: [["تطعيمات", "Vaccinations"], ["نزلات البرد", "Colds & flu"], ["تغذية ونمو", "Nutrition & growth"], ["متابعة حديثي الولادة", "Newborn care"]],
  orthopedics: [["آلام الظهر", "Back pain"], ["إصابات الملاعب", "Sports injuries"], ["خشونة الركبة", "Knee arthritis"], ["كسور", "Fractures"]],
  ophthalmology: [["قياس نظر", "Eye exams"], ["مياه بيضاء", "Cataracts"], ["جفاف العين", "Dry eyes"], ["تصحيح النظر", "Vision correction"]],
  ent: [["لوز وجيوب أنفية", "Tonsils & sinuses"], ["مشاكل السمع", "Hearing"], ["دوخة", "Dizziness"], ["حساسية الأنف", "Nasal allergy"]],
  cardiology: [["ضغط وكوليسترول", "Pressure & cholesterol"], ["رسم قلب وإيكو", "ECG & echo"], ["خفقان", "Palpitations"], ["متابعة بعد القسطرة", "Post-cath care"]],
  neurology: [["صداع نصفي", "Migraine"], ["دوخة وإغماء", "Dizziness & fainting"], ["تنميل", "Numbness"], ["اضطرابات النوم", "Sleep disorders"]],
  psychiatry: [["قلق وتوتر", "Anxiety"], ["اكتئاب", "Depression"], ["اضطرابات النوم", "Sleep issues"], ["استشارات أسرية", "Family counseling"]],
  urology: [["حصوات الكلى", "Kidney stones"], ["البروستاتا", "Prostate"], ["التهابات المسالك", "Urinary infections"], ["العقم عند الرجال", "Male fertility"]],
  nutrition: [["إنقاص الوزن", "Weight loss"], ["تغذية السكر", "Diabetic diet"], ["زيادة الوزن الصحية", "Healthy weight gain"], ["تغذية الرياضيين", "Sports nutrition"]],
  physio: [["آلام الرقبة والظهر", "Neck & back pain"], ["تأهيل بعد الكسور", "Fracture rehab"], ["الانزلاق الغضروفي", "Slipped disc"], ["علاج الإصابات", "Injury recovery"]],
};
route(/^\/specialty\/([a-z]+)$/, async (app, m) => {
  const sp = S.meta.specialties.find((x) => x.id === m[1]); if (!sp) throw new Error(T("التخصص غير موجود", "Specialty not found"));
  const d = await api("/doctors?spec=" + m[1]); const nm = specName(m[1]); document.title = T(`دكتور ${nm} | طبيبي`, `${nm} doctors | Tabeebi`);
  const items = d.items, minFee = items.length ? Math.min(...items.map((x) => x.fee)) : 0, best = items.length ? Math.max(...items.map((x) => x.rating_avg)) : 0;
  const conds = COND[m[1]] || [];
  app.innerHTML = `<section class="hero sp-hero"><div class="wrap" style="grid-template-columns:1fr"><div style="max-width:660px"><nav class="crumbs"><a href="/" data-link>${T("الرئيسية", "Home")}</a> / <a href="/doctors" data-link>${T("الأطباء", "Doctors")}</a> / ${h(nm)}</nav><div class="sp-ic">${ic(m[1], "lg")}</div><h1>${T("أطباء", "Sample")} <em>${h(nm)}</em> ${T("(عينة تجريبية)", "doctors (demo)")}</h1><p class="lead">${T(`قارن ${num(items.length)} طبيب ${nm} تجريبي، شوف الأسعار والتقييمات والمواعيد المتاحة، واحجز في دقيقة.`, `Compare ${items.length} sample ${nm.toLowerCase()} doctors, see fees, reviews and open slots, and book in a minute.`)}</p><div class="sp-stats"><div><b>${num(items.length)}</b><span>${T("طبيب", "doctors")}</span></div><div><b>${minFee ? T("من ", "From ") + num(minFee) : "-"}</b><span>${T("ج.م للكشف", "EGP / visit")}</span></div><div><b>${best || "-"}</b><span>${T("أعلى تقييم", "top rating")}</span></div></div></div>
  <div class="sp-art" style="--sh:${(m[1].split("").reduce((a, c) => a + c.charCodeAt(0), 0) * 37) % 360}"><div class="ring"></div><div class="big">${ic(m[1], "lg")}</div><svg viewBox="0 0 300 60" preserveAspectRatio="none"><path d="M0 34h96l10-24 12 44 10-30 8 10h164" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div></section>
  <section class="s"><div class="wrap"><div class="s-head"><div><h2>${T("بتعالج إيه؟", "What they treat")}</h2></div></div><div class="conds">${conds.map((c, i) => `<div class="cond" style="--i:${i}"><span>${i + 1}</span>${T(c[0], c[1])}</div>`).join("")}</div></div></section>
  <section class="s band"><div class="wrap"><div class="s-head"><div><h2>${T("أطباء متاحون", "Available doctors")}</h2></div><a class="link" href="/doctors?spec=${m[1]}" data-link>${T("فلاتر أكتر", "More filters")} ${ic("arrow", "sm")}</a></div><div class="grid">${items.map(doctorCard).join("") || `<p style="color:var(--mute)">${T("مفيش أطباء حاليا.", "No doctors yet.")}</p>`}</div></div></section>
  <section class="s"><div class="wrap"><div class="s-head"><div><h2>${T("تخصصات أخرى", "Other specialties")}</h2></div></div><div class="chips" style="margin:0">${S.meta.specialties.filter((x) => x.id !== m[1]).map((x) => `<a class="chip" href="/specialty/${x.id}" data-link>${h(S.lang === "ar" ? x.name_ar : x.name_en)}</a>`).join("")}</div></div></section>`;
});
// richer profile extras: credentials + clinic gallery, injected after the About box
const CRED = (d) => [[T("بكالوريوس الطب والجراحة (مثال)", "MBBCh (sample)"), T("بيانات تجريبية", "Sample data")], [T(`${specName(d.spec)} · دراسات عليا`, `${specName(d.spec)} postgraduate training`), T("بيانات تجريبية", "Sample data")], [T("عضوية نقابة (مثال)", "Syndicate membership (sample)"), T("غير موثق: تجريبي", "Not verified: demo")], [T(`${num(d.years)} سنة خبرة (مثال)`, `${d.years} years of practice (sample)`), T("بيانات تجريبية", "Sample data")]];
const GAL = [`<rect x="20" y="70" width="160" height="12" rx="4" fill="var(--brand-soft)"/><rect x="34" y="40" width="60" height="30" rx="6" fill="var(--card2)" stroke="var(--brand)"/><circle cx="150" cy="52" r="14" fill="var(--warm-soft)" stroke="var(--warm)"/><path d="M150 46v12M144 52h12" stroke="var(--warm)" stroke-width="2.4"/>`, `<rect x="24" y="56" width="152" height="26" rx="8" fill="var(--card2)" stroke="var(--brand)"/><rect x="40" y="30" width="44" height="26" rx="5" fill="var(--lav-soft)" stroke="var(--lav)"/><path d="M128 56V34h24v22" fill="none" stroke="var(--brand)" stroke-width="2"/>`, `<rect x="30" y="34" width="54" height="48" rx="8" fill="var(--card2)" stroke="var(--brand)"/><path d="M40 70l12-14 10 8 14-18" fill="none" stroke="var(--brand)" stroke-width="2.4"/><rect x="104" y="34" width="66" height="48" rx="8" fill="var(--warm-soft)" stroke="var(--warm)"/><path d="M118 58h38M118 68h24" stroke="var(--warm)" stroke-width="2.4" stroke-linecap="round"/>`];
export const profileExtras = (d) => `<div class="box"><h2>${T("المؤهلات", "Credentials")}</h2><ol class="tl">${CRED(d).map((c) => `<li><b>${c[0]}</b><small>${c[1]}</small></li>`).join("")}</ol></div><div class="box"><h2>${T("العيادة", "The clinic")}</h2><div class="gal">${[T("الاستقبال", "Reception"), T("غرفة الكشف", "Exam room"), T("الأجهزة", "Equipment")].map((t, i) => `<figure><svg viewBox="0 0 200 100" aria-hidden="true">${GAL[i]}</svg><figcaption>${t}</figcaption></figure>`).join("")}</div><p style="color:var(--mute);font-size:12.5px;margin-top:10px">${T("رسوم توضيحية للنسخة التجريبية.", "Illustrations for the demo version.")}</p></div>`;

route(/^\/compare$/, async (app, m, q) => {
  const slugs = (q.get("d") || cmpGet().join(",")).split(",").filter((x) => /^[a-z0-9-]+$/.test(x)).slice(0, 3);
  if (!slugs.length) { app.innerHTML = `<div class="wrap"><div class="empty">${ic("info")}<p>${T("اختار أطباء من الدليل علشان تقارنهم.", "Pick doctors from the directory to compare them.")}</p><a class="btn" style="margin-top:14px" href="/doctors" data-link>${T("دليل الأطباء", "Browse doctors")}</a></div></div>`; return; }
  const ds = (await Promise.all(slugs.map((s) => api("/doctors/" + s).catch(() => null)))).filter(Boolean);
  const yes = (v) => (v ? T("نعم", "Yes") : "-");
  const rows = [
    [T("التخصص", "Specialty"), (d) => h(specName(d.spec))],
    [T("المكان", "Location"), (d) => h(d.area) + "، " + h(d.city)],
    [T("سعر الكشف", "Visit fee"), (d) => money(d.fee)],
    [T("سعر الإعادة", "Follow-up fee"), (d) => money(d.fee_followup)],
    [T("التقييم", "Rating"), (d) => `${num(d.rating_avg)} (${num(d.rating_count)})`],
    [T("سنين الخبرة", "Experience"), (d) => T(num(d.years) + " سنة", d.years + " years")],
    [T("وقت الانتظار", "Waiting time"), (d) => T(num(d.waiting) + " د", d.waiting + " min")],
    [T("كشف أونلاين", "Video visit"), (d) => (d.online ? money(d.online_fee) : "-")],
    [T("زيارة منزلية", "Home visit"), (d) => (d.home_fee ? money(d.home_fee) : "-")],
  ];
  app.innerHTML = `<div class="wrap"><div class="page-h"><h1>${T("مقارنة الأطباء", "Compare doctors")}</h1></div>
  <div class="box scroll"><table class="tbl cmp-t"><tr><th></th>${ds.map((d) => `<th><a href="/doctor/${d.slug}" data-link style="display:flex;gap:10px;align-items:center">${avatar(d)}<span>${h(dname(d))}</span></a></th>`).join("")}</tr>
  ${rows.map(([l, f]) => `<tr><td style="color:var(--mute)">${l}</td>${ds.map((d) => `<td>${f(d)}</td>`).join("")}</tr>`).join("")}
  <tr><td></td>${ds.map((d) => `<td><a class="btn sm" href="/doctor/${d.slug}#book" data-link>${T("احجز", "Book")}</a></td>`).join("")}</tr></table></div>
  <p style="color:var(--mute);margin-top:14px;font-size:14px">${T("نسخة تجريبية: كل الأطباء والأسعار نماذج افتراضية.", "Demo build: all doctors and prices are fictional samples.")}</p></div>`;
});
