import { useState, useEffect, useRef } from "react";

// ============================================================
// API CONFIG — เปลี่ยน BASE_URL เป็น PHP server
// ============================================================
const API_BASE = "https://your-php-server.com/api";

const api = {
  // Auth
  loginGoogle: (token) => fetch(`${API_BASE}/auth/google`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) }).then(r => r.json()),
  getProfile: () => fetch(`${API_BASE}/user/profile`, { headers: authHeaders() }).then(r => r.json()),

  // Shops
  searchShops: (q, page = 1) => fetch(`${API_BASE}/shops?q=${encodeURIComponent(q)}&page=${page}`).then(r => r.json()),
  getFeaturedShops: () => fetch(`${API_BASE}/shops/featured`).then(r => r.json()),
  getShopDetail: (id) => fetch(`${API_BASE}/shops/${id}`).then(r => r.json()),
  reportShop: (id, data) => fetch(`${API_BASE}/shops/${id}/report`, { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify(data) }).then(r => r.json()),

  // My Shop
  getMyShop: () => fetch(`${API_BASE}/my-shop`, { headers: authHeaders() }).then(r => r.json()),
  updateMyShop: (data) => fetch(`${API_BASE}/my-shop`, { method: "PATCH", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify(data) }).then(r => r.json()),

  // Upgrade
  checkUpgradeEligibility: (tier) => fetch(`${API_BASE}/my-shop/upgrade/check?tier=${tier}`, { headers: authHeaders() }).then(r => r.json()),
  submitUpgrade: (formData) => fetch(`${API_BASE}/my-shop/upgrade`, { method: "POST", headers: authHeaders(), body: formData }).then(r => r.json()),
};

const authHeaders = () => {
  const t = localStorage.getItem("user_token");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

// ============================================================
// MOCK DATA
// ============================================================
const MOCK_USER = { id: "USR0042", name: "ปิยะ ใจดี", email: "piya@gmail.com", avatar: null };

const MOCK_SHOPS = [
  { id: 1, name: "ร้านข้าวมันไก่สมชาย", category: "อาหาร", tier: 3, link: "https://line.me/shop1", description: "ข้าวมันไก่ต้มและทอด สูตรโบราณ รสชาติเข้มข้น เปิดมากว่า 20 ปี", rating: 4.8, reviews: 312, verified: true, location: "สุขุมวิท 11, กรุงเทพฯ", img_emoji: "🍗", tags: ["ข้าว", "ไก่", "อาหารจานเดียว"] },
  { id: 2, name: "ก๋วยเตี๋ยวเรือป้าแดง", category: "อาหาร", tier: 2, link: "https://line.me/shop2", description: "ก๋วยเตี๋ยวเรือสูตรดั้งเดิม น้ำซุปเข้มข้น หมูนุ่มลูกชิ้นเด้ง", rating: 4.6, reviews: 187, verified: true, location: "รามคำแหง 24, กรุงเทพฯ", img_emoji: "🍜", tags: ["ก๋วยเตี๋ยว", "หมู", "เรือ"] },
  { id: 3, name: "ขนมครกบ้านนา", category: "ขนม", tier: 1, link: "https://line.me/shop3", description: "ขนมครกหอมมะพร้าว ใส่ต้นหอมหน้าขาว ทำสดทุกวัน", rating: 4.3, reviews: 94, verified: false, location: "ลาดพร้าว 41, กรุงเทพฯ", img_emoji: "🥥", tags: ["ขนม", "มะพร้าว", "ของหวาน"] },
  { id: 4, name: "ส้มตำอีสานแม่ตุ๋ย", category: "อาหาร", tier: 2, link: "https://line.me/shop4", description: "ส้มตำ ลาบ ก้อยรสเด็ด แซ่บอีหลี ข้าวเหนียวหุงใหม่ทุกวัน", rating: 4.7, reviews: 256, verified: true, location: "พระโขนง, กรุงเทพฯ", img_emoji: "🥗", tags: ["ส้มตำ", "อีสาน", "แซ่บ"] },
  { id: 5, name: "ชานมไข่มุกไต้หวันแท้", category: "เครื่องดื่ม", tier: 3, link: "https://line.me/shop5", description: "ชานมไข่มุกไต้หวันแบบดั้งเดิม ไข่มุกทำเอง หวานน้อยได้", rating: 4.9, reviews: 523, verified: true, location: "ทองหล่อ, กรุงเทพฯ", img_emoji: "🧋", tags: ["ชานม", "ไข่มุก", "เครื่องดื่ม"] },
  { id: 6, name: "ปาท่องโก๋กรอบน้อย", category: "ขนม", tier: 1, link: "https://line.me/shop6", description: "ปาท่องโก๋ทอดสด กรอบนอกนุ่มใน เสิร์ฟคู่นมถั่วเหลืองร้อนๆ", rating: 4.2, reviews: 67, verified: false, location: "อ่อนนุช, กรุงเทพฯ", img_emoji: "🍩", tags: ["ปาท่องโก๋", "ของเช้า", "ทอด"] },
];

const MOCK_MY_SHOP = {
  id: 10, name: "ร้านผัดไทยนายดี", category: "อาหาร", tier: 1, current_tier: 1,
  link: "https://line.me/my-shop", description: "ผัดไทยกุ้งสด เส้นเหนียวหนึบ ไข่ห่อ เสิร์ฟพร้อมผักสด",
  rating: 4.5, orders_count: 143, img_emoji: "🍝",
  upgrade_history: [
    { round: 1, tier_requested: 2, status: "rejected", reason: "เอกสารภาพไม่ชัดเจน", date: "15/01/2568" },
    { round: 2, tier_requested: 2, status: "pending", date: "10/03/2568" },
  ],
  created_at: "01/09/2567",
};

// ============================================================
// STYLES
// ============================================================
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700;800&family=Mitr:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #faf8f5;
    --surface: #ffffff;
    --surface2: #f5f2ed;
    --border: #e8e2d9;
    --border2: #d5cdc0;
    --accent: #e85d26;
    --accent2: #c94d1a;
    --accent-light: #fef3ee;
    --accent-glow: rgba(232,93,38,0.12);
    --green: #1a9e5e;
    --green-light: #edfaf3;
    --yellow: #d97706;
    --yellow-light: #fffbeb;
    --blue: #2563eb;
    --blue-light: #eff6ff;
    --red: #dc2626;
    --red-light: #fef2f2;
    --text: #1a1410;
    --text2: #5c4f42;
    --text3: #9c8c7c;
    --shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
    --shadow-md: 0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04);
    --shadow-lg: 0 8px 40px rgba(0,0,0,0.12);
    --font: 'Sarabun', sans-serif;
    --display: 'Mitr', sans-serif;
    --radius: 12px;
    --radius-sm: 8px;
  }

  html, body { height: 100%; background: var(--bg); color: var(--text); font-family: var(--font); font-size: 15px; line-height: 1.6; }

  /* NAVBAR */
  .navbar {
    position: sticky; top: 0; z-index: 50;
    background: rgba(250,248,245,0.92); backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    padding: 0 24px; height: 60px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .nav-brand { font-family: var(--display); font-size: 20px; font-weight: 600; color: var(--accent); cursor: pointer; letter-spacing: -0.02em; }
  .nav-brand span { color: var(--text); }
  .nav-right { display: flex; align-items: center; gap: 10px; }

  /* BUTTONS */
  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: var(--radius-sm); font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.18s; border: 1.5px solid transparent; font-family: var(--font); white-space: nowrap; }
  .btn-primary { background: var(--accent); color: #fff; border-color: var(--accent); }
  .btn-primary:hover { background: var(--accent2); transform: translateY(-1px); box-shadow: 0 4px 12px var(--accent-glow); }
  .btn-outline { background: transparent; color: var(--text); border-color: var(--border2); }
  .btn-outline:hover { background: var(--surface2); border-color: var(--text3); }
  .btn-ghost { background: transparent; color: var(--text2); border-color: transparent; }
  .btn-ghost:hover { background: var(--surface2); }
  .btn-danger { background: var(--red-light); color: var(--red); border-color: rgba(220,38,38,0.2); }
  .btn-danger:hover { background: rgba(220,38,38,0.12); }
  .btn-success { background: var(--green-light); color: var(--green); border-color: rgba(26,158,94,0.2); }
  .btn-sm { padding: 6px 12px; font-size: 13px; }
  .btn-lg { padding: 12px 28px; font-size: 15px; border-radius: var(--radius); }
  .btn-icon { padding: 8px; border-radius: var(--radius-sm); }
  .btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none !important; }

  /* BADGES / TIER */
  .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 100px; font-size: 12px; font-weight: 700; }
  .badge-tier1 { background: var(--surface2); color: var(--text3); border: 1px solid var(--border2); }
  .badge-tier2 { background: #e8f0fe; color: #3b5bdb; border: 1px solid #c5d2f6; }
  .badge-tier3 { background: linear-gradient(135deg, #fff7e6, #ffecd2); color: #b45309; border: 1px solid #f6d860; }
  .badge-green { background: var(--green-light); color: var(--green); }
  .badge-red { background: var(--red-light); color: var(--red); }
  .badge-yellow { background: var(--yellow-light); color: var(--yellow); }
  .badge-gray { background: var(--surface2); color: var(--text3); }

  /* INPUTS */
  .input { background: var(--surface); border: 1.5px solid var(--border2); color: var(--text); border-radius: var(--radius-sm); padding: 10px 14px; font-size: 14px; font-family: var(--font); outline: none; transition: border-color 0.18s; width: 100%; }
  .input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }
  .textarea { resize: vertical; min-height: 90px; }
  .form-group { margin-bottom: 16px; }
  .form-label { display: block; font-size: 13px; font-weight: 700; color: var(--text2); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.04em; }
  .form-hint { font-size: 12px; color: var(--text3); margin-top: 5px; }

  /* UPLOAD ZONE */
  .upload-zone {
    border: 2px dashed var(--border2); border-radius: var(--radius); padding: 28px;
    text-align: center; cursor: pointer; transition: all 0.18s; background: var(--surface2);
  }
  .upload-zone:hover, .upload-zone.dragover { border-color: var(--accent); background: var(--accent-light); }
  .upload-zone.filled { border-color: var(--green); background: var(--green-light); border-style: solid; }
  .upload-icon { font-size: 28px; margin-bottom: 8px; }
  .upload-text { font-size: 14px; font-weight: 600; color: var(--text2); }
  .upload-sub { font-size: 12px; color: var(--text3); margin-top: 4px; }

  /* MODAL */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(4px); animation: fadeIn 0.15s ease; padding: 20px; }
  .modal { background: var(--surface); border-radius: 20px; width: 100%; max-width: 520px; max-height: 88vh; overflow-y: auto; box-shadow: var(--shadow-lg); animation: slideUp 0.22s ease; }
  .modal-wide { max-width: 640px; }
  .modal-header { padding: 22px 24px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
  .modal-header h3 { font-family: var(--display); font-size: 17px; font-weight: 600; }
  .modal-body { padding: 22px 24px; }
  .modal-footer { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; gap: 8px; justify-content: flex-end; }

  /* SHOP CARD */
  .shop-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 18px; }
  .shop-card {
    background: var(--surface); border: 1.5px solid var(--border); border-radius: 16px;
    overflow: hidden; transition: all 0.22s; cursor: pointer;
  }
  .shop-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); border-color: var(--border2); }
  .shop-card-thumb { height: 120px; display: flex; align-items: center; justify-content: center; font-size: 52px; background: var(--surface2); position: relative; }
  .shop-card-body { padding: 16px; }
  .shop-card-name { font-family: var(--display); font-size: 15px; font-weight: 600; margin-bottom: 4px; }
  .shop-card-desc { font-size: 13px; color: var(--text2); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 12px; }
  .shop-card-meta { display: flex; align-items: center; justify-content: space-between; }
  .shop-card-rating { font-size: 13px; font-weight: 700; color: var(--yellow); }
  .shop-card-loc { font-size: 12px; color: var(--text3); }

  /* TIER BADGE POSITIONED */
  .tier-badge-abs { position: absolute; top: 10px; right: 10px; }

  /* HERO */
  .hero { padding: 60px 24px 48px; text-align: center; position: relative; overflow: hidden; }
  .hero::before { content: ''; position: absolute; top: -40px; left: 50%; transform: translateX(-50%); width: 600px; height: 300px; background: radial-gradient(ellipse, rgba(232,93,38,0.08) 0%, transparent 70%); pointer-events: none; }
  .hero-title { font-family: var(--display); font-size: 40px; font-weight: 600; line-height: 1.2; margin-bottom: 12px; letter-spacing: -0.03em; }
  .hero-title span { color: var(--accent); }
  .hero-sub { font-size: 16px; color: var(--text2); margin-bottom: 32px; max-width: 440px; margin-left: auto; margin-right: auto; }
  .search-box { max-width: 560px; margin: 0 auto; display: flex; gap: 0; background: var(--surface); border: 2px solid var(--border2); border-radius: 14px; overflow: hidden; box-shadow: var(--shadow-md); transition: border-color 0.18s; }
  .search-box:focus-within { border-color: var(--accent); }
  .search-input { flex: 1; padding: 14px 18px; font-size: 15px; font-family: var(--font); border: none; outline: none; background: transparent; }
  .search-btn { padding: 14px 22px; background: var(--accent); color: #fff; font-size: 15px; font-weight: 700; font-family: var(--font); border: none; cursor: pointer; transition: background 0.15s; }
  .search-btn:hover { background: var(--accent2); }

  /* SECTION */
  .section { padding: 0 24px 48px; max-width: 1100px; margin: 0 auto; }
  .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .section-title { font-family: var(--display); font-size: 20px; font-weight: 600; }
  .section-sub { font-size: 13px; color: var(--text3); margin-top: 2px; }

  /* CATEGORY PILLS */
  .category-pills { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }
  .pill { padding: 7px 16px; border-radius: 100px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1.5px solid var(--border2); background: var(--surface); color: var(--text2); transition: all 0.15s; }
  .pill:hover, .pill.active { background: var(--accent); color: #fff; border-color: var(--accent); }

  /* SHOP DETAIL */
  .shop-detail-hero { background: var(--surface2); border-radius: 20px; padding: 36px; margin-bottom: 24px; display: flex; gap: 28px; align-items: flex-start; }
  .shop-emoji { font-size: 72px; flex-shrink: 0; }
  .shop-detail-info { flex: 1; }
  .shop-detail-name { font-family: var(--display); font-size: 26px; font-weight: 600; margin-bottom: 8px; letter-spacing: -0.02em; }
  .shop-detail-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; align-items: center; }
  .shop-detail-desc { color: var(--text2); font-size: 15px; line-height: 1.7; margin-bottom: 16px; }
  .shop-detail-link { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 600; color: var(--accent); text-decoration: none; }

  /* PROFILE */
  .profile-header { background: var(--surface); border-radius: 20px; padding: 32px; margin-bottom: 20px; display: flex; gap: 24px; align-items: center; box-shadow: var(--shadow); }
  .avatar { width: 72px; height: 72px; border-radius: 50%; background: var(--accent-light); display: flex; align-items: center; justify-content: center; font-size: 28px; flex-shrink: 0; border: 3px solid var(--border); }
  .profile-name { font-family: var(--display); font-size: 22px; font-weight: 600; }
  .profile-email { font-size: 14px; color: var(--text3); margin-top: 2px; }

  /* DASHBOARD CARDS */
  .dash-card { background: var(--surface); border: 1.5px solid var(--border); border-radius: 16px; padding: 24px; box-shadow: var(--shadow); }
  .dash-card-title { font-family: var(--display); font-size: 16px; font-weight: 600; margin-bottom: 4px; }
  .dash-card-sub { font-size: 13px; color: var(--text3); margin-bottom: 20px; }
  .stat-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-bottom: 20px; }
  .stat-mini { background: var(--surface2); border-radius: 12px; padding: 16px; text-align: center; }
  .stat-mini-val { font-size: 24px; font-weight: 800; font-family: var(--display); color: var(--text); }
  .stat-mini-label { font-size: 12px; color: var(--text3); margin-top: 2px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }

  /* HISTORY TABLE */
  .history-item { display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border); align-items: flex-start; }
  .history-item:last-child { border-bottom: none; }
  .history-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 6px; flex-shrink: 0; }
  .dot-success { background: var(--green); }
  .dot-fail { background: var(--red); }
  .dot-pending { background: var(--yellow); }

  /* TIER INFO */
  .tier-card { border-radius: 14px; padding: 16px 18px; border: 1.5px solid; margin-bottom: 10px; cursor: pointer; transition: all 0.15s; }
  .tier-card:hover { transform: translateY(-1px); }
  .tier-card.selected { transform: translateY(-1px); }
  .tier-1 { background: var(--surface2); border-color: var(--border2); }
  .tier-2 { background: #e8f0fe; border-color: #c5d2f6; }
  .tier-3 { background: linear-gradient(135deg, #fff7e6, #fef3c7); border-color: #f6d860; }
  .tier-card.selected.tier-2 { box-shadow: 0 4px 16px rgba(59,91,219,0.2); }
  .tier-card.selected.tier-3 { box-shadow: 0 4px 16px rgba(180,83,9,0.2); }

  /* WIZARD */
  .wizard-steps { display: flex; gap: 0; margin-bottom: 32px; }
  .wizard-step { flex: 1; display: flex; flex-direction: column; align-items: center; position: relative; }
  .wizard-step::after { content: ''; position: absolute; top: 18px; left: 50%; width: 100%; height: 2px; background: var(--border2); z-index: 0; }
  .wizard-step:last-child::after { display: none; }
  .step-circle { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; border: 2px solid var(--border2); background: var(--surface2); color: var(--text3); position: relative; z-index: 1; transition: all 0.2s; }
  .step-circle.active { background: var(--accent); color: #fff; border-color: var(--accent); box-shadow: 0 0 0 4px var(--accent-glow); }
  .step-circle.done { background: var(--green); color: #fff; border-color: var(--green); }
  .step-label { font-size: 12px; font-weight: 700; color: var(--text3); margin-top: 8px; text-align: center; }
  .step-label.active { color: var(--accent); }
  .step-label.done { color: var(--green); }

  /* NOTIFICATION */
  .notification { position: fixed; top: 76px; right: 20px; z-index: 200; background: var(--surface); border: 1.5px solid var(--border2); border-radius: 12px; padding: 14px 18px; min-width: 280px; box-shadow: var(--shadow-lg); animation: slideIn 0.25s ease; display: flex; align-items: center; gap: 10px; font-size: 14px; }
  .notification.success { border-left: 3px solid var(--green); }
  .notification.error { border-left: 3px solid var(--red); }

  /* PAGE WRAPPER */
  .page { min-height: calc(100vh - 60px); }

  /* DETAIL ROW */
  .detail-row { display: flex; gap: 12px; padding: 11px 0; border-bottom: 1px solid var(--border); }
  .detail-row:last-child { border-bottom: none; }
  .detail-label { font-size: 12px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.05em; min-width: 130px; padding-top: 2px; }
  .detail-value { font-size: 14px; color: var(--text); flex: 1; }

  /* TAG */
  .tag { display: inline-block; padding: 2px 9px; border-radius: 6px; font-size: 12px; font-weight: 600; background: var(--surface2); color: var(--text3); margin-right: 4px; }

  /* DIVIDER */
  .divider { border: none; border-top: 1px solid var(--border); margin: 20px 0; }

  /* ALERT */
  .alert { border-radius: var(--radius-sm); padding: 12px 16px; font-size: 14px; display: flex; gap: 10px; align-items: flex-start; }
  .alert-warn { background: var(--yellow-light); color: #92400e; border: 1px solid #fde68a; }
  .alert-success { background: var(--green-light); color: #065f46; border: 1px solid #a7f3d0; }
  .alert-error { background: var(--red-light); color: #991b1b; border: 1px solid #fecaca; }
  .alert-info { background: var(--blue-light); color: #1e40af; border: 1px solid #bfdbfe; }

  /* GOOGLE LOGIN BTN */
  .google-btn { width: 100%; padding: 13px; background: #fff; color: #333; border: 1.5px solid #dadce0; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.15s; font-family: var(--font); box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
  .google-btn:hover { background: #f8f9fa; box-shadow: 0 2px 8px rgba(0,0,0,0.12); }

  @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
  @keyframes slideUp { from { transform: translateY(14px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
  @keyframes slideIn { from { transform: translateX(16px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }

  /* RESPONSIVE */
  @media (max-width: 640px) {
    .hero-title { font-size: 28px; }
    .shop-detail-hero { flex-direction: column; gap: 16px; }
    .stat-row { grid-template-columns: repeat(2, 1fr); }
    .navbar { padding: 0 16px; }
    .section { padding: 0 16px 40px; }
  }
`;

// ============================================================
// HELPERS
// ============================================================
function TierBadge({ tier }) {
  const map = { 1: ["badge-tier1", "⚪ ขั้น 1"], 2: ["badge-tier2", "🔵 ขั้น 2"], 3: ["badge-tier3", "🥇 ขั้น 3"] };
  const [cls, label] = map[tier] || map[1];
  return <span className={`badge ${cls}`}>{label}</span>;
}

function Notification({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return <div className={`notification ${type}`}><span>{type === "success" ? "✓" : "✕"}</span><span>{msg}</span></div>;
}

function Modal({ title, onClose, children, footer, wide }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? "modal-wide" : ""}`}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ============================================================
// NAVBAR
// ============================================================
function Navbar({ user, onNavigate, page }) {
  const [showLogin, setShowLogin] = useState(false);
  const handleGoogleLogin = () => {
    // TODO: Google OAuth
    localStorage.setItem("user_token", "mock_token");
    localStorage.setItem("user_data", JSON.stringify(MOCK_USER));
    window.location.reload();
  };
  return (
    <>
      <nav className="navbar">
        <div className="nav-brand" onClick={() => onNavigate("home")}>my<span>Order</span></div>
        <div className="nav-right">
          {user ? (
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("profile")}>👤 {user.name.split(" ")[0]}</button>
              <button className="btn btn-outline btn-sm" onClick={() => onNavigate("myshop")}>🏪 ร้านของฉัน</button>
            </>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => setShowLogin(true)}>เข้าสู่ระบบ</button>
          )}
        </div>
      </nav>
      {showLogin && (
        <Modal title="เข้าสู่ระบบ" onClose={() => setShowLogin(false)}>
          <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👋</div>
            <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 24 }}>เข้าสู่ระบบเพื่อจัดการร้านค้าและรายงานร้านค้าได้</p>
          </div>
          <button className="google-btn" onClick={handleGoogleLogin}>
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.6 2.3 30.1 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.8 6.1C12.4 13.2 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 7.1-10 7.1-17z"/><path fill="#FBBC05" d="M10.4 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.6L2.6 13.3A24 24 0 0 0 0 24c0 3.8.9 7.4 2.6 10.7l7.8-6.1z"/><path fill="#34A853" d="M24 48c6.1 0 11.2-2 14.9-5.4l-7.5-5.8c-2 1.4-4.7 2.2-7.4 2.2-6.3 0-11.6-3.7-13.6-9.4l-7.8 6.1C6.6 42.6 14.6 48 24 48z"/></svg>
            เข้าสู่ระบบด้วย Google
          </button>
        </Modal>
      )}
    </>
  );
}

// ============================================================
// PAGE 1: HOME
// ============================================================
function HomePage({ onNavigate }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ทั้งหมด");
  const categories = ["ทั้งหมด", "อาหาร", "ขนม", "เครื่องดื่ม"];

  const filtered = MOCK_SHOPS.filter(s =>
    (category === "ทั้งหมด" || s.category === category) &&
    (s.name.includes(query) || s.description.includes(query) || query === "")
  );

  return (
    <div className="page">
      <div className="hero">
        <h1 className="hero-title">ค้นหาร้านค้าที่คุณ<span>ไว้วางใจ</span></h1>
        <p className="hero-sub">ค้นหาร้านค้าที่ผ่านการยืนยันตัวตนแล้ว ปลอดภัย มั่นใจ</p>
        <div className="search-box">
          <input className="search-input" placeholder="พิมพ์ชื่อร้าน หรือประเภทสินค้า..." value={query} onChange={e => setQuery(e.target.value)} />
          <button className="search-btn">🔍</button>
        </div>
      </div>

      <div className="section">
        <div className="category-pills">
          {categories.map(c => <button key={c} className={`pill ${category === c ? "active" : ""}`} onClick={() => setCategory(c)}>{c}</button>)}
        </div>

        <div className="section-header">
          <div>
            <div className="section-title">{query ? `ผลการค้นหา "${query}"` : "ร้านค้าแนะนำ"}</div>
            <div className="section-sub">พบ {filtered.length} ร้านค้า</div>
          </div>
        </div>

        <div className="shop-grid">
          {filtered.map(shop => (
            <div className="shop-card" key={shop.id} onClick={() => onNavigate("shop-detail", shop)}>
              <div className="shop-card-thumb">
                {shop.img_emoji}
                <div className="tier-badge-abs"><TierBadge tier={shop.tier} /></div>
              </div>
              <div className="shop-card-body">
                <div className="shop-card-name">{shop.name}</div>
                <div className="shop-card-desc">{shop.description}</div>
                <div className="shop-card-meta">
                  <span className="shop-card-rating">⭐ {shop.rating} ({shop.reviews})</span>
                  <span className="shop-card-loc">📍 {shop.location.split(",")[0]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PAGE 2: SHOP DETAIL
// ============================================================
function ShopDetailPage({ shop, user, onNavigate, notify }) {
  const [showReport, setShowReport] = useState(false);
  const [report, setReport] = useState({ reason: "", detail: "", file: null });
  const fileRef = useRef();

  const handleReport = () => {
    if (!user) { notify("กรุณาเข้าสู่ระบบก่อน", "error"); setShowReport(false); return; }
    if (!report.reason || !report.detail) return;
    // TODO: await api.reportShop(shop.id, { reason: report.reason, detail: report.detail, file: report.file })
    setShowReport(false);
    notify("ส่งรายงานเรียบร้อยแล้ว ขอบคุณครับ", "success");
    setReport({ reason: "", detail: "", file: null });
  };

  const tierDesc = { 1: "ร้านค้าทั่วไป ยังไม่ได้ยืนยันตัวตน", 2: "ยืนยันตัวตนระดับเอกสาร", 3: "ยืนยันตัวตนสูงสุด มีประวัติการสั่งของจาก myOrder" };

  return (
    <div className="page">
      <div className="section" style={{ paddingTop: 24 }}>
        <button className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }} onClick={() => onNavigate("home")}>← กลับ</button>

        <div className="shop-detail-hero">
          <div className="shop-emoji">{shop.img_emoji}</div>
          <div className="shop-detail-info">
            <div className="shop-detail-name">{shop.name}</div>
            <div className="shop-detail-meta">
              <TierBadge tier={shop.tier} />
              <span className="badge badge-gray">{shop.category}</span>
              <span style={{ fontSize: 14, color: "var(--yellow)", fontWeight: 700 }}>⭐ {shop.rating}</span>
              <span style={{ fontSize: 13, color: "var(--text3)" }}>({shop.reviews} รีวิว)</span>
            </div>
            <p className="shop-detail-desc">{shop.description}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
              {shop.tags.map(t => <span className="tag" key={t}>#{t}</span>)}
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a href={shop.link} className="btn btn-primary" target="_blank" rel="noreferrer">🔗 ติดต่อร้านค้า</a>
              <button className="btn btn-outline" onClick={() => setShowReport(true)}>🚩 รายงานร้านค้า</button>
            </div>
          </div>
        </div>

        <div className="dash-card" style={{ marginBottom: 16 }}>
          <div className="dash-card-title">ระดับการยืนยันตัวตน</div>
          <div className="dash-card-sub">ร้านค้านี้ได้รับการยืนยัน</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[1, 2, 3].map(t => (
              <div key={t} style={{ flex: 1, minWidth: 160, padding: "14px 16px", background: t === shop.tier ? "var(--accent-light)" : "var(--surface2)", border: `1.5px solid ${t === shop.tier ? "var(--accent)" : "var(--border)"}`, borderRadius: 12 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}><TierBadge tier={t} />{t === shop.tier && <span style={{ fontSize: 11, background: "var(--accent)", color: "#fff", padding: "1px 7px", borderRadius: 100, fontWeight: 700 }}>ปัจจุบัน</span>}</div>
                <div style={{ fontSize: 13, color: "var(--text2)" }}>{tierDesc[t]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-card">
          <div className="detail-row"><div className="detail-label">📍 ที่อยู่</div><div className="detail-value">{shop.location}</div></div>
          <div className="detail-row"><div className="detail-label">🔗 ลิงก์ติดต่อ</div><div className="detail-value"><a href={shop.link} style={{ color: "var(--accent)" }} target="_blank" rel="noreferrer">{shop.link}</a></div></div>
        </div>
      </div>

      {showReport && (
        <Modal title="รายงานร้านค้า" onClose={() => setShowReport(false)}
          footer={<>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowReport(false)}>ยกเลิก</button>
            <button className="btn btn-danger btn-sm" onClick={handleReport} disabled={!report.reason || !report.detail}>ส่งรายงาน</button>
          </>}>
          <div className="alert alert-warn" style={{ marginBottom: 16 }}>⚠️ การรายงานเท็จอาจส่งผลต่อบัญชีของคุณ กรุณาใส่ข้อมูลที่เป็นจริงเท่านั้น</div>
          <div className="form-group">
            <label className="form-label">ประเภทการรายงาน *</label>
            <select className="input" value={report.reason} onChange={e => setReport(p => ({ ...p, reason: e.target.value }))}>
              <option value="">-- เลือกประเภท --</option>
              <option>สินค้าไม่ตรงรูป</option>
              <option>โกงเงิน / ไม่ส่งของ</option>
              <option>ร้านค้าปลอม</option>
              <option>ข้อมูลร้านค้าผิด</option>
              <option>อื่นๆ</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">รายละเอียด *</label>
            <textarea className="input textarea" placeholder="อธิบายปัญหาโดยละเอียด..." value={report.detail} onChange={e => setReport(p => ({ ...p, detail: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">แนบหลักฐาน (ไฟล์รูป / สลิป)</label>
            <div className={`upload-zone ${report.file ? "filled" : ""}`} onClick={() => fileRef.current?.click()}>
              <div className="upload-icon">{report.file ? "✅" : "📎"}</div>
              <div className="upload-text">{report.file ? report.file.name : "คลิกเพื่อแนบไฟล์"}</div>
              <div className="upload-sub">PNG, JPG, PDF ขนาดไม่เกิน 10MB</div>
              <input ref={fileRef} type="file" style={{ display: "none" }} accept="image/*,.pdf" onChange={e => setReport(p => ({ ...p, file: e.target.files[0] }))} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ============================================================
// PAGE 3: USER PROFILE
// ============================================================
function ProfilePage({ user, onNavigate }) {
  const hasShop = true; // TODO: check from API

  return (
    <div className="page">
      <div className="section" style={{ paddingTop: 28 }}>
        <div className="profile-header">
          <div className="avatar">👤</div>
          <div style={{ flex: 1 }}>
            <div className="profile-name">{user.name}</div>
            <div className="profile-email">{user.email}</div>
            <div style={{ marginTop: 8 }}><span className="badge badge-green">✓ เข้าสู่ระบบแล้ว</span></div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => { localStorage.clear(); window.location.reload(); }}>ออกจากระบบ</button>
        </div>

        <div className="dash-card">
          <div className="dash-card-title">ร้านค้าของฉัน</div>
          <div className="dash-card-sub">จัดการร้านค้าและดูสถานะการยืนยันตัวตน</div>
          <hr className="divider" />
          {hasShop ? (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <span style={{ fontSize: 36 }}>{MOCK_MY_SHOP.img_emoji}</span>
                <div>
                  <div style={{ fontFamily: "var(--display)", fontSize: 16, fontWeight: 600 }}>{MOCK_MY_SHOP.name}</div>
                  <TierBadge tier={MOCK_MY_SHOP.tier} />
                </div>
              </div>
              <button className="btn btn-primary" onClick={() => onNavigate("myshop")}>🏪 จัดการร้านค้า →</button>
            </div>
          ) : (
            <div>
              <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 16 }}>คุณยังไม่มีร้านค้าในระบบ ติดต่อทีมงาน myOrder เพื่อลงทะเบียน</p>
              <a href="https://line.me/myorder-register" className="btn btn-outline" target="_blank" rel="noreferrer">📩 ติดต่อลงทะเบียน</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PAGE 4: MY SHOP DASHBOARD
// ============================================================
function MyShopPage({ onNavigate, notify }) {
  const [shop, setShop] = useState(MOCK_MY_SHOP);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: shop.name, link: shop.link, description: shop.description });

  const handleSave = () => {
    // TODO: await api.updateMyShop(editForm)
    setShop(p => ({ ...p, ...editForm }));
    setEditing(false);
    notify("บันทึกข้อมูลเรียบร้อย", "success");
  };

  const statusBadge = (s) => {
    if (s === "pending") return <span className="badge badge-yellow">⏳ รอตรวจสอบ</span>;
    if (s === "approved") return <span className="badge badge-green">✓ อนุมัติ</span>;
    return <span className="badge badge-red">✕ ไม่ผ่าน</span>;
  };

  return (
    <div className="page">
      <div className="section" style={{ paddingTop: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontFamily: "var(--display)", fontSize: 22, fontWeight: 600 }}>แดชบอร์ดร้านค้า</h2>
            <p style={{ color: "var(--text3)", fontSize: 13 }}>จัดการข้อมูลและสถานะร้านค้าของคุณ</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("home")}>← กลับ</button>
        </div>

        {/* STATS */}
        <div className="stat-row" style={{ marginBottom: 20 }}>
          <div className="stat-mini"><div className="stat-mini-val">{shop.rating}</div><div className="stat-mini-label">คะแนน</div></div>
          <div className="stat-mini"><div className="stat-mini-val">{shop.orders_count}</div><div className="stat-mini-label">ออเดอร์</div></div>
          <div className="stat-mini"><div className="stat-mini-val">ขั้น {shop.tier}</div><div className="stat-mini-label">ระดับ</div></div>
        </div>

        {/* INFO CARD */}
        <div className="dash-card" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <span style={{ fontSize: 40 }}>{shop.img_emoji}</span>
              <div>
                <div style={{ fontFamily: "var(--display)", fontSize: 18, fontWeight: 600 }}>{shop.name}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 4 }}><TierBadge tier={shop.tier} /><span className="badge badge-gray">{shop.category}</span></div>
              </div>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>✏️ แก้ไข</button>
          </div>
          <div className="detail-row"><div className="detail-label">🔗 ลิงก์</div><div className="detail-value"><a href={shop.link} style={{ color: "var(--accent)" }} target="_blank" rel="noreferrer">{shop.link}</a></div></div>
          <div className="detail-row"><div className="detail-label">📝 รายละเอียด</div><div className="detail-value" style={{ color: "var(--text2)" }}>{shop.description}</div></div>
          <div className="detail-row"><div className="detail-label">📅 สร้างเมื่อ</div><div className="detail-value" style={{ color: "var(--text3)" }}>{shop.created_at}</div></div>
        </div>

        {/* UPGRADE SECTION */}
        {shop.tier < 3 && (
          <div className="dash-card" style={{ marginBottom: 16, background: "linear-gradient(135deg, #fff7f5, #fef3ee)", border: "1.5px solid rgba(232,93,38,0.2)" }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ fontSize: 36 }}>🚀</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--display)", fontSize: 16, fontWeight: 600, marginBottom: 4 }}>เลื่อนขั้นเพื่อความน่าเชื่อถือ</div>
                <p style={{ fontSize: 13, color: "var(--text2)" }}>ขั้น {shop.tier + 1} จะทำให้ลูกค้าเชื่อมั่นในร้านคุณมากขึ้น และแสดง Badge พิเศษ</p>
              </div>
              <button className="btn btn-primary" onClick={() => onNavigate("upgrade")}>ขอเลื่อนขั้น →</button>
            </div>
          </div>
        )}

        {/* UPGRADE HISTORY */}
        <div className="dash-card">
          <div className="dash-card-title">ประวัติการขอเลื่อนขั้น</div>
          <div className="dash-card-sub">บันทึกคำขอทั้งหมด</div>
          {shop.upgrade_history.length === 0 ? (
            <p style={{ color: "var(--text3)", fontSize: 14 }}>ยังไม่มีประวัติ</p>
          ) : shop.upgrade_history.map((h, i) => (
            <div className="history-item" key={i}>
              <div className={`history-dot ${h.status === "approved" ? "dot-success" : h.status === "pending" ? "dot-pending" : "dot-fail"}`} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>ขอขึ้นขั้น {h.tier_requested} {statusBadge(h.status)}</div>
                {h.reason && <div style={{ fontSize: 13, color: "var(--red)", marginTop: 4 }}>เหตุผล: {h.reason}</div>}
                <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>{h.date} · ครั้งที่ {h.round}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EDIT MODAL */}
      {editing && (
        <Modal title="แก้ไขข้อมูลร้านค้า" onClose={() => setEditing(false)}
          footer={<>
            <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>ยกเลิก</button>
            <button className="btn btn-primary btn-sm" onClick={handleSave}>บันทึก</button>
          </>}>
          <div className="form-group">
            <label className="form-label">ชื่อร้านค้า</label>
            <input className="input" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">ลิงก์ติดต่อ</label>
            <input className="input" placeholder="https://line.me/..." value={editForm.link} onChange={e => setEditForm(p => ({ ...p, link: e.target.value }))} />
            <div className="form-hint">เช่น Line OA, Facebook Page, หรือ Instagram</div>
          </div>
          <div className="form-group">
            <label className="form-label">รายละเอียดร้าน</label>
            <textarea className="input textarea" value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} />
          </div>
        </Modal>
      )}
    </div>
  );
}

// ============================================================
// PAGE 5: UPGRADE WIZARD
// ============================================================
const WIZARD_STEPS = ["เลือกขั้น", "ตรวจสอบ", "อัปโหลด", "ยืนยัน"];

function UpgradePage({ onNavigate, notify }) {
  const [step, setStep] = useState(0);
  const [targetTier, setTargetTier] = useState(null);
  const [entityType, setEntityType] = useState("individual");
  const [checks, setChecks] = useState({ fraud_check: null, order_check: null });
  const [files, setFiles] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const fileRefs = useRef({});

  const currentTier = MOCK_MY_SHOP.current_tier;

  // Step 2: Pre-check mock
  const runChecks = () => {
    // TODO: await api.checkUpgradeEligibility(targetTier)
    setTimeout(() => {
      setChecks({
        fraud_check: true,
        order_check: targetTier === 3 ? true : null,
      });
    }, 800);
  };
  useEffect(() => { if (step === 1) runChecks(); }, [step]);

  const getRequiredDocs = () => {
    if (targetTier === 2 && entityType === "individual") return [{ key: "id_card", label: "สำเนาบัตรประชาชน", hint: "ถ่ายภาพให้ชัด ครบ 4 มุม" }];
    if (targetTier === 2 && entityType === "company") return [
      { key: "vat", label: "ภพ.20 (ทะเบียนภาษีมูลค่าเพิ่ม)", hint: "เอกสารจากกรมสรรพากร" },
      { key: "director_id", label: "บัตรประชาชนของกรรมการ", hint: "สำเนาพร้อมเซ็นรับรอง" },
    ];
    if (targetTier === 3 && entityType === "individual") return [{ key: "selfie_id", label: "รูปถ่ายคู่บัตรประชาชน", hint: "ถือบัตร ถ่ายให้เห็นหน้าและบัตรชัดเจน" }];
    if (targetTier === 3 && entityType === "company") return [{ key: "selfie_director", label: "รูปถ่ายกรรมการคู่บัตรประชาชน", hint: "กรรมการถือบัตรประชาชน ถ่ายให้ชัด" }];
    return [];
  };

  const handleFileChange = (key, file) => setFiles(p => ({ ...p, [key]: file }));
  const allFilesUploaded = getRequiredDocs().every(d => files[d.key]);

  const handleSubmit = () => {
    // TODO: const formData = new FormData(); Object.entries(files).forEach(([k,v]) => formData.append(k,v)); await api.submitUpgrade(formData)
    setSubmitted(true);
    notify("ส่งคำขอเรียบร้อยแล้ว รอแอดมินตรวจสอบ", "success");
  };

  const tierOptions = [2, 3].filter(t => t > currentTier);

  return (
    <div className="page">
      <div className="section" style={{ paddingTop: 28, maxWidth: 680 }}>
        <button className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }} onClick={() => onNavigate("myshop")}>← กลับหน้าร้านค้า</button>

        {submitted ? (
          <div className="dash-card" style={{ textAlign: "center", padding: 48 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontFamily: "var(--display)", fontSize: 22, fontWeight: 600, marginBottom: 8 }}>ส่งคำขอเรียบร้อยแล้ว!</h2>
            <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 24 }}>ทีมแอดมินจะตรวจสอบและแจ้งผลภายใน 1–3 วันทำการ</p>
            <button className="btn btn-primary" onClick={() => onNavigate("myshop")}>กลับหน้าแดชบอร์ด</button>
          </div>
        ) : (
          <>
            <h2 style={{ fontFamily: "var(--display)", fontSize: 22, fontWeight: 600, marginBottom: 6 }}>ขอเลื่อนขั้นร้านค้า</h2>
            <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 28 }}>ระดับปัจจุบัน: <TierBadge tier={currentTier} /></p>

            {/* WIZARD STEPS */}
            <div className="wizard-steps">
              {WIZARD_STEPS.map((s, i) => (
                <div className="wizard-step" key={s}>
                  <div className={`step-circle ${i < step ? "done" : i === step ? "active" : ""}`}>{i < step ? "✓" : i + 1}</div>
                  <div className={`step-label ${i < step ? "done" : i === step ? "active" : ""}`}>{s}</div>
                </div>
              ))}
            </div>

            {/* STEP 0: เลือกขั้น */}
            {step === 0 && (
              <div className="dash-card">
                <div className="dash-card-title">เลือกขั้นที่ต้องการเลื่อน</div>
                <div className="dash-card-sub">ขั้นที่สูงขึ้น = ความน่าเชื่อถือที่มากขึ้น</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                  {tierOptions.map(t => (
                    <div key={t} className={`tier-card tier-${t} ${targetTier === t ? "selected" : ""}`} onClick={() => setTargetTier(t)}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${targetTier === t ? "var(--accent)" : "var(--border2)"}`, background: targetTier === t ? "var(--accent)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{targetTier === t && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}</div>
                          <TierBadge tier={t} />
                        </div>
                        {t === 3 && <span style={{ fontSize: 12, fontWeight: 700, color: "var(--yellow)", background: "#fef9c3", padding: "2px 8px", borderRadius: 100 }}>⚠ ต้องมีประวัติสั่ง</span>}
                      </div>
                      <p style={{ fontSize: 13, color: "var(--text2)", marginTop: 8, marginLeft: 30 }}>
                        {t === 2 ? "ยืนยันตัวตนด้วยบัตรประชาชน / เอกสารบริษัท" : "ยืนยันสูงสุด ต้องเคยสั่งสินค้าผ่าน myOrder"}
                      </p>
                    </div>
                  ))}
                </div>
                {targetTier && (
                  <>
                    <div className="form-group">
                      <label className="form-label">ประเภทผู้ประกอบการ</label>
                      <div style={{ display: "flex", gap: 10 }}>
                        {[["individual", "👤 บุคคลธรรมดา"], ["company", "🏢 นิติบุคคล"]].map(([val, lbl]) => (
                          <button key={val} className={`btn ${entityType === val ? "btn-primary" : "btn-outline"}`} onClick={() => setEntityType(val)}>{lbl}</button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button className="btn btn-primary" disabled={!targetTier} onClick={() => setStep(1)}>ถัดไป →</button>
                </div>
              </div>
            )}

            {/* STEP 1: PRE-CHECK */}
            {step === 1 && (
              <div className="dash-card">
                <div className="dash-card-title">ตรวจสอบคุณสมบัติ</div>
                <div className="dash-card-sub">ระบบกำลังตรวจสอบเงื่อนไขก่อนดำเนินการ</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                  <div className={`alert ${checks.fraud_check === null ? "alert-info" : checks.fraud_check ? "alert-success" : "alert-error"}`}>
                    {checks.fraud_check === null ? "⏳ กำลังตรวจสอบประวัติการโกง..." : checks.fraud_check ? "✓ ไม่มีประวัติการโกงย้อนหลัง 3 เดือน" : "✕ พบประวัติการโกง ไม่สามารถขอเลื่อนขั้นได้"}
                  </div>
                  {targetTier === 3 && (
                    <div className={`alert ${checks.order_check === null ? "alert-info" : checks.order_check ? "alert-success" : "alert-error"}`}>
                      {checks.order_check === null ? "⏳ กำลังตรวจสอบประวัติสั่งของ..." : checks.order_check ? "✓ มีประวัติการสั่งสินค้าจาก myOrder" : "✕ ไม่มีประวัติการสั่งของ กรุณาทดลองสั่งก่อน"}
                    </div>
                  )}
                </div>
                {checks.fraud_check !== null && (
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setStep(0)}>← ย้อนกลับ</button>
                    <button className="btn btn-primary" disabled={!checks.fraud_check || (targetTier === 3 && !checks.order_check)} onClick={() => setStep(2)}>ถัดไป →</button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: UPLOAD */}
            {step === 2 && (
              <div className="dash-card">
                <div className="dash-card-title">อัปโหลดเอกสาร</div>
                <div className="dash-card-sub">กรุณาอัปโหลดเอกสารให้ครบถ้วนและชัดเจน</div>
                <div className="alert alert-info" style={{ marginBottom: 20 }}>
                  💡 เอกสารควรถ่ายให้ชัดเจน ตัวอักษรอ่านออก และไม่มีส่วนที่ถูกบัง จะช่วยให้ผ่านการตรวจสอบเร็วขึ้น
                </div>
                {getRequiredDocs().map(doc => (
                  <div key={doc.key} className="form-group">
                    <label className="form-label">{doc.label} *</label>
                    <div className={`upload-zone ${files[doc.key] ? "filled" : ""}`} onClick={() => { if (!fileRefs.current[doc.key]) fileRefs.current[doc.key] = document.createElement("input"); fileRefs.current[doc.key].type = "file"; fileRefs.current[doc.key].accept = "image/*,.pdf"; fileRefs.current[doc.key].onchange = e => handleFileChange(doc.key, e.target.files[0]); fileRefs.current[doc.key].click(); }}>
                      <div className="upload-icon">{files[doc.key] ? "✅" : "📄"}</div>
                      <div className="upload-text">{files[doc.key] ? files[doc.key].name : "คลิกเพื่ออัปโหลด"}</div>
                      <div className="upload-sub">{doc.hint}</div>
                    </div>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>← ย้อนกลับ</button>
                  <button className="btn btn-primary" disabled={!allFilesUploaded} onClick={() => setStep(3)}>ถัดไป →</button>
                </div>
              </div>
            )}

            {/* STEP 3: CONFIRM */}
            {step === 3 && (
              <div className="dash-card">
                <div className="dash-card-title">ยืนยันการส่งคำขอ</div>
                <div className="dash-card-sub">ตรวจสอบข้อมูลก่อนส่ง</div>
                <div style={{ marginBottom: 20 }}>
                  <div className="detail-row"><div className="detail-label">ขั้นที่ขอ</div><div className="detail-value"><TierBadge tier={targetTier} /></div></div>
                  <div className="detail-row"><div className="detail-label">ประเภท</div><div className="detail-value">{entityType === "individual" ? "บุคคลธรรมดา" : "นิติบุคคล"}</div></div>
                  <div className="detail-row"><div className="detail-label">เอกสาร</div><div className="detail-value">{Object.values(files).map(f => <div key={f.name} style={{ fontSize: 13, color: "var(--green)" }}>✓ {f.name}</div>)}</div></div>
                </div>
                <div className="alert alert-warn" style={{ marginBottom: 20 }}>⚠️ เมื่อส่งแล้วจะไม่สามารถแก้ไขเอกสารได้ กรุณาตรวจสอบให้เรียบร้อย</div>
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setStep(2)}>← ย้อนกลับ</button>
                  <button className="btn btn-primary" onClick={handleSubmit}>📩 ส่งคำขอ</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
// APP SHELL
// ============================================================
export default function App() {
  const [page, setPage] = useState("home");
  const [pageData, setPageData] = useState(null);
  const [notification, setNotification] = useState(null);
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem("user_data")); } catch { return null; } });

  const notify = (msg, type = "success") => setNotification({ msg, type });

  const navigate = (p, data = null) => {
    setPage(p); setPageData(data);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <style>{styles}</style>
      <Navbar user={user} onNavigate={navigate} page={page} />
      {page === "home" && <HomePage onNavigate={navigate} />}
      {page === "shop-detail" && pageData && <ShopDetailPage shop={pageData} user={user} onNavigate={navigate} notify={notify} />}
      {page === "profile" && user && <ProfilePage user={user} onNavigate={navigate} />}
      {page === "myshop" && <MyShopPage onNavigate={navigate} notify={notify} />}
      {page === "upgrade" && <UpgradePage onNavigate={navigate} notify={notify} />}
      {notification && <Notification msg={notification.msg} type={notification.type} onClose={() => setNotification(null)} />}
    </>
  );
}