import { useState, useEffect } from "react";

// ============================================================
// API CONFIG — เปลี่ยน BASE_URL เป็น PHP server ของคุณ
// ============================================================
const API_BASE = "https://your-php-server.com/api";

const api = {
  // Auth
  loginWithGoogle: (token) => fetch(`${API_BASE}/auth/google`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) }).then(r => r.json()),

  // Shops
  getShops: (page = 1, search = "") => fetch(`${API_BASE}/shops?page=${page}&search=${encodeURIComponent(search)}`, { headers: authHeaders() }).then(r => r.json()),
  addShop: (data) => fetch(`${API_BASE}/shops`, { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify(data) }).then(r => r.json()),
  deleteShop: (id) => fetch(`${API_BASE}/shops/${id}`, { method: "DELETE", headers: authHeaders() }).then(r => r.json()),
  blacklistShop: (id) => fetch(`${API_BASE}/shops/${id}/blacklist`, { method: "PATCH", headers: authHeaders() }).then(r => r.json()),

  // Upgrade Requests
  getUpgradeRequests: (page = 1) => fetch(`${API_BASE}/upgrade-requests?page=${page}`, { headers: authHeaders() }).then(r => r.json()),
  approveUpgrade: (id) => fetch(`${API_BASE}/upgrade-requests/${id}/approve`, { method: "PATCH", headers: authHeaders() }).then(r => r.json()),
  rejectUpgrade: (id, reason) => fetch(`${API_BASE}/upgrade-requests/${id}/reject`, { method: "PATCH", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify({ reason }) }).then(r => r.json()),

  // Blacklist
  getBlacklist: (page = 1) => fetch(`${API_BASE}/shops/blacklist?page=${page}`, { headers: authHeaders() }).then(r => r.json()),

  // Tickets
  getTickets: (page = 1) => fetch(`${API_BASE}/tickets?page=${page}`, { headers: authHeaders() }).then(r => r.json()),
};

const authHeaders = () => {
  const token = localStorage.getItem("admin_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ============================================================
// MOCK DATA
// ============================================================
const MOCK_SHOPS = Array.from({ length: 47 }, (_, i) => ({
  id: i + 1,
  name: ["ร้านข้าวมันไก่สมชาย", "ก๋วยเตี๋ยวเรือป้าแดง", "ขนมครกบ้านนา", "ผัดไทยอร่อยดี", "ส้มตำอีสาน"][i % 5] + ` #${i + 1}`,
  owner_name: ["สมชาย มีสุข", "วิไล ดีงาม", "ประเสริฐ ใจดี", "นงนุช สุขใส", "อภิชาต เก่งกาจ"][i % 5],
  user_id: `USR${String(1000 + i).padStart(4, "0")}`,
  category: ["อาหาร", "ขนม", "เครื่องดื่ม"][i % 3],
  status: i % 11 === 0 ? "blacklist" : i % 13 === 0 ? "deleted" : "active",
  verified: i % 3 === 0,
  created_at: new Date(2024, i % 12, (i % 28) + 1).toLocaleDateString("th-TH"),
  address: `${i + 1} ถ.สุขุมวิท แขวงคลองเตย กรุงเทพฯ`,
  phone: `08${String(i).padStart(8, "0")}`,
  rating: (3.5 + (i % 15) * 0.1).toFixed(1),
  orders_count: Math.floor(Math.random() * 500) + 10,
}));

const MOCK_UPGRADE_REQUESTS = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  shop_name: `ร้านค้า Premium #${i + 1}`,
  shop_id: i + 10,
  owner_name: ["มานะ ขยันดี", "สุดา รักงาน", "ธีรพงษ์ ใฝ่เรียน"][i % 3],
  submitted_at: new Date(2025, 2, 10 + i).toLocaleDateString("th-TH"),
  documents: [
    { name: "สำเนาบัตรประชาชน.pdf", url: "#" },
    { name: "ทะเบียนพาณิชย์.pdf", url: "#" },
  ],
  reject_rounds: i % 4 === 0 ? 1 : 0,
  status: "pending",
}));

const MOCK_BLACKLIST = MOCK_SHOPS.filter(s => s.status === "blacklist").map((s, i) => ({
  ...s,
  blacklisted_at: new Date(2025, i % 12, i + 1).toLocaleDateString("th-TH"),
  reason: ["ขายสินค้าไม่ตรงปก", "โกงเงินลูกค้า", "ละเมิดนโยบาย"][i % 3],
}));

const MOCK_TICKETS = Array.from({ length: 22 }, (_, i) => ({
  id: `TKT${String(1000 + i).padStart(4, "0")}`,
  title: ["ร้านค้าโกงเงิน", "ไม่ได้รับสินค้า", "สินค้าไม่ตรงรูป", "ร้านปิดแต่ยังรับออเดอร์"][i % 4],
  reporter_id: `USR${String(2000 + i).padStart(4, "0")}`,
  reporter_name: ["สมหญิง ดี", "วิชัย เก่ง", "นภา สุข", "อัมพร ใส"][i % 4],
  shop_name: `ร้านค้า #${i + 1}`,
  description: "ผู้ใช้แจ้งว่าทำการสั่งซื้อและโอนเงินแล้ว แต่ร้านค้าไม่ส่งสินค้าให้ และไม่ตอบรับการสื่อสาร มีหลักฐานสลิปการโอนเงินแนบมาด้วย",
  attachments: i % 2 === 0 ? [{ name: "slip_transfer.jpg", url: "#" }, { name: "chat_screenshot.jpg", url: "#" }] : [],
  status: ["open", "open", "resolved"][i % 3],
  created_at: new Date(2025, 2, i + 1).toLocaleDateString("th-TH"),
}));

// ============================================================
// STYLES
// ============================================================
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0a0f;
    --surface: #111118;
    --surface2: #18181f;
    --border: #2a2a35;
    --border2: #35354a;
    --accent: #6c63ff;
    --accent2: #8b5cf6;
    --accent-glow: rgba(108,99,255,0.15);
    --green: #10d98a;
    --red: #ff4757;
    --yellow: #ffa502;
    --blue: #2563eb;
    --text: #e8e8f0;
    --text2: #9999b0;
    --text3: #55556a;
    --font: 'IBM Plex Sans Thai', sans-serif;
    --mono: 'IBM Plex Mono', monospace;
  }

  html, body { height: 100%; background: var(--bg); color: var(--text); font-family: var(--font); }

  /* LAYOUT */
  .app { display: flex; height: 100vh; overflow: hidden; }

  .sidebar {
    width: 220px; flex-shrink: 0;
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    padding: 0;
  }

  .sidebar-logo {
    padding: 24px 20px 20px;
    border-bottom: 1px solid var(--border);
    font-size: 13px; font-weight: 700; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--accent);
    display: flex; align-items: center; gap: 10px;
  }
  .sidebar-logo span { font-size: 18px; }

  .sidebar-nav { flex: 1; padding: 12px 10px; display: flex; flex-direction: column; gap: 2px; }

  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 8px;
    font-size: 13.5px; font-weight: 500; color: var(--text2);
    cursor: pointer; transition: all 0.15s; border: 1px solid transparent;
    text-decoration: none;
  }
  .nav-item:hover { background: var(--surface2); color: var(--text); }
  .nav-item.active { background: var(--accent-glow); color: var(--accent); border-color: rgba(108,99,255,0.25); }
  .nav-item .icon { font-size: 16px; width: 20px; text-align: center; }

  .sidebar-footer { padding: 16px; border-top: 1px solid var(--border); }

  .admin-badge {
    background: var(--surface2); border: 1px solid var(--border2);
    border-radius: 8px; padding: 10px 12px;
    font-size: 12px; color: var(--text2);
  }
  .admin-badge strong { display: block; color: var(--text); font-size: 13px; margin-bottom: 2px; }

  .main { flex: 1; overflow-y: auto; display: flex; flex-direction: column; }

  .topbar {
    padding: 16px 28px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    background: var(--surface); position: sticky; top: 0; z-index: 10;
  }
  .topbar h1 { font-size: 18px; font-weight: 700; }
  .topbar-sub { font-size: 12px; color: var(--text3); margin-top: 1px; font-family: var(--mono); }

  .content { padding: 24px 28px; flex: 1; }

  /* COMPONENTS */
  .btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 7px; font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.15s; border: 1px solid transparent;
    font-family: var(--font);
  }
  .btn-primary { background: var(--accent); color: #fff; }
  .btn-primary:hover { background: var(--accent2); box-shadow: 0 0 20px var(--accent-glow); }
  .btn-ghost { background: transparent; color: var(--text2); border-color: var(--border2); }
  .btn-ghost:hover { background: var(--surface2); color: var(--text); }
  .btn-danger { background: rgba(255,71,87,0.12); color: var(--red); border-color: rgba(255,71,87,0.2); }
  .btn-danger:hover { background: rgba(255,71,87,0.2); }
  .btn-warn { background: rgba(255,165,2,0.12); color: var(--yellow); border-color: rgba(255,165,2,0.2); }
  .btn-warn:hover { background: rgba(255,165,2,0.2); }
  .btn-success { background: rgba(16,217,138,0.12); color: var(--green); border-color: rgba(16,217,138,0.2); }
  .btn-success:hover { background: rgba(16,217,138,0.2); }
  .btn-sm { padding: 5px 10px; font-size: 12px; }
  .btn-icon { padding: 7px; border-radius: 6px; }

  .badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 2px 8px; border-radius: 100px; font-size: 11px; font-weight: 600;
  }
  .badge-green { background: rgba(16,217,138,0.12); color: var(--green); }
  .badge-red { background: rgba(255,71,87,0.12); color: var(--red); }
  .badge-yellow { background: rgba(255,165,2,0.12); color: var(--yellow); }
  .badge-blue { background: rgba(37,99,235,0.12); color: #60a5fa; }
  .badge-gray { background: rgba(150,150,170,0.1); color: var(--text3); }

  .card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; }

  .search-bar {
    display: flex; gap: 10px; margin-bottom: 20px; align-items: center;
  }
  .input {
    background: var(--surface2); border: 1px solid var(--border2);
    color: var(--text); border-radius: 8px; padding: 9px 14px; font-size: 13px;
    font-family: var(--font); outline: none; transition: border-color 0.15s;
  }
  .input:focus { border-color: var(--accent); }
  .input-search { flex: 1; }
  .textarea { resize: vertical; min-height: 80px; }

  /* TABLE */
  .table-wrap { overflow-x: auto; border-radius: 12px; border: 1px solid var(--border); }
  table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
  thead tr { border-bottom: 1px solid var(--border); background: var(--surface2); }
  th { padding: 11px 16px; text-align: left; font-size: 11px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase; color: var(--text3); }
  td { padding: 13px 16px; border-bottom: 1px solid rgba(42,42,53,0.6); vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: rgba(255,255,255,0.015); }

  /* PAGINATION */
  .pagination { display: flex; gap: 4px; align-items: center; margin-top: 20px; }
  .page-btn {
    width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
    border-radius: 7px; font-size: 13px; font-weight: 600; cursor: pointer;
    border: 1px solid var(--border2); background: transparent; color: var(--text2);
    transition: all 0.15s; font-family: var(--font);
  }
  .page-btn:hover { background: var(--surface2); color: var(--text); }
  .page-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }
  .page-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  /* MODAL */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.7);
    display: flex; align-items: center; justify-content: center; z-index: 100;
    backdrop-filter: blur(4px); animation: fadeIn 0.15s ease;
  }
  .modal {
    background: var(--surface); border: 1px solid var(--border2); border-radius: 16px;
    width: 520px; max-height: 85vh; overflow-y: auto;
    box-shadow: 0 24px 80px rgba(0,0,0,0.6); animation: slideUp 0.2s ease;
  }
  .modal-wide { width: 640px; }
  .modal-header {
    padding: 20px 24px 16px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
  }
  .modal-header h3 { font-size: 16px; font-weight: 700; }
  .modal-body { padding: 20px 24px; }
  .modal-footer { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; gap: 8px; justify-content: flex-end; }

  .detail-row {
    display: flex; gap: 8px; padding: 10px 0; border-bottom: 1px solid rgba(42,42,53,0.4); align-items: flex-start;
  }
  .detail-row:last-child { border-bottom: none; }
  .detail-label { font-size: 12px; color: var(--text3); min-width: 120px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; padding-top: 1px; }
  .detail-value { font-size: 13.5px; color: var(--text); flex: 1; }

  .doc-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; background: var(--surface2); border: 1px solid var(--border);
    border-radius: 8px; margin-bottom: 8px;
  }
  .doc-icon { font-size: 20px; }
  .doc-name { flex: 1; font-size: 13px; }

  /* STAT CARDS */
  .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  .stat-card {
    background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
    padding: 20px; position: relative; overflow: hidden;
  }
  .stat-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: var(--accent-color, var(--accent));
  }
  .stat-label { font-size: 11px; color: var(--text3); font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px; }
  .stat-value { font-size: 28px; font-weight: 700; font-family: var(--mono); color: var(--text); }
  .stat-sub { font-size: 12px; color: var(--text3); margin-top: 4px; }

  /* LOGIN */
  .login-page {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: var(--bg); position: relative; overflow: hidden;
  }
  .login-bg {
    position: absolute; inset: 0; z-index: 0;
    background: radial-gradient(ellipse 60% 40% at 50% 0%, rgba(108,99,255,0.12) 0%, transparent 70%);
  }
  .login-card {
    position: relative; z-index: 1;
    background: var(--surface); border: 1px solid var(--border2);
    border-radius: 20px; padding: 48px 40px; width: 380px; text-align: center;
    box-shadow: 0 32px 80px rgba(0,0,0,0.5);
  }
  .login-logo { font-size: 36px; margin-bottom: 16px; }
  .login-title { font-size: 22px; font-weight: 700; margin-bottom: 6px; }
  .login-sub { font-size: 13px; color: var(--text3); margin-bottom: 32px; }
  .google-btn {
    width: 100%; padding: 13px; background: #fff; color: #333; border: none;
    border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    transition: all 0.15s; font-family: var(--font);
  }
  .google-btn:hover { background: #f5f5f5; transform: translateY(-1px); box-shadow: 0 8px 20px rgba(0,0,0,0.3); }

  @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
  @keyframes slideUp { from { transform: translateY(16px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }

  .empty-state { text-align: center; padding: 60px 20px; color: var(--text3); }
  .empty-state .icon { font-size: 40px; margin-bottom: 12px; }
  .empty-state p { font-size: 14px; }

  .reject-form { margin-top: 16px; }
  .form-label { font-size: 12px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; display: block; }

  .tag { display: inline-block; padding: 1px 7px; border-radius: 4px; font-size: 11px; font-weight: 600; font-family: var(--mono); }
  .section-title { font-size: 13px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 14px; }

  .notification {
    position: fixed; top: 20px; right: 20px; z-index: 200;
    background: var(--surface); border: 1px solid var(--border2);
    border-radius: 10px; padding: 14px 18px; min-width: 280px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.4);
    animation: slideIn 0.25s ease; display: flex; align-items: center; gap: 10px;
    font-size: 13.5px;
  }
  .notification.success { border-left: 3px solid var(--green); }
  .notification.error { border-left: 3px solid var(--red); }
  @keyframes slideIn { from { transform: translateX(20px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
`;

// ============================================================
// HELPERS
// ============================================================
const ITEMS_PER_PAGE = 20;

function paginate(data, page) {
  const start = (page - 1) * ITEMS_PER_PAGE;
  return { items: data.slice(start, start + ITEMS_PER_PAGE), total: data.length, totalPages: Math.ceil(data.length / ITEMS_PER_PAGE) };
}

function Pagination({ page, totalPages, onChange }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="pagination">
      <button className="page-btn" onClick={() => onChange(page - 1)} disabled={page === 1}>‹</button>
      {pages.map(p => <button key={p} className={`page-btn ${p === page ? "active" : ""}`} onClick={() => onChange(p)}>{p}</button>)}
      <button className="page-btn" onClick={() => onChange(page + 1)} disabled={page === totalPages}>›</button>
    </div>
  );
}

function Modal({ title, onClose, children, footer, wide }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? "modal-wide" : ""}`}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

function Notification({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return (
    <div className={`notification ${type}`}>
      <span>{type === "success" ? "✓" : "✕"}</span>
      <span>{msg}</span>
    </div>
  );
}

// ============================================================
// PAGES
// ============================================================

// --- LOGIN ---
function LoginPage({ onLogin }) {
  const handleGoogleLogin = () => {
    // TODO: Replace with actual Google OAuth
    // window.google.accounts.id.initialize({ client_id: "YOUR_GOOGLE_CLIENT_ID", callback: handleCredential })
    // For now, mock login:
    localStorage.setItem("admin_token", "mock_jwt_token");
    localStorage.setItem("admin_user", JSON.stringify({ name: "Admin User", email: "admin@example.com" }));
    onLogin({ name: "Admin User", email: "admin@example.com" });
  };
  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-card">
        <div className="login-logo">🛡️</div>
        <div className="login-title">Admin Portal</div>
        <div className="login-sub">เข้าสู่ระบบเพื่อจัดการข้อมูลระบบ</div>
        <button className="google-btn" onClick={handleGoogleLogin}>
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.6 2.3 30.1 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.8 6.1C12.4 13.2 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 7.1-10 7.1-17z"/><path fill="#FBBC05" d="M10.4 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.6L2.6 13.3A24 24 0 0 0 0 24c0 3.8.9 7.4 2.6 10.7l7.8-6.1z"/><path fill="#34A853" d="M24 48c6.1 0 11.2-2 14.9-5.4l-7.5-5.8c-2 1.4-4.7 2.2-7.4 2.2-6.3 0-11.6-3.7-13.6-9.4l-7.8 6.1C6.6 42.6 14.6 48 24 48z"/></svg>
          เข้าสู่ระบบด้วย Google
        </button>
        <p style={{ marginTop: 20, fontSize: 11, color: "var(--text3)" }}>เฉพาะบัญชีที่ได้รับสิทธิ์แอดมินเท่านั้น</p>
      </div>
    </div>
  );
}

// --- ALL SHOPS ---
function AllShopsPage({ notify }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newShop, setNewShop] = useState({ name: "", owner_name: "", user_id: "", phone: "", address: "", category: "อาหาร" });
  const [shops, setShops] = useState(MOCK_SHOPS.filter(s => s.status !== "deleted"));

  const filtered = shops.filter(s => s.status !== "deleted" && (s.name.includes(search) || s.user_id.includes(search) || s.owner_name.includes(search)));
  const { items, totalPages } = paginate(filtered, page);

  const handleDelete = (id) => {
    // TODO: await api.deleteShop(id)
    setShops(prev => prev.map(s => s.id === id ? { ...s, status: "deleted" } : s));
    setSelected(null); notify("ลบร้านค้าเรียบร้อยแล้ว", "success");
  };
  const handleBlacklist = (id) => {
    // TODO: await api.blacklistShop(id)
    setShops(prev => prev.map(s => s.id === id ? { ...s, status: "blacklist" } : s));
    setSelected(null); notify("เพิ่ม Blacklist เรียบร้อยแล้ว", "success");
  };
  const handleAdd = () => {
    // TODO: await api.addShop(newShop)
    setShops(prev => [...prev, { ...newShop, id: Date.now(), status: "active", verified: false, created_at: new Date().toLocaleDateString("th-TH"), rating: "0.0", orders_count: 0 }]);
    setShowAdd(false); notify("เพิ่มร้านค้าใหม่เรียบร้อย", "success");
    setNewShop({ name: "", owner_name: "", user_id: "", phone: "", address: "", category: "อาหาร" });
  };

  const statusBadge = (s) => s.status === "blacklist" ? <span className="badge badge-red">⛔ Blacklist</span> : s.verified ? <span className="badge badge-green">✓ Verified</span> : <span className="badge badge-gray">ทั่วไป</span>;

  return (
    <div>
      <div className="stats-row">
        {[
          { label: "ร้านค้าทั้งหมด", val: shops.filter(s=>s.status!=="deleted").length, color: "var(--accent)" },
          { label: "ร้านค้า Verified", val: shops.filter(s=>s.verified && s.status!=="deleted").length, color: "var(--green)" },
          { label: "Blacklist", val: shops.filter(s=>s.status==="blacklist").length, color: "var(--red)" },
          { label: "ถูกลบ", val: shops.filter(s=>s.status==="deleted").length, color: "var(--text3)" },
        ].map(s => (
          <div className="stat-card" key={s.label} style={{ "--accent-color": s.color }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.val}</div>
          </div>
        ))}
      </div>

      <div className="search-bar">
        <input className="input input-search" placeholder="ค้นหาชื่อร้าน, ชื่อเจ้าของ, User ID..." value={searchInput} onChange={e => setSearchInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }} />
        <button className="btn btn-ghost" onClick={() => { setSearch(searchInput); setPage(1); }}>🔍 ค้นหา</button>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>＋ เพิ่มร้านค้า</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead><tr><th>#</th><th>ชื่อร้านค้า</th><th>เจ้าของ</th><th>User ID</th><th>หมวดหมู่</th><th>สถานะ</th><th>วันที่สร้าง</th><th></th></tr></thead>
          <tbody>
            {items.length === 0 ? <tr><td colSpan={8}><div className="empty-state"><div className="icon">🔍</div><p>ไม่พบร้านค้า</p></div></td></tr> :
              items.map((s, i) => (
                <tr key={s.id}>
                  <td style={{ color: "var(--text3)", fontFamily: "var(--mono)", fontSize: 12 }}>{(page - 1) * ITEMS_PER_PAGE + i + 1}</td>
                  <td><strong>{s.name}</strong></td>
                  <td style={{ color: "var(--text2)" }}>{s.owner_name}</td>
                  <td><span className="tag badge badge-blue">{s.user_id}</span></td>
                  <td style={{ color: "var(--text2)" }}>{s.category}</td>
                  <td>{statusBadge(s)}</td>
                  <td style={{ color: "var(--text3)", fontSize: 12 }}>{s.created_at}</td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => setSelected(s)}>จัดการ</button></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}

      {selected && (
        <Modal title="จัดการร้านค้า" onClose={() => setSelected(null)} wide
          footer={<>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>ปิด</button>
            <button className="btn btn-warn btn-sm" onClick={() => handleBlacklist(selected.id)} disabled={selected.status === "blacklist"}>⛔ เพิ่ม Blacklist</button>
            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selected.id)}>🗑️ ลบร้านค้า</button>
          </>}>
          <div className="section-title">ข้อมูลร้านค้า</div>
          {[["ชื่อร้านค้า", selected.name], ["เจ้าของ", selected.owner_name], ["User ID", selected.user_id], ["เบอร์โทร", selected.phone], ["ที่อยู่", selected.address], ["หมวดหมู่", selected.category], ["คะแนน", `⭐ ${selected.rating}`], ["ออเดอร์ทั้งหมด", `${selected.orders_count} ออเดอร์`], ["วันที่สร้าง", selected.created_at], ["สถานะ", selected.status]].map(([l, v]) => (
            <div className="detail-row" key={l}><div className="detail-label">{l}</div><div className="detail-value">{v}</div></div>
          ))}
        </Modal>
      )}

      {showAdd && (
        <Modal title="เพิ่มร้านค้าใหม่" onClose={() => setShowAdd(false)}
          footer={<>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowAdd(false)}>ยกเลิก</button>
            <button className="btn btn-primary btn-sm" onClick={handleAdd}>บันทึก</button>
          </>}>
          {[["name", "ชื่อร้านค้า"], ["owner_name", "ชื่อเจ้าของ"], ["user_id", "User ID"], ["phone", "เบอร์โทร"], ["address", "ที่อยู่"]].map(([k, l]) => (
            <div key={k} style={{ marginBottom: 12 }}>
              <label className="form-label">{l}</label>
              <input className="input" style={{ width: "100%" }} value={newShop[k]} onChange={e => setNewShop(p => ({ ...p, [k]: e.target.value }))} />
            </div>
          ))}
          <div>
            <label className="form-label">หมวดหมู่</label>
            <select className="input" style={{ width: "100%" }} value={newShop.category} onChange={e => setNewShop(p => ({ ...p, category: e.target.value }))}>
              {["อาหาร", "ขนม", "เครื่องดื่ม", "ของใช้"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </Modal>
      )}
    </div>
  );
}

// --- UPGRADE REQUESTS ---
function UpgradeRequestsPage({ notify }) {
  const [page, setPage] = useState(1);
  const [requests, setRequests] = useState(MOCK_UPGRADE_REQUESTS);
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);

  const pending = requests.filter(r => r.status === "pending");
  const { items, totalPages } = paginate(pending, page);

  const handleApprove = (id) => {
    // TODO: await api.approveUpgrade(id)
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "approved" } : r));
    setSelected(null); notify("อนุมัติเรียบร้อยแล้ว ✓", "success");
  };
  const handleReject = (id) => {
    if (!rejectReason.trim()) return;
    // TODO: await api.rejectUpgrade(id, rejectReason)
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "rejected", reject_rounds: r.reject_rounds + 1 } : r));
    setSelected(null); setShowReject(false); setRejectReason("");
    notify("ปฏิเสธคำขอเรียบร้อยแล้ว", "success");
  };

  return (
    <div>
      <div className="stats-row" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        {[
          { label: "รอดำเนินการ", val: requests.filter(r=>r.status==="pending").length, color: "var(--yellow)" },
          { label: "อนุมัติแล้ว", val: requests.filter(r=>r.status==="approved").length, color: "var(--green)" },
          { label: "ปฏิเสธ", val: requests.filter(r=>r.status==="rejected").length, color: "var(--red)" },
        ].map(s => (
          <div className="stat-card" key={s.label} style={{ "--accent-color": s.color }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.val}</div>
          </div>
        ))}
      </div>

      <div className="table-wrap">
        <table>
          <thead><tr><th>#</th><th>ชื่อร้านค้า</th><th>เจ้าของ</th><th>วันที่ส่ง</th><th>รอบที่ไม่ผ่าน</th><th></th></tr></thead>
          <tbody>
            {items.length === 0 ? <tr><td colSpan={6}><div className="empty-state"><div className="icon">✅</div><p>ไม่มีคำขอที่รอดำเนินการ</p></div></td></tr> :
              items.map((r, i) => (
                <tr key={r.id}>
                  <td style={{ color: "var(--text3)", fontFamily: "var(--mono)", fontSize: 12 }}>{(page - 1) * ITEMS_PER_PAGE + i + 1}</td>
                  <td><strong>{r.shop_name}</strong></td>
                  <td style={{ color: "var(--text2)" }}>{r.owner_name}</td>
                  <td style={{ color: "var(--text3)", fontSize: 12 }}>{r.submitted_at}</td>
                  <td>{r.reject_rounds > 0 ? <span className="badge badge-red">ครั้งที่ {r.reject_rounds}</span> : <span className="badge badge-gray">ครั้งแรก</span>}</td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => { setSelected(r); setShowReject(false); setRejectReason(""); }}>ตรวจสอบ</button></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}

      {selected && (
        <Modal title="ตรวจสอบคำขอ Verified" onClose={() => setSelected(null)} wide
          footer={<>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>ปิด</button>
            <button className="btn btn-danger btn-sm" onClick={() => setShowReject(v => !v)}>✕ ปฏิเสธ</button>
            <button className="btn btn-success btn-sm" onClick={() => handleApprove(selected.id)}>✓ อนุมัติ</button>
          </>}>
          <div className="section-title">ข้อมูลร้านค้า</div>
          {[["ชื่อร้านค้า", selected.shop_name], ["เจ้าของ", selected.owner_name], ["วันที่ส่ง", selected.submitted_at], ["รอบที่ไม่ผ่าน", selected.reject_rounds + " ครั้ง"]].map(([l, v]) => (
            <div className="detail-row" key={l}><div className="detail-label">{l}</div><div className="detail-value">{v}</div></div>
          ))}
          <div className="section-title" style={{ marginTop: 20 }}>เอกสารแนบ</div>
          {selected.documents.map(doc => (
            <div className="doc-item" key={doc.name}>
              <span className="doc-icon">📄</span>
              <span className="doc-name">{doc.name}</span>
              <a href={doc.url} className="btn btn-ghost btn-sm" target="_blank" rel="noreferrer">⬇ ดาวน์โหลด</a>
            </div>
          ))}
          {showReject && (
            <div className="reject-form">
              <label className="form-label">เหตุผลที่ปฏิเสธ *</label>
              <textarea className="input textarea" style={{ width: "100%" }} placeholder="กรอกเหตุผล..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
              <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
                <button className="btn btn-danger btn-sm" onClick={() => handleReject(selected.id)} disabled={!rejectReason.trim()}>ยืนยันการปฏิเสธ</button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

// --- BLACKLIST ---
function BlacklistPage() {
  const [page, setPage] = useState(1);
  const { items, totalPages } = paginate(MOCK_BLACKLIST, page);
  return (
    <div>
      <div style={{ marginBottom: 20, padding: "12px 16px", background: "rgba(255,71,87,0.06)", border: "1px solid rgba(255,71,87,0.15)", borderRadius: 10, fontSize: 13, color: "var(--text2)", display: "flex", alignItems: "center", gap: 8 }}>
        <span>⚠️</span> ร้านค้าในรายการนี้ถูกระงับการใช้งาน หากต้องการปลดแบน ต้องเพิ่มฟีเจอร์ใน UC เพิ่มเติม
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>#</th><th>ชื่อร้านค้า</th><th>เจ้าของ</th><th>วันที่ถูกแบน</th><th>เหตุผล</th><th>คะแนน</th></tr></thead>
          <tbody>
            {items.length === 0 ? <tr><td colSpan={6}><div className="empty-state"><div className="icon">🎉</div><p>ไม่มีร้านค้าใน Blacklist</p></div></td></tr> :
              items.map((s, i) => (
                <tr key={s.id}>
                  <td style={{ color: "var(--text3)", fontFamily: "var(--mono)", fontSize: 12 }}>{(page - 1) * ITEMS_PER_PAGE + i + 1}</td>
                  <td><strong>{s.name}</strong></td>
                  <td style={{ color: "var(--text2)" }}>{s.owner_name}</td>
                  <td style={{ color: "var(--text3)", fontSize: 12 }}>{s.blacklisted_at}</td>
                  <td><span className="badge badge-red">{s.reason}</span></td>
                  <td style={{ color: "var(--text2)" }}>⭐ {s.rating}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}
    </div>
  );
}

// --- TICKETS ---
function TicketsPage() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const { items, totalPages } = paginate(MOCK_TICKETS, page);

  const statusBadge = (s) => s === "open" ? <span className="badge badge-yellow">🔓 เปิด</span> : <span className="badge badge-gray">✓ แก้ไขแล้ว</span>;

  return (
    <div>
      <div className="stats-row" style={{ gridTemplateColumns: "repeat(2,1fr)" }}>
        {[
          { label: "คำร้องทั้งหมด", val: MOCK_TICKETS.length, color: "var(--accent)" },
          { label: "รอดำเนินการ", val: MOCK_TICKETS.filter(t=>t.status==="open").length, color: "var(--yellow)" },
        ].map(s => (
          <div className="stat-card" key={s.label} style={{ "--accent-color": s.color }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.val}</div>
          </div>
        ))}
      </div>

      <div className="table-wrap">
        <table>
          <thead><tr><th>Ticket ID</th><th>หัวข้อ</th><th>ร้านที่เกี่ยวข้อง</th><th>ผู้ร้องเรียน</th><th>วันที่</th><th>สถานะ</th><th></th></tr></thead>
          <tbody>
            {items.map(t => (
              <tr key={t.id}>
                <td><span className="tag badge badge-blue" style={{ fontFamily: "var(--mono)", fontSize: 11 }}>{t.id}</span></td>
                <td><strong>{t.title}</strong></td>
                <td style={{ color: "var(--text2)" }}>{t.shop_name}</td>
                <td>
                  <div style={{ fontSize: 13 }}>{t.reporter_name}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--mono)" }}>{t.reporter_id}</div>
                </td>
                <td style={{ color: "var(--text3)", fontSize: 12 }}>{t.created_at}</td>
                <td>{statusBadge(t.status)}</td>
                <td><button className="btn btn-ghost btn-sm" onClick={() => setSelected(t)}>จัดการ</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}

      {selected && (
        <Modal title={`Ticket: ${selected.id}`} onClose={() => setSelected(null)} wide
          footer={<button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>ปิด</button>}>
          <div className="section-title">รายละเอียดคำร้อง</div>
          {[["Ticket ID", selected.id], ["หัวข้อ", selected.title], ["ร้านที่เกี่ยวข้อง", selected.shop_name], ["ผู้ร้องเรียน", `${selected.reporter_name} (${selected.reporter_id})`], ["วันที่", selected.created_at], ["สถานะ", selected.status === "open" ? "เปิด" : "แก้ไขแล้ว"]].map(([l, v]) => (
            <div className="detail-row" key={l}><div className="detail-label">{l}</div><div className="detail-value">{v}</div></div>
          ))}
          <div className="section-title" style={{ marginTop: 20 }}>รายละเอียดปัญหา</div>
          <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, padding: 14, fontSize: 13.5, lineHeight: 1.7, color: "var(--text2)" }}>
            {selected.description}
          </div>
          {selected.attachments.length > 0 && <>
            <div className="section-title" style={{ marginTop: 20 }}>ไฟล์แนบ ({selected.attachments.length})</div>
            {selected.attachments.map(f => (
              <div className="doc-item" key={f.name}>
                <span className="doc-icon">{f.name.endsWith(".jpg") ? "🖼️" : "📄"}</span>
                <span className="doc-name">{f.name}</span>
                <a href={f.url} className="btn btn-ghost btn-sm" target="_blank" rel="noreferrer">⬇ ดาวน์โหลด</a>
              </div>
            ))}
          </>}
        </Modal>
      )}
    </div>
  );
}

// ============================================================
// APP SHELL
// ============================================================
const PAGES = [
  { id: "shops", label: "ร้านค้าทั้งหมด", icon: "🏪", title: "ร้านค้าทั้งหมด", sub: "All Shops Management" },
  { id: "upgrades", label: "คำขอเลื่อนขั้น", icon: "⬆️", title: "คำขอ Verified", sub: "Upgrade Requests" },
  { id: "blacklist", label: "Blacklist", icon: "⛔", title: "ร้านค้า Blacklist", sub: "Blacklisted Shops" },
  { id: "tickets", label: "Support Tickets", icon: "🎫", title: "คำร้องขอความช่วยเหลือ", sub: "Support Tickets" },
];

export default function App() {
  const [authed, setAuthed] = useState(!!localStorage.getItem("admin_token"));
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem("admin_user")); } catch { return null; } });
  const [activePage, setActivePage] = useState("shops");
  const [notification, setNotification] = useState(null);

  const notify = (msg, type = "success") => setNotification({ msg, type });
  const page = PAGES.find(p => p.id === activePage);

  if (!authed) return (
    <>
      <style>{styles}</style>
      <LoginPage onLogin={(u) => { setUser(u); setAuthed(true); }} />
    </>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <aside className="sidebar">
          <div className="sidebar-logo"><span>🛡️</span> ADMIN</div>
          <nav className="sidebar-nav">
            {PAGES.map(p => (
              <button key={p.id} className={`nav-item ${activePage === p.id ? "active" : ""}`} onClick={() => setActivePage(p.id)}>
                <span className="icon">{p.icon}</span>{p.label}
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">
            <div className="admin-badge">
              <strong>{user?.name || "Admin"}</strong>
              {user?.email || "admin@example.com"}
            </div>
            <button className="btn btn-ghost btn-sm" style={{ width: "100%", marginTop: 8 }} onClick={() => { localStorage.clear(); setAuthed(false); setUser(null); }}>
              ออกจากระบบ
            </button>
          </div>
        </aside>

        <main className="main">
          <div className="topbar">
            <div>
              <h1>{page.title}</h1>
              <div className="topbar-sub">{page.sub}</div>
            </div>
          </div>
          <div className="content">
            {activePage === "shops" && <AllShopsPage notify={notify} />}
            {activePage === "upgrades" && <UpgradeRequestsPage notify={notify} />}
            {activePage === "blacklist" && <BlacklistPage />}
            {activePage === "tickets" && <TicketsPage />}
          </div>
        </main>
      </div>

      {notification && <Notification msg={notification.msg} type={notification.type} onClose={() => setNotification(null)} />}
    </>
  );
}
