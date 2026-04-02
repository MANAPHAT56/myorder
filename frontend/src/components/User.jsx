import { useState, useEffect, useRef } from "react";
import AboutPage from "./About";
import { GoogleLogin } from '@react-oauth/google';
const API_BASE = "http://localhost:8080/api/v1";

const authHeaders = () => {
  const t = localStorage.getItem("user_token");
  return {
    Accept: "application/json",
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
  };
};
const handleResponse = async (response) => {
  // พยายามแปลงข้อมูลที่ได้มาเป็น JSON
  const data = await response.json().catch(() => ({})); 
  
  // ถ้า Status Code ไม่ใช่ 200-299 (เช่น 400, 401, 404, 500) ให้โยน Error
  if (!response.ok) {
    throw new Error(data.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
  }
  
  return data;
};
const api = {
  loginGoogle: (token) =>
    fetch(`${API_BASE}/auth/google`, {
      method: "POST",
      credentials: "include", // ✅ เพิ่ม credentials
      headers: { 
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({ token }),
    }).then(handleResponse),

  getProfile: () =>
    fetch(`${API_BASE}/user/profile`, { 
      headers: authHeaders(),
      credentials: "include" // ✅ เพิ่ม credentials
    }).then(handleResponse),

  searchShops: (params) =>
    fetch(`${API_BASE}/shops?${new URLSearchParams(params)}`, {
      headers: authHeaders(),
      credentials: "include"
    }).then(handleResponse),

  getFeaturedShops: () =>
    fetch(`${API_BASE}/shops/featured`, {
      headers: authHeaders(),
      credentials: "include"
    }).then(handleResponse),

  getShopDetail: (refId) =>
    fetch(`${API_BASE}/shops/${refId}`, {
      headers: authHeaders(),
      credentials: "include"
    }).then(handleResponse),

  getShopUpgradeRequests: (refId) =>
    fetch(`${API_BASE}/shops/${refId}/upgrade-requests`, {
      headers: authHeaders(),
      credentials: "include"
    }).then(handleResponse),

  // UC18: ยื่นเคลม — ใช้ FormData
  claimShop: (refId, formData) =>
    fetch(`${API_BASE}/shops/${refId}/claim`, {
      method: "POST",
      headers: {
        // ❌ ไม่ต้องตั้ง Content-Type เมื่อใช้ FormData
        ...(localStorage.getItem("user_token") && { 
          Authorization: `Bearer ${localStorage.getItem("user_token")}` 
        })
      },
      credentials: "include",
      body: formData, // FormData จะ set Content-Type อัตโนมัติ
    }).then(handleResponse),

  getMyShop: () =>
    fetch(`${API_BASE}/my-shop`, { 
      headers: authHeaders(),
      credentials: "include"
    }).then(handleResponse),

  updateMyShop: (data) =>
    fetch(`${API_BASE}/my-shop`, {
      method: "PATCH",
      headers: authHeaders(),
      credentials: "include",
      body: JSON.stringify(data),
    }).then(handleResponse),

  checkUpgradeEligibility: () =>
    fetch(`${API_BASE}/my-shop/upgrade/check`, { 
      headers: authHeaders(),
      credentials: "include"
    }).then(handleResponse),

submitUpgrade: (formData) =>
    fetch(`${API_BASE}/my-shop/upgrade`, {
      method: "POST",
      headers: {
        "Accept": "application/json", // 👈 เพิ่มบรรทัดนี้เข้าไปครับ สำคัญมาก!
        ...(localStorage.getItem("user_token") && { 
          Authorization: `Bearer ${localStorage.getItem("user_token")}` 
        })
      },
      credentials: "include",
      body: formData,
    }).then(handleResponse),

  logout: () =>
    fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: authHeaders(),
      credentials: "include",
    }).then(handleResponse),
};

function normalizeUser(raw) {
  if (!raw) return null;
  return {
    ...raw,
    role: raw.role === "ADMIN" ? "admin" : raw.has_shop ? "shop" : "user",
  };
}

// current_tier จาก schema: TIER_1, TIER_2, TIER_3
function tierOf(shop) {
  if (!shop) return 1;
  if (shop.current_tier === "TIER_3") return 3;
  if (shop.current_tier === "TIER_2") return 2;
  return 1;
}

const ITEMS_PER_PAGE = 8;
// cooldown 30 วัน ตรงกับ backend UpgradeService
const COOLDOWN_DAYS = 30;

function useShopSearch({ query, category, page, tierFilter = "all", showClosed = false, featuredOnly = false }) {
  const [state, setState] = useState({
    items: [], totalItems: 0, totalPages: 1, currentPage: 1, loading: true, error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState(s => ({ ...s, loading: true, error: null }));

    const run = async () => {
      try {
        let data;
        if (featuredOnly) {
          data = await api.getFeaturedShops();
          const items = Array.isArray(data) ? data : (data.data ?? []);
          if (!cancelled) setState({ items, totalItems: items.length, totalPages: 1, currentPage: 1, loading: false, error: null });
          return;
        }
        const params = {
          q: query || "", tier: tierFilter || "all",
          page: page || 1, per_page: ITEMS_PER_PAGE,
          show_closed: showClosed ? 1 : 0,
        };
        if (category && category !== "ทั้งหมด") params.category = category;
        data = await api.searchShops(params);
        const items       = data.data        ?? [];
        const totalItems  = data.total       ?? items.length;
        const totalPages  = data.last_page   ?? 1;
        const currentPage = data.current_page ?? page;
        if (!cancelled) setState({ items, totalItems, totalPages, currentPage, loading: false, error: null });
      } catch (err) {
        if (!cancelled) setState(s => ({ ...s, loading: false, error: err.message }));
      }
    };

    const timer = setTimeout(run, query ? 300 : 0);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [query, category, page, tierFilter, showClosed, featuredOnly]);

  return state;
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700;800&family=Mitr:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #faf8f5; --surface: #ffffff; --surface2: #f5f2ed;
    --border: #e8e2d9; --border2: #d5cdc0;
    --accent: #e85d26; --accent2: #c94d1a;
    --accent-light: #fef3ee; --accent-glow: rgba(232,93,38,0.12);
    --green: #1a9e5e; --green-light: #edfaf3;
    --yellow: #d97706; --yellow-light: #fffbeb;
    --blue: #2563eb; --blue-light: #eff6ff;
    --red: #dc2626; --red-light: #fef2f2;
    --text: #1a1410; --text2: #5c4f42; --text3: #9c8c7c;
    --shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
    --shadow-md: 0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04);
    --shadow-lg: 0 8px 40px rgba(0,0,0,0.12);
    --font: 'Sarabun', sans-serif; --display: 'Mitr', sans-serif;
    --radius: 12px; --radius-sm: 8px;
    --navbar-bg: rgba(250,248,245,0.92);
  }
  [data-theme="dark"] {
    --bg: #0f0e0c; --surface: #1a1815; --surface2: #242220;
    --border: #2e2c28; --border2: #3a3834;
    --accent: #f97316; --accent2: #ea6b10;
    --accent-light: rgba(249,115,22,0.12); --accent-glow: rgba(249,115,22,0.18);
    --green: #22c55e; --green-light: rgba(34,197,94,0.1);
    --yellow: #fbbf24; --yellow-light: rgba(251,191,36,0.1);
    --blue: #60a5fa; --blue-light: rgba(96,165,250,0.1);
    --red: #f87171; --red-light: rgba(248,113,113,0.1);
    --text: #f0ede8; --text2: #b0a898; --text3: #6e6558;
    --shadow: 0 1px 3px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2);
    --shadow-md: 0 4px 20px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.2);
    --shadow-lg: 0 8px 40px rgba(0,0,0,0.6);
    --navbar-bg: rgba(15,14,12,0.92);
  }
  [data-theme="dark"] .badge-tier2 { background: rgba(59,91,219,0.2); color: #93a8f4; border-color: rgba(59,91,219,0.3); }
  [data-theme="dark"] .badge-tier3 { background: rgba(180,83,9,0.2); color: #fbbf24; border-color: rgba(180,83,9,0.3); }
  [data-theme="dark"] .alert-warn { background: rgba(251,191,36,0.1); color: #fde68a; border-color: rgba(251,191,36,0.2); }
  [data-theme="dark"] .alert-success { background: rgba(34,197,94,0.1); color: #86efac; border-color: rgba(34,197,94,0.2); }
  [data-theme="dark"] .alert-error { background: rgba(248,113,113,0.1); color: #fca5a5; border-color: rgba(248,113,113,0.2); }
  [data-theme="dark"] .alert-info { background: rgba(96,165,250,0.1); color: #93c5fd; border-color: rgba(96,165,250,0.2); }
  [data-theme="dark"] .google-btn { background: #2a2826; color: #f0ede8; border-color: #3a3834; }
  [data-theme="dark"] .google-btn:hover { background: #333130; }
  .theme-toggle { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--surface2); border: 1.5px solid var(--border2); cursor: pointer; font-size: 16px; transition: all 0.2s; flex-shrink: 0; }
  .theme-toggle:hover { background: var(--border); transform: rotate(15deg); }
  html, body { height: 100%; background: var(--bg); color: var(--text); font-family: var(--font); font-size: 15px; line-height: 1.6; transition: background 0.2s, color 0.2s; }
  .navbar { position: sticky; top: 0; z-index: 50; background: var(--navbar-bg); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); padding: 0 24px; height: 60px; display: flex; align-items: center; justify-content: space-between; }
  .nav-brand { font-family: var(--display); font-size: 20px; font-weight: 600; color: var(--accent); cursor: pointer; letter-spacing: -0.02em; }
  .nav-brand span { color: var(--text); }
  .nav-right { display: flex; align-items: center; gap: 10px; }
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
  .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 100px; font-size: 12px; font-weight: 700; }
  .badge-tier1 { background: var(--surface2); color: var(--text3); border: 1px solid var(--border2); }
  .badge-tier2 { background: #e8f0fe; color: #3b5bdb; border: 1px solid #c5d2f6; }
  .badge-tier3 { background: linear-gradient(135deg, #fff7e6, #ffecd2); color: #b45309; border: 1px solid #f6d860; }
  .badge-green { background: var(--green-light); color: var(--green); }
  .badge-red { background: var(--red-light); color: var(--red); }
  .badge-yellow { background: var(--yellow-light); color: var(--yellow); }
  .badge-gray { background: var(--surface2); color: var(--text3); }
  .badge-role-visitor { background: var(--surface2); color: var(--text3); border: 1px solid var(--border2); }
  .badge-role-user    { background: var(--blue-light); color: var(--blue); border: 1px solid rgba(37,99,235,0.2); }
  .badge-role-shop    { background: var(--accent-light); color: var(--accent); border: 1px solid rgba(232,93,38,0.2); }
  .badge-role-admin   { background: var(--red-light); color: var(--red); border: 1px solid rgba(220,38,38,0.2); }
  .input { background: var(--surface); border: 1.5px solid var(--border2); color: var(--text); border-radius: var(--radius-sm); padding: 10px 14px; font-size: 14px; font-family: var(--font); outline: none; transition: border-color 0.18s; width: 100%; }
  .input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }
  .textarea { resize: vertical; min-height: 90px; }
  .form-group { margin-bottom: 16px; }
  .form-label { display: block; font-size: 13px; font-weight: 700; color: var(--text2); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.04em; }
  .form-hint { font-size: 12px; color: var(--text3); margin-top: 5px; }
  .upload-zone { border: 2px dashed var(--border2); border-radius: var(--radius); padding: 28px; text-align: center; cursor: pointer; transition: all 0.18s; background: var(--surface2); }
  .upload-zone:hover, .upload-zone.dragover { border-color: var(--accent); background: var(--accent-light); }
  .upload-zone.filled { border-color: var(--green); background: var(--green-light); border-style: solid; }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(4px); animation: fadeIn 0.15s ease; padding: 20px; }
  .modal { background: var(--surface); border-radius: 20px; width: 100%; max-width: 520px; max-height: 88vh; overflow-y: auto; box-shadow: var(--shadow-lg); animation: slideUp 0.22s ease; }
  .modal-wide { max-width: 640px; }
  .modal-header { padding: 22px 24px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
  .modal-header h3 { font-family: var(--display); font-size: 17px; font-weight: 600; }
  .modal-body { padding: 22px 24px; }
  .modal-footer { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; gap: 8px; justify-content: flex-end; }
  .shop-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 18px; }
  .shop-card { background: var(--surface); border: 1.5px solid var(--border); border-radius: 16px; overflow: hidden; transition: all 0.22s; cursor: pointer; }
  .shop-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); border-color: var(--border2); }
  .shop-card-thumb { height: 120px; display: flex; align-items: center; justify-content: center; font-size: 52px; background: var(--surface2); position: relative; }
  .shop-card-body { padding: 16px; }
  .shop-card-name { font-family: var(--display); font-size: 15px; font-weight: 600; margin-bottom: 4px; }
  .shop-card-desc { font-size: 13px; color: var(--text2); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 12px; }
  .shop-card-meta { display: flex; align-items: center; justify-content: space-between; }
  .tier-badge-abs { position: absolute; top: 10px; right: 10px; }
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
  .section { padding: 0 24px 48px; max-width: 1100px; margin: 0 auto; }
  .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .section-title { font-family: var(--display); font-size: 20px; font-weight: 600; }
  .section-sub { font-size: 13px; color: var(--text3); margin-top: 2px; }
  .category-pills { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }
  .pill { padding: 7px 16px; border-radius: 100px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1.5px solid var(--border2); background: var(--surface); color: var(--text2); transition: all 0.15s; }
  .pill:hover, .pill.active { background: var(--accent); color: #fff; border-color: var(--accent); }
  .shop-detail-hero { background: var(--surface2); border-radius: 20px; padding: 36px; margin-bottom: 24px; display: flex; gap: 28px; align-items: flex-start; }
  .shop-emoji { font-size: 72px; flex-shrink: 0; }
  .shop-detail-info { flex: 1; }
  .shop-detail-name { font-family: var(--display); font-size: 26px; font-weight: 600; margin-bottom: 8px; letter-spacing: -0.02em; }
  .shop-detail-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; align-items: center; }
  .shop-detail-desc { color: var(--text2); font-size: 15px; line-height: 1.7; margin-bottom: 16px; }
  .profile-header { background: var(--surface); border-radius: 20px; padding: 32px; margin-bottom: 20px; display: flex; gap: 24px; align-items: center; box-shadow: var(--shadow); }
  .avatar { width: 72px; height: 72px; border-radius: 50%; background: var(--accent-light); display: flex; align-items: center; justify-content: center; font-size: 28px; flex-shrink: 0; border: 3px solid var(--border); }
  .profile-name { font-family: var(--display); font-size: 22px; font-weight: 600; }
  .profile-email { font-size: 14px; color: var(--text3); margin-top: 2px; }
  .dash-card { background: var(--surface); border: 1.5px solid var(--border); border-radius: 16px; padding: 24px; box-shadow: var(--shadow); }
  .dash-card-title { font-family: var(--display); font-size: 16px; font-weight: 600; margin-bottom: 4px; }
  .dash-card-sub { font-size: 13px; color: var(--text3); margin-bottom: 20px; }
  .stat-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-bottom: 20px; }
  .stat-mini { background: var(--surface2); border-radius: 12px; padding: 16px; text-align: center; }
  .stat-mini-val { font-size: 24px; font-weight: 800; font-family: var(--display); color: var(--text); }
  .stat-mini-label { font-size: 12px; color: var(--text3); margin-top: 2px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
  .history-item { display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border); align-items: flex-start; }
  .history-item:last-child { border-bottom: none; }
  .history-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 6px; flex-shrink: 0; }
  .dot-success { background: var(--green); }
  .dot-fail { background: var(--red); }
  .dot-pending { background: var(--yellow); }
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
  .notification { position: fixed; top: 76px; right: 20px; z-index: 200; background: var(--surface); border: 1.5px solid var(--border2); border-radius: 12px; padding: 14px 18px; min-width: 280px; box-shadow: var(--shadow-lg); animation: slideIn 0.25s ease; display: flex; align-items: center; gap: 10px; font-size: 14px; }
  .notification.success { border-left: 3px solid var(--green); }
  .notification.error { border-left: 3px solid var(--red); }
  .page { min-height: calc(100vh - 60px); }
  .detail-row { display: flex; gap: 12px; padding: 11px 0; border-bottom: 1px solid var(--border); }
  .detail-row:last-child { border-bottom: none; }
  .detail-label { font-size: 12px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.05em; min-width: 130px; padding-top: 2px; }
  .detail-value { font-size: 14px; color: var(--text); flex: 1; }
  .divider { border: none; border-top: 1px solid var(--border); margin: 20px 0; }
  .alert { border-radius: var(--radius-sm); padding: 12px 16px; font-size: 14px; display: flex; gap: 10px; align-items: flex-start; }
  .alert-warn { background: var(--yellow-light); color: #92400e; border: 1px solid #fde68a; }
  .alert-success { background: var(--green-light); color: #065f46; border: 1px solid #a7f3d0; }
  .alert-error { background: var(--red-light); color: #991b1b; border: 1px solid #fecaca; }
  .alert-info { background: var(--blue-light); color: #1e40af; border: 1px solid #bfdbfe; }
  .google-btn { width: 100%; padding: 13px; background: #fff; color: #333; border: 1.5px solid #dadce0; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.15s; font-family: var(--font); box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
  .google-btn:hover { background: #f8f9fa; box-shadow: 0 2px 8px rgba(0,0,0,0.12); }
  .pagination-wrap { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 36px; padding-bottom: 8px; }
  .page-btn { min-width: 38px; height: 38px; padding: 0 8px; border-radius: 9px; font-size: 14px; font-weight: 700; cursor: pointer; border: 1.5px solid var(--border2); background: var(--surface); color: var(--text2); transition: all 0.15s; font-family: var(--font); display: flex; align-items: center; justify-content: center; }
  .page-btn:hover:not(:disabled) { background: var(--surface2); }
  .page-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }
  .page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .page-dots { color: var(--text3); font-size: 14px; padding: 0 4px; }
  @keyframes shimmer { 0% { background-position: -400px 0 } 100% { background-position: 400px 0 } }
  .skeleton-card { pointer-events: none; }
  .skeleton-thumb { height: 120px; background: linear-gradient(90deg, var(--surface2) 25%, var(--border) 50%, var(--surface2) 75%); background-size: 400px 100%; animation: shimmer 1.4s infinite linear; }
  .skeleton-body { padding: 16px; display: flex; flex-direction: column; gap: 10px; }
  .skeleton-line { height: 13px; border-radius: 6px; background: linear-gradient(90deg, var(--surface2) 25%, var(--border) 50%, var(--surface2) 75%); background-size: 400px 100%; animation: shimmer 1.4s infinite linear; }
  @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
  @keyframes slideUp { from { transform: translateY(14px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
  @keyframes slideIn { from { transform: translateX(16px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
  .nav-center { display: flex; align-items: center; gap: 4px; }
  .nav-tab { padding: 7px 14px; border-radius: 8px; font-size: 13.5px; font-weight: 600; cursor: pointer; border: 1.5px solid transparent; background: transparent; color: var(--text2); font-family: var(--font); transition: all 0.15s; }
  .nav-tab:hover { background: var(--surface2); color: var(--text); }
  .nav-tab.active { background: var(--accent-light); color: var(--accent); border-color: rgba(232,93,38,0.2); }
  .shop-card-muted { opacity: 0.72; }
  .shop-card-muted:hover { opacity: 1; }
  select.input { cursor: pointer; }
  @media (max-width: 640px) {
    .hero-title { font-size: 28px; }
    .shop-detail-hero { flex-direction: column; gap: 16px; }
    .stat-row { grid-template-columns: repeat(2, 1fr); }
    .navbar { padding: 0 16px; }
    .section { padding: 0 16px 40px; }
    .nav-center { display: none; }
  }
`;

// ── Helpers ──────────────────────────────────────────────────
function TierBadge({ tier }) {
  const map = { 1:["badge-tier1","⚪ ขั้น 1"], 2:["badge-tier2","🔵 ขั้น 2"], 3:["badge-tier3","🥇 ขั้น 3"] };
  const [cls, label] = map[tier] || map[1];
  return <span className={`badge ${cls}`}>{label}</span>;
}

function RoleBadge({ role }) {
  const map = {
    visitor: ["badge-role-visitor","👁️ ผู้เยี่ยมชม"],
    user:    ["badge-role-user",   "👤 ผู้ใช้"],
    shop:    ["badge-role-shop",   "🏪 ร้านค้า"],
    admin:   ["badge-role-admin",  "🔑 แอดมิน"],
  };
  const [cls, label] = map[role] || map["visitor"];
  return <span className={`badge ${cls}`}>{label}</span>;
}

function Notification({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return <div className={`notification ${type}`}><span>{type==="success"?"✓":"✕"}</span><span>{msg}</span></div>;
}

function Modal({ title, onClose, children, footer, wide }) {
  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className={`modal ${wide?"modal-wide":""}`}>
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

function Pagination({ currentPage, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage-1); i <= Math.min(totalPages-1, currentPage+1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };
  return (
    <div className="pagination-wrap">
      <button className="page-btn" onClick={() => onChange(currentPage-1)} disabled={currentPage===1}>‹</button>
      {getPages().map((p,i) =>
        p==="..." ? <span key={`d${i}`} className="page-dots">···</span> :
        <button key={p} className={`page-btn ${p===currentPage?"active":""}`} onClick={() => onChange(p)}>{p}</button>
      )}
      <button className="page-btn" onClick={() => onChange(currentPage+1)} disabled={currentPage===totalPages}>›</button>
    </div>
  );
}

// ShopCard — ใช้ tierOf() ที่แก้แล้ว (current_tier)
function ShopCard({ shop, onNavigate }) {
  const isBad = shop.is_blacklist || !shop.is_active;
  const tier  = tierOf(shop);
  return (
    <div className={`shop-card ${isBad?"shop-card-muted":""}`} onClick={() => onNavigate("shop-detail", shop)}>
      <div className="shop-card-thumb">
        {shop.img_emoji ?? "🏪"}
        <div className="tier-badge-abs">
          {shop.is_blacklist
            ? <span className="badge badge-red">⛔ Blacklist</span>
            : !shop.is_active
              ? <span className="badge badge-gray">🔒 ปิดแล้ว</span>
              : <TierBadge tier={tier} />}
        </div>
      </div>
      <div className="shop-card-body">
        <div className="shop-card-name" style={isBad?{color:"var(--text3)"}:{}}>{shop.name}</div>
        <div className="shop-card-desc">{shop.description}</div>
        <div className="shop-card-meta">
          <span style={{fontSize:13,color:"var(--yellow)",fontWeight:700}}>⭐ {shop.rating??"-"}</span>
          <span style={{fontSize:12,color:"var(--text3)"}}>📍 {(shop.location??"").split(",")[0]}</span>
        </div>
      </div>
    </div>
  );
}

function SkeletonGrid({ count = 8 }) {
  return (
    <div className="shop-grid">
      {Array.from({ length: count }).map((_,i) => (
        <div key={i} className="shop-card skeleton-card">
          <div className="skeleton-thumb" />
          <div className="skeleton-body">
            <div className="skeleton-line" style={{width:"70%"}} />
            <div className="skeleton-line" style={{width:"90%"}} />
            <div className="skeleton-line" style={{width:"50%"}} />
          </div>
        </div>
      ))}
    </div>
  );
}



// 👇 เพิ่ม onLoginClick เข้ามาในวงเล็บ
function Navbar({ user, onNavigate, darkMode, toggleDark, currentPage, onLoginClick }) {

  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={() => onNavigate("home")}>my<span>Order</span></div>
      <div className="nav-center">
        <button className={`nav-tab ${currentPage==="home"?"active":""}`} onClick={() => onNavigate("home")}>🏠 หน้าหลัก</button>
        <button className={`nav-tab ${currentPage==="shop-list"?"active":""}`} onClick={() => onNavigate("shop-list")}>🏪 ร้านค้าทั้งหมด</button>
        <button className={`nav-tab ${currentPage==="about"?"active":""}`} onClick={() => onNavigate("about")}>ℹ️ เกี่ยวกับ</button>
      </div>
      <div className="nav-right">
        {user && (
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("profile")}>
            {user.role==="admin"?"🔑":user.role==="shop"?"🏪":"👤"} {user.name?.split(" ")[0]}
          </button>
        )}
        {(!user || user.role!=="admin") && (
          <button className="btn btn-outline btn-sm" onClick={() => onNavigate("myshop")}>🏪 ร้านของฉัน</button>
        )}
        {!user && (
          <button className="btn btn-primary btn-sm" onClick={onLoginClick}>เข้าสู่ระบบ</button>
        )}
        <button className="theme-toggle" onClick={toggleDark}>{darkMode?"☀️":"🌙"}</button>
      </div>
    </nav>
  );
}



// ── HomePage ─────────────────────────────────────────────────
function HomePage({ onNavigate }) {
  const [inputVal, setInputVal] = useState("");
  const [query, setQuery]       = useState("");
  const [category, setCategory] = useState("ทั้งหมด");
  const [searchPage, setSearchPage] = useState(1);
  const categories = ["ทั้งหมด","อาหาร","ขนม","เครื่องดื่ม"];
  const isSearching = query !== "" || category !== "ทั้งหมด";

  const { items: featured, loading: loadFeatured } = useShopSearch({ query:"", category:"ทั้งหมด", page:1, featuredOnly:true });
  const { items: results, totalItems, totalPages, currentPage, loading: loadSearch } = useShopSearch({
    query, category, page: searchPage, tierFilter:"all", showClosed:true,
  });

  const handleSearch = () => { setQuery(inputVal); setSearchPage(1); };
  const handleClearSearch = () => { setInputVal(""); setQuery(""); setCategory("ทั้งหมด"); setSearchPage(1); };

  return (
    <div className="page">
      <div className="hero">
        <h1 className="hero-title">ค้นหาร้านค้าที่คุณ<span>ไว้วางใจ</span></h1>
        <p className="hero-sub">ค้นหาร้านค้าที่ผ่านการยืนยันตัวตนแล้ว ปลอดภัย มั่นใจ</p>
        <div className="search-box">
          <input className="search-input" placeholder="พิมพ์ชื่อร้าน..." value={inputVal} onChange={e=>setInputVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSearch()} />
          {isSearching && <button onClick={handleClearSearch} style={{padding:"0 14px",background:"transparent",border:"none",cursor:"pointer",color:"var(--text3)",fontSize:18}}>✕</button>}
          <button className="search-btn" onClick={handleSearch}>🔍</button>
        </div>
      </div>
      <div className="section home-results">
        {isSearching && (
          <div className="category-pills">
            {categories.map(c => <button key={c} className={`pill ${category===c?"active":""}`} onClick={() => { setCategory(c); setSearchPage(1); }}>{c}</button>)}
          </div>
        )}
        <div className="section-header">
          <div>
            <div className="section-title">{isSearching?`ผลการค้นหา "${query||"ทุกร้าน"}"` : "⭐ ร้านค้าแนะนำ"}</div>
            <div className="section-sub">{isSearching ? (loadSearch?"กำลังโหลด...":`พบ ${totalItems} ร้านค้า · หน้า ${currentPage} / ${totalPages}`) : "คัดสรรจากร้านที่มีคะแนนสูง"}</div>
          </div>
          {isSearching && <button className="btn btn-ghost btn-sm" onClick={handleClearSearch}>✕ ล้าง</button>}
        </div>
        {isSearching
          ? loadSearch ? <SkeletonGrid count={ITEMS_PER_PAGE} />
            : results.length===0 ? (
              <div style={{textAlign:"center",padding:"60px 20px",color:"var(--text3)"}}>
                <div style={{fontSize:40,marginBottom:12}}>🔍</div>
                <p>ไม่พบร้านค้าที่ตรงกับการค้นหา</p>
                <button className="btn btn-ghost btn-sm" style={{marginTop:16}} onClick={handleClearSearch}>กลับร้านแนะนำ</button>
              </div>
            ) : (
              <>
                <div className="shop-grid">{results.map((s,i) => <ShopCard key={s.ref_id??i} shop={s} onNavigate={onNavigate} />)}</div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onChange={p => { setSearchPage(p); document.querySelector(".home-results")?.scrollIntoView({ behavior:"smooth", block:"start" }); }} />
              </>
            )
          : loadFeatured ? <SkeletonGrid count={10} />
          : <div className="shop-grid">{featured.map((s,i) => <ShopCard key={s.ref_id??i} shop={s} onNavigate={onNavigate} />)}</div>
        }
      </div>
    </div>
  );
}

// ── ShopListPage ─────────────────────────────────────────────
function ShopListPage({ onNavigate }) {
  const [inputVal, setInputVal] = useState("");
  const [query, setQuery]       = useState("");
  const [category, setCategory] = useState("ทั้งหมด");
  const [tierFilter, setTierFilter] = useState("all");
  const [showClosed, setShowClosed] = useState(false);
  const [page, setPage] = useState(1);
  const categories = ["ทั้งหมด","อาหาร","ขนม","เครื่องดื่ม"];
  const tierFilters = [
    {val:"all",label:"ทุกร้าน"},{val:"tier1+",label:"⚪ ขั้น 1+"},{val:"tier2+",label:"🔵 ขั้น 2+"},
    {val:"tier3",label:"🥇 ขั้น 3"},{val:"blacklist",label:"⛔ Blacklist"},
  ];
  const { items, totalItems, totalPages, currentPage, loading, error } = useShopSearch({ query, category, page, tierFilter, showClosed });

  return (
    <div className="page">
      <div style={{background:"var(--surface)",borderBottom:"1px solid var(--border)",padding:"16px 24px"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div className="search-box" style={{marginBottom:14,maxWidth:"100%"}}>
            <input className="search-input" placeholder="ค้นหาชื่อร้านค้า..." value={inputVal} onChange={e=>setInputVal(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){setQuery(inputVal);setPage(1);}}} />
            <button className="search-btn" onClick={()=>{setQuery(inputVal);setPage(1);}}>🔍</button>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
            <span style={{fontSize:12,color:"var(--text3)",fontWeight:700,marginRight:4}}>หมวดหมู่:</span>
            {categories.map(c => <button key={c} className={`pill ${category===c?"active":""}`} style={{padding:"5px 12px",fontSize:12}} onClick={()=>{setCategory(c);setPage(1);}}>{c}</button>)}
            <div style={{width:1,height:20,background:"var(--border2)",margin:"0 4px"}} />
            <span style={{fontSize:12,color:"var(--text3)",fontWeight:700,marginRight:4}}>ระดับ:</span>
            {tierFilters.map(f => <button key={f.val} className={`pill ${tierFilter===f.val?"active":""}`} style={{padding:"5px 12px",fontSize:12}} onClick={()=>{setTierFilter(f.val);setPage(1);}}>{f.label}</button>)}
            <div style={{width:1,height:20,background:"var(--border2)",margin:"0 4px"}} />
            <button className={`pill ${showClosed?"active":""}`} style={{padding:"5px 12px",fontSize:12}} onClick={()=>{setShowClosed(v=>!v);setPage(1);}}>🔒 รวมร้านปิด</button>
          </div>
        </div>
      </div>
      <div className="section" style={{paddingTop:24}}>
        <div className="section-header">
          <div>
            <div className="section-title">รายการร้านค้า</div>
            <div className="section-sub">{loading?"กำลังโหลด...":`พบ ${totalItems} ร้านค้า · หน้า ${currentPage} / ${totalPages}`}</div>
          </div>
        </div>
        {error && <div style={{padding:20,color:"var(--red)",background:"var(--red-light)",borderRadius:12,marginBottom:20}}>⚠️ {error}</div>}
        {loading ? <SkeletonGrid /> : items.length===0
          ? <div style={{textAlign:"center",padding:"60px 20px",color:"var(--text3)"}}><div style={{fontSize:40,marginBottom:12}}>🔍</div><p>ไม่พบร้านค้า</p></div>
          : <>
              <div className="shop-grid">{items.map((s,i) => <ShopCard key={s.ref_id??i} shop={s} onNavigate={onNavigate} />)}</div>
              <Pagination currentPage={currentPage} totalPages={totalPages} onChange={p=>{setPage(p);window.scrollTo({top:0,behavior:"smooth"});}} />
            </>
        }
      </div>
    </div>
  );
}

// ── UpgradeCooldownBanner — cooldown 30 วัน ──────────────────
function UpgradeCooldownBanner({ shopRefId }) {
  const [status, setStatus]   = useState("loading");
  const [daysLeft, setDaysLeft] = useState(0);
  const [lastRejectedDate, setLastRejectedDate] = useState(null);

  useEffect(() => {
    if (!shopRefId) return;
    api.getShopUpgradeRequests(shopRefId)
      .then(data => {
        const list = Array.isArray(data) ? data : (data.data ?? []);
        const rejected = list
          .filter(r => r.status==="rejected")
          .sort((a,b) => new Date(b.updated_at) - new Date(a.updated_at));

        if (rejected.length===0) { setStatus("ok"); return; }

        const latest     = rejected[0];
        const rejectedAt = new Date(latest.updated_at || latest.created_at);
        const diffDays   = Math.floor((new Date() - rejectedAt) / 86400000);
        // COOLDOWN_DAYS = 30 วัน ตรงกับ backend
        const left       = COOLDOWN_DAYS - diffDays;

        setLastRejectedDate(rejectedAt.toLocaleDateString("th-TH", { day:"numeric", month:"long", year:"numeric" }));

        if (left > 0) { setDaysLeft(left); setStatus("in_cooldown"); }
        else { setStatus("ok"); }
      })
      .catch(() => setStatus("error"));
  }, [shopRefId]);

  if (status==="loading") return <div className="alert alert-info" style={{marginTop:12}}>⏳ กำลังตรวจสอบสถานะ...</div>;
  if (status==="error" || status==="ok") return null;

  return (
    <div className="alert alert-error" style={{marginTop:12,flexDirection:"column",alignItems:"flex-start",gap:6}}>
      <div style={{fontWeight:700,fontSize:14}}>⏳ ร้านนี้อยู่ในช่วง Cooldown การขอเลื่อนขั้น</div>
      <div style={{fontSize:13,lineHeight:1.7}}>
        คำขอเลื่อนขั้นถูกปฏิเสธครบ 3 ครั้งแล้ว<br/>
        {lastRejectedDate && <>ครั้งล่าสุดถูกปฏิเสธเมื่อ: <strong>{lastRejectedDate}</strong><br/></>}
        ต้องรออีก <strong>{daysLeft} วัน</strong> ({COOLDOWN_DAYS} วันนับจากครั้งล่าสุด)
      </div>
    </div>
  );
}

// ── ShopDetailPage ───────────────────────────────────────────
// ── ShopDetailPage ───────────────────────────────────────────
function ShopDetailPage({ shop: initialShop, user, onNavigate, notify }) {
  const [shop, setShop]         = useState(initialShop);
  const [shopLoading, setShopLoading] = useState(true);
  const refId = initialShop?.ref_id ?? initialShop?.id;

  useEffect(() => {
    if (!refId) { setShopLoading(false); return; }
    api.getShopDetail(refId)
      .then(res => { 
        const actualShopData = res.data ? res.data : res;
        setShop(actualShopData); 
        setShopLoading(false); 
      })
      .catch(() => setShopLoading(false));
  }, [refId]);

  const [showClaim, setShowClaim] = useState(false);
  const [claim, setClaim] = useState({ fraud_type_id:"", reason:"", contact_info:"" });
  const [claimAttachments, setClaimAttachments] = useState([{ id:Date.now(), file:null }]);
  const [sending, setSending] = useState(false);

  const canClaim = user !== null;

  const addClaimAtt    = () => setClaimAttachments(p => [...p, { id:Date.now(), file:null }]);
  const removeClaimAtt = (id) => setClaimAttachments(p => p.filter(a => a.id!==id));
  const updateClaimAtt = (id, file) => setClaimAttachments(p => p.map(a => a.id===id ? {...a,file} : a));
  const resetClaim     = () => { setClaim({ fraud_type_id:"", reason:"", contact_info:"" }); setClaimAttachments([{ id:Date.now(), file:null }]); };

  const handleClaim = async () => {
    if (!claim.fraud_type_id || !claim.reason || !claim.contact_info) return;
    setSending(true);
    try {
      const fd = new FormData();
      fd.append("fraud_type_id", claim.fraud_type_id);
      fd.append("reason", claim.reason);
      fd.append("contact_info", claim.contact_info);
      claimAttachments.filter(a => a.file).forEach(a => fd.append("attachments[]", a.file));
      await api.claimShop(shop.ref_id ?? shop.id, fd);
      setShowClaim(false);
      notify("ส่งเรื่องเคลมเรียบร้อยแล้ว ทีมงานจะติดต่อกลับ","success");
      resetClaim();
    } catch(e) {
      notify("ส่งเคลมไม่สำเร็จ: "+e.message,"error");
    } finally { setSending(false); }
  };

  if (shopLoading) return <div className="page"><div className="section" style={{paddingTop:24}}><SkeletonGrid count={1} /></div></div>;
  if (!shop) return null;

  const tier        = tierOf(shop);
  const isClosed    = !shop.is_active;
  const isBlacklist = shop.is_blacklist;
  const failedCount = shop.failed_upgrade_count ?? 0;
  const shopRefId   = shop.ref_id ?? shop.id;
  const tierDesc = {
    1:"ร้านค้าทั่วไป ยังไม่ได้ยืนยันตัวตน",
    2:"ยืนยันตัวตนระดับเอกสาร",
    3:"ยืนยันตัวตนสูงสุด", // ลบคำว่า myOrder ออกแล้ว
  };

  return (
    <div className="page">
      <div className="section" style={{paddingTop:24}}>
        <button className="btn btn-ghost btn-sm" style={{marginBottom:16}} onClick={() => onNavigate("home")}>← กลับ</button>

        <div className="shop-detail-hero">
          <div className="shop-emoji">{shop.img_emoji??"🏪"}</div>
          <div className="shop-detail-info">
            <div className="shop-detail-name">{shop.name}</div>
            <div className="shop-detail-meta">
              <TierBadge tier={tier} />
              <span className="badge badge-gray">{shop.category ?? shop.channel ?? "ไม่ระบุ"}</span>
              <span className="badge" style={{background:shop.is_company?"#ede9fe":"#fce7f3",color:shop.is_company?"#6d28d9":"#be185d",border:`1px solid ${shop.is_company?"#c4b5fd":"#fbcfe8"}`}}>
                {shop.is_company?"🏢 นิติบุคคล":"👤 บุคคลธรรมดา"}
              </span>
            </div>
            {/* ดักค่า description กรณี API ไม่ส่งมา */}
            {shop.description && <p className="shop-detail-desc">{shop.description}</p>}

            <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:8}}>
              {!isClosed && !isBlacklist && (shop.url || shop.link) && (
                <a href={shop.url??shop.link} className="btn btn-primary" target="_blank" rel="noreferrer">🔗 ติดต่อร้านค้า</a>
              )}
              <button className="btn btn-outline" style={{borderColor:"var(--blue)",color:"var(--blue)"}} onClick={() => {
                if (!canClaim) { notify("กรุณาเข้าสู่ระบบก่อนยื่นเรื่องเคลม","error"); return; }
                setShowClaim(true);
              }}>
                ⚖️ เคลมปัญหา
                {!canClaim && <span style={{fontSize:11,marginLeft:4,opacity:0.7}}>(ต้องล็อกอิน)</span>}
              </button>
            </div>

            {isClosed    && <div className="alert alert-warn"  style={{marginTop:4}}>🔒 ร้านนี้ปิดบริการแล้ว</div>}
            {isBlacklist && <div className="alert alert-error" style={{marginTop:4}}>⛔ ร้านนี้ถูกระงับจากระบบ</div>}
            {failedCount >= 3 && <UpgradeCooldownBanner shopRefId={shopRefId} />}
          </div>
        </div>

        <div className="dash-card" style={{marginBottom:16}}>
          <div className="dash-card-title">ระดับการยืนยันตัวตน</div>
          <div className="dash-card-sub">ระดับความน่าเชื่อถือของร้านค้านี้</div>
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            {[1,2,3].map(t => (
              <div key={t} style={{flex:1,minWidth:160,padding:"14px 16px",background:t===tier?"var(--accent-light)":"var(--surface2)",border:`1.5px solid ${t===tier?"var(--accent)":"var(--border)"}`,borderRadius:12}}>
                <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
                  <TierBadge tier={t} />
                  {t===tier && <span style={{fontSize:11,background:"var(--accent)",color:"#fff",padding:"1px 7px",borderRadius:100,fontWeight:700}}>ปัจจุบัน</span>}
                </div>
                <div style={{fontSize:13,color:"var(--text2)"}}>{tierDesc[t]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-card">
          {/* เพิ่มฟิลด์ สร้างเมื่อ */}
          <div className="detail-row"><div className="detail-label">📅 สร้างเมื่อ</div><div className="detail-value">{shop.created_at ?? "—"}</div></div>
          {/* ดักค่า location เป็น — ถ้าไม่มีข้อมูล */}
          <div className="detail-row"><div className="detail-label">📍 ที่อยู่</div><div className="detail-value">{shop.location ?? "—"}</div></div>
          <div className="detail-row"><div className="detail-label">👤 ประเภท</div><div className="detail-value">{shop.is_company ? "นิติบุคคล" : "บุคคลธรรมดา"}</div></div>
          <div className="detail-row">
            <div className="detail-label">🏷️ สถานะ</div>
            <div className="detail-value">
              {isBlacklist ? <span className="badge badge-red">⛔ ถูกระงับ</span>
                : isClosed ? <span className="badge badge-gray">🔒 ปิดบริการ</span>
                : <span className="badge badge-green">✓ เปิดให้บริการ</span>}
            </div>
          </div>
          {/* แสดงข้อมูลลิงก์ให้ถูกต้อง */}
          {!isClosed && !isBlacklist && (shop.url || shop.link) && (
            <div className="detail-row">
              <div className="detail-label">🔗 ลิงก์</div>
              <div className="detail-value">
                <a href={shop.url ?? shop.link} style={{color:"var(--accent)"}} target="_blank" rel="noreferrer">
                  {shop.url ?? shop.link}
                </a>
              </div>
            </div>
          )}
          {failedCount > 0 && (
            <div className="detail-row">
              <div className="detail-label">📊 ขอเลื่อนขั้นไม่ผ่าน</div>
              <div className="detail-value">
                <span style={{color:failedCount>=3?"var(--red)":"var(--yellow)",fontWeight:700}}>{failedCount} / 3 ครั้ง</span>
                {failedCount>=3 && <span style={{marginLeft:8,fontSize:12,color:"var(--text3)"}}>(cooldown {COOLDOWN_DAYS} วัน)</span>}
              </div>
            </div>
          )}
        </div>
      </div>

      {showClaim && (
        <Modal title="⚖️ เคลมปัญหากับร้านค้า" onClose={() => { setShowClaim(false); resetClaim(); }} wide
          footer={<>
            <button className="btn btn-ghost btn-sm" onClick={() => { setShowClaim(false); resetClaim(); }}>ยกเลิก</button>
            <button className="btn btn-primary btn-sm" onClick={handleClaim} disabled={!claim.fraud_type_id||!claim.reason||!claim.contact_info||sending}>
              {sending?"กำลังส่ง...":"ส่งเรื่องเคลม"}
            </button>
          </>}>
          <div className="alert alert-info" style={{marginBottom:16}}>💬 ระบุช่องทางติดต่อกลับ ทีมงานจะช่วยประสานงานให้</div>
          <div className="form-group">
            <label className="form-label">ประเภทปัญหา *</label>
            <select className="input" value={claim.fraud_type_id} onChange={e=>setClaim(p=>({...p,fraud_type_id:e.target.value}))}>
              <option value="">-- เลือกประเภท --</option>
              <option value="1">สินค้าไม่ตรงรูป</option>
              <option value="2">โกงเงิน / ไม่ส่งของ</option>
              <option value="3">ร้านค้าปลอม</option>
              <option value="4">ข้อมูลร้านค้าผิด</option>
              <option value="5">อื่นๆ</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">รายละเอียดปัญหา *</label>
            <textarea className="input textarea" placeholder="อธิบายปัญหาที่ต้องการเคลม..." value={claim.reason} onChange={e=>setClaim(p=>({...p,reason:e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="form-label">ช่องทางติดต่อกลับ *</label>
            <input className="input" placeholder="เช่น LINE: @yourlineid หรือ 081-234-5678" value={claim.contact_info} onChange={e=>setClaim(p=>({...p,contact_info:e.target.value}))} />
          </div>
          <div className="form-group">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <label className="form-label" style={{margin:0}}>แนบหลักฐาน</label>
              <button className="btn btn-ghost btn-sm" onClick={addClaimAtt} style={{color:"var(--accent)",fontSize:13}}>＋ เพิ่มไฟล์</button>
            </div>
            {claimAttachments.map((att,idx) => (
              <div key={att.id} style={{display:"flex",gap:8,marginBottom:8,alignItems:"center",background:"var(--surface2)",padding:"8px 10px",borderRadius:10,border:"1px solid var(--border)"}}>
                <span style={{fontSize:12,color:"var(--text3)",minWidth:20,textAlign:"center",fontWeight:700}}>{idx+1}</span>
                <label className={`btn btn-sm ${att.file?"btn-success":"btn-outline"}`} style={{margin:0,cursor:"pointer",fontSize:12}}>
                  {att.file?"✅ เลือกแล้ว":"📎 เลือกไฟล์"}
                  <input type="file" style={{display:"none"}} accept="image/*,.pdf" onChange={e=>updateClaimAtt(att.id,e.target.files[0])} />
                </label>
                {att.file && <span style={{fontSize:12,color:"var(--text3)",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{att.file.name}</span>}
                {claimAttachments.length > 1 && <button className="btn btn-ghost btn-sm" onClick={() => removeClaimAtt(att.id)} style={{color:"var(--red)",padding:"4px 8px"}}>✕</button>}
              </div>
            ))}
            <div style={{fontSize:12,color:"var(--text3)",marginTop:6}}>PNG, JPG, PDF ขนาดไม่เกิน 10MB</div>
          </div>
        </Modal>
      )}
    </div>
  );
}
function ProfilePage({ user, onNavigate }) {
  const [hasShop, setHasShop] = useState(false);
  const [loadingShop, setLoadingShop] = useState(true);

  useEffect(() => {
    api.getMyShop()
      .then(() => setHasShop(true))
      .catch(() => setHasShop(false))
      .finally(() => setLoadingShop(false));
  }, []);

   return (
    <div className="page">
      <div className="section" style={{paddingTop:28}}>

        {/* Profile Header จากอันที่ 2 */}
        <div className="profile-header">
          <div className="avatar">
            {user.role==="shop" ? "🏪" : user.role==="admin" ? "🔑" : "👤"}
          </div>
          <div style={{flex:1}}>
            <div className="profile-name">{user.name ?? user.display_name}</div>
            <div className="profile-email">{user.email}</div>
            <div style={{marginTop:8, display:"flex", gap:6}}>
              <span className="badge badge-green">✓ เข้าสู่ระบบแล้ว</span>
              <RoleBadge role={user.role} />
            </div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => {
            api.logout().catch(() => {});
            localStorage.clear();
            window.location.reload();
          }}>ออกจากระบบ</button>
        </div>

        {/* Shop Card — ตรวจจาก API จริง */}
        <div className="dash-card">
          <div className="dash-card-title">ร้านค้าของฉัน</div>
          <div className="dash-card-sub">จัดการร้านค้าและดูสถานะการยืนยันตัวตน</div>
          <hr className="divider" />
          {loadingShop
            ? <div className="alert alert-info">⏳ กำลังตรวจสอบ...</div>
            : hasShop
              ? <div>
                  <div className="alert alert-info" style={{marginBottom:16}}>🏪 คุณมีร้านค้าในระบบแล้ว</div>
                  <button className="btn btn-primary" onClick={() => onNavigate("myshop")}>
                    🏪 ดูรายละเอียดร้านค้า →
                  </button>
                </div>
              : <div>
                  <div className="alert alert-info" style={{marginBottom:16}}>💡 คุณยังไม่มีร้านค้าในระบบ</div>
                  <a href="https://line.me/myorder-register" className="btn btn-primary" target="_blank" rel="noreferrer">
                    📩 ติดต่อ myOrder เพื่อลงทะเบียน
                  </a>
                </div>
          }
        </div>

      </div>
    </div>
  );
}
// ── MyShopPage ────────────────────────────────────────────────
function MyShopPage({ user, onNavigate, notify }) {
  const [shop, setShop]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

api.getMyShop()
  .then(res => {
    const data = res.data ? res.data : res;  // unwrap เหมือน ShopDetail
    setShop(data);
    setEditForm({ name: data.name, url: data.url });
    setLoading(false);
  })
  .catch(() => setLoading(false));

  if (user && user.role==="USER" && !shop && !loading) {
    return (
      <div className="page">
        <div className="section" style={{paddingTop:28,maxWidth:640}}>
          <div className="dash-card" style={{textAlign:"center",padding:40}}>
            <div style={{fontSize:56,marginBottom:16}}>🏪</div>
            <h2 style={{fontFamily:"var(--display)",fontSize:20,fontWeight:600,marginBottom:16}}>คุณยังไม่มีร้านค้าในระบบ</h2>
            <a href="https://line.me/myorder-register" className="btn btn-primary btn-lg" target="_blank" rel="noreferrer">📩 ติดต่อ myOrder เพื่อลงทะเบียน</a>
          </div>
        </div>
      </div>
    );
  }

 if (!user || (user.role !== "USER" && user.role !== "ADMIN")) return null;
  if (loading) return <div className="page"><div className="section" style={{paddingTop:28}}><SkeletonGrid count={3} /></div></div>;
  
  // กรณีที่โหลดเสร็จแล้วแต่ไม่พบข้อมูลร้านค้า (ไม่มีร้าน)
  if (!shop) return (
    <div className="page">
      <div className="section" style={{ paddingTop: 28 }}>
        <div className="card" style={{ textAlign: "center", padding: "60px 20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🏪</div>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>คุณยังไม่มีร้านค้าในระบบ</h2>
          <div style={{ color: "var(--text3)", marginBottom: 24, lineHeight: "1.6" }}>
            ดูเหมือนว่าบัญชีของคุณจะยังไม่ได้เปิดใช้งานระบบร้านค้า<br />
            กรุณาติดต่อทีมงาน myOrder เพื่อลงทะเบียนและรับสิทธิ์ใช้งาน
          </div>
          <a 
            href="https://line.me/myorder-register" /* เปลี่ยนเป็น Link ติดต่อแอดมินหรือ LINE OA ของคุณได้เลยครับ */
            target="_blank" 
            rel="noreferrer" 
            className="btn btn-primary"
            style={{ padding: "10px 24px", borderRadius: 100 }}
          >
            💬 ติดต่อ myOrder เพื่อลงทะเบียน
          </a>
        </div>
      </div>
    </div>
  );

  const tier        = tierOf(shop);
  const failedCount = shop.failed_upgrade_count ?? 0;
  const upgradeHistory = shop.upgrade_requests ?? [];

  const handleSave = async () => {
    try {
      const updated = await api.updateMyShop(editForm);
      setShop(updated); setEditing(false);
      notify("บันทึกข้อมูลเรียบร้อย","success");
    } catch(e) { notify("บันทึกไม่สำเร็จ: "+e.message,"error"); }
  };

  const statusBadge = (s) => {
    if (s==="pending")  return <span className="badge badge-yellow">⏳ รอตรวจสอบ</span>;
    if (s==="approved") return <span className="badge badge-green">✓ อนุมัติ</span>;
    return <span className="badge badge-red">✕ ไม่ผ่าน</span>;
  };

  return (
    <div className="page">
      <div className="section" style={{paddingTop:28}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div>
            <h2 style={{fontFamily:"var(--display)",fontSize:22,fontWeight:600}}>รายละเอียดร้านค้าของฉัน</h2>
            <p style={{color:"var(--text3)",fontSize:13}}>จัดการข้อมูลและสถานะร้านค้า</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("profile")}>← กลับ</button>
        </div>

        <div className="stat-row" style={{marginBottom:20}}>
          <div className="stat-mini"><div className="stat-mini-val">{shop.rating??"-"}</div><div className="stat-mini-label">คะแนน</div></div>
          <div className="stat-mini"><div className="stat-mini-val">{shop.orders_count??0}</div><div className="stat-mini-label">ออเดอร์</div></div>
          <div className="stat-mini"><div className="stat-mini-val">ขั้น {tier}</div><div className="stat-mini-label">ระดับ</div></div>
        </div>

        <div className="dash-card" style={{marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
            <div style={{display:"flex",gap:14,alignItems:"center"}}>
              <span style={{fontSize:40}}>{shop.img_emoji??"🏪"}</span>
              <div>
                <div style={{fontFamily:"var(--display)",fontSize:18,fontWeight:600}}>{shop.name}</div>
                <div style={{display:"flex",gap:6,marginTop:4}}><TierBadge tier={tier} /></div>
              </div>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>✏️ แก้ไข</button>
          </div>
          <div className="detail-row"><div className="detail-label">🔗 ลิงก์</div><div className="detail-value"><a href={shop.url} style={{color:"var(--accent)"}} target="_blank" rel="noreferrer">{shop.url}</a></div></div>
          <div className="detail-row"><div className="detail-label">📅 สร้างเมื่อ</div><div className="detail-value" style={{color:"var(--text3)"}}>{shop.created_at?.substring(0,10)}</div></div>
        </div>

        {tier === 1 && (
          <div className="dash-card" style={{marginBottom:16,background:"linear-gradient(135deg,#fff7f5,#fef3ee)",border:"1.5px solid rgba(232,93,38,0.2)"}}>
            <div style={{display:"flex",gap:16,alignItems:"center"}}>
              <div style={{fontSize:36}}>🚀</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"var(--display)",fontSize:16,fontWeight:600,marginBottom:4}}>ขอเลื่อนขั้น 1 → 2</div>
                <p style={{fontSize:13,color:"var(--text2)"}}>
                  ยืนยันตัวตนด้วยเอกสาร เพื่อเพิ่มความน่าเชื่อถือ
                  {failedCount > 0 && <span style={{marginLeft:6,color:"var(--yellow)",fontWeight:700}}>(ไม่ผ่าน {failedCount}/3 ครั้ง)</span>}
                </p>
              </div>
              <button className="btn btn-primary" onClick={() => onNavigate("upgrade")}>ยื่นขอเลื่อนขั้น →</button>
            </div>
          </div>
        )}

        <div className="dash-card">
          <div className="dash-card-title">ประวัติการขอเลื่อนขั้น</div>
          <div className="dash-card-sub">บันทึกคำขอและผลการพิจารณา</div>
          {upgradeHistory.length===0
            ? <p style={{color:"var(--text3)",fontSize:14}}>ยังไม่มีประวัติ</p>
            : upgradeHistory.map((h,i) => (
              <div className="history-item" key={i}>
                <div className={`history-dot ${h.status==="approved"?"dot-success":h.status==="pending"?"dot-pending":"dot-fail"}`} />
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:600}}>คำขอเลื่อนขั้น {statusBadge(h.status)}</div>
                  {h.admin_remark && <div style={{fontSize:13,color:"var(--red)",marginTop:4}}>เหตุผลที่ไม่ผ่าน: {h.admin_remark}</div>}
                  <div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>{h.created_at?.substring(0,10)}</div>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {editing && (
        <Modal title="✏️ แก้ไขรายละเอียดร้านค้า" onClose={() => setEditing(false)}
          footer={<><button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>ยกเลิก</button><button className="btn btn-primary btn-sm" onClick={handleSave}>บันทึก</button></>}>
          <div className="form-group"><label className="form-label">ชื่อร้านค้า</label><input className="input" value={editForm.name} onChange={e=>setEditForm(p=>({...p,name:e.target.value}))} /></div>
          <div className="form-group"><label className="form-label">ลิงก์ติดต่อ</label><input className="input" value={editForm.url} onChange={e=>setEditForm(p=>({...p,url:e.target.value}))} /></div>
        </Modal>
      )}
    </div>
  );
}
// ── UpgradePage ───────────────────────────────────────────────
const WIZARD_STEPS = ["ตรวจสอบ","อัปโหลด","ยืนยัน"];

function UpgradePage({ user, onNavigate, notify }) {
  const [step, setStep]       = useState(0);
  const [checks, setChecks]   = useState({ eligible:null, failed_count:0, days_remaining:0 });
  const [files, setFiles]     = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [entityType, setEntityType] = useState("individual");
  const fileRefs = useRef({});

  if (!user ) {
    return (
      <div className="page">
        <div className="section" style={{paddingTop:40,textAlign:"center"}}>
          <div style={{fontSize:40,marginBottom:12}}>🔒</div>
          <h2 style={{fontFamily:"var(--display)",fontSize:20,marginBottom:12}}>ไม่มีสิทธิ์เข้าถึงหน้านี้</h2>
          <button className="btn btn-primary" onClick={() => onNavigate("home")}>กลับหน้าหลัก</button>
        </div>
      </div>
    );
  }

  const runChecks = async () => {
    try {
      const result = await api.checkUpgradeEligibility();
      setChecks(result);
      const shopData = await api.getMyShop();
      setEntityType(shopData.is_company?"company":"individual");
    } catch(e) {
      setChecks({ eligible:false, failed_count:0, days_remaining:0, error:e.message });
    }
  };

  useEffect(() => { if (step===0) runChecks(); }, [step]);

  const getRequiredDocs = () => entityType==="individual"
    ? [
        { key:"id_card",   label:"สำเนาบัตรประชาชน",       hint:"ถ่ายภาพให้ชัด ครบ 4 มุม" },
        { key:"selfie_id", label:"รูปถ่ายคู่บัตรประชาชน",  hint:"ถือบัตร ถ่ายให้เห็นหน้าและบัตร" },
      ]
    : [
        { key:"vat",        label:"ภพ.20",                        hint:"เอกสารจากกรมสรรพากร" },
        { key:"dir_id",     label:"บัตรประชาชนกรรมการ",           hint:"สำเนาพร้อมเซ็นรับรอง" },
        { key:"selfie_dir", label:"รูปถ่ายกรรมการคู่บัตร",        hint:"กรรมการถือบัตร ถ่ายให้ชัด" },
      ];

  const handleFileChange = (key, file) => setFiles(p => ({...p,[key]:file}));
  const allFilesUploaded = getRequiredDocs().every(d => files[d.key]);

  const handleSubmit = async () => {
    try {
      const fd = new FormData();
      Object.entries(files).forEach(([key,file],idx) => {
        fd.append(`files[${idx}]`, file);
        fd.append(`labels[${idx}]`, key);
      });
      await api.submitUpgrade(fd);
      setSubmitted(true);
      notify("ส่งคำขอเรียบร้อยแล้ว รอแอดมินตรวจสอบ","success");
    } catch(e) { notify("ส่งคำขอไม่สำเร็จ: "+e.message,"error"); }
  };

  return (
    <div className="page">
      <div className="section" style={{paddingTop:28,maxWidth:680}}>
        <button className="btn btn-ghost btn-sm" style={{marginBottom:20}} onClick={() => onNavigate("myshop")}>← กลับ</button>

        {submitted ? (
          <div className="dash-card" style={{textAlign:"center",padding:48}}>
            <div style={{fontSize:56,marginBottom:16}}>✅</div>
            <h2 style={{fontFamily:"var(--display)",fontSize:22,fontWeight:600,marginBottom:8}}>ส่งคำขอเรียบร้อยแล้ว!</h2>
            <p style={{color:"var(--text2)",fontSize:14,marginBottom:24}}>ทีมแอดมินจะตรวจสอบและแจ้งผลภายใน 1–3 วันทำการ</p>
            <button className="btn btn-primary" onClick={() => onNavigate("myshop")}>กลับหน้าร้านค้า</button>
          </div>
        ) : (
          <>
            <h2 style={{fontFamily:"var(--display)",fontSize:22,fontWeight:600,marginBottom:28}}>ยื่นขอเลื่อนขั้น 1 → 2</h2>
            <div className="wizard-steps">
              {WIZARD_STEPS.map((s,i) => (
                <div className="wizard-step" key={s}>
                  <div className={`step-circle ${i<step?"done":i===step?"active":""}`}>{i<step?"✓":i+1}</div>
                  <div className={`step-label ${i<step?"done":i===step?"active":""}`}>{s}</div>
                </div>
              ))}
            </div>

            {step===0 && (
              <div className="dash-card">
                <div className="dash-card-title">ตรวจสอบคุณสมบัติ</div>
                <div className="dash-card-sub">ระบบกำลังตรวจสอบสิทธิ์ก่อนดำเนินการ</div>
                <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
                  {checks.eligible===null && <div className="alert alert-info">⏳ กำลังตรวจสอบ...</div>}
                  {checks.eligible===false && (
                    <div className="alert alert-error">
                      <div>
                        <div style={{fontWeight:700,marginBottom:6}}>✕ ไม่สามารถยื่นขอได้ในขณะนี้</div>
                        <div style={{fontSize:13,lineHeight:1.7}}>
                          {checks.days_remaining>0
                            ? <>ต้องรออีก <strong>{checks.days_remaining} วัน</strong> ก่อนยื่นใหม่ได้</>
                            : checks.error || "กรุณาติดต่อทีมงาน"}
                        </div>
                      </div>
                    </div>
                  )}
                  {checks.eligible===true && checks.failed_count>0 && !checks.was_reset && (
                    <>
                      <div className="alert alert-success">✓ สามารถยื่นขอเลื่อนขั้นได้</div>
                      <div className="alert alert-warn">
                        <div style={{fontSize:13,lineHeight:1.7}}>
                          ⚠️ ขอเลื่อนขั้นไม่ผ่านมาแล้ว <strong>{checks.failed_count} / 3 ครั้ง</strong><br/>
                          หากไม่ผ่านอีก <strong>{3-checks.failed_count} ครั้ง</strong> จะต้องรอ {COOLDOWN_DAYS} วัน
                        </div>
                      </div>
                    </>
                  )}
                  {checks.eligible===true && checks.failed_count===0 && !checks.was_reset && (
                    <div className="alert alert-success">✓ สามารถยื่นขอเลื่อนขั้นได้</div>
                  )}
                  {checks.eligible===true && checks.was_reset && (
                    <>
                      <div className="alert alert-success">✓ ครบกำหนดแล้ว สามารถยื่นขอได้อีกครั้ง</div>
                      <div className="alert alert-info" style={{fontSize:13}}>💡 จำนวนครั้งที่ไม่ผ่านถูก reset เป็น 0 แล้ว</div>
                    </>
                  )}
                </div>
                {checks.eligible!==null && (
                  <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
                    <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("myshop")}>ยกเลิก</button>
                    <button className="btn btn-primary" disabled={!checks.eligible} onClick={() => setStep(1)}>ถัดไป →</button>
                  </div>
                )}
              </div>
            )}

            {step===1 && (
              <div className="dash-card">
                <div className="dash-card-title">ยื่นเอกสาร</div>
                <div className="dash-card-sub">กรุณาอัปโหลดเอกสารให้ครบถ้วน</div>
                <div className="alert alert-info" style={{marginBottom:20}}>💡 เอกสารควรถ่ายให้ชัดเจน ตัวอักษรอ่านออก</div>
                {getRequiredDocs().map(doc => (
                  <div key={doc.key} className="form-group">
                    <label className="form-label">{doc.label} *</label>
                    <div className={`upload-zone ${files[doc.key]?"filled":""}`} onClick={() => {
                      if (!fileRefs.current[doc.key]) fileRefs.current[doc.key] = document.createElement("input");
                      fileRefs.current[doc.key].type="file";
                      fileRefs.current[doc.key].accept="image/*,.pdf";
                      fileRefs.current[doc.key].onchange=e=>handleFileChange(doc.key,e.target.files[0]);
                      fileRefs.current[doc.key].click();
                    }}>
                      <div style={{fontSize:28,marginBottom:8}}>{files[doc.key]?"✅":"📄"}</div>
                      <div style={{fontSize:14,fontWeight:600,color:"var(--text2)"}}>{files[doc.key]?files[doc.key].name:"คลิกเพื่ออัปโหลด"}</div>
                      <div style={{fontSize:12,color:"var(--text3)",marginTop:4}}>{doc.hint}</div>
                    </div>
                  </div>
                ))}
                <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setStep(0)}>← ย้อนกลับ</button>
                  <button className="btn btn-primary" disabled={!allFilesUploaded} onClick={() => setStep(2)}>ถัดไป →</button>
                </div>
              </div>
            )}

            {step===2 && (
              <div className="dash-card">
                <div className="dash-card-title">ยืนยันการส่งคำขอ</div>
                <div style={{marginBottom:20}}>
                  {Object.values(files).map(f => <div key={f.name} style={{fontSize:13,color:"var(--green)",padding:"4px 0"}}>✓ {f.name}</div>)}
                </div>
                <div className="alert alert-warn" style={{marginBottom:20}}>⚠️ เมื่อส่งแล้วจะไม่สามารถแก้ไขเอกสารได้</div>
                <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>← ย้อนกลับ</button>
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

// ── App Shell ─────────────────────────────────────────────────
export default function App() {
  const [page, setPage]         = useState("home");
  const [pageData, setPageData] = useState(null);
  const [notification, setNotification] = useState(null);
  const [homeKey, setHomeKey]   = useState(0);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme")==="dark");
  
  // 👇 สร้าง State จัดการเรื่อง Login แค่ที่นี่ที่เดียว
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user_data")); } catch { return null; }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode?"dark":"light");
    localStorage.setItem("theme", darkMode?"dark":"light");
  }, [darkMode]);

  const notify = (msg, type="success") => setNotification({ msg, type });

  // 👇 ย้าย Google Hook มาไว้ที่ App

  const navigate = (p, data=null) => {
    if (p==="profile" && !user) { notify("กรุณาเข้าสู่ระบบก่อน","error"); return; }
    if (p==="upgrade" && (!user)) { notify("ต้องเป็นเจ้าของร้านค้าเท่านั้น","error"); return; }
    // 👇 ถ้ายังไม่ล็อกอิน ให้เปิด Modal ที่มีอยู่ตัวเดียวของเรา
    if (p==="myshop" && !user) { setShowLoginModal(true); return; }
    if (p==="home") setHomeKey(k => k+1);
    setPage(p); setPageData(data);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <style>{styles}</style>
      
      {/* 👇 ส่ง onLoginClick ไปให้ Navbar ใช้ */}
      <Navbar 
        user={user} 
        onNavigate={navigate} 
        darkMode={darkMode} 
        toggleDark={() => setDarkMode(d=>!d)} 
        currentPage={page} 
        onLoginClick={() => setShowLoginModal(true)} 
      />

      {page==="home"        && <HomePage key={homeKey} onNavigate={navigate} />}
      {page==="shop-list"   && <ShopListPage onNavigate={navigate} />}
      {page==="shop-detail" && pageData && <ShopDetailPage shop={pageData} user={user} onNavigate={navigate} notify={notify} />}
      {page==="profile"     && user && <ProfilePage user={user} onNavigate={navigate} />}
      {page==="myshop"      && <MyShopPage user={user} onNavigate={navigate} notify={notify} />}
      {page==="upgrade"     && <UpgradePage user={user} onNavigate={navigate} notify={notify} />}
      {page==="about"       && <AboutPage user={user} onNavigate={navigate} darkMode={darkMode} toggleDark={() => setDarkMode(d=>!d)} />}
      
      {notification && <Notification msg={notification.msg} type={notification.type} onClose={() => setNotification(null)} />}
      
     {showLoginModal && (
  <Modal title="เข้าสู่ระบบ" onClose={() => setShowLoginModal(false)}>
    <div style={{textAlign:"center",padding:"8px 0 16px"}}>
      <div style={{fontSize:40,marginBottom:12}}>👋</div>
      <p style={{color:"var(--text2)",fontSize:14,marginBottom:8}}>เข้าสู่ระบบเพื่อยื่นเรื่องเคลม หรือจัดการร้านของคุณ</p>
    </div>
    
    <div style={{ display: "flex", justifyContent: "center", paddingBottom: "20px" }}>
      {googleLoading ? (
        <p>กำลังรันระบบ...</p>
      ) : (
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            // 👇 ตัว credential นี่แหละคือ "ID Token" ที่ Backend คุณต้องการ!
            const idToken = credentialResponse.credential;
            console.log("✅ [1] ได้ ID Token มาแล้ว!", idToken);
            
            setGoogleLoading(true);
            try {
              console.log("⏳ [2] กำลังส่ง Token ไปที่ Backend...");
              
              // เรียก API โดยส่ง ID Token ไป
              const result = await api.loginGoogle(idToken);
              
              console.log("✅ [3] Backend ตอบกลับ:", result);
              
              if (result.token) {
                localStorage.setItem("user_token", result.token);
                localStorage.setItem("user_data", JSON.stringify(result.user));
                window.location.reload();
              }
            } catch (e) {
              console.error("❌ [Error]:", e.response?.data || e);
              notify("เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่", "error");
            } finally {
              setGoogleLoading(false);
              setShowLoginModal(false);
            }
          }}
          onError={() => {
            console.log('Login Failed');
            notify("การเชื่อมต่อ Google ล้มเหลว", "error");
          }}
          useOneTap // แถม: ฟีเจอร์กดทีเดียวเข้าเลยถ้าเคย Login แล้ว
        />
      )}
    </div>
  </Modal>
)}
    </>
  );
}