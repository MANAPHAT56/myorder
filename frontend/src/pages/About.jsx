import { useState, useEffect, useRef } from "react";

// ============================================================
// ABOUT PAGE — ใช้ styles และ Navbar เดียวกับ App หลัก
// Props: user, onNavigate, darkMode, toggleDark
// ============================================================

const aboutStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700;800&family=Mitr:wght@300;400;500;600&display=swap');

  /* ===== ABOUT PAGE SPECIFIC ===== */

  .about-page {
    min-height: calc(100vh - 60px);
    overflow-x: hidden;
  }

  /* ---- Hero ---- */
  .about-hero {
    position: relative;
    padding: 80px 24px 96px;
    text-align: center;
    overflow: hidden;
  }

  /* mesh gradient background */
  .about-hero-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background:
      radial-gradient(ellipse 60% 50% at 20% 30%, rgba(232,93,38,0.10) 0%, transparent 70%),
      radial-gradient(ellipse 50% 60% at 80% 70%, rgba(37,99,235,0.07) 0%, transparent 65%),
      radial-gradient(ellipse 40% 40% at 55% 10%, rgba(26,158,94,0.06) 0%, transparent 60%);
  }
  [data-theme="dark"] .about-hero-bg {
    background:
      radial-gradient(ellipse 60% 50% at 20% 30%, rgba(249,115,22,0.13) 0%, transparent 70%),
      radial-gradient(ellipse 50% 60% at 80% 70%, rgba(96,165,250,0.09) 0%, transparent 65%),
      radial-gradient(ellipse 40% 40% at 55% 10%, rgba(34,197,94,0.07) 0%, transparent 60%);
  }

  /* noise overlay */
  .about-hero-bg::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
    opacity: 0.4;
  }

  .about-hero-inner {
    position: relative;
    z-index: 1;
    max-width: 720px;
    margin: 0 auto;
  }

  .about-badge {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 6px 16px;
    border-radius: 100px;
    font-size: 12.5px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    background: var(--accent-light);
    color: var(--accent);
    border: 1.5px solid rgba(232,93,38,0.25);
    margin-bottom: 28px;
    opacity: 0;
    animation: aboutFadeUp 0.6s 0.1s ease forwards;
  }

  .about-hero-title {
    font-family: var(--display);
    font-size: clamp(32px, 6vw, 56px);
    font-weight: 600;
    line-height: 1.15;
    letter-spacing: -0.03em;
    margin-bottom: 20px;
    color: var(--text);
    opacity: 0;
    animation: aboutFadeUp 0.6s 0.2s ease forwards;
  }

  .about-hero-title em {
    font-style: normal;
    color: var(--accent);
    position: relative;
    display: inline-block;
  }

  /* underline decoration on accent word */
  .about-hero-title em::after {
    content: '';
    position: absolute;
    left: 0; right: 0; bottom: -4px;
    height: 3px;
    border-radius: 100px;
    background: var(--accent);
    opacity: 0.35;
    transform: scaleX(0);
    transform-origin: left;
    animation: lineReveal 0.5s 0.85s ease forwards;
  }
  @keyframes lineReveal { to { transform: scaleX(1); } }

  .about-hero-sub {
    font-size: 16px;
    color: var(--text2);
    line-height: 1.75;
    max-width: 520px;
    margin: 0 auto 36px;
    opacity: 0;
    animation: aboutFadeUp 0.6s 0.3s ease forwards;
  }

  .about-hero-cta {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
    opacity: 0;
    animation: aboutFadeUp 0.6s 0.4s ease forwards;
  }

  /* ---- Scroll reveal ---- */
  .reveal {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  .reveal.visible {
    opacity: 1;
    transform: translateY(0);
  }
  .reveal-d1 { transition-delay: 0.05s; }
  .reveal-d2 { transition-delay: 0.12s; }
  .reveal-d3 { transition-delay: 0.19s; }
  .reveal-d4 { transition-delay: 0.26s; }
  .reveal-d5 { transition-delay: 0.33s; }

  /* ---- Divider ---- */
  .about-divider {
    width: 48px;
    height: 3px;
    border-radius: 100px;
    background: var(--accent);
    margin: 0 auto 20px;
    opacity: 0.6;
  }

  /* ---- Stats strip ---- */
  .stats-strip {
    background: var(--surface);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    padding: 36px 24px;
    overflow: hidden;
  }
  .stats-inner {
    max-width: 1000px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0;
  }
  .stat-item {
    text-align: center;
    padding: 8px 24px;
    border-right: 1px solid var(--border);
  }
  .stat-item:last-child { border-right: none; }
  .stat-val {
    font-family: var(--display);
    font-size: 36px;
    font-weight: 600;
    color: var(--text);
    letter-spacing: -0.03em;
    line-height: 1;
    margin-bottom: 6px;
  }
  .stat-val span { color: var(--accent); }
  .stat-lbl {
    font-size: 12px;
    font-weight: 700;
    color: var(--text3);
    text-transform: uppercase;
    letter-spacing: 0.07em;
  }

  /* ---- Feature cards ---- */
  .features-section {
    padding: 72px 24px;
    max-width: 1100px;
    margin: 0 auto;
  }
  .section-eyebrow {
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 12px;
    display: block;
  }
  .section-heading {
    font-family: var(--display);
    font-size: clamp(22px, 4vw, 32px);
    font-weight: 600;
    color: var(--text);
    letter-spacing: -0.025em;
    margin-bottom: 48px;
    line-height: 1.3;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }

  .feature-card {
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: 20px;
    padding: 28px 26px;
    position: relative;
    overflow: hidden;
    transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
    cursor: default;
  }
  .feature-card::before {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 0.3s ease;
    border-radius: inherit;
  }
  .feature-card:hover {
    transform: translateY(-4px);
    border-color: var(--accent);
    box-shadow: 0 8px 32px var(--accent-glow), 0 2px 8px rgba(0,0,0,0.06);
  }
  .feature-card:hover::before { opacity: 1; }

  .feature-icon {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    margin-bottom: 18px;
    background: var(--surface2);
    border: 1.5px solid var(--border);
    transition: transform 0.25s ease;
    position: relative;
  }
  .feature-card:hover .feature-icon {
    transform: scale(1.1) rotate(-4deg);
    background: var(--accent-light);
    border-color: rgba(232,93,38,0.3);
  }
  .feature-title {
    font-family: var(--display);
    font-size: 16px;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 10px;
  }
  .feature-text {
    font-size: 14px;
    color: var(--text2);
    line-height: 1.7;
  }
  .feature-tag {
    display: inline-block;
    margin-top: 16px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--accent);
    background: var(--accent-light);
    padding: 3px 10px;
    border-radius: 100px;
    border: 1px solid rgba(232,93,38,0.2);
  }

  /* ---- Tier showcase ---- */
  .tiers-section {
    padding: 72px 24px;
    background: var(--surface2);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }
  .tiers-inner {
    max-width: 900px;
    margin: 0 auto;
  }
  .tiers-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-top: 48px;
  }
  .tier-showcase {
    border-radius: 20px;
    padding: 28px 24px;
    border: 1.5px solid;
    position: relative;
    overflow: hidden;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }
  .tier-showcase:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
  }
  .ts-1 {
    background: var(--surface);
    border-color: var(--border2);
  }
  .ts-2 {
    background: linear-gradient(135deg, #eff6ff 0%, #e0f0ff 100%);
    border-color: #bfdbfe;
  }
  .ts-3 {
    background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
    border-color: #fcd34d;
  }
  [data-theme="dark"] .ts-2 {
    background: linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(59,130,246,0.05) 100%);
    border-color: rgba(37,99,235,0.25);
  }
  [data-theme="dark"] .ts-3 {
    background: linear-gradient(135deg, rgba(180,83,9,0.1) 0%, rgba(217,119,6,0.06) 100%);
    border-color: rgba(217,119,6,0.3);
  }
  .ts-emoji {
    font-size: 36px;
    margin-bottom: 14px;
    display: block;
    filter: drop-shadow(0 2px 8px rgba(0,0,0,0.12));
    transition: transform 0.3s ease;
  }
  .tier-showcase:hover .ts-emoji {
    transform: scale(1.15) rotate(-5deg);
  }
  .ts-level {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text3);
    margin-bottom: 6px;
  }
  .ts-name {
    font-family: var(--display);
    font-size: 18px;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 10px;
  }
  .ts-desc {
    font-size: 13px;
    color: var(--text2);
    line-height: 1.65;
  }
  .ts-check {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 16px;
  }
  .ts-check-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--text2);
  }
  .ts-check-item span:first-child {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--green-light);
    color: var(--green);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    flex-shrink: 0;
    font-weight: 700;
  }

  /* ---- Mission banner ---- */
  .mission-section {
    padding: 80px 24px;
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
  }
  .mission-quote {
    font-family: var(--display);
    font-size: clamp(18px, 3vw, 24px);
    font-weight: 500;
    color: var(--text);
    line-height: 1.7;
    letter-spacing: -0.01em;
    margin-bottom: 24px;
    position: relative;
    padding: 0 40px;
  }
  .mission-quote::before,
  .mission-quote::after {
    content: '"';
    position: absolute;
    font-size: 80px;
    font-family: var(--display);
    line-height: 1;
    color: var(--accent);
    opacity: 0.15;
    top: -10px;
  }
  .mission-quote::before { left: 0; }
  .mission-quote::after { right: 0; top: auto; bottom: -30px; }

  .mission-author {
    font-size: 13px;
    font-weight: 700;
    color: var(--text3);
    letter-spacing: 0.07em;
    text-transform: uppercase;
    margin-top: 32px;
  }

  /* ---- CTA bottom ---- */
  .cta-section {
    padding: 64px 24px 80px;
    background: var(--surface);
    border-top: 1px solid var(--border);
    text-align: center;
  }
  .cta-inner {
    max-width: 560px;
    margin: 0 auto;
  }
  .cta-title {
    font-family: var(--display);
    font-size: clamp(20px, 3.5vw, 28px);
    font-weight: 600;
    color: var(--text);
    letter-spacing: -0.02em;
    margin-bottom: 12px;
  }
  .cta-sub {
    font-size: 14px;
    color: var(--text2);
    line-height: 1.7;
    margin-bottom: 28px;
  }
  .cta-btns {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }

  /* ---- floating orbs decoration ---- */
  .orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    pointer-events: none;
    opacity: 0;
    animation: orbFloat 8s ease-in-out infinite, aboutFadeIn 1s 0.5s ease forwards;
  }
  .orb-1 {
    width: 280px; height: 280px;
    background: radial-gradient(circle, rgba(232,93,38,0.14), transparent 70%);
    top: -60px; right: 5%;
    animation-delay: 0.5s;
  }
  .orb-2 {
    width: 200px; height: 200px;
    background: radial-gradient(circle, rgba(37,99,235,0.10), transparent 70%);
    bottom: -40px; left: 8%;
    animation-delay: 0.5s, 3s;
  }
  @keyframes orbFloat {
    0%, 100% { transform: translateY(0px) scale(1); }
    33% { transform: translateY(-18px) scale(1.04); }
    66% { transform: translateY(10px) scale(0.97); }
  }

  /* ---- animations ---- */
  @keyframes aboutFadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes aboutFadeIn {
    to { opacity: 1; }
  }

  /* ---- counter animation ---- */
  .count-anim { display: inline-block; }

  /* ---- responsive ---- */
  @media (max-width: 768px) {
    .features-grid { grid-template-columns: 1fr; gap: 14px; }
    .tiers-grid    { grid-template-columns: 1fr; gap: 14px; }
    .stats-inner   { grid-template-columns: repeat(2, 1fr); }
    .stat-item:nth-child(2) { border-right: none; }
    .stat-item:nth-child(3) { border-top: 1px solid var(--border); }
    .stat-item:nth-child(4) { border-top: 1px solid var(--border); border-right: none; }
    .about-hero { padding: 52px 20px 64px; }
    .features-section, .mission-section { padding: 52px 20px; }
    .tiers-section { padding: 52px 20px; }
    .mission-quote { padding: 0 28px; font-size: 17px; }
  }
  @media (max-width: 480px) {
    .stats-inner { grid-template-columns: repeat(2, 1fr); }
    .about-hero-cta { flex-direction: column; align-items: center; }
  }
`;

// ---- Animated counter hook ----
function useCountUp(target, duration = 1600, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return val;
}

// ---- Stat item with counter ----
function StatItem({ value, suffix, label, delay, started }) {
  const num = useCountUp(value, 1600, started);
  return (
    <div className="stat-item reveal" style={{ transitionDelay: `${delay}s` }}>
      <div className="stat-val">
        <span className="count-anim">{num.toLocaleString()}</span>
        <span>{suffix}</span>
      </div>
      <div className="stat-lbl">{label}</div>
    </div>
  );
}

// ---- Scroll reveal hook ----
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    el.querySelectorAll(".reveal").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
  return ref;
}

// ---- About Page ----
export default function AboutPage({ user, onNavigate, darkMode, toggleDark }) {
  const [statsStarted, setStatsStarted] = useState(false);
  const statsRef = useRef(null);
  const featRef = useReveal();
  const tierRef = useReveal();
  const missionRef = useReveal();
  const ctaRef = useReveal();

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) { setStatsStarted(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const features = [
    {
      icon: "🔒",
      title: "ระบบตรวจสอบแน่หนา",
      text: "ข้อมูลทุกร้านค้าถูกคัดกรองและยืนยันโดยทีมงาน myOrder ก่อนที่จะปรากฏในระบบ",
      tag: "Verified System",
    },
    {
      icon: "⚡",
      title: "อัปเดตเรียลไทม์",
      text: "สถานะ Blacklist และการยืนยันตัวตนอัปเดตทันทีหลังจากทีมงานตรวจสอบ ไม่มีความล่าช้า",
      tag: "Real-time",
    },
    {
      icon: "🛡️",
      title: "ปกป้องผู้บริโภค",
      text: "ระบบรายงานและเคลมช่วยให้ลูกค้าสามารถแจ้งปัญหาและได้รับการดูแลอย่างรวดเร็ว",
      tag: "Consumer First",
    },
    {
      icon: "📋",
      title: "เอกสารยืนยันตัวตน",
      text: "กระบวนการยื่นเอกสารที่ชัดเจน ปลอดภัย และโปร่งใส สำหรับทั้งบุคคลธรรมดาและนิติบุคคล",
      tag: "KYC Process",
    },
    {
      icon: "🤝",
      title: "ชุมชนที่เชื่อถือได้",
      text: "เครือข่ายร้านค้าที่ผ่านการคัดกรอง สร้างความไว้วางใจระหว่างผู้ซื้อและผู้ขายในระยะยาว",
      tag: "Trusted Community",
    },
    {
      icon: "📊",
      title: "ติดตามสถานะง่าย",
      text: "ดูประวัติการขอเลื่อนขั้น สถานะเอกสาร และคะแนนร้านค้าได้ทุกที่ทุกเวลา",
      tag: "Transparency",
    },
  ];

  const tiers = [
    {
      emoji: "⚪",
      cls: "ts-1",
      level: "ขั้นที่ 1",
      name: "ร้านค้าทั่วไป",
      desc: "ลงทะเบียนร้านค้าเข้าสู่ระบบ myOrder เพื่อให้ลูกค้าค้นหาพบ",
      checks: ["ลงทะเบียนกับ myOrder", "ปรากฏในระบบค้นหา", "รับรีวิวจากลูกค้า"],
    },
    {
      emoji: "🔵",
      cls: "ts-2",
      level: "ขั้นที่ 2",
      name: "ยืนยันตัวตนแล้ว",
      desc: "ยืนยันด้วยบัตรประชาชนหรือเอกสารนิติบุคคล เพิ่มความน่าเชื่อถือ",
      checks: ["ยืนยันด้วยเอกสารจริง", "แสดง Badge ยืนยัน", "ลูกค้าไว้วางใจมากขึ้น"],
    },
    {
      emoji: "🥇",
      cls: "ts-3",
      level: "ขั้นที่ 3",
      name: "ระดับสูงสุด",
      desc: "ผ่านการทดสอบสั่งซื้อจริงจากทีมงาน myOrder รับประกันคุณภาพสูงสุด",
      checks: ["ทดสอบโดยทีมงาน myOrder", "Badge สีทองพิเศษ", "ความน่าเชื่อถือสูงสุด"],
    },
  ];

  return (
    <>
      <style>{aboutStyles}</style>
      <div className="about-page">

        {/* ── Hero ── */}
        <section className="about-hero">
          <div className="about-hero-bg" />
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="about-hero-inner">
            <div className="about-badge">🛡️ &nbsp;myOrder Trust System</div>
            <h1 className="about-hero-title">
              ระบบตรวจสอบร้านค้า<br />ที่คุณ<em>ไว้วางใจ</em>ได้
            </h1>
            <p className="about-hero-sub">
              myOrder สร้างมาตรฐานใหม่ให้กับการซื้อขายออนไลน์ในไทย
              ด้วยระบบ Blacklist Database และการยืนยันตัวตนแบบ 3 ระดับ
              เพื่อปกป้องทั้งผู้ซื้อและผู้ขายจากการฉ้อโกง
            </p>
            <div className="about-hero-cta">
              <button className="btn btn-primary btn-lg" onClick={() => onNavigate("shop-list")}>
                🔍 ค้นหาร้านค้า
              </button>
              <button className="btn btn-outline btn-lg" onClick={() => onNavigate("home")}>
                🏠 หน้าหลัก
              </button>
            </div>
          </div>
        </section>

        {/* ── Stats strip ── */}
        <div className="stats-strip" ref={statsRef}>
          <div className="stats-inner">
            <StatItem value={2400} suffix="+" label="ร้านค้าในระบบ"   delay={0.05} started={statsStarted} />
            <StatItem value={98}   suffix="%"  label="ความพึงพอใจ"    delay={0.12} started={statsStarted} />
            <StatItem value={156}  suffix="+"  label="แบนเนดถูกตรวจพบ" delay={0.19} started={statsStarted} />
            <StatItem value={3}    suffix=" ขั้น" label="ระดับยืนยัน"  delay={0.26} started={statsStarted} />
          </div>
        </div>

        {/* ── Features ── */}
        <section className="features-section" ref={featRef}>
          <span className="section-eyebrow reveal">ทำไมต้อง myOrder</span>
          <h2 className="section-heading reveal reveal-d1">
            ทุกฟีเจอร์ออกแบบมา<br />เพื่อความปลอดภัยของคุณ
          </h2>
          <div className="features-grid">
            {features.map((f, i) => (
              <div className={`feature-card reveal reveal-d${(i % 3) + 2}`} key={f.title}>
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-text">{f.text}</div>
                <span className="feature-tag">{f.tag}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Tiers ── */}
        <section className="tiers-section" ref={tierRef}>
          <div className="tiers-inner">
            <div style={{ textAlign: "center" }}>
              <span className="section-eyebrow reveal" style={{ display: "block" }}>ระดับความน่าเชื่อถือ</span>
              <h2 className="section-heading reveal reveal-d1" style={{ marginBottom: 0 }}>
                3 ระดับ การยืนยันตัวตน
              </h2>
            </div>
            <div className="tiers-grid">
              {tiers.map((t, i) => (
                <div className={`tier-showcase ${t.cls} reveal reveal-d${i + 2}`} key={t.name}>
                  <span className="ts-emoji">{t.emoji}</span>
                  <div className="ts-level">{t.level}</div>
                  <div className="ts-name">{t.name}</div>
                  <div className="ts-desc">{t.desc}</div>
                  <div className="ts-check">
                    {t.checks.map(c => (
                      <div className="ts-check-item" key={c}>
                        <span>✓</span>
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Mission ── */}
        <section className="mission-section" ref={missionRef}>
          <div className="about-divider reveal" />
          <blockquote className="mission-quote reveal reveal-d1">
            บริษัท myOrder สร้างระบบนี้ขึ้นมาเพื่อเป็นศูนย์กลางในการตรวจสอบประวัติผู้ซื้อและผู้ขาย
            ลดความเสี่ยงในการทำธุรกิจออนไลน์ และส่งเสริมให้เกิดการแข่งขันที่ยุติธรรม
            เราเชื่อว่าความโปร่งใสคือรากฐานสำคัญของการเติบโตอย่างยั่งยืน
          </blockquote>
          <div className="mission-author reveal reveal-d2">— ทีมงาน myOrder</div>
        </section>

        {/* ── CTA ── */}
        <section className="cta-section" ref={ctaRef}>
          <div className="cta-inner">
            <h2 className="cta-title reveal">พบปัญหา หรืออยากร่วมมือกับเรา?</h2>
            <p className="cta-sub reveal reveal-d1">
              ไม่ว่าจะเป็นการรายงานร้านค้า ลงทะเบียนร้านใหม่ หรือต้องการความช่วยเหลือ
              ทีมงาน myOrder พร้อมดูแลคุณตลอดเวลา
            </p>
            <div className="cta-btns reveal reveal-d2">
              <a
                href="https://line.me/myorder"
                className="btn btn-primary btn-lg"
                target="_blank"
                rel="noreferrer"
              >
                💬 ติดต่อทีมงาน
              </a>
              <button className="btn btn-outline btn-lg" onClick={() => onNavigate("shop-list")}>
                🏪 ดูรายการร้านค้า
              </button>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}