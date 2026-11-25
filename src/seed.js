export const SPECIALTIES = [
  ["internal", "باطنة", "Internal medicine"], ["dentistry", "أسنان", "Dentistry"], ["dermatology", "جلدية", "Dermatology"],
  ["obgyn", "نساء وتوليد", "Obstetrics & gynecology"], ["pediatrics", "أطفال", "Pediatrics"], ["orthopedics", "عظام", "Orthopedics"],
  ["ophthalmology", "عيون", "Ophthalmology"], ["ent", "أنف وأذن وحنجرة", "ENT"], ["cardiology", "قلب وأوعية دموية", "Cardiology"],
  ["neurology", "مخ وأعصاب", "Neurology"], ["psychiatry", "نفسي", "Psychiatry"], ["urology", "مسالك بولية", "Urology"],
  ["nutrition", "تغذية علاجية", "Clinical nutrition"], ["physio", "علاج طبيعي", "Physiotherapy"],
];
export const PLANS = [
  { id: "free", name_ar: "أساسية", name_en: "Basic", price: 0, cap: 30, boost: 0, online: 0, analytics: 0, featured: 0,
    features: ["ملف شخصي على الدليل", "حتى 30 حجز في الشهر", "جدول مواعيد وتقويم", "رد على التقييمات"] },
  { id: "plus", name_ar: "بلس", name_en: "Plus", price: 299, cap: 0, boost: 1, online: 0, analytics: 1, featured: 0,
    features: ["حجوزات بلا حد", "أولوية في نتائج البحث", "شارة طبيب موثق", "تقارير الأداء والإيرادات", "قائمة المرضى"] },
  { id: "premium", name_ar: "بريميوم", name_en: "Premium", price: 599, cap: 0, boost: 2, online: 1, analytics: 1, featured: 1,
    features: ["كل مزايا بلس", "ظهور مميز في الصفحة الرئيسية", "كشف أونلاين بالفيديو", "أعلى أولوية في البحث", "دعم مخصص"] },
];
export const CITIES = {
  "القاهرة": ["مدينة نصر", "المعادي", "التجمع الخامس", "مصر الجديدة", "الزمالك", "الشروق"],
  "الجيزة": ["الدقي", "المهندسين", "6 أكتوبر", "الشيخ زايد", "فيصل"],
  "الإسكندرية": ["سموحة", "سيدي جابر", "ميامي", "العجمي"],
  "المنصورة": ["حي الجامعة", "توريل"],
  "طنطا": ["السكة الجديدة", "شارع البحر"],
};
const MALE = ["أحمد", "محمد", "محمود", "مصطفى", "عمر", "كريم", "طارق", "هشام", "ياسر", "خالد", "أيمن", "وائل", "شريف", "حسام", "عادل"];
const FEMALE = ["سارة", "منى", "نهى", "ياسمين", "دينا", "هبة", "رانيا", "مي", "نورهان", "إيمان", "هدى", "ريم"];
const LAST = ["عبد الرحمن", "السيد", "فاروق", "الشناوي", "منصور", "حجازي", "رمضان", "النجار", "البنا", "عزمي", "سالم", "الجمل", "زكريا", "لطفي", "الخطيب", "غانم"];
const EN_M = ["Ahmed", "Mohamed", "Mahmoud", "Mostafa", "Omar", "Karim", "Tarek", "Hisham", "Yasser", "Khaled", "Ayman", "Wael", "Sherif", "Hossam", "Adel"];
const EN_F = ["Sara", "Mona", "Noha", "Yasmin", "Dina", "Heba", "Rania", "Mai", "Nourhan", "Eman", "Hoda", "Reem"];
const EN_L = ["Abdelrahman", "El-Sayed", "Farouk", "El-Shennawy", "Mansour", "Hegazy", "Ramadan", "El-Naggar", "El-Banna", "Azmy", "Salem", "El-Gammal", "Zakaria", "Lotfy", "El-Khatib", "Ghanem"];
const FEES = { internal: [250, 450], dentistry: [200, 500], dermatology: [300, 600], obgyn: [300, 600], pediatrics: [250, 450], orthopedics: [300, 550], ophthalmology: [250, 500], ent: [250, 450], cardiology: [350, 700], neurology: [350, 650], psychiatry: [400, 800], urology: [300, 550], nutrition: [200, 400], physio: [200, 350] };
const TITLES = { internal: "استشاري الباطنة والسكر", dentistry: "أخصائي طب وتجميل الأسنان", dermatology: "استشاري الأمراض الجلدية والليزر", obgyn: "استشاري النساء والتوليد", pediatrics: "استشاري طب الأطفال وحديثي الولادة", orthopedics: "استشاري جراحة العظام والمفاصل", ophthalmology: "استشاري طب وجراحة العيون", ent: "استشاري الأنف والأذن والحنجرة", cardiology: "استشاري أمراض القلب والقسطرة", neurology: "استشاري المخ والأعصاب", psychiatry: "استشاري الطب النفسي", urology: "استشاري المسالك البولية", nutrition: "أخصائي التغذية العلاجية", physio: "أخصائي العلاج الطبيعي والتأهيل" };
const SERVICES = { internal: ["كشف وتشخيص", "متابعة السكر والضغط", "فحص شامل", "استشارة أونلاين"], dentistry: ["حشو وعلاج عصب", "تبييض الأسنان", "تقويم", "زراعة"], dermatology: ["علاج حب الشباب", "ليزر وإزالة شعر", "علاج التصبغات", "حقن بوتوكس"], obgyn: ["متابعة حمل", "سونار", "علاج تأخر الإنجاب", "كشف دوري"], pediatrics: ["تطعيمات", "متابعة نمو", "حساسية وصدر", "استشارة أونلاين"], orthopedics: ["آلام المفاصل", "إصابات الملاعب", "هشاشة العظام", "علاج الغضروف"], ophthalmology: ["قياس نظر", "علاج المياه البيضاء", "تصحيح إبصار", "قاع العين"], ent: ["علاج الجيوب", "اللوزتين", "سماعات", "ضعف السمع"], cardiology: ["رسم قلب وإيكو", "متابعة الضغط", "قسطرة تشخيصية", "فحص رياضي"], neurology: ["صداع نصفي", "رسم مخ", "علاج الصرع", "آلام الأعصاب"], psychiatry: ["علاج القلق", "علاج الاكتئاب", "جلسات سلوكي", "استشارة أونلاين"], urology: ["علاج الحصوات", "البروستاتا", "تحاليل", "جراحات اليوم الواحد"], nutrition: ["نظام إنقاص وزن", "تغذية الأطفال", "تغذية رياضية", "متابعة أسبوعية"], physio: ["علاج آلام الظهر", "تأهيل بعد الكسور", "علاج الرقبة", "جلسات منزلية"] };

function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function makeDoctors() {
  const r = rng(20261125);
  const out = [];
  const cityKeys = Object.keys(CITIES);
  const perSpec = { internal: 3, dentistry: 3, dermatology: 3, obgyn: 3, pediatrics: 3, orthopedics: 2, ophthalmology: 2, ent: 2, cardiology: 2, neurology: 2, psychiatry: 2, urology: 2, nutrition: 2, physio: 2 };
  let n = 0;
  for (const [spec, count] of Object.entries(perSpec)) {
    for (let i = 0; i < count; i++) {
      const female = spec === "obgyn" ? r() < 0.9 : r() < 0.42;
      const fi = Math.floor(r() * (female ? FEMALE.length : MALE.length));
      const li = Math.floor(r() * LAST.length);
      const first = (female ? FEMALE : MALE)[fi], last = LAST[li];
      const firstEn = (female ? EN_F : EN_M)[fi], lastEn = EN_L[li];
      const city = i === 0 && n % 2 === 0 ? "القاهرة" : r() < 0.5 ? "القاهرة" : pick(r, cityKeys);
      const area = pick(r, CITIES[city]);
      const [lo, hi] = FEES[spec];
      const fee = Math.round((lo + r() * (hi - lo)) / 50) * 50;
      const years = 5 + Math.floor(r() * 24);
      const planRoll = r();
      const plan = planRoll < 0.5 ? "free" : planRoll < 0.8 ? "plus" : "premium";
      const name_en = `Dr. ${firstEn} ${lastEn}`;
      out.push({
        slug: slugify(`${firstEn}-${lastEn}-${spec}`), name_ar: `د. ${first} ${last}`, name_en, spec, female, city, area,
        address: `${Math.floor(1 + r() * 60)} شارع ${pick(r, ["التحرير", "النصر", "الجامعة", "البحر", "الهرم", "الثورة", "الحرية", "جامعة الدول"])}، ${area}، ${city}`,
        fee, fee_followup: Math.round(fee * 0.5 / 50) * 50, online_fee: Math.max(150, Math.round(fee * 0.7 / 50) * 50),
        years, title_ar: TITLES[spec], hue: Math.floor(r() * 360), plan,
        base_avg: Math.round((4.1 + r() * 0.85) * 10) / 10, base_n: 18 + Math.floor(r() * 420),
        waiting: 10 + Math.floor(r() * 35), services: SERVICES[spec], langs: r() < 0.5 ? ["العربية", "English"] : ["العربية"],
        bio_ar: `${TITLES[spec]} بخبرة ${years} سنة. يهتم بالتشخيص الدقيق وشرح الحالة للمريض بوضوح، مع خطة متابعة مكتوبة بعد كل كشف. الحاصل على الدكتوراه والزمالة في التخصص، وعضو في الجمعيات الطبية المتخصصة.`,
        bio_en: `${years} years of experience in ${spec}. Focuses on accurate diagnosis, clear explanation and a written follow-up plan after every visit.`,
        sched: (() => {
          const style = Math.floor(r() * 3);
          const days = style === 0 ? [0, 1, 2, 3, 4] : style === 1 ? [6, 0, 2, 4] : [6, 1, 3, 5];
          const starts = style === 2 ? ["10:00", "13:00"] : ["16:00", "18:30"];
          return days.map((d) => ({ dow: d, start: starts[0], end: starts[1] === "13:00" ? "14:00" : "21:00", slot: spec === "psychiatry" ? 45 : 20 }));
        })(),
      });
      n++;
    }
  }
  return out;
}
export const REVIEW_TEXTS = [
  ["ممتاز جدا", "دكتور محترم وشرح لي حالتي بالتفصيل. الكشف كان في معاده بالظبط."],
  ["تجربة مريحة", "العيادة نضيفة والسكرتارية متعاونة. الدكتور مهتم فعلا."],
  ["أنصح به", "تشخيص دقيق وخطة علاج واضحة. هرجع له تاني بإذن الله."],
  ["جيد", "الكشف كويس بس استنيت حوالي 20 دقيقة."],
  ["رائع", "أحسن دكتور جربته، صبور ومبسط الكلام."],
  ["خدمة محترمة", "الحجز أونلاين وفر عليا وقت كتير. شكرا."],
];
export const REVIEW_NAMES = ["أحمد س.", "منى ع.", "كريم ح.", "هدى م.", "ياسر ف.", "نورا ط.", "عمر ز.", "سلمى ك."];
