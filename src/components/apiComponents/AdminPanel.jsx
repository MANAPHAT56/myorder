import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// ADMIN PANEL — UC1-UC11
// Backend: http://localhost:5000/api/v1
// ============================================================

const API_BASE = "http://localhost:5000/api/v1";
const ITEMS_PER_PAGE = 8;
const INVALID_CHARS  = /[^\u0E00-\u0E7Fa-zA-Z0-9\s\-_.@/:,()]/;

// ── Auth helpers ──────────────────────────────────────────────
const authHeaders = () => {
  const t = localStorage.getItem("user_token");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

const jsonHeaders = () => ({
  "Content-Type": "application/json",
  ...authHeaders(),
});

// ── API calls ─────────────────────────────────────────────────
const adminApi = {
  // Dashboard stats
  getDashboard: () =>
    fetch(`${API_BASE}/admin/dashboard`, { headers: authHeaders() }).then(r => r.json()),

  // UC6: รายการร้านค้า
  getShops: (params) =>
    fetch(`${API_BASE}/admin/shops?${new URLSearchParams(params)}`, { headers: authHeaders() }).then(r => r.json()),

  // UC3: เพิ่มร้านค้า
  createShop: (data) =>
    fetch(`${API_BASE}/admin/shops`, {
      method: "POST", headers: jsonHeaders(), body: JSON.stringify(data),
    }).then(r => r.json()),

  // UC4: แก้ไขข้อมูลร้านค้า
  updateShop: (refId, data) =>
    fetch(`${API_BASE}/admin/shops/${refId}`, {
      method: "PATCH", headers: jsonHeaders(), body: JSON.stringify(data),
    }).then(r => r.json()),

  // UC5: ลบร้านค้า
  deleteShop: (refId) =>
    fetch(`${API_BASE}/admin/shops/${refId}`, {
      method: "DELETE", headers: authHeaders(),
    }).then(r => r.json()),

  // UC7: Blacklist
  blacklistShop: (refId, reason, reportRequestId = null) =>
    fetch(`${API_BASE}/admin/shops/${refId}/blacklist`, {
      method: "POST", headers: jsonHeaders(),
      body: JSON.stringify({ reason, report_request_id: reportRequestId }),
    }).then(r => r.json()),

  // UC9: เลื่อนขั้น 3
  promoteTier3: (refId) =>
    fetch(`${API_BASE}/admin/shops/${refId}/tier3`, {
      method: "PATCH", headers: authHeaders(),
    }).then(r => r.json()),

  // UC10: คำร้องขอเลื่อนขั้น
  getUpgradeRequests: (params) =>
    fetch(`${API_BASE}/admin/upgrade-requests?${new URLSearchParams(params)}`, { headers: authHeaders() }).then(r => r.json()),

  approveUpgrade: (id) =>
    fetch(`${API_BASE}/admin/upgrade-requests/${id}/approve`, {
      method: "PATCH", headers: authHeaders(),
    }).then(r => r.json()),

  rejectUpgrade: (id, reason) =>
    fetch(`${API_BASE}/admin/upgrade-requests/${id}/reject`, {
      method: "PATCH", headers: jsonHeaders(), body: JSON.stringify({ reason }),
    }).then(r => r.json()),

  // UC2: รายงาน
  getReports: (params) =>
    fetch(`${API_BASE}/admin/reports?${new URLSearchParams(params)}`, { headers: authHeaders() }).then(r => r.json()),

  resolveReport: (id) =>
    fetch(`${API_BASE}/admin/reports/${id}/resolve`, {
      method: "PATCH", headers: authHeaders(),
    }).then(r => r.json()),

  // UC11: เคลม
  getClaims: (params) =>
    fetch(`${API_BASE}/admin/claims?${new URLSearchParams(params)}`, { headers: authHeaders() }).then(r => r.json()),

  resolveClaim: (id) =>
    fetch(`${API_BASE}/admin/claims/${id}/resolve`, {
      method: "PATCH", headers: authHeaders(),
    }).then(r => r.json()),

  // signed URL สำหรับดูเอกสาร (ถ้า backend รองรับ)
  getAttachmentUrl: (path) =>
    fetch(`${API_BASE}/admin/attachments/url?path=${encodeURIComponent(path)}`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => d.url ?? path),
};

// ── Validation ────────────────────────────────────────────────
function validateText(val) {
  if (!val || val.trim() === "") return "กรุณากรอกข้อมูลให้ครบถ้วน";
  if (INVALID_CHARS.test(val)) return "ไม่อนุญาตให้ใช้อักขระพิเศษหรืออีโมจิ";
  return null;
}
function validateUrl(val) {
  if (!val || val.trim() === "") return "กรุณากรอก URL";
  if (!/^https?:\/\/.+/.test(val)) return "URL ต้องขึ้นต้นด้วย http:// หรือ https://";
  return null;
}
function validateUserId(val) {
  if (!val || val.trim() === "") return "กรุณากรอก Account ID";
  return null;
}

// ── Attachment helper — แปลง file_url เป็น previewable doc ──
function makeDocFromAttachment(att) {
  const url      = att.file_url ?? att.url ?? "";
  const isPdf    = url.toLowerCase().endsWith(".pdf");
  return {
    id:         att.id,
    name:       url.split("/").pop(),
    label:      att.label ?? url.split("/").pop(),
    fileType:   isPdf ? "pdf" : "image",
    previewUrl: isPdf ? null : url,  // ในระบบจริง: signed URL จาก backend
  };
}

// ============================================================
// STYLES
// ============================================================
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700;800&family=Mitr:wght@300;400;500;600&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  :root {
    --bg:#f4f1ec; --surface:#ffffff; --surface2:#f0ece4; --border:#e5ddd0; --border2:#ccc5b5;
    --accent:#c0392b; --accent2:#a93226; --accent-light:#fdf2f1; --accent-glow:rgba(192,57,43,0.12);
    --green:#16a34a; --green-light:#f0fdf4; --yellow:#d97706; --yellow-light:#fffbeb;
    --blue:#1d4ed8; --blue-light:#eff6ff; --red:#dc2626; --red-light:#fef2f2;
    --text:#18130e; --text2:#584f42; --text3:#96887a;
    --shadow:0 1px 3px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.04);
    --shadow-md:0 4px 20px rgba(0,0,0,0.08);
    --shadow-lg:0 8px 40px rgba(0,0,0,0.14);
    --font:'Sarabun',sans-serif; --display:'Mitr',sans-serif;
    --radius:12px; --radius-sm:8px;
    --sidebar-w:220px;
  }
  html,body{height:100%;background:var(--bg);color:var(--text);font-family:var(--font);font-size:14px;line-height:1.6;}
  .admin-layout{display:flex;min-height:100vh;}
  .sidebar{width:var(--sidebar-w);background:#1a1208;color:#e8e0d4;flex-shrink:0;display:flex;flex-direction:column;position:sticky;top:0;height:100vh;overflow-y:auto;}
  .sidebar-brand{padding:20px 20px 16px;font-family:var(--display);font-size:18px;font-weight:600;color:#f97316;border-bottom:1px solid rgba(255,255,255,0.08);}
  .sidebar-brand span{color:#e8e0d4;}
  .sidebar-section{padding:12px 12px 4px;font-size:10px;font-weight:700;color:#6b5d4e;text-transform:uppercase;letter-spacing:0.1em;}
  .sidebar-item{display:flex;align-items:center;gap:10px;padding:9px 16px;border-radius:8px;margin:2px 8px;cursor:pointer;font-size:13.5px;font-weight:500;color:#c4b5a0;transition:all 0.15s;}
  .sidebar-item:hover{background:rgba(255,255,255,0.06);color:#f0e8dc;}
  .sidebar-item.active{background:rgba(249,115,22,0.15);color:#fb923c;}
  .sidebar-item-icon{font-size:15px;width:18px;text-align:center;}
  .main-content{flex:1;padding:28px 32px;overflow-y:auto;}
  .page-title{font-family:var(--display);font-size:22px;font-weight:600;margin-bottom:4px;}
  .page-sub{font-size:13px;color:var(--text3);margin-bottom:24px;}
  .btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:var(--radius-sm);font-size:13px;font-weight:600;cursor:pointer;transition:all 0.18s;border:1.5px solid transparent;font-family:var(--font);white-space:nowrap;}
  .btn-primary{background:var(--accent);color:#fff;border-color:var(--accent);}
  .btn-primary:hover{background:var(--accent2);transform:translateY(-1px);}
  .btn-outline{background:transparent;color:var(--text);border-color:var(--border2);}
  .btn-outline:hover{background:var(--surface2);}
  .btn-ghost{background:transparent;color:var(--text2);border-color:transparent;}
  .btn-ghost:hover{background:var(--surface2);}
  .btn-danger{background:var(--red-light);color:var(--red);border-color:rgba(220,38,38,0.2);}
  .btn-danger:hover{background:rgba(220,38,38,0.12);}
  .btn-success{background:var(--green-light);color:var(--green);border-color:rgba(22,163,74,0.2);}
  .btn-success:hover{background:rgba(22,163,74,0.1);}
  .btn-warn{background:var(--yellow-light);color:var(--yellow);border-color:rgba(217,119,6,0.2);}
  .btn-sm{padding:5px 11px;font-size:12px;}
  .btn-xs{padding:3px 9px;font-size:11px;}
  .btn:disabled{opacity:0.4;cursor:not-allowed;transform:none!important;}
  .badge{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:100px;font-size:11px;font-weight:700;}
  .badge-tier1{background:var(--surface2);color:var(--text3);border:1px solid var(--border2);}
  .badge-tier2{background:#e8f0fe;color:#3b5bdb;border:1px solid #c5d2f6;}
  .badge-tier3{background:linear-gradient(135deg,#fff7e6,#ffecd2);color:#b45309;border:1px solid #f6d860;}
  .badge-green{background:var(--green-light);color:var(--green);}
  .badge-red{background:var(--red-light);color:var(--red);}
  .badge-yellow{background:var(--yellow-light);color:var(--yellow);}
  .badge-gray{background:var(--surface2);color:var(--text3);}
  .badge-blue{background:var(--blue-light);color:var(--blue);}
  .card{background:var(--surface);border:1.5px solid var(--border);border-radius:16px;padding:22px;box-shadow:var(--shadow);}
  .card-title{font-family:var(--display);font-size:15px;font-weight:600;margin-bottom:4px;}
  .card-sub{font-size:12px;color:var(--text3);margin-bottom:18px;}
  .input{background:var(--surface);border:1.5px solid var(--border2);color:var(--text);border-radius:var(--radius-sm);padding:9px 13px;font-size:13px;font-family:var(--font);outline:none;transition:border-color 0.18s;width:100%;}
  .input:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-glow);}
  .input.error{border-color:var(--red);}
  .textarea{resize:vertical;min-height:80px;}
  .form-group{margin-bottom:14px;}
  .form-label{display:block;font-size:11px;font-weight:700;color:var(--text2);margin-bottom:5px;text-transform:uppercase;letter-spacing:0.04em;}
  .form-error{font-size:11px;color:var(--red);margin-top:4px;font-weight:600;}
  .form-hint{font-size:11px;color:var(--text3);margin-top:4px;}
  .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;z-index:100;backdrop-filter:blur(4px);animation:fadeIn 0.15s ease;padding:20px;}
  .modal{background:var(--surface);border-radius:18px;width:100%;max-width:520px;max-height:88vh;overflow-y:auto;box-shadow:var(--shadow-lg);animation:slideUp 0.2s ease;}
  .modal-wide{max-width:680px;}
  .modal-header{padding:20px 22px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;}
  .modal-header h3{font-family:var(--display);font-size:16px;font-weight:600;}
  .modal-body{padding:20px 22px;}
  .modal-footer{padding:14px 22px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end;}
  .table{width:100%;border-collapse:collapse;}
  .table th{padding:9px 12px;text-align:left;font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.05em;border-bottom:2px solid var(--border);}
  .table td{padding:10px 12px;border-bottom:1px solid var(--border);font-size:13px;vertical-align:middle;}
  .table tr:last-child td{border-bottom:none;}
  .table tr:hover td{background:var(--surface2);}
  .search-bar{display:flex;gap:8px;margin-bottom:20px;}
  .search-input{flex:1;background:var(--surface);border:1.5px solid var(--border2);color:var(--text);border-radius:var(--radius-sm);padding:9px 14px;font-size:13px;font-family:var(--font);outline:none;}
  .search-input:focus{border-color:var(--accent);}
  .alert{border-radius:var(--radius-sm);padding:11px 14px;font-size:13px;display:flex;gap:9px;align-items:flex-start;}
  .alert-warn{background:var(--yellow-light);color:#92400e;border:1px solid #fde68a;}
  .alert-success{background:var(--green-light);color:#065f46;border:1px solid #a7f3d0;}
  .alert-error{background:var(--red-light);color:#991b1b;border:1px solid #fecaca;}
  .alert-info{background:var(--blue-light);color:#1e40af;border:1px solid #bfdbfe;}
  .notification{position:fixed;top:20px;right:20px;z-index:300;background:var(--surface);border:1.5px solid var(--border2);border-radius:11px;padding:12px 16px;min-width:260px;box-shadow:var(--shadow-lg);animation:slideIn 0.25s ease;display:flex;align-items:center;gap:9px;font-size:13px;}
  .notification.success{border-left:3px solid var(--green);}
  .notification.error{border-left:3px solid var(--red);}
  .stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px;}
  .stat-card{background:var(--surface);border:1.5px solid var(--border);border-radius:14px;padding:18px;box-shadow:var(--shadow);}
  .stat-val{font-size:26px;font-weight:800;font-family:var(--display);}
  .stat-label{font-size:11px;color:var(--text3);font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin-top:2px;}
  .detail-row{display:flex;gap:12px;padding:9px 0;border-bottom:1px solid var(--border);}
  .detail-row:last-child{border-bottom:none;}
  .detail-label{font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.05em;min-width:120px;padding-top:2px;}
  .detail-value{font-size:13px;color:var(--text);flex:1;}
  .pagination-wrap{display:flex;align-items:center;justify-content:flex-end;gap:5px;margin-top:18px;}
  .page-btn{min-width:34px;height:34px;padding:0 7px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;border:1.5px solid var(--border2);background:var(--surface);color:var(--text2);transition:all 0.15s;font-family:var(--font);display:flex;align-items:center;justify-content:center;}
  .page-btn:hover:not(:disabled){background:var(--surface2);}
  .page-btn.active{background:var(--accent);color:#fff;border-color:var(--accent);}
  .page-btn:disabled{opacity:0.3;cursor:not-allowed;}
  .divider{border:none;border-top:1px solid var(--border);margin:16px 0;}
  /* DOC VIEWER */
  .doc-viewer-overlay{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,0.88);display:flex;flex-direction:column;animation:fadeIn 0.18s ease;}
  .doc-viewer-topbar{display:flex;align-items:center;justify-content:space-between;padding:12px 20px;background:rgba(255,255,255,0.06);border-bottom:1px solid rgba(255,255,255,0.1);flex-shrink:0;}
  .doc-viewer-title{font-family:var(--display);font-size:15px;font-weight:600;color:#f0ede8;display:flex;align-items:center;gap:10px;}
  .doc-viewer-controls{display:flex;align-items:center;gap:8px;}
  .doc-ctrl-btn{width:36px;height:36px;border-radius:9px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.15);color:#f0ede8;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.15s;font-family:var(--font);font-weight:700;}
  .doc-ctrl-btn:hover{background:rgba(255,255,255,0.18);}
  .doc-ctrl-btn:disabled{opacity:0.35;cursor:not-allowed;}
  .doc-zoom-label{min-width:52px;text-align:center;font-size:13px;font-weight:700;color:#d0c8be;font-family:var(--font);}
  .doc-viewer-sidebar{display:flex;flex-direction:column;gap:6px;padding:14px 10px;background:rgba(255,255,255,0.04);border-right:1px solid rgba(255,255,255,0.08);min-width:130px;overflow-y:auto;flex-shrink:0;}
  .doc-thumb-btn{padding:8px 10px;border-radius:8px;cursor:pointer;border:1.5px solid transparent;background:rgba(255,255,255,0.06);color:#c4b5a0;font-size:12px;font-family:var(--font);transition:all 0.15s;text-align:left;line-height:1.4;}
  .doc-thumb-btn:hover{background:rgba(255,255,255,0.12);color:#f0e8dc;}
  .doc-thumb-btn.active{background:rgba(249,115,22,0.2);border-color:rgba(249,115,22,0.5);color:#fb923c;}
  .doc-viewer-main{flex:1;overflow:hidden;display:flex;align-items:center;justify-content:center;position:relative;cursor:grab;user-select:none;}
  .doc-viewer-main.grabbing{cursor:grabbing;}
  .doc-viewer-main.zoom-in-cursor{cursor:zoom-in;}
  .doc-img-wrap{transition:transform 0.05s linear;transform-origin:center center;display:flex;align-items:center;justify-content:center;}
  .doc-img{max-width:90vw;max-height:78vh;border-radius:6px;box-shadow:0 8px 48px rgba(0,0,0,0.6);display:block;pointer-events:none;object-fit:contain;}
  .doc-pdf-placeholder{background:#fff;border-radius:10px;padding:40px 60px;text-align:center;box-shadow:0 8px 48px rgba(0,0,0,0.6);}
  .doc-pdf-icon{font-size:56px;margin-bottom:14px;}
  .doc-pdf-name{font-size:15px;font-weight:700;color:#333;margin-bottom:6px;}
  .doc-pdf-sub{font-size:12px;color:#888;}
  .doc-viewer-body{flex:1;display:flex;overflow:hidden;}
  .doc-page-indicator{position:absolute;bottom:16px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.55);border-radius:100px;padding:4px 14px;font-size:12px;color:#ccc;font-family:var(--font);pointer-events:none;}
  .doc-item{display:flex;justify-content:space-between;align-items:center;background:var(--surface2);padding:10px 14px;border-radius:10px;border:1px solid var(--border);margin-bottom:8px;}
  .doc-item-info{display:flex;flex-direction:column;gap:2px;}
  .doc-item-label{font-weight:600;font-size:13px;}
  .doc-item-name{font-size:11px;color:var(--text3);}
  .doc-view-btn{display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:6px;background:var(--blue-light);color:var(--blue);font-size:12px;font-weight:700;cursor:pointer;border:1px solid rgba(29,78,216,0.18);transition:background 0.15s;font-family:var(--font);}
  .doc-view-btn:hover{background:rgba(29,78,216,0.14);}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes slideUp{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}
  @keyframes slideIn{from{transform:translateX(14px);opacity:0}to{transform:translateX(0);opacity:1}}
  .skeleton-row td{background:linear-gradient(90deg,var(--surface2) 25%,var(--border) 50%,var(--surface2) 75%);background-size:400px 100%;animation:shimmer 1.4s infinite linear;}
  @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
`;

// ============================================================
// HELPERS
// ============================================================
function TierBadge({ tier }) {
  const map = { 1:["badge-tier1","⚪ ขั้น 1"], 2:["badge-tier2","🔵 ขั้น 2"], 3:["badge-tier3","🥇 ขั้น 3"] };
  const [cls, label] = map[tier] || map[1];
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
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

function Pagination({ currentPage, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1);
  return (
    <div className="pagination-wrap">
      <button className="page-btn" onClick={() => onChange(currentPage-1)} disabled={currentPage===1}>‹</button>
      {pages.map(p => <button key={p} className={`page-btn ${p===currentPage?"active":""}`} onClick={() => onChange(p)}>{p}</button>)}
      <button className="page-btn" onClick={() => onChange(currentPage+1)} disabled={currentPage===totalPages}>›</button>
    </div>
  );
}

function SkeletonRows({ cols = 6, rows = 4 }) {
  return Array.from({ length: rows }).map((_, i) => (
    <tr key={i} className="skeleton-row">
      {Array.from({ length: cols }).map((_, j) => <td key={j}>&nbsp;</td>)}
    </tr>
  ));
}

// ============================================================
// DOC VIEWER
// ============================================================
const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];
const DEFAULT_ZOOM_IDX = 2;

function DocViewer({ docs, initialIndex = 0, onClose }) {
  const [docIdx, setDocIdx]   = useState(initialIndex);
  const [zoomIdx, setZoomIdx] = useState(DEFAULT_ZOOM_IDX);
  const [pan, setPan]         = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(null);
  const mainRef   = useRef(null);
  const doc  = docs[docIdx];
  const zoom = ZOOM_LEVELS[zoomIdx];

  useEffect(() => { setZoomIdx(DEFAULT_ZOOM_IDX); setPan({ x:0, y:0 }); }, [docIdx]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key==="Escape") onClose();
      if (e.key==="ArrowRight"||e.key==="ArrowDown") setDocIdx(i=>Math.min(i+1,docs.length-1));
      if (e.key==="ArrowLeft" ||e.key==="ArrowUp")   setDocIdx(i=>Math.max(i-1,0));
      if (e.key==="+"||e.key==="=") setZoomIdx(i=>Math.min(i+1,ZOOM_LEVELS.length-1));
      if (e.key==="-")              setZoomIdx(i=>Math.max(i-1,0));
      if (e.key==="0") { setZoomIdx(DEFAULT_ZOOM_IDX); setPan({x:0,y:0}); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [docs.length, onClose]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    if (e.deltaY<0) setZoomIdx(i=>Math.min(i+1,ZOOM_LEVELS.length-1));
    else            setZoomIdx(i=>Math.max(i-1,0));
  }, []);
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  const onPointerDown = (e) => {
    if (zoom<=1) return;
    setDragging(true);
    dragStart.current = { mx:e.clientX, my:e.clientY, px:pan.x, py:pan.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!dragging||!dragStart.current) return;
    setPan({ x:dragStart.current.px+(e.clientX-dragStart.current.mx), y:dragStart.current.py+(e.clientY-dragStart.current.my) });
  };
  const onPointerUp = () => { setDragging(false); dragStart.current=null; };

  return (
    <div className="doc-viewer-overlay">
      <div className="doc-viewer-topbar">
        <div className="doc-viewer-title">
          <span style={{fontSize:18}}>{doc.fileType==="pdf"?"📄":"🖼️"}</span>
          <span>{doc.label}</span>
          <span style={{fontSize:12,opacity:0.5,fontFamily:"var(--font)",fontWeight:400}}>{doc.name}</span>
          {docs.length>1 && <span style={{fontSize:12,color:"#9a8a7a"}}>({docIdx+1}/{docs.length})</span>}
        </div>
        <div className="doc-viewer-controls">
          <button className="doc-ctrl-btn" onClick={()=>setZoomIdx(i=>Math.max(i-1,0))} disabled={zoomIdx===0}>−</button>
          <span className="doc-zoom-label">{Math.round(zoom*100)}%</span>
          <button className="doc-ctrl-btn" onClick={()=>setZoomIdx(i=>Math.min(i+1,ZOOM_LEVELS.length-1))} disabled={zoomIdx===ZOOM_LEVELS.length-1}>+</button>
          <button className="doc-ctrl-btn" onClick={()=>{setZoomIdx(DEFAULT_ZOOM_IDX);setPan({x:0,y:0})}} style={{fontSize:13}}>⊙</button>
          <div style={{width:1,height:24,background:"rgba(255,255,255,0.15)",margin:"0 4px"}}/>
          {docs.length>1 && <>
            <button className="doc-ctrl-btn" onClick={()=>setDocIdx(i=>Math.max(i-1,0))} disabled={docIdx===0}>‹</button>
            <button className="doc-ctrl-btn" onClick={()=>setDocIdx(i=>Math.min(i+1,docs.length-1))} disabled={docIdx===docs.length-1}>›</button>
          </>}
          <button className="doc-ctrl-btn" onClick={onClose} style={{background:"rgba(220,38,38,0.25)",marginLeft:4}}>✕</button>
        </div>
      </div>
      <div className="doc-viewer-body">
        {docs.length>1 && (
          <div className="doc-viewer-sidebar">
            <div style={{fontSize:10,fontWeight:700,color:"#6b5d4e",textTransform:"uppercase",letterSpacing:"0.1em",padding:"0 4px 8px"}}>เอกสาร</div>
            {docs.map((d,i) => (
              <button key={i} className={`doc-thumb-btn ${i===docIdx?"active":""}`} onClick={()=>setDocIdx(i)}>
                <span style={{fontSize:15}}>{d.fileType==="pdf"?"📄":"🖼️"}</span>
                <span style={{display:"block",marginTop:3,fontSize:11}}>{d.label}</span>
                <span style={{display:"block",fontSize:10,opacity:0.6}}>{d.name}</span>
              </button>
            ))}
          </div>
        )}
        <div ref={mainRef} className={`doc-viewer-main ${dragging?"grabbing":zoom>1?"":"zoom-in-cursor"}`}
          onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}
          onDoubleClick={()=>{ if(zoomIdx<ZOOM_LEVELS.length-1) setZoomIdx(i=>i+1); else{setZoomIdx(DEFAULT_ZOOM_IDX);setPan({x:0,y:0}); }}}>
          <div className="doc-img-wrap" style={{transform:`scale(${zoom}) translate(${pan.x/zoom}px,${pan.y/zoom}px)`}}>
            {doc.fileType==="pdf" ? (
              <div className="doc-pdf-placeholder">
                <div className="doc-pdf-icon">📄</div>
                <div className="doc-pdf-name">{doc.name}</div>
                <div className="doc-pdf-sub">{doc.label}</div>
                <div style={{marginTop:16,fontSize:12,color:"#888"}}>ไฟล์ PDF — ในระบบจริงจะแสดง PDF viewer</div>
              </div>
            ) : (
              <img className="doc-img" src={doc.previewUrl} alt={doc.label} draggable={false} />
            )}
          </div>
          <div className="doc-page-indicator">scroll เพื่อซูม · ดับเบิ้ลคลิกซูมเข้า · ลากเพื่อเลื่อน · Esc ปิด</div>
        </div>
      </div>
    </div>
  );
}

function DocList({ docs, onView }) {
  if (!docs || docs.length===0) return <div style={{fontSize:13,color:"var(--text3)",fontStyle:"italic",padding:"8px 0"}}>ไม่มีเอกสารแนบ</div>;
  return (
    <div>
      {docs.map((doc,i) => (
        <div key={i} className="doc-item">
          <div className="doc-item-info">
            <span className="doc-item-label">{doc.fileType==="pdf"?"📄":"🖼️"} {doc.label}</span>
            <span className="doc-item-name">{doc.name}</span>
          </div>
          <button className="doc-view-btn" onClick={()=>onView(i)}>🔍 ดูเอกสาร</button>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// SIDEBAR
// ============================================================
const NAV_ITEMS = [
  { id:"dashboard",        icon:"📊", label:"ภาพรวม",            section:"ภาพรวม" },
  { id:"shops",            icon:"🏪", label:"จัดการร้านค้า",      section:"ร้านค้า" },
  { id:"blacklist",        icon:"⛔", label:"รายการ Blacklist" },
  { id:"upgrade-tier3",    icon:"🥇", label:"เลื่อนขั้นที่ 3",    section:"คำร้อง" },
  { id:"upgrade-requests", icon:"📋", label:"คำร้องขอเลื่อนขั้น" },
  { id:"reports",          icon:"🚩", label:"คำร้องรายงาน" },
  { id:"claims",           icon:"⚖️", label:"คำร้องขอเคลม" },
];

function Sidebar({ active, onNavigate }) {
  let lastSection = "";
  return (
    <div className="sidebar">
      <div className="sidebar-brand">my<span>Order</span> <span style={{fontSize:11,opacity:0.6}}>Admin</span></div>
      {NAV_ITEMS.map(item => {
        const showSection = item.section && item.section !== lastSection;
        if (showSection) lastSection = item.section;
        return (
          <div key={item.id}>
            {showSection && <div className="sidebar-section">{item.section}</div>}
            <div className={`sidebar-item ${active===item.id?"active":""}`} onClick={()=>onNavigate(item.id)}>
              <span className="sidebar-item-icon">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// DASHBOARD
// ============================================================
function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.getDashboard().catch(() => null),
      adminApi.getReports({ status: "pending", per_page: 5 }).catch(() => ({ data: [] })),
    ]).then(([dashData, reportsData]) => {
      setStats(dashData);
      setRecentReports(reportsData?.data ?? []);
      setLoading(false);
    });
  }, []);

  const s = stats ?? {};

  return (
    <div>
      <div className="page-title">📊 ภาพรวมระบบ</div>
      <div className="page-sub">ข้อมูลสถานะรวมของระบบ myOrder</div>
      <div className="stat-grid">
        {[
          ["ร้านค้าทั้งหมด", s.total_shops ?? "—",   "var(--accent)"],
          ["Blacklist",       s.blacklisted  ?? "—",   "var(--red)"],
          ["รอเลื่อนขั้น",   s.pending_upgrades ?? "—","var(--yellow)"],
          ["คำร้องเคลม",     s.pending_claims ?? "—",  "var(--blue)"],
        ].map(([label, val, color]) => (
          <div key={label} className="stat-card">
            <div className="stat-val" style={{ color }}>{loading ? "…" : val}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-title">คำร้องรายงานล่าสุดที่รอดำเนินการ</div>
        <div className="card-sub">คำร้องที่ยังไม่ได้จัดการ</div>
        {loading ? <div style={{color:"var(--text3)",fontSize:13}}>กำลังโหลด...</div> :
         recentReports.length === 0 ? <div style={{color:"var(--text3)",fontSize:13}}>ไม่มีคำร้องที่รอดำเนินการ</div> :
         recentReports.map(r => (
          <div key={r.id} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid var(--border)",alignItems:"center"}}>
            <div>
              <div style={{fontWeight:600}}>{r.shop?.name ?? r.reported_shop_ref_id}</div>
              <div style={{fontSize:12,color:"var(--text3)"}}>{r.fraud_type?.name ?? r.reason} · {r.created_at?.substring(0,10)}</div>
            </div>
            <span className="badge badge-yellow">⏳ รอดำเนินการ</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// UC6 + UC3 + UC4 + UC5 + UC7 — จัดการร้านค้า
// ============================================================
function ShopsPage({ notify }) {
  const [shops, setShops]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [query, setQuery]       = useState("");
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedShop, setSelectedShop]           = useState(null);
  const [showAddModal, setShowAddModal]            = useState(false);
  const [showEditModal, setShowEditModal]          = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [confirmShop, setConfirmShop]             = useState(null);

  const [editForm, setEditForm]   = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [addForm, setAddForm]     = useState({ name:"", url:"", description:"", owner_account_id:"" });
  const [addErrors, setAddErrors] = useState({});
  const [blacklistReason, setBlacklistReason]   = useState("");
  const [blacklistError, setBlacklistError]     = useState("");
  const [saving, setSaving] = useState(false);

  const loadShops = (q = query, p = page) => {
    setLoading(true);
    adminApi.getShops({ q, page: p, per_page: ITEMS_PER_PAGE })
      .then(data => {
        setShops(data.data ?? []);
        setTotalPages(data.last_page ?? 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadShops(); }, []);

  const handleSearch = () => { setPage(1); loadShops(query, 1); };

  const openManage = (shop) => {
    setSelectedShop(shop);
    setEditForm({ name: shop.name, url: shop.url, description: shop.description ?? "" });
    setEditErrors({});
  };

  const handleSaveEdit = async () => {
    const errors = {};
    const ne = validateText(editForm.name);  if (ne) errors.name = ne;
    const le = validateUrl(editForm.url);    if (le) errors.url  = le;
    if (Object.keys(errors).length) { setEditErrors(errors); return; }
    setSaving(true);
    try {
      const updated = await adminApi.updateShop(selectedShop.ref_id, editForm);
      setShops(prev => prev.map(s => s.ref_id === selectedShop.ref_id ? { ...s, ...updated } : s));
      setSelectedShop(s => ({ ...s, ...updated }));
      setShowEditModal(false);
      notify("แก้ไขข้อมูลร้านค้าเรียบร้อย", "success");
    } catch (e) {
      notify("บันทึกไม่สำเร็จ: " + e.message, "error");
    } finally { setSaving(false); }
  };

  const handleDelete = async (shop) => {
    setSaving(true);
    try {
      await adminApi.deleteShop(shop.ref_id);
      setShops(prev => prev.filter(s => s.ref_id !== shop.ref_id));
      setSelectedShop(null); setShowDeleteConfirm(false);
      notify(`ลบร้านค้า "${shop.name}" เรียบร้อย`, "success");
    } catch (e) {
      notify("ลบไม่สำเร็จ: " + e.message, "error");
    } finally { setSaving(false); }
  };

  const handleBlacklist = async () => {
    if (!blacklistReason.trim()) { setBlacklistError("กรุณาระบุเหตุผล"); return; }
    setSaving(true);
    try {
      await adminApi.blacklistShop(selectedShop.ref_id, blacklistReason);
      setShops(prev => prev.map(s => s.ref_id === selectedShop.ref_id ? { ...s, is_blacklist: true } : s));
      setShowBlacklistModal(false); setSelectedShop(null);
      notify(`เพิ่ม "${selectedShop.name}" ใน Blacklist แล้ว`, "success");
    } catch (e) {
      notify("Blacklist ไม่สำเร็จ: " + e.message, "error");
    } finally { setSaving(false); }
  };

  const handleAddShop = async () => {
    const errors = {};
    const ne = validateText(addForm.name);       if (ne) errors.name = ne;
    const le = validateUrl(addForm.url);         if (le) errors.url  = le;
    const oe = validateUserId(addForm.owner_account_id); if (oe) errors.owner_account_id = oe;
    if (Object.keys(errors).length) { setAddErrors(errors); return; }
    setSaving(true);
    try {
      const newShop = await adminApi.createShop(addForm);
      setShops(prev => [newShop, ...prev]);
      setShowAddModal(false);
      setAddForm({ name:"", url:"", description:"", owner_account_id:"" });
      notify("เพิ่มร้านค้าใหม่เรียบร้อย", "success");
    } catch (e) {
      notify("เพิ่มไม่สำเร็จ: " + e.message, "error");
    } finally { setSaving(false); }
  };

  const tierOf = (s) => s.tier ?? (s.shop_status === "TIER3" ? 3 : s.shop_status === "TIER2" ? 2 : 1);

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        <div><div className="page-title">🏪 จัดการร้านค้า</div><div className="page-sub">รายการร้านค้าทั้งหมดในระบบ</div></div>
        <button className="btn btn-primary" onClick={()=>setShowAddModal(true)}>＋ เพิ่มร้านค้า</button>
      </div>
      <div className="search-bar">
        <input className="search-input" placeholder="ค้นหาชื่อร้าน, Account ID..." value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSearch()} />
        <button className="btn btn-outline btn-sm" onClick={handleSearch}>🔍 ค้นหา</button>
      </div>
      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <table className="table">
          <thead><tr><th>ร้านค้า</th><th>ระดับ</th><th>สถานะ</th><th>เจ้าของ</th><th>จัดการ</th></tr></thead>
          <tbody>
            {loading ? <SkeletonRows cols={5} /> : shops.length === 0
              ? <tr><td colSpan={5} style={{textAlign:"center",padding:"24px",color:"var(--text3)"}}>ไม่พบร้านค้า</td></tr>
              : shops.map(s => (
              <tr key={s.ref_id}>
                <td><div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:20}}>{s.img_emoji ?? "🏪"}</span>
                  <div><div style={{fontWeight:600}}>{s.name}</div><div style={{fontSize:11,color:"var(--text3)"}}>{s.ref_id}</div></div>
                </div></td>
                <td><TierBadge tier={tierOf(s)} /></td>
                <td>{s.is_blacklist
                  ? <span className="badge badge-red">⛔ Blacklist</span>
                  : s.is_active
                    ? <span className="badge badge-green">✓ เปิด</span>
                    : <span className="badge badge-gray">🔒 ปิด</span>}
                </td>
                <td style={{fontSize:12,color:"var(--text3)"}}>{s.owner_account_id ?? "—"}</td>
                <td><button className="btn btn-outline btn-xs" onClick={()=>openManage(s)}>จัดการ</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={page} totalPages={totalPages} onChange={p=>{setPage(p);loadShops(query,p);}} />

      {/* Modal จัดการ */}
      {selectedShop && (
        <Modal title={`จัดการ: ${selectedShop.name}`} onClose={()=>setSelectedShop(null)} wide>
          <div style={{display:"flex",gap:14,alignItems:"center",marginBottom:20,padding:"0 0 16px",borderBottom:"1px solid var(--border)"}}>
            <span style={{fontSize:36}}>{selectedShop.img_emoji ?? "🏪"}</span>
            <div>
              <div style={{fontFamily:"var(--display)",fontSize:16,fontWeight:600}}>{selectedShop.name}</div>
              <div style={{display:"flex",gap:6,marginTop:4}}><TierBadge tier={tierOf(selectedShop)} /></div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
            <button className="btn btn-outline" onClick={()=>setShowEditModal(true)}>✏️ แก้ไขข้อมูล</button>
            <button className="btn btn-warn"
              onClick={()=>{setBlacklistReason("");setBlacklistError("");setShowBlacklistModal(true);}}
              disabled={!!selectedShop.is_blacklist}>
              {selectedShop.is_blacklist ? "⛔ Blacklist แล้ว" : "⛔ เพิ่ม Blacklist"}
            </button>
            <button className="btn btn-danger" onClick={()=>{setConfirmShop(selectedShop);setShowDeleteConfirm(true);}}>🗑️ ลบร้านค้า</button>
          </div>
          <div className="detail-row"><div className="detail-label">🔗 ลิงก์</div><div className="detail-value" style={{wordBreak:"break-all"}}>{selectedShop.url||"—"}</div></div>
          <div className="detail-row"><div className="detail-label">📝 รายละเอียด</div><div className="detail-value">{selectedShop.description||"—"}</div></div>
          <div className="detail-row"><div className="detail-label">👤 เจ้าของ</div><div className="detail-value">{selectedShop.owner_account_id||"—"}</div></div>
          <div className="detail-row"><div className="detail-label">📅 สร้างเมื่อ</div><div className="detail-value">{selectedShop.created_at?.substring(0,10)||"—"}</div></div>
          <div className="detail-row"><div className="detail-label">📊 Upgrade fails</div>
            <div className="detail-value">
              <span style={{color: selectedShop.failed_upgrade_count >= 3 ? "var(--red)" : "var(--text)", fontWeight: selectedShop.failed_upgrade_count >= 3 ? 700 : 400}}>
                {selectedShop.failed_upgrade_count ?? 0} / 3 ครั้ง
              </span>
              {selectedShop.failed_upgrade_count >= 3 && <span style={{marginLeft:8,fontSize:11,color:"var(--text3)"}}>(cooldown 90 วัน)</span>}
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Blacklist */}
      {showBlacklistModal && selectedShop && (
        <Modal title="⛔ ยืนยันการแบนร้านค้า" onClose={()=>setShowBlacklistModal(false)}
          footer={<><button className="btn btn-ghost btn-sm" onClick={()=>setShowBlacklistModal(false)}>ยกเลิก</button><button className="btn btn-warn btn-sm" onClick={handleBlacklist} disabled={saving}>ยืนยันการแบน</button></>}>
          <div className="alert alert-warn" style={{marginBottom:16}}>⚠️ ร้านค้านี้จะหายไปจากระบบทันที</div>
          <p style={{fontSize:14,marginBottom:12}}>แบน <strong>"{selectedShop.name}"</strong></p>
          <div className="form-group">
            <label className="form-label">เหตุผลในการแบน *</label>
            <textarea className={`input textarea ${blacklistError?"error":""}`} placeholder="ระบุเหตุผล..." value={blacklistReason} onChange={e=>{setBlacklistReason(e.target.value);setBlacklistError("");}} rows={3} />
            {blacklistError && <div className="form-error">{blacklistError}</div>}
          </div>
        </Modal>
      )}

      {/* Modal Edit */}
      {showEditModal && selectedShop && (
        <Modal title="✏️ แก้ไขข้อมูลร้านค้า" onClose={()=>{setShowEditModal(false);setEditErrors({});}}
          footer={<><button className="btn btn-ghost btn-sm" onClick={()=>setShowEditModal(false)}>ยกเลิก</button><button className="btn btn-primary btn-sm" onClick={handleSaveEdit} disabled={saving}>บันทึก</button></>}>
          <div className="form-group"><label className="form-label">ชื่อร้านค้า *</label><input className={`input ${editErrors.name?"error":""}`} value={editForm.name} onChange={e=>{setEditForm(p=>({...p,name:e.target.value}));setEditErrors(p=>({...p,name:null}));}} />{editErrors.name&&<div className="form-error">{editErrors.name}</div>}</div>
          <div className="form-group"><label className="form-label">ลิงก์ติดต่อ *</label><input className={`input ${editErrors.url?"error":""}`} value={editForm.url} onChange={e=>{setEditForm(p=>({...p,url:e.target.value}));setEditErrors(p=>({...p,url:null}));}} />{editErrors.url&&<div className="form-error">{editErrors.url}</div>}</div>
          <div className="form-group"><label className="form-label">รายละเอียด</label><textarea className="input textarea" value={editForm.description} onChange={e=>setEditForm(p=>({...p,description:e.target.value}))} /></div>
        </Modal>
      )}

      {/* Modal Delete */}
      {showDeleteConfirm && confirmShop && (
        <Modal title="🗑️ ยืนยันการลบ" onClose={()=>setShowDeleteConfirm(false)}
          footer={<><button className="btn btn-ghost btn-sm" onClick={()=>setShowDeleteConfirm(false)}>ยกเลิก</button><button className="btn btn-danger btn-sm" onClick={()=>handleDelete(confirmShop)} disabled={saving}>ยืนยันลบ</button></>}>
          <div className="alert alert-warn" style={{marginBottom:16}}>⚠️ ร้านค้าจะไม่ปรากฏในระบบอีกต่อไป</div>
          <p style={{fontSize:14}}>ลบ <strong>"{confirmShop.name}"</strong>?</p>
        </Modal>
      )}

      {/* Modal Add */}
      {showAddModal && (
        <Modal title="＋ เพิ่มร้านค้าใหม่" onClose={()=>{setShowAddModal(false);setAddErrors({});}} wide
          footer={<><button className="btn btn-ghost btn-sm" onClick={()=>setShowAddModal(false)}>ยกเลิก</button><button className="btn btn-primary btn-sm" onClick={handleAddShop} disabled={saving}>เพิ่มร้านค้า</button></>}>
          <div className="form-group"><label className="form-label">ชื่อร้านค้า *</label><input className={`input ${addErrors.name?"error":""}`} value={addForm.name} onChange={e=>{setAddForm(p=>({...p,name:e.target.value}));setAddErrors(p=>({...p,name:null}));}} />{addErrors.name&&<div className="form-error">{addErrors.name}</div>}</div>
          <div className="form-group"><label className="form-label">Account ID เจ้าของ *</label><input className={`input ${addErrors.owner_account_id?"error":""}`} placeholder="ULID ของ account" value={addForm.owner_account_id} onChange={e=>{setAddForm(p=>({...p,owner_account_id:e.target.value}));setAddErrors(p=>({...p,owner_account_id:null}));}} />{addErrors.owner_account_id&&<div className="form-error">{addErrors.owner_account_id}</div>}</div>
          <div className="form-group"><label className="form-label">ลิงก์ติดต่อ *</label><input className={`input ${addErrors.url?"error":""}`} placeholder="https://line.me/..." value={addForm.url} onChange={e=>{setAddForm(p=>({...p,url:e.target.value}));setAddErrors(p=>({...p,url:null}));}} />{addErrors.url&&<div className="form-error">{addErrors.url}</div>}</div>
          <div className="form-group"><label className="form-label">รายละเอียด</label><textarea className="input textarea" value={addForm.description} onChange={e=>setAddForm(p=>({...p,description:e.target.value}))} /></div>
        </Modal>
      )}
    </div>
  );
}

// ============================================================
// UC7 — Blacklist
// ============================================================
function BlacklistPage() {
  const [shops, setShops]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery]     = useState("");
  const [page, setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState(null);

  const load = (q = query, p = page) => {
    setLoading(true);
    adminApi.getShops({ q, blacklisted: 1, page: p, per_page: ITEMS_PER_PAGE })
      .then(data => { setShops(data.data ?? []); setTotalPages(data.last_page ?? 1); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="page-title">⛔ รายการร้านค้า Blacklist</div>
      <div className="page-sub">UC7 — ร้านค้าที่ถูกระงับจากระบบ</div>
      <div className="search-bar">
        <input className="search-input" placeholder="ค้นหาชื่อร้าน..." value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&load(query,1)} />
        <button className="btn btn-outline btn-sm" onClick={()=>load(query,1)}>🔍</button>
      </div>
      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <table className="table">
          <thead><tr><th>ร้านค้า</th><th>สถานะ</th><th>เจ้าของ</th><th>จัดการ</th></tr></thead>
          <tbody>
            {loading ? <SkeletonRows cols={4} /> : shops.length===0
              ? <tr><td colSpan={4} style={{textAlign:"center",padding:"24px",color:"var(--text3)"}}>ไม่พบร้านค้าใน Blacklist</td></tr>
              : shops.map(s => (
              <tr key={s.ref_id}>
                <td><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:18}}>{s.img_emoji ?? "🏪"}</span><div><div style={{fontWeight:600}}>{s.name}</div><span className="badge badge-red" style={{fontSize:10}}>⛔ Blacklist</span></div></div></td>
                <td><span className="badge badge-red">ระงับ</span></td>
                <td style={{fontSize:12,color:"var(--text3)"}}>{s.owner_account_id ?? "—"}</td>
                <td><button className="btn btn-outline btn-xs" onClick={()=>setSelected(s)}>ดูรายละเอียด</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={page} totalPages={totalPages} onChange={p=>{setPage(p);load(query,p);}} />
      {selected && (
        <Modal title={`รายละเอียด: ${selected.name}`} onClose={()=>setSelected(null)}>
          <div className="alert alert-error" style={{marginBottom:16}}>⛔ ร้านนี้อยู่ใน Blacklist</div>
          <div className="detail-row"><div className="detail-label">ชื่อร้าน</div><div className="detail-value">{selected.name}</div></div>
          <div className="detail-row"><div className="detail-label">ref_id</div><div className="detail-value">{selected.ref_id}</div></div>
          <div className="detail-row"><div className="detail-label">เจ้าของ</div><div className="detail-value">{selected.owner_account_id}</div></div>
          <div className="detail-row"><div className="detail-label">รายละเอียด</div><div className="detail-value">{selected.description}</div></div>
        </Modal>
      )}
    </div>
  );
}

// ============================================================
// UC9 — เลื่อนขั้น 3
// ============================================================
function UpgradeTier3Page({ notify }) {
  const [shops, setShops]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery]     = useState("");
  const [page, setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedShop, setSelectedShop] = useState(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [saving, setSaving]   = useState(false);

  const load = (q = query, p = page) => {
    setLoading(true);
    adminApi.getShops({ q, tier: "tier2", page: p, per_page: ITEMS_PER_PAGE })
      .then(data => { setShops(data.data ?? []); setTotalPages(data.last_page ?? 1); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handlePromote = async () => {
    setSaving(true);
    try {
      await adminApi.promoteTier3(selectedShop.ref_id);
      setShops(prev => prev.filter(s => s.ref_id !== selectedShop.ref_id));
      setSelectedShop(null); setConfirmModal(false);
      notify(`เลื่อน "${selectedShop.name}" เป็น ขั้น 3 เรียบร้อย`, "success");
    } catch (e) {
      notify("ไม่สำเร็จ: " + e.message, "error");
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="page-title">🥇 เลื่อนขั้นที่ 3 ให้ร้านค้า</div>
      <div className="page-sub">UC9 — ร้านค้าระดับ 2 ที่ myOrder ทดลองสั่งของแล้ว</div>
      <div className="search-bar">
        <input className="search-input" placeholder="ค้นหาชื่อร้าน..." value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&load(query,1)} />
        <button className="btn btn-outline btn-sm" onClick={()=>load(query,1)}>🔍</button>
      </div>
      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <table className="table">
          <thead><tr><th>ร้านค้า</th><th>ระดับปัจจุบัน</th><th>เจ้าของ</th><th>จัดการ</th></tr></thead>
          <tbody>
            {loading ? <SkeletonRows cols={4} /> : shops.length===0
              ? <tr><td colSpan={4} style={{textAlign:"center",padding:"24px",color:"var(--text3)"}}>ไม่มีร้านค้าระดับ 2 รอเลื่อนขั้น</td></tr>
              : shops.map(s => (
              <tr key={s.ref_id}>
                <td><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:18}}>{s.img_emoji ?? "🏪"}</span><div style={{fontWeight:600}}>{s.name}</div></div></td>
                <td><TierBadge tier={2} /></td>
                <td style={{fontSize:12,color:"var(--text3)"}}>{s.owner_account_id ?? "—"}</td>
                <td><button className="btn btn-outline btn-xs" onClick={()=>{setSelectedShop(s);setConfirmModal(false);}}>จัดการ</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={page} totalPages={totalPages} onChange={p=>{setPage(p);load(query,p);}} />

      {selectedShop && !confirmModal && (
        <Modal title={`เลื่อนขั้น: ${selectedShop.name}`} onClose={()=>setSelectedShop(null)}>
          <div className="alert alert-info" style={{marginBottom:16}}>💡 ยืนยันว่า myOrder ทดลองสั่งสินค้าแล้วและไม่พบการโกง</div>
          <div className="detail-row"><div className="detail-label">เจ้าของ</div><div className="detail-value">{selectedShop.owner_account_id}</div></div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:20}}>
            <button className="btn btn-ghost btn-sm" onClick={()=>setSelectedShop(null)}>ยกเลิก</button>
            <button className="btn btn-success btn-sm" onClick={()=>setConfirmModal(true)}>✓ ทดลองสั่งของแล้ว → เลื่อนขั้น 3</button>
          </div>
        </Modal>
      )}
      {selectedShop && confirmModal && (
        <Modal title="ยืนยันการเลื่อนขั้น" onClose={()=>setConfirmModal(false)}
          footer={<><button className="btn btn-ghost btn-sm" onClick={()=>setConfirmModal(false)}>ยกเลิก</button><button className="btn btn-success btn-sm" onClick={handlePromote} disabled={saving}>ยืนยัน เลื่อนขั้น 3</button></>}>
          <div className="alert alert-warn" style={{marginBottom:14}}>⚠️ จะเลื่อน <strong>"{selectedShop.name}"</strong> เป็น ขั้น 3 ทันที</div>
        </Modal>
      )}
    </div>
  );
}

// ============================================================
// UC10 — คำร้องขอเลื่อนขั้น
// ============================================================
function UpgradeRequestsPage({ notify }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewerDocs, setViewerDocs]   = useState(null);
  const [viewerInitIdx, setViewerInitIdx] = useState(0);

  const load = (status = statusFilter, p = page) => {
    setLoading(true);
    adminApi.getUpgradeRequests({ status, page: p, per_page: ITEMS_PER_PAGE })
      .then(data => { setRequests(data.data ?? []); setTotalPages(data.last_page ?? 1); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openViewer = (docs, idx) => { setViewerDocs(docs); setViewerInitIdx(idx); };

  const handleApprove = async (req) => {
    setSaving(true);
    try {
      await adminApi.approveUpgrade(req.id);
      setRequests(prev => prev.filter(r => r.id !== req.id));
      setSelected(null);
      notify(`อนุมัติคำขอของ "${req.shop?.name}" แล้ว`, "success");
    } catch (e) {
      notify("ไม่สำเร็จ: " + e.message, "error");
    } finally { setSaving(false); }
  };

  const handleReject = async (req) => {
    if (!rejectReason.trim()) return;
    setSaving(true);
    try {
      await adminApi.rejectUpgrade(req.id, rejectReason);
      setRequests(prev => prev.filter(r => r.id !== req.id));
      setSelected(null); setShowRejectModal(false); setRejectReason("");
      notify(`ปฏิเสธคำขอของ "${req.shop?.name}"`, "error");
    } catch (e) {
      notify("ไม่สำเร็จ: " + e.message, "error");
    } finally { setSaving(false); }
  };

  const statusBadge = (s) => {
    if (s==="pending")  return <span className="badge badge-yellow">⏳ รอดำเนินการ</span>;
    if (s==="approved") return <span className="badge badge-green">✓ อนุมัติ</span>;
    if (s==="rejected") return <span className="badge badge-red">✕ ไม่อนุมัติ</span>;
    return <span className="badge badge-gray">{s}</span>;
  };

  return (
    <div>
      <div className="page-title">📋 คำร้องขอเลื่อนขั้น</div>
      <div className="page-sub">UC10 — รายการคำร้องจากร้านค้าที่ต้องการเลื่อนระดับ</div>
      <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
        {["pending","approved","rejected"].map(s => (
          <button key={s} className={`btn btn-sm ${statusFilter===s?"btn-primary":"btn-outline"}`}
            onClick={()=>{setStatusFilter(s);setPage(1);load(s,1);}}>
            {s==="pending"?"⏳ รอดำเนินการ":s==="approved"?"✓ อนุมัติแล้ว":"✕ ไม่อนุมัติ"}
          </button>
        ))}
      </div>
      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <table className="table">
          <thead><tr><th>ร้านค้า</th><th>ประเภทเจ้าของ</th><th>วันที่ยื่น</th><th>สถานะ</th><th>จัดการ</th></tr></thead>
          <tbody>
            {loading ? <SkeletonRows cols={5} /> : requests.length===0
              ? <tr><td colSpan={5} style={{textAlign:"center",padding:"24px",color:"var(--text3)"}}>ไม่มีคำร้อง</td></tr>
              : requests.map(req => (
              <tr key={req.id}>
                <td style={{fontWeight:600}}>{req.shop?.name ?? req.shop_ref_id}</td>
                <td><span className="badge badge-gray">{req.shop?.is_company?"🏢 นิติบุคคล":"👤 บุคคลธรรมดา"}</span></td>
                <td style={{fontSize:12,color:"var(--text3)"}}>{req.created_at?.substring(0,10)}</td>
                <td>{statusBadge(req.status)}</td>
                <td><button className="btn btn-outline btn-xs" onClick={()=>setSelected(req)}>จัดการ</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={page} totalPages={totalPages} onChange={p=>{setPage(p);load(statusFilter,p);}} />

      {selected && (
        <Modal title={`คำขอ: ${selected.shop?.name ?? selected.shop_ref_id}`} onClose={()=>setSelected(null)} wide>
          <div style={{marginBottom:16}}>
            <div className="detail-row"><div className="detail-label">ร้านค้า</div><div className="detail-value">{selected.shop?.name}</div></div>
            <div className="detail-row"><div className="detail-label">ประเภทเจ้าของ</div><div className="detail-value">{selected.shop?.is_company?"🏢 นิติบุคคล":"👤 บุคคลธรรมดา"}</div></div>
            <div className="detail-row"><div className="detail-label">วันที่ยื่น</div><div className="detail-value">{selected.created_at?.substring(0,10)}</div></div>
            <div className="detail-row"><div className="detail-label">สถานะ</div><div className="detail-value">{statusBadge(selected.status)}</div></div>
            {selected.admin_remark && <div className="detail-row"><div className="detail-label">เหตุผลไม่ผ่าน</div><div className="detail-value" style={{color:"var(--red)"}}>{selected.admin_remark}</div></div>}
          </div>
          {/* เอกสาร */}
          {(selected.attachments?.length > 0) && (
            <div style={{marginBottom:20}}>
              <div style={{fontSize:12,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:10}}>เอกสารที่ส่งมา</div>
              <DocList docs={selected.attachments.map(makeDocFromAttachment)} onView={idx=>openViewer(selected.attachments.map(makeDocFromAttachment),idx)} />
            </div>
          )}
          {selected.status==="pending" && (
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button className="btn btn-danger btn-sm" onClick={()=>setShowRejectModal(true)} disabled={saving}>✕ ไม่อนุมัติ</button>
              <button className="btn btn-success btn-sm" onClick={()=>handleApprove(selected)} disabled={saving}>✓ อนุมัติ</button>
            </div>
          )}
        </Modal>
      )}

      {showRejectModal && selected && (
        <Modal title="✕ ระบุเหตุผลที่ไม่อนุมัติ" onClose={()=>{setShowRejectModal(false);setRejectReason("");}}
          footer={<><button className="btn btn-ghost btn-sm" onClick={()=>{setShowRejectModal(false);setRejectReason("");}}>ยกเลิก</button><button className="btn btn-danger btn-sm" disabled={!rejectReason.trim()||saving} onClick={()=>handleReject(selected)}>ยืนยันไม่อนุมัติ</button></>}>
          <div className="form-group">
            <label className="form-label">เหตุผลที่ไม่อนุมัติ *</label>
            <textarea className="input textarea" placeholder="เช่น เอกสารไม่ชัดเจน..." value={rejectReason} onChange={e=>setRejectReason(e.target.value)} />
            <div className="form-hint">เหตุผลนี้จะแสดงให้ร้านค้าเห็น</div>
          </div>
        </Modal>
      )}
      {viewerDocs && <DocViewer docs={viewerDocs} initialIndex={viewerInitIdx} onClose={()=>setViewerDocs(null)} />}
    </div>
  );
}

// ============================================================
// UC2 — คำร้องรายงาน
// ============================================================
function ReportsPage({ notify }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selected, setSelected] = useState(null);
  const [saving, setSaving]    = useState(false);
  const [viewerDocs, setViewerDocs]   = useState(null);
  const [viewerInitIdx, setViewerInitIdx] = useState(0);

  const load = (status = statusFilter, p = page) => {
    setLoading(true);
    adminApi.getReports({ status, page: p, per_page: ITEMS_PER_PAGE })
      .then(data => { setReports(data.data ?? []); setTotalPages(data.last_page ?? 1); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleResolve = async (req) => {
    setSaving(true);
    try {
      await adminApi.resolveReport(req.id);
      setReports(prev => prev.filter(r => r.id !== req.id));
      setSelected(null);
      notify(`ดำเนินการคำร้อง "${req.shop?.name}" เรียบร้อย`, "success");
    } catch (e) {
      notify("ไม่สำเร็จ: " + e.message, "error");
    } finally { setSaving(false); }
  };

  const statusBadge = (s) => s==="pending"
    ? <span className="badge badge-yellow">⏳ รอดำเนินการ</span>
    : <span className="badge badge-green">✓ ดำเนินการแล้ว</span>;

  return (
    <div>
      <div className="page-title">🚩 คำร้องรายงาน</div>
      <div className="page-sub">UC2 — รายการร้านค้าที่ถูกรายงาน</div>
      <div style={{display:"flex",gap:8,marginBottom:20}}>
        {["pending","resolved"].map(s => (
          <button key={s} className={`btn btn-sm ${statusFilter===s?"btn-primary":"btn-outline"}`}
            onClick={()=>{setStatusFilter(s);setPage(1);load(s,1);}}>
            {s==="pending"?"⏳ รอดำเนินการ":"✓ ดำเนินการแล้ว"}
          </button>
        ))}
      </div>
      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <table className="table">
          <thead><tr><th>ร้านค้า</th><th>ประเภท</th><th>ผู้รายงาน</th><th>วันที่</th><th>สถานะ</th><th>จัดการ</th></tr></thead>
          <tbody>
            {loading ? <SkeletonRows cols={6} /> : reports.length===0
              ? <tr><td colSpan={6} style={{textAlign:"center",padding:"24px",color:"var(--text3)"}}>ไม่มีคำร้อง</td></tr>
              : reports.map(r => (
              <tr key={r.id}>
                <td style={{fontWeight:600}}>{r.shop?.name ?? r.reported_shop_ref_id}</td>
                <td><span className="badge badge-red" style={{fontSize:10}}>{r.fraud_type?.name ?? r.reason}</span></td>
                <td style={{fontSize:12,color:"var(--text3)"}}>{r.reporter?.email ?? r.reporter_account_id}</td>
                <td style={{fontSize:12,color:"var(--text3)"}}>{r.created_at?.substring(0,10)}</td>
                <td>{statusBadge(r.status)}</td>
                <td><button className="btn btn-outline btn-xs" onClick={()=>setSelected(r)}>จัดการ</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={page} totalPages={totalPages} onChange={p=>{setPage(p);load(statusFilter,p);}} />

      {selected && (
        <Modal title={`คำร้อง: ${selected.shop?.name ?? selected.reported_shop_ref_id}`} onClose={()=>setSelected(null)} wide>
          <div className="detail-row"><div className="detail-label">ร้านค้า</div><div className="detail-value">{selected.shop?.name}</div></div>
          <div className="detail-row"><div className="detail-label">ประเภท</div><div className="detail-value">{selected.fraud_type?.name}</div></div>
          <div className="detail-row"><div className="detail-label">รายละเอียด</div><div className="detail-value">{selected.reason}</div></div>
          <div className="detail-row"><div className="detail-label">ผู้รายงาน</div><div className="detail-value">{selected.reporter?.email ?? selected.reporter_account_id}</div></div>
          <div className="detail-row"><div className="detail-label">วันที่</div><div className="detail-value">{selected.created_at?.substring(0,10)}</div></div>
          <div className="detail-row"><div className="detail-label">สถานะ</div><div className="detail-value">{statusBadge(selected.status)}</div></div>
          {(selected.attachments?.length > 0) && (
            <div style={{marginTop:16,marginBottom:4}}>
              <div style={{fontSize:12,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:10}}>เอกสารแนบ</div>
              <DocList docs={selected.attachments.map(makeDocFromAttachment)} onView={idx=>{ setViewerDocs(selected.attachments.map(makeDocFromAttachment)); setViewerInitIdx(idx); }} />
            </div>
          )}
          {selected.status==="pending" && (
            <div style={{display:"flex",justifyContent:"flex-end",marginTop:16}}>
              <button className="btn btn-success btn-sm" onClick={()=>handleResolve(selected)} disabled={saving}>✓ ดำเนินการแล้ว</button>
            </div>
          )}
        </Modal>
      )}
      {viewerDocs && <DocViewer docs={viewerDocs} initialIndex={viewerInitIdx} onClose={()=>setViewerDocs(null)} />}
    </div>
  );
}

// ============================================================
// UC11 — คำร้องเคลม
// ============================================================
function ClaimsPage({ notify }) {
  const [claims, setClaims]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selected, setSelected] = useState(null);
  const [saving, setSaving]    = useState(false);
  const [viewerDocs, setViewerDocs]   = useState(null);
  const [viewerInitIdx, setViewerInitIdx] = useState(0);

  const load = (status = statusFilter, p = page) => {
    setLoading(true);
    adminApi.getClaims({ status, page: p, per_page: ITEMS_PER_PAGE })
      .then(data => { setClaims(data.data ?? []); setTotalPages(data.last_page ?? 1); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleResolve = async (clm) => {
    setSaving(true);
    try {
      await adminApi.resolveClaim(clm.id);
      setClaims(prev => prev.filter(c => c.id !== clm.id));
      setSelected(null);
      notify(`ปิดคำร้องเคลมของ "${clm.shop?.name}" เรียบร้อย`, "success");
    } catch (e) {
      notify("ไม่สำเร็จ: " + e.message, "error");
    } finally { setSaving(false); }
  };

  const statusBadge = (s) => s==="pending"
    ? <span className="badge badge-yellow">⏳ รอดำเนินการ</span>
    : <span className="badge badge-green">✓ ดำเนินการแล้ว</span>;

  return (
    <div>
      <div className="page-title">⚖️ คำร้องขอเคลม</div>
      <div className="page-sub">UC11 — ติดตามและช่วยเหลือผู้ใช้ที่ประสบปัญหา</div>
      <div style={{display:"flex",gap:8,marginBottom:20}}>
        {["pending","resolved"].map(s => (
          <button key={s} className={`btn btn-sm ${statusFilter===s?"btn-primary":"btn-outline"}`}
            onClick={()=>{setStatusFilter(s);setPage(1);load(s,1);}}>
            {s==="pending"?"⏳ รอดำเนินการ":"✓ ดำเนินการแล้ว"}
          </button>
        ))}
      </div>
      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <table className="table">
          <thead><tr><th>รหัส</th><th>ร้านค้า</th><th>ผู้ร้องเรียน</th><th>ช่องทางติดต่อ</th><th>วันที่</th><th>สถานะ</th><th>จัดการ</th></tr></thead>
          <tbody>
            {loading ? <SkeletonRows cols={7} /> : claims.length===0
              ? <tr><td colSpan={7} style={{textAlign:"center",padding:"24px",color:"var(--text3)"}}>ไม่มีคำร้อง</td></tr>
              : claims.map(c => (
              <tr key={c.id}>
                <td style={{fontSize:11,color:"var(--text3)"}}>{c.id}</td>
                <td style={{fontWeight:600}}>{c.shop?.name ?? c.shop_ref_id}</td>
                <td style={{fontSize:12,color:"var(--text3)"}}>{c.claimer?.email ?? c.claimer_account_id}</td>
                <td style={{fontSize:12}}>{c.contact_info}</td>
                <td style={{fontSize:12,color:"var(--text3)"}}>{c.created_at?.substring(0,10)}</td>
                <td>{statusBadge(c.status)}</td>
                <td><button className="btn btn-outline btn-xs" onClick={()=>setSelected(c)}>จัดการ</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={page} totalPages={totalPages} onChange={p=>{setPage(p);load(statusFilter,p);}} />

      {selected && (
        <Modal title={`เคลม #${selected.id}`} onClose={()=>setSelected(null)} wide>
          <div className="detail-row"><div className="detail-label">ร้านค้า</div><div className="detail-value">{selected.shop?.name}</div></div>
          <div className="detail-row"><div className="detail-label">ผู้ร้องเรียน</div><div className="detail-value">{selected.claimer?.email ?? selected.claimer_account_id}</div></div>
          <div className="detail-row">
            <div className="detail-label">ช่องทางติดต่อ</div>
            <div className="detail-value">
              <span style={{background:"var(--green-light)",color:"var(--green)",padding:"2px 10px",borderRadius:100,fontSize:12,fontWeight:700}}>
                {selected.contact_info}
              </span>
            </div>
          </div>
          <div className="detail-row"><div className="detail-label">รายละเอียด</div><div className="detail-value">{selected.detail}</div></div>
          <div className="detail-row"><div className="detail-label">วันที่</div><div className="detail-value">{selected.created_at?.substring(0,10)}</div></div>
          <div className="detail-row"><div className="detail-label">สถานะ</div><div className="detail-value">{statusBadge(selected.status)}</div></div>
          {(selected.attachments?.length > 0) && (
            <div style={{marginTop:16,marginBottom:4}}>
              <div style={{fontSize:12,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:10}}>หลักฐาน</div>
              <DocList docs={selected.attachments.map(makeDocFromAttachment)} onView={idx=>{ setViewerDocs(selected.attachments.map(makeDocFromAttachment)); setViewerInitIdx(idx); }} />
            </div>
          )}
          {selected.status==="pending" && (
            <div>
              <div className="alert alert-info" style={{marginTop:12,marginBottom:12}}>
                📞 ติดต่อผู้ร้องเรียนผ่าน: <strong>{selected.contact_info}</strong>
              </div>
              <div style={{display:"flex",justifyContent:"flex-end"}}>
                <button className="btn btn-success btn-sm" onClick={()=>handleResolve(selected)} disabled={saving}>✓ ดำเนินการแล้ว / ปิดคำร้อง</button>
              </div>
            </div>
          )}
        </Modal>
      )}
      {viewerDocs && <DocViewer docs={viewerDocs} initialIndex={viewerInitIdx} onClose={()=>setViewerDocs(null)} />}
    </div>
  );
}

// ============================================================
// APP SHELL
// ============================================================
export default function AdminPanel() {
  const [activePage, setActivePage] = useState("dashboard");
  const [notification, setNotification] = useState(null);

  // ตรวจสอบว่ามี token อยู่
  const token = localStorage.getItem("user_token");
  if (!token) {
    return (
      <>
        <style>{styles}</style>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"var(--bg)",fontFamily:"var(--font)"}}>
          <div style={{textAlign:"center",padding:40}}>
            <div style={{fontSize:48,marginBottom:16}}>🔑</div>
            <h2 style={{fontFamily:"var(--display)",fontSize:20,marginBottom:8}}>กรุณาเข้าสู่ระบบก่อน</h2>
            <p style={{color:"var(--text3)",fontSize:14}}>ต้องมี token ใน localStorage เพื่อเข้าใช้ Admin Panel</p>
          </div>
        </div>
      </>
    );
  }

  const notify = (msg, type="success") => setNotification({ msg, type });

  const renderPage = () => {
    switch(activePage) {
      case "dashboard":         return <DashboardPage />;
      case "shops":             return <ShopsPage notify={notify} />;
      case "blacklist":         return <BlacklistPage />;
      case "upgrade-tier3":     return <UpgradeTier3Page notify={notify} />;
      case "upgrade-requests":  return <UpgradeRequestsPage notify={notify} />;
      case "reports":           return <ReportsPage notify={notify} />;
      case "claims":            return <ClaimsPage notify={notify} />;
      default:                  return <DashboardPage />;
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="admin-layout">
        <Sidebar active={activePage} onNavigate={setActivePage} />
        <div className="main-content">{renderPage()}</div>
      </div>
      {notification && <Notification msg={notification.msg} type={notification.type} onClose={()=>setNotification(null)} />}
    </>
  );
}