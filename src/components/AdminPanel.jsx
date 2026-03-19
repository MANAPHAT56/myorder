import { useState, useEffect } from "react";

// ============================================================
// ADMIN PANEL — ครอบคลุม UC1-UC11
// UC1:  แก้ไขรายละเอียดร้านค้า
// UC2:  จัดการคำร้องรายงาน
// UC3:  เพิ่มร้านค้า
// UC4:  ลบร้านค้า
// UC5:  เพิ่ม Blacklist
// UC6:  จัดการร้านค้า (hub)
// UC7:  ดูรายการร้านค้า Blacklist
// UC8:  ค้นหาร้านค้า
// UC9:  จัดการเลื่อนขั้นที่ 3 ให้ร้านค้า
// UC10: จัดการคำร้องร้านค้าที่ขอเลื่อนขั้น
// UC11: จัดการคำร้องขอเคลม
// ============================================================

const ITEMS_PER_PAGE = 8;
const INVALID_CHARS  = /[^\u0E00-\u0E7Fa-zA-Z0-9\s\-_.@/:,()]/;

// ============================================================
// MOCK DATA
// ============================================================
const ALL_SHOPS = [
  { id:1,  name:"ร้านข้าวมันไก่สมชาย",       category:"อาหาร",      tier:3, entity_type:"individual", is_closed:false, is_blacklisted:false, is_deleted:false, link:"https://line.me/shop1",  description:"ข้าวมันไก่ต้มและทอด", rating:4.8, location:"สุขุมวิท 11", owner_id:"USR001", img_emoji:"🍗" },
  { id:2,  name:"ก๋วยเตี๋ยวเรือป้าแดง",       category:"อาหาร",      tier:2, entity_type:"company",    is_closed:false, is_blacklisted:false, is_deleted:false, link:"https://line.me/shop2",  description:"ก๋วยเตี๋ยวเรือสูตรดั้งเดิม", rating:4.6, location:"รามคำแหง 24", owner_id:"USR002", img_emoji:"🍜" },
  { id:3,  name:"ขนมครกบ้านนา",               category:"ขนม",        tier:1, entity_type:"individual", is_closed:false, is_blacklisted:false, is_deleted:false, link:"https://line.me/shop3",  description:"ขนมครกหอมมะพร้าว", rating:4.3, location:"ลาดพร้าว 41", owner_id:"USR003", img_emoji:"🥥" },
  { id:4,  name:"ส้มตำอีสานแม่ตุ๋ย",          category:"อาหาร",      tier:2, entity_type:"individual", is_closed:false, is_blacklisted:false, is_deleted:false, link:"https://line.me/shop4",  description:"ส้มตำลาบรสเด็ด", rating:4.7, location:"พระโขนง", owner_id:"USR004", img_emoji:"🥗" },
  { id:5,  name:"ชานมไข่มุกไต้หวันแท้",       category:"เครื่องดื่ม",tier:3, entity_type:"company",    is_closed:false, is_blacklisted:false, is_deleted:false, link:"https://line.me/shop5",  description:"ชานมไข่มุก", rating:4.9, location:"ทองหล่อ", owner_id:"USR005", img_emoji:"🧋" },
  { id:6,  name:"ร้านหมูกระทะแซ่บโอ้โห",      category:"อาหาร",      tier:2, entity_type:"company",    is_closed:false, is_blacklisted:false, is_deleted:false, link:"https://line.me/shop7",  description:"หมูกระทะบุฟเฟ่ต์", rating:4.5, location:"บางนา", owner_id:"USR006", img_emoji:"🥩" },
  { id:7,  name:"กาแฟดริปคั่วสด",             category:"เครื่องดื่ม",tier:2, entity_type:"individual", is_closed:false, is_blacklisted:false, is_deleted:false, link:"https://line.me/shop8",  description:"กาแฟดริปสด", rating:4.7, location:"เชียงใหม่", owner_id:"USR007", img_emoji:"☕" },
  { id:8,  name:"เค้กวันเกิดสั่งทำพิเศษ",     category:"ขนม",        tier:3, entity_type:"company",    is_closed:false, is_blacklisted:false, is_deleted:false, link:"https://line.me/shop15", description:"เค้กวันเกิด Custom", rating:4.9, location:"จตุจักร", owner_id:"USR008", img_emoji:"🎂" },
  // ร้าน tier 2 รอเลื่อนขั้น 3 (UC9)
  { id:9,  name:"ข้าวหน้าเป็ดพะโล้",           category:"อาหาร",      tier:2, entity_type:"company",    is_closed:false, is_blacklisted:false, is_deleted:false, link:"https://line.me/shop11", description:"ข้าวหน้าเป็ดพะโล้", rating:4.8, location:"เยาวราช", owner_id:"USR009", img_emoji:"🦆" },
  { id:10, name:"คุกกี้อบสดออเดอร์เมด",        category:"ขนม",        tier:2, entity_type:"individual", is_closed:false, is_blacklisted:false, is_deleted:false, link:"https://line.me/shop12", description:"คุกกี้อบสด", rating:4.6, location:"ปทุมธานี", owner_id:"USR010", img_emoji:"🍪" },
  // Blacklist
  { id:26, name:"ร้านต้มยำโกงเงินลูกค้า",     category:"อาหาร",      tier:1, entity_type:"individual", is_closed:false, is_blacklisted:true,  is_deleted:false, link:"", description:"ต้มยำกุ้ง", rating:2.1, location:"มีนบุรี", owner_id:"USR026", img_emoji:"🦐" },
  { id:27, name:"ร้านขนมปลอมแปลงสินค้า",       category:"ขนม",        tier:1, entity_type:"company",    is_closed:false, is_blacklisted:true,  is_deleted:false, link:"", description:"ขนมปังแซนด์วิช", rating:1.8, location:"ลาดพร้าว", owner_id:"USR027", img_emoji:"🥪" },
];

const MOCK_REPORTS = [
  { id:"RPT001", shop_id:3, shop_name:"ขนมครกบ้านนา",   reporter_id:"USR099", reason:"สินค้าไม่ตรงรูป",    detail:"ของที่ได้รับแตกต่างจากรูปโปรไฟล์มาก", date:"12/03/2568", status:"pending",  docs:[{ name:"สลิปโอนเงิน.jpg", label:"สลิปโอนเงิน" },{ name:"รูปสินค้า.jpg", label:"รูปสินค้า" }] },
  { id:"RPT002", shop_id:6, shop_name:"ร้านหมูกระทะ",    reporter_id:"USR088", reason:"โกงเงิน",             detail:"โอนเงินแล้วร้านหายไม่ตอบ", date:"14/03/2568", status:"pending",  docs:[{ name:"แชท.pdf", label:"แชทสนทนา" }] },
  { id:"RPT003", shop_id:2, shop_name:"ก๋วยเตี๋ยวเรือ",  reporter_id:"USR077", reason:"ข้อมูลร้านค้าผิด",   detail:"ที่อยู่ไม่ตรง", date:"10/03/2568", status:"resolved", docs:[] },
];

const MOCK_UPGRADE_REQUESTS = [
  { id:"UPG001", shop_id:3,  shop_name:"ขนมครกบ้านนา",    shop_emoji:"🥥", current_tier:1, requested_tier:2, entity_type:"individual", date:"08/03/2568", status:"pending", docs:[{ name:"บัตรประชาชน.jpg", label:"บัตรประชาชน" },{ name:"รูปถ่ายคู่บัตร.jpg", label:"รูปถ่ายคู่บัตรประชาชน" }] },
  { id:"UPG002", shop_id:7,  shop_name:"กาแฟดริปคั่วสด",  shop_emoji:"☕", current_tier:1, requested_tier:2, entity_type:"company",    date:"09/03/2568", status:"pending", docs:[{ name:"ภพ20.pdf", label:"ภพ.20" },{ name:"บัตรกรรมการ.jpg", label:"บัตรประชาชนกรรมการ" }] },
  { id:"UPG003", shop_id:10, shop_name:"คุกกี้อบสด",       shop_emoji:"🍪", current_tier:1, requested_tier:2, entity_type:"individual", date:"11/03/2568", status:"rejected", reject_reason:"เอกสารไม่ชัดเจน", docs:[{ name:"บัตร.jpg", label:"บัตรประชาชน" }] },
];

const MOCK_CLAIMS = [
  { id:"CLM001", shop_id:3, shop_name:"ขนมครกบ้านนา",    claimant_id:"USR099", claimant_contact:"LINE: @user99", detail:"สั่งของแล้วไม่ส่ง โอนเงินไปแล้ว 500 บาท", date:"13/03/2568", status:"pending", docs:[{ name:"สลิปโอนเงิน.jpg", label:"สลิปโอนเงิน" }] },
  { id:"CLM002", shop_id:6, shop_name:"ร้านหมูกระทะ",    claimant_id:"USR088", claimant_contact:"081-234-5678",   detail:"ของมาไม่ครบ ขาดหมู 2 ถาด", date:"14/03/2568", status:"resolved", docs:[] },
];

// ============================================================
// VALIDATION
// ============================================================
function validateText(val) {
  if (!val || val.trim() === "") return "กรุณากรอกข้อมูลให้ครบถ้วน";
  if (INVALID_CHARS.test(val)) return "ไม่อนุญาตให้ใช้อักขระพิเศษหรืออีโมจิ"; // UC1 Exception
  return null;
}
function validateUrl(val) {
  if (!val || val.trim() === "") return "กรุณากรอก URL";
  if (!/^https?:\/\/.+/.test(val)) return "URL ต้องขึ้นต้นด้วย http:// หรือ https://";
  return null;
}
function validateUserId(val) {
  if (!val || val.trim() === "") return "กรุณากรอก User ID";
  return null;
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
  .notification{position:fixed;top:20px;right:20px;z-index:200;background:var(--surface);border:1.5px solid var(--border2);border-radius:11px;padding:12px 16px;min-width:260px;box-shadow:var(--shadow-lg);animation:slideIn 0.25s ease;display:flex;align-items:center;gap:9px;font-size:13px;}
  .notification.success{border-left:3px solid var(--green);}
  .notification.error{border-left:3px solid var(--red);}
  .stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px;}
  .stat-card{background:var(--surface);border:1.5px solid var(--border);border-radius:14px;padding:18px;box-shadow:var(--shadow);}
  .stat-val{font-size:26px;font-weight:800;font-family:var(--display);}
  .stat-label{font-size:11px;color:var(--text3);font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin-top:2px;}
  .doc-link{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:6px;background:var(--blue-light);color:var(--blue);font-size:12px;font-weight:600;cursor:pointer;border:1px solid rgba(29,78,216,0.15);}
  .doc-link:hover{background:rgba(29,78,216,0.12);}
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
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes slideUp{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}
  @keyframes slideIn{from{transform:translateX(14px);opacity:0}to{transform:translateX(0);opacity:1}}
  .pill-tabs{display:flex;gap:6px;margin-bottom:18px;flex-wrap:wrap;}
  .pill-tab{padding:5px 14px;border-radius:100px;font-size:12px;font-weight:600;cursor:pointer;border:1.5px solid var(--border2);background:var(--surface);color:var(--text2);transition:all 0.15s;}
  .pill-tab.active,.pill-tab:hover{background:var(--accent);color:#fff;border-color:var(--accent);}
`;

// ============================================================
// HELPERS
// ============================================================
function TierBadge({ tier }) {
  const map = { 1:["badge-tier1","⚪ ขั้น 1"],2:["badge-tier2","🔵 ขั้น 2"],3:["badge-tier3","🥇 ขั้น 3"] };
  const [cls,label] = map[tier]||map[1];
  return <span className={`badge ${cls}`}>{label}</span>;
}

function Notification({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); },[]);
  return <div className={`notification ${type}`}><span>{type==="success"?"✓":"✕"}</span><span>{msg}</span></div>;
}

function Modal({ title, onClose, children, footer, wide }) {
  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget&&onClose()}>
      <div className={`modal ${wide?"modal-wide":""}`}>
        <div className="modal-header"><h3>{title}</h3><button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button></div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

function Pagination({ currentPage, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="pagination-wrap">
      <button className="page-btn" onClick={() => onChange(currentPage-1)} disabled={currentPage===1}>‹</button>
      {pages.map(p => <button key={p} className={`page-btn ${p===currentPage?"active":""}`} onClick={() => onChange(p)}>{p}</button>)}
      <button className="page-btn" onClick={() => onChange(currentPage+1)} disabled={currentPage===totalPages}>›</button>
    </div>
  );
}

// Simulate download
function downloadDoc(name) {
  alert(`ดาวน์โหลด: ${name}\n(ในระบบจริงจะเรียก API เพื่อดาวน์โหลดไฟล์)`);
}

// ============================================================
// UC8 — ค้นหาร้านค้า (shared across pages)
// ============================================================
function useShopList(shops, query) {
  return shops.filter(s =>
    !query || s.name.toLowerCase().includes(query.toLowerCase()) ||
    s.location.toLowerCase().includes(query.toLowerCase()) ||
    s.owner_id.toLowerCase().includes(query.toLowerCase())
  );
}

// ============================================================
// SIDEBAR
// ============================================================
const NAV_ITEMS = [
  { id:"dashboard",  icon:"📊", label:"ภาพรวม", section:"ภาพรวม" },
  { id:"shops",      icon:"🏪", label:"จัดการร้านค้า", section:"ร้านค้า" },
  { id:"blacklist",  icon:"⛔", label:"รายการ Blacklist" },
  { id:"upgrade-tier3", icon:"🥇", label:"เลื่อนขั้นที่ 3", section:"คำร้อง" },
  { id:"upgrade-requests", icon:"📋", label:"คำร้องขอเลื่อนขั้น" },
  { id:"reports",    icon:"🚩", label:"คำร้องรายงาน" },
  { id:"claims",     icon:"⚖️", label:"คำร้องขอเคลม" },
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
            <div className={`sidebar-item ${active===item.id?"active":""}`} onClick={() => onNavigate(item.id)}>
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
  const total = ALL_SHOPS.filter(s => !s.is_deleted).length;
  const blacklisted = ALL_SHOPS.filter(s => s.is_blacklisted).length;
  const pendingUpgrade = MOCK_UPGRADE_REQUESTS.filter(r => r.status==="pending").length;
  const pendingClaims = MOCK_CLAIMS.filter(c => c.status==="pending").length;

  return (
    <div>
      <div className="page-title">📊 ภาพรวมระบบ</div>
      <div className="page-sub">ข้อมูลสถานะรวมของระบบ myOrder</div>

      <div className="stat-grid">
        <div className="stat-card"><div className="stat-val" style={{color:"var(--accent)"}}>{total}</div><div className="stat-label">ร้านค้าทั้งหมด</div></div>
        <div className="stat-card"><div className="stat-val" style={{color:"var(--red)"}}>{blacklisted}</div><div className="stat-label">Blacklist</div></div>
        <div className="stat-card"><div className="stat-val" style={{color:"var(--yellow)"}}>{pendingUpgrade}</div><div className="stat-label">รอเลื่อนขั้น</div></div>
        <div className="stat-card"><div className="stat-val" style={{color:"var(--blue)"}}>{pendingClaims}</div><div className="stat-label">คำร้องเคลม</div></div>
      </div>

      <div className="card">
        <div className="card-title">คำร้องล่าสุดที่รอดำเนินการ</div>
        <div className="card-sub">คำร้องที่ยังไม่ได้จัดการ</div>
        {MOCK_REPORTS.filter(r => r.status==="pending").map(r => (
          <div key={r.id} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid var(--border)",alignItems:"center"}}>
            <div><div style={{fontWeight:600}}>{r.shop_name}</div><div style={{fontSize:12,color:"var(--text3)"}}>{r.reason} · {r.date}</div></div>
            <span className="badge badge-yellow">⏳ รอดำเนินการ</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// UC6 — จัดการร้านค้า (hub) + UC3 เพิ่ม + UC8 ค้นหา
// ============================================================
function ShopsPage({ notify }) {
  const [shops, setShops] = useState(ALL_SHOPS.filter(s => !s.is_blacklisted && !s.is_deleted));
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedShop, setSelectedShop] = useState(null); // UC6 — manage drawer
  const [showAddModal, setShowAddModal]  = useState(false); // UC3
  const [showEditModal, setShowEditModal] = useState(false); // UC1
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // UC4
  const [confirmShop, setConfirmShop] = useState(null);

  // UC1 — form state
  const [editForm, setEditForm] = useState({});
  const [editErrors, setEditErrors] = useState({});

  // UC3 — add form state
  const [addForm, setAddForm] = useState({ name:"", category:"อาหาร", entity_type:"individual", link:"", description:"", location:"", owner_id:"" });
  const [addErrors, setAddErrors] = useState({});

  const filtered = useShopList(shops, query);
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paged = filtered.slice((page-1)*ITEMS_PER_PAGE, page*ITEMS_PER_PAGE);

  // UC6 — เปิดหน้าจัดการร้านค้า
  const openManage = (shop) => {
    setSelectedShop(shop);
    setEditForm({ name: shop.name, link: shop.link, description: shop.description, location: shop.location });
    setEditErrors({});
  };

  // UC1 — validate + save
  const handleSaveEdit = () => {
    const errors = {};
    const ne = validateText(editForm.name); if (ne) errors.name = ne;
    const le = validateUrl(editForm.link);  if (le) errors.link = le;
    const de = validateText(editForm.description); if (de) errors.description = de;
    const loe = validateText(editForm.location);   if (loe) errors.location = loe;
    if (Object.keys(errors).length) { setEditErrors(errors); return; }

    setShops(prev => prev.map(s => s.id === selectedShop.id ? { ...s, ...editForm } : s));
    setSelectedShop(s => ({ ...s, ...editForm }));
    setShowEditModal(false);
    notify("แก้ไขข้อมูลร้านค้าเรียบร้อย", "success");
  };

  // UC4 — ลบร้านค้า (soft delete → สถานะ is_deleted)
  const handleDelete = (shop) => {
    setShops(prev => prev.filter(s => s.id !== shop.id)); // หายจาก list
    setSelectedShop(null);
    setShowDeleteConfirm(false);
    notify(`ลบร้านค้า "${shop.name}" เรียบร้อยแล้ว`, "success");
    // TODO: api → update is_deleted = true
  };

  // UC5 — เพิ่ม Blacklist
  const handleBlacklist = (shop) => {
    if (shop.is_blacklisted) return;
    setShops(prev => prev.map(s => s.id === shop.id ? { ...s, is_blacklisted: true } : s));
    setSelectedShop(null);
    notify(`เพิ่ม "${shop.name}" ใน Blacklist แล้ว`, "success");
    // TODO: api → update is_blacklisted = true
  };

  // UC3 — เพิ่มร้านค้า validate + save
  const handleAddShop = () => {
    const errors = {};
    const ne = validateText(addForm.name);        if (ne) errors.name = ne;
    const le = validateUrl(addForm.link);         if (le) errors.link = le;
    const de = validateText(addForm.description); if (de) errors.description = de;
    const loe = validateText(addForm.location);   if (loe) errors.location = loe;
    const oe = validateUserId(addForm.owner_id);  if (oe) errors.owner_id = oe;
    if (Object.keys(errors).length) { setAddErrors(errors); return; }

    const newShop = { ...addForm, id: Date.now(), tier: 1, rating: 0, is_closed: false, is_blacklisted: false, is_deleted: false, img_emoji: "🏪" };
    setShops(prev => [newShop, ...prev]);
    setShowAddModal(false);
    setAddForm({ name:"", category:"อาหาร", entity_type:"individual", link:"", description:"", location:"", owner_id:"" });
    setAddErrors({});
    notify("เพิ่มร้านค้าใหม่เรียบร้อยแล้ว", "success");
    // UC3 Exception: ถ้าข้อมูลเยอะร้านใหม่ไปอยู่หน้าอื่น จะไม่ scroll ไป
  };

  const categories = ["อาหาร","ขนม","เครื่องดื่ม","อื่นๆ"];

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        <div>
          <div className="page-title">🏪 จัดการร้านค้า</div>
          <div className="page-sub">รายการร้านค้าทั้งหมดในระบบ (ไม่รวม Blacklist)</div>
        </div>
        {/* UC3 — ปุ่มเพิ่มร้านค้า */}
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>＋ เพิ่มร้านค้า</button>
      </div>

      {/* UC8 — ค้นหาร้านค้า */}
      <div className="search-bar">
        <input className="search-input" placeholder="ค้นหาชื่อร้าน, ที่อยู่, หรือ User ID เจ้าของ..."
          value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} />
      </div>

      {/* UC8 Exception: ไม่พบ */}
      {filtered.length === 0 && (
        <div className="alert alert-info">🔍 ไม่พบร้านค้าที่ตรงกับ "{query}"</div>
      )}

      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <table className="table">
          <thead>
            <tr>
              <th>ร้านค้า</th><th>หมวดหมู่</th><th>ระดับ</th>
              <th>เจ้าของ</th><th>คะแนน</th><th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(s => (
              <tr key={s.id}>
                <td>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:20}}>{s.img_emoji}</span>
                    <div>
                      <div style={{fontWeight:600,fontSize:13}}>{s.name}</div>
                      <div style={{fontSize:11,color:"var(--text3)"}}>📍 {s.location}</div>
                    </div>
                  </div>
                </td>
                <td><span className="badge badge-gray">{s.category}</span></td>
                <td><TierBadge tier={s.tier} /></td>
                <td style={{fontSize:12,color:"var(--text3)"}}>{s.owner_id}</td>
                <td style={{fontWeight:700,color:"var(--yellow)"}}>⭐ {s.rating}</td>
                <td>
                  {/* UC6 — ปุ่มจัดการ */}
                  <button className="btn btn-outline btn-xs" onClick={() => openManage(s)}>จัดการ</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={page} totalPages={totalPages} onChange={setPage} />

      {/* UC6 — หน้าจัดการร้านค้า (side panel simulation) */}
      {selectedShop && (
        <Modal title={`จัดการ: ${selectedShop.name}`} onClose={() => setSelectedShop(null)} wide>
          <div style={{display:"flex",gap:14,alignItems:"center",marginBottom:20,padding:"0 0 16px",borderBottom:"1px solid var(--border)"}}>
            <span style={{fontSize:36}}>{selectedShop.img_emoji}</span>
            <div>
              <div style={{fontFamily:"var(--display)",fontSize:16,fontWeight:600}}>{selectedShop.name}</div>
              <div style={{display:"flex",gap:6,marginTop:4}}><TierBadge tier={selectedShop.tier} /><span className="badge badge-gray">{selectedShop.category}</span></div>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
            {/* UC1 — แก้ไขร้านค้า */}
            <button className="btn btn-outline" onClick={() => setShowEditModal(true)}>✏️ แก้ไขข้อมูล</button>
            {/* UC5 — Blacklist */}
            <button className="btn btn-warn" onClick={() => { handleBlacklist(selectedShop); }} disabled={selectedShop.is_blacklisted}>
              {selectedShop.is_blacklisted ? "⛔ Blacklist แล้ว" : "⛔ เพิ่ม Blacklist"}
            </button>
            {/* UC4 — ลบร้านค้า */}
            <button className="btn btn-danger" onClick={() => { setConfirmShop(selectedShop); setShowDeleteConfirm(true); }}>🗑️ ลบร้านค้า</button>
          </div>

          <div className="detail-row"><div className="detail-label">📝 รายละเอียด</div><div className="detail-value">{selectedShop.description}</div></div>
          <div className="detail-row"><div className="detail-label">📍 ที่อยู่</div><div className="detail-value">{selectedShop.location}</div></div>
          <div className="detail-row"><div className="detail-label">🔗 ลิงก์</div><div className="detail-value" style={{wordBreak:"break-all"}}>{selectedShop.link||"—"}</div></div>
          <div className="detail-row"><div className="detail-label">👤 เจ้าของ</div><div className="detail-value">{selectedShop.owner_id}</div></div>
          <div className="detail-row"><div className="detail-label">👥 ประเภท</div><div className="detail-value">{selectedShop.entity_type==="company"?"🏢 นิติบุคคล":"👤 บุคคลธรรมดา"}</div></div>
        </Modal>
      )}

      {/* UC1 — Modal แก้ไขร้านค้า */}
      {showEditModal && selectedShop && (
        <Modal title="✏️ แก้ไขข้อมูลร้านค้า" onClose={() => { setShowEditModal(false); setEditErrors({}); }}
          footer={<>
            {/* UC1 Exception: กดยกเลิก */}
            <button className="btn btn-ghost btn-sm" onClick={() => { setShowEditModal(false); setEditErrors({}); }}>ยกเลิก</button>
            <button className="btn btn-primary btn-sm" onClick={handleSaveEdit}>บันทึก</button>
          </>}>
          <div className="form-group">
            <label className="form-label">ชื่อร้านค้า *</label>
            <input className={`input ${editErrors.name?"error":""}`} value={editForm.name}
              onChange={e => { setEditForm(p=>({...p,name:e.target.value})); setEditErrors(p=>({...p,name:null})); }} />
            {editErrors.name && <div className="form-error">{editErrors.name}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">ลิงก์ติดต่อ *</label>
            <input className={`input ${editErrors.link?"error":""}`} value={editForm.link}
              onChange={e => { setEditForm(p=>({...p,link:e.target.value})); setEditErrors(p=>({...p,link:null})); }} />
            {editErrors.link && <div className="form-error">{editErrors.link}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">รายละเอียด *</label>
            <textarea className={`input textarea ${editErrors.description?"error":""}`} value={editForm.description}
              onChange={e => { setEditForm(p=>({...p,description:e.target.value})); setEditErrors(p=>({...p,description:null})); }} />
            {editErrors.description && <div className="form-error">{editErrors.description}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">ที่อยู่ *</label>
            <input className={`input ${editErrors.location?"error":""}`} value={editForm.location}
              onChange={e => { setEditForm(p=>({...p,location:e.target.value})); setEditErrors(p=>({...p,location:null})); }} />
            {editErrors.location && <div className="form-error">{editErrors.location}</div>}
          </div>
        </Modal>
      )}

      {/* UC4 — Confirm Delete */}
      {showDeleteConfirm && confirmShop && (
        <Modal title="🗑️ ยืนยันการลบร้านค้า" onClose={() => setShowDeleteConfirm(false)}
          footer={<>
            {/* UC4 Exception: กดยกเลิก */}
            <button className="btn btn-ghost btn-sm" onClick={() => setShowDeleteConfirm(false)}>ยกเลิก</button>
            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(confirmShop)}>ยืนยันลบ</button>
          </>}>
          <div className="alert alert-warn" style={{marginBottom:16}}>
            ⚠️ การลบร้านค้าจะทำให้ร้านนี้ไม่ปรากฏในระบบ ผู้ใช้จะไม่สามารถค้นหาได้อีก
          </div>
          <p style={{fontSize:14}}>คุณต้องการลบ <strong>"{confirmShop.name}"</strong> ออกจากระบบ?</p>
          <p style={{fontSize:12,color:"var(--text3)",marginTop:8}}>สถานะร้านค้าในฐานข้อมูลจะเปลี่ยนเป็น "ถูกลบ"</p>
        </Modal>
      )}

      {/* UC3 — Modal เพิ่มร้านค้า */}
      {showAddModal && (
        <Modal title="＋ เพิ่มร้านค้าใหม่" onClose={() => { setShowAddModal(false); setAddErrors({}); }} wide
          footer={<>
            <button className="btn btn-ghost btn-sm" onClick={() => { setShowAddModal(false); setAddErrors({}); }}>ยกเลิก</button>
            <button className="btn btn-primary btn-sm" onClick={handleAddShop}>เพิ่มร้านค้า</button>
          </>}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div className="form-group" style={{gridColumn:"1/-1"}}>
              <label className="form-label">ชื่อร้านค้า *</label>
              <input className={`input ${addErrors.name?"error":""}`} value={addForm.name}
                onChange={e => { setAddForm(p=>({...p,name:e.target.value})); setAddErrors(p=>({...p,name:null})); }} />
              {addErrors.name && <div className="form-error">{addErrors.name}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">หมวดหมู่ *</label>
              <select className="input" value={addForm.category} onChange={e => setAddForm(p=>({...p,category:e.target.value}))}>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">ประเภทเจ้าของ *</label>
              <select className="input" value={addForm.entity_type} onChange={e => setAddForm(p=>({...p,entity_type:e.target.value}))}>
                <option value="individual">บุคคลธรรมดา</option>
                <option value="company">นิติบุคคล</option>
              </select>
            </div>
            <div className="form-group" style={{gridColumn:"1/-1"}}>
              <label className="form-label">User ID เจ้าของร้าน *</label>
              <input className={`input ${addErrors.owner_id?"error":""}`} placeholder="เช่น USR0042"
                value={addForm.owner_id} onChange={e => { setAddForm(p=>({...p,owner_id:e.target.value})); setAddErrors(p=>({...p,owner_id:null})); }} />
              {addErrors.owner_id && <div className="form-error">{addErrors.owner_id}</div>}
              <div className="form-hint">กรอก ID ของผู้ใช้ที่เป็นเจ้าของร้านค้า</div>
            </div>
            <div className="form-group" style={{gridColumn:"1/-1"}}>
              <label className="form-label">ลิงก์ติดต่อ *</label>
              <input className={`input ${addErrors.link?"error":""}`} placeholder="https://line.me/..."
                value={addForm.link} onChange={e => { setAddForm(p=>({...p,link:e.target.value})); setAddErrors(p=>({...p,link:null})); }} />
              {addErrors.link && <div className="form-error">{addErrors.link}</div>}
            </div>
            <div className="form-group" style={{gridColumn:"1/-1"}}>
              <label className="form-label">ที่อยู่ *</label>
              <input className={`input ${addErrors.location?"error":""}`} value={addForm.location}
                onChange={e => { setAddForm(p=>({...p,location:e.target.value})); setAddErrors(p=>({...p,location:null})); }} />
              {addErrors.location && <div className="form-error">{addErrors.location}</div>}
            </div>
            <div className="form-group" style={{gridColumn:"1/-1"}}>
              <label className="form-label">รายละเอียดร้าน *</label>
              <textarea className={`input textarea ${addErrors.description?"error":""}`} value={addForm.description}
                onChange={e => { setAddForm(p=>({...p,description:e.target.value})); setAddErrors(p=>({...p,description:null})); }} />
              {addErrors.description && <div className="form-error">{addErrors.description}</div>}
            </div>
          </div>
          {/* UC3 Exception: ถ้าข้อมูลมีปัญหา จะแสดง error แต่ละ field ด้านบน */}
        </Modal>
      )}
    </div>
  );
}

// ============================================================
// UC7 — ดูรายการร้านค้า Blacklist (+ UC8 ค้นหา)
// ============================================================
function BlacklistPage({ notify }) {
  const [shops, setShops] = useState(ALL_SHOPS.filter(s => s.is_blacklisted && !s.is_deleted));
  const [query, setQuery] = useState("");
  const [page, setPage]   = useState(1);
  const [selectedShop, setSelectedShop] = useState(null);

  const filtered = useShopList(shops, query);
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paged = filtered.slice((page-1)*ITEMS_PER_PAGE, page*ITEMS_PER_PAGE);

  return (
    <div>
      <div className="page-title">⛔ รายการร้านค้า Blacklist</div>
      <div className="page-sub">UC7 — ร้านค้าที่ถูกระงับจากระบบ</div>

      {/* UC8 — ค้นหา */}
      <div className="search-bar">
        <input className="search-input" placeholder="ค้นหาชื่อร้าน..."
          value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} />
      </div>

      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <table className="table">
          <thead>
            <tr><th>ร้านค้า</th><th>หมวดหมู่</th><th>ที่อยู่</th><th>เจ้าของ</th><th>จัดการ</th></tr>
          </thead>
          <tbody>
            {paged.length===0 && (
              <tr><td colSpan={5} style={{textAlign:"center",padding:"24px",color:"var(--text3)"}}>ไม่พบร้านค้าใน Blacklist</td></tr>
            )}
            {paged.map(s => (
              <tr key={s.id}>
                <td>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:18}}>{s.img_emoji}</span>
                    <div>
                      <div style={{fontWeight:600}}>{s.name}</div>
                      <span className="badge badge-red" style={{fontSize:10}}>⛔ Blacklist</span>
                    </div>
                  </div>
                </td>
                <td><span className="badge badge-gray">{s.category}</span></td>
                <td style={{fontSize:12,color:"var(--text3)"}}>📍 {s.location}</td>
                <td style={{fontSize:12,color:"var(--text3)"}}>{s.owner_id}</td>
                <td><button className="btn btn-outline btn-xs" onClick={() => setSelectedShop(s)}>ดูรายละเอียด</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={page} totalPages={totalPages} onChange={setPage} />

      {selectedShop && (
        <Modal title={`รายละเอียด: ${selectedShop.name}`} onClose={() => setSelectedShop(null)}>
          <div className="alert alert-error" style={{marginBottom:16}}>⛔ ร้านนี้อยู่ใน Blacklist</div>
          <div className="detail-row"><div className="detail-label">ชื่อร้าน</div><div className="detail-value">{selectedShop.name}</div></div>
          <div className="detail-row"><div className="detail-label">หมวดหมู่</div><div className="detail-value">{selectedShop.category}</div></div>
          <div className="detail-row"><div className="detail-label">ที่อยู่</div><div className="detail-value">{selectedShop.location}</div></div>
          <div className="detail-row"><div className="detail-label">เจ้าของ</div><div className="detail-value">{selectedShop.owner_id}</div></div>
          <div className="detail-row"><div className="detail-label">รายละเอียด</div><div className="detail-value">{selectedShop.description}</div></div>
        </Modal>
      )}
    </div>
  );
}

// ============================================================
// UC9 — จัดการเลื่อนขั้นที่ 3 ให้ร้านค้า
// ============================================================
function UpgradeTier3Page({ notify }) {
  const [shops, setShops] = useState(ALL_SHOPS.filter(s => s.tier===2 && !s.is_blacklisted && !s.is_deleted));
  const [query, setQuery] = useState("");
  const [page, setPage]   = useState(1);
  const [selectedShop, setSelectedShop] = useState(null);
  const [confirmModal, setConfirmModal] = useState(false);

  const filtered = useShopList(shops, query);
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paged = filtered.slice((page-1)*ITEMS_PER_PAGE, page*ITEMS_PER_PAGE);

  // UC9 — ยืนยันว่าทดลองสั่งของแล้ว → เลื่อนขั้น 3
  const handleConfirmOrder = () => {
    setShops(prev => prev.filter(s => s.id !== selectedShop.id)); // ออกจาก list tier2
    setSelectedShop(null);
    setConfirmModal(false);
    notify(`เลื่อน "${selectedShop.name}" เป็น ขั้น 3 เรียบร้อย`, "success");
    // TODO: api → update tier=3 + log admin action (UC9 step 6)
  };

  return (
    <div>
      <div className="page-title">🥇 เลื่อนขั้นที่ 3 ให้ร้านค้า</div>
      <div className="page-sub">UC9 — ร้านค้าระดับ 2 ที่พร้อมเลื่อนขั้น 3 (myOrder ทดลองสั่งของแล้ว)</div>

      {/* UC8 — ค้นหา */}
      <div className="search-bar">
        <input className="search-input" placeholder="ค้นหาชื่อร้าน..." value={query}
          onChange={e => { setQuery(e.target.value); setPage(1); }} />
      </div>

      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <table className="table">
          <thead>
            <tr><th>ร้านค้า</th><th>หมวดหมู่</th><th>ระดับปัจจุบัน</th><th>เจ้าของ</th><th>จัดการ</th></tr>
          </thead>
          <tbody>
            {paged.length===0 && (
              <tr><td colSpan={5} style={{textAlign:"center",padding:"24px",color:"var(--text3)"}}>ไม่มีร้านค้าระดับ 2 ที่รอเลื่อนขั้น</td></tr>
            )}
            {paged.map(s => (
              <tr key={s.id}>
                <td>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:18}}>{s.img_emoji}</span>
                    <div style={{fontWeight:600}}>{s.name}</div>
                  </div>
                </td>
                <td><span className="badge badge-gray">{s.category}</span></td>
                <td><TierBadge tier={s.tier} /></td>
                <td style={{fontSize:12,color:"var(--text3)"}}>{s.owner_id}</td>
                <td>
                  <button className="btn btn-outline btn-xs" onClick={() => { setSelectedShop(s); setConfirmModal(false); }}>จัดการ</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={page} totalPages={totalPages} onChange={setPage} />

      {/* UC9 — แสดงรายละเอียดร้านพร้อมปุ่มยืนยัน */}
      {selectedShop && !confirmModal && (
        <Modal title={`จัดการเลื่อนขั้น: ${selectedShop.name}`} onClose={() => setSelectedShop(null)}>
          <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:18,padding:"0 0 14px",borderBottom:"1px solid var(--border)"}}>
            <span style={{fontSize:32}}>{selectedShop.img_emoji}</span>
            <div>
              <div style={{fontFamily:"var(--display)",fontSize:15,fontWeight:600}}>{selectedShop.name}</div>
              <div style={{display:"flex",gap:6,marginTop:4}}><TierBadge tier={selectedShop.tier} /><span className="badge badge-gray">{selectedShop.category}</span></div>
            </div>
          </div>
          <div className="alert alert-info" style={{marginBottom:16}}>
            💡 กดปุ่มด้านล่างเพื่อยืนยันว่า myOrder ทดลองสั่งสินค้าจากร้านนี้แล้วและไม่พบการโกง
          </div>
          <div className="detail-row"><div className="detail-label">ที่อยู่</div><div className="detail-value">{selectedShop.location}</div></div>
          <div className="detail-row"><div className="detail-label">เจ้าของ</div><div className="detail-value">{selectedShop.owner_id}</div></div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:20}}>
            {/* UC9 Exception: กดยกเลิก */}
            <button className="btn btn-ghost btn-sm" onClick={() => setSelectedShop(null)}>ยกเลิก</button>
            <button className="btn btn-success btn-sm" onClick={() => setConfirmModal(true)}>✓ ทดลองสั่งของแล้ว → เลื่อนขั้น 3</button>
          </div>
        </Modal>
      )}

      {/* UC9 — Confirm */}
      {selectedShop && confirmModal && (
        <Modal title="ยืนยันการเลื่อนขั้น" onClose={() => setConfirmModal(false)}
          footer={<>
            <button className="btn btn-ghost btn-sm" onClick={() => setConfirmModal(false)}>ยกเลิก</button>
            <button className="btn btn-success btn-sm" onClick={handleConfirmOrder}>ยืนยัน เลื่อนขั้น 3</button>
          </>}>
          <div className="alert alert-warn" style={{marginBottom:14}}>⚠️ การดำเนินการนี้จะเลื่อนร้าน <strong>"{selectedShop.name}"</strong> เป็น ขั้น 3 ทันที</div>
          <p style={{fontSize:13}}>ข้อมูลการดำเนินการจะถูกบันทึกในระบบ</p>
        </Modal>
      )}
    </div>
  );
}

// ============================================================
// UC10 — จัดการคำร้องร้านค้าที่ขอเลื่อนขั้น
// ============================================================
function UpgradeRequestsPage({ notify }) {
  const [requests, setRequests] = useState(MOCK_UPGRADE_REQUESTS);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const pending = requests.filter(r => r.status==="pending");
  const totalPages = Math.max(1, Math.ceil(requests.length / ITEMS_PER_PAGE));
  const paged = requests.slice((page-1)*ITEMS_PER_PAGE, page*ITEMS_PER_PAGE);

  // UC10 — อนุมัติ
  const handleApprove = (req) => {
    setRequests(prev => prev.map(r => r.id===req.id ? {...r, status:"approved"} : r));
    setSelected(null);
    notify(`อนุมัติคำขอเลื่อนขั้นของ "${req.shop_name}" แล้ว`, "success");
    // TODO: api → update request status="approved", update shop tier, log admin
  };

  // UC10 A1 — ไม่อนุมัติ
  const handleReject = (req) => {
    if (!rejectReason.trim()) return;
    setRequests(prev => prev.map(r => r.id===req.id ? {...r, status:"rejected", reject_reason:rejectReason} : r));
    setSelected(null);
    setShowRejectModal(false);
    setRejectReason("");
    notify(`ปฏิเสธคำขอของ "${req.shop_name}"`, "error");
    // TODO: api → update status="rejected", increment failed_count
  };

  const statusBadge = (s) => {
    if (s==="pending")  return <span className="badge badge-yellow">⏳ รอดำเนินการ</span>;
    if (s==="approved") return <span className="badge badge-green">✓ อนุมัติ</span>;
    return <span className="badge badge-red">✕ ไม่อนุมัติ</span>;
  };

  return (
    <div>
      <div className="page-title">📋 คำร้องขอเลื่อนขั้น</div>
      <div className="page-sub">UC10 — รายการคำร้องจากร้านค้าที่ต้องการเลื่อนระดับการยืนยัน</div>

      <div style={{display:"flex",gap:12,marginBottom:20}}>
        <div className="card" style={{flex:1,padding:"14px 18px",textAlign:"center"}}>
          <div style={{fontSize:22,fontWeight:800,color:"var(--yellow)"}}>{pending.length}</div>
          <div style={{fontSize:11,color:"var(--text3)",fontWeight:700,textTransform:"uppercase"}}>รอดำเนินการ</div>
        </div>
        <div className="card" style={{flex:1,padding:"14px 18px",textAlign:"center"}}>
          <div style={{fontSize:22,fontWeight:800,color:"var(--green)"}}>{requests.filter(r=>r.status==="approved").length}</div>
          <div style={{fontSize:11,color:"var(--text3)",fontWeight:700,textTransform:"uppercase"}}>อนุมัติแล้ว</div>
        </div>
        <div className="card" style={{flex:1,padding:"14px 18px",textAlign:"center"}}>
          <div style={{fontSize:22,fontWeight:800,color:"var(--red)"}}>{requests.filter(r=>r.status==="rejected").length}</div>
          <div style={{fontSize:11,color:"var(--text3)",fontWeight:700,textTransform:"uppercase"}}>ไม่ผ่าน</div>
        </div>
      </div>

      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <table className="table">
          <thead>
            <tr><th>ร้านค้า</th><th>ขอเลื่อนจาก→ถึง</th><th>ประเภท</th><th>วันที่ยื่น</th><th>สถานะ</th><th>จัดการ</th></tr>
          </thead>
          <tbody>
            {paged.map(req => (
              <tr key={req.id}>
                <td><div style={{display:"flex",alignItems:"center",gap:6}}><span>{req.shop_emoji}</span><span style={{fontWeight:600}}>{req.shop_name}</span></div></td>
                <td><div style={{display:"flex",alignItems:"center",gap:6}}><TierBadge tier={req.current_tier} /><span style={{color:"var(--text3)"}}>→</span><TierBadge tier={req.requested_tier} /></div></td>
                <td><span className="badge badge-gray">{req.entity_type==="company"?"🏢 นิติบุคคล":"👤 บุคคลธรรมดา"}</span></td>
                <td style={{fontSize:12,color:"var(--text3)"}}>{req.date}</td>
                <td>{statusBadge(req.status)}</td>
                <td>
                  <button className="btn btn-outline btn-xs" onClick={() => setSelected(req)}>จัดการ</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={page} totalPages={totalPages} onChange={setPage} />

      {/* UC10 — Modal จัดการคำขอ */}
      {selected && (
        <Modal title={`จัดการคำขอ: ${selected.shop_name}`} onClose={() => setSelected(null)} wide>
          <div style={{marginBottom:16}}>
            <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:12}}>
              <span style={{fontSize:28}}>{selected.shop_emoji}</span>
              <div>
                <div style={{fontFamily:"var(--display)",fontSize:15,fontWeight:600}}>{selected.shop_name}</div>
                <div style={{display:"flex",gap:6,marginTop:4}}>
                  <TierBadge tier={selected.current_tier} />
                  <span style={{color:"var(--text3)"}}>→</span>
                  <TierBadge tier={selected.requested_tier} />
                  {statusBadge(selected.status)}
                </div>
              </div>
            </div>

            <div className="detail-row"><div className="detail-label">ประเภทเจ้าของ</div><div className="detail-value">{selected.entity_type==="company"?"🏢 นิติบุคคล":"👤 บุคคลธรรมดา"}</div></div>
            <div className="detail-row"><div className="detail-label">วันที่ยื่น</div><div className="detail-value">{selected.date}</div></div>
            {selected.reject_reason && <div className="detail-row"><div className="detail-label">เหตุผลที่ไม่ผ่าน</div><div className="detail-value" style={{color:"var(--red)"}}>{selected.reject_reason}</div></div>}
          </div>

          {/* UC10 — UC17 เอกสาร: ดาวน์โหลดตรวจสอบ */}
          {selected.docs.length > 0 && (
            <div style={{marginBottom:20}}>
              <div style={{fontSize:12,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:10}}>เอกสารที่ส่งมา</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {selected.docs.map((doc,i) => (
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"var(--surface2)",padding:"10px 14px",borderRadius:10,border:"1px solid var(--border)"}}>
                    <div>
                      <div style={{fontWeight:600,fontSize:13}}>{doc.label}</div>
                      <div style={{fontSize:11,color:"var(--text3)"}}>{doc.name}</div>
                    </div>
                    {/* UC10 — ดาวน์โหลดเอกสาร */}
                    <button className="doc-link" onClick={() => downloadDoc(doc.name)}>⬇ ดาวน์โหลด</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selected.status==="pending" && (
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              {/* UC10 A1 — ไม่อนุมัติ */}
              <button className="btn btn-danger btn-sm" onClick={() => setShowRejectModal(true)}>✕ ไม่อนุมัติ</button>
              {/* UC10 — อนุมัติ */}
              <button className="btn btn-success btn-sm" onClick={() => handleApprove(selected)}>✓ อนุมัติ</button>
            </div>
          )}
        </Modal>
      )}

      {/* UC10 A1 — Modal ระบุเหตุผลไม่อนุมัติ */}
      {showRejectModal && selected && (
        <Modal title="✕ ระบุเหตุผลที่ไม่อนุมัติ" onClose={() => { setShowRejectModal(false); setRejectReason(""); }}
          footer={<>
            <button className="btn btn-ghost btn-sm" onClick={() => { setShowRejectModal(false); setRejectReason(""); }}>ยกเลิก</button>
            <button className="btn btn-danger btn-sm" disabled={!rejectReason.trim()} onClick={() => handleReject(selected)}>ยืนยันไม่อนุมัติ</button>
          </>}>
          <div className="form-group">
            <label className="form-label">เหตุผลที่ไม่อนุมัติ *</label>
            <textarea className="input textarea" placeholder="เช่น เอกสารไม่ชัดเจน, ข้อมูลไม่ครบถ้วน..."
              value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
            <div className="form-hint">เหตุผลนี้จะแสดงให้ร้านค้าเห็นในประวัติคำขอ</div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ============================================================
// UC2 — จัดการคำร้องรายงาน
// ============================================================
function ReportsPage({ notify }) {
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const totalPages = Math.max(1, Math.ceil(reports.length / ITEMS_PER_PAGE));
  const paged = reports.slice((page-1)*ITEMS_PER_PAGE, page*ITEMS_PER_PAGE);

  // UC2 — กดดำเนินการแล้ว → อัปเดตสถานะ
  const handleResolve = (req) => {
    setReports(prev => prev.map(r => r.id===req.id ? {...r, status:"resolved"} : r));
    setSelected(null);
    notify(`ดำเนินการคำร้อง "${req.shop_name}" เรียบร้อย`, "success");
    // TODO: api → update status="resolved" + log
  };

  const statusBadge = (s) => {
    if (s==="pending")  return <span className="badge badge-yellow">⏳ รอดำเนินการ</span>;
    return <span className="badge badge-green">✓ ดำเนินการแล้ว</span>;
  };

  return (
    <div>
      <div className="page-title">🚩 คำร้องรายงาน</div>
      <div className="page-sub">UC2 — รายการร้านค้าที่ถูกรายงานโดยผู้ใช้</div>

      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <table className="table">
          <thead>
            <tr><th>ร้านค้า</th><th>ประเภท</th><th>ผู้รายงาน</th><th>วันที่</th><th>สถานะ</th><th>จัดการ</th></tr>
          </thead>
          <tbody>
            {paged.map(r => (
              <tr key={r.id}>
                <td style={{fontWeight:600}}>{r.shop_name}</td>
                <td><span className="badge badge-red" style={{fontSize:10}}>{r.reason}</span></td>
                <td style={{fontSize:12,color:"var(--text3)"}}>{r.reporter_id}</td>
                <td style={{fontSize:12,color:"var(--text3)"}}>{r.date}</td>
                <td>{statusBadge(r.status)}</td>
                <td><button className="btn btn-outline btn-xs" onClick={() => setSelected(r)}>จัดการ</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={page} totalPages={totalPages} onChange={setPage} />

      {/* UC2 — Modal รายละเอียดคำร้องรายงาน */}
      {selected && (
        <Modal title={`คำร้อง: ${selected.shop_name}`} onClose={() => setSelected(null)} wide>
          <div className="detail-row"><div className="detail-label">รหัสคำร้อง</div><div className="detail-value">{selected.id}</div></div>
          <div className="detail-row"><div className="detail-label">ร้านค้า</div><div className="detail-value">{selected.shop_name}</div></div>
          <div className="detail-row"><div className="detail-label">ประเภท</div><div className="detail-value">{selected.reason}</div></div>
          <div className="detail-row"><div className="detail-label">รายละเอียด</div><div className="detail-value">{selected.detail}</div></div>
          <div className="detail-row"><div className="detail-label">ผู้รายงาน</div><div className="detail-value">{selected.reporter_id}</div></div>
          <div className="detail-row"><div className="detail-label">วันที่</div><div className="detail-value">{selected.date}</div></div>
          <div className="detail-row"><div className="detail-label">สถานะ</div><div className="detail-value">{statusBadge(selected.status)}</div></div>

          {/* UC2 — ดาวน์โหลดเอกสาร */}
          {selected.docs.length > 0 && (
            <div style={{marginTop:16,marginBottom:8}}>
              <div style={{fontSize:12,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:10}}>เอกสารแนบ</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {selected.docs.map((doc,i) => (
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"var(--surface2)",padding:"9px 12px",borderRadius:9,border:"1px solid var(--border)"}}>
                    <div>
                      <div style={{fontWeight:600,fontSize:13}}>{doc.label}</div>
                      <div style={{fontSize:11,color:"var(--text3)"}}>{doc.name}</div>
                    </div>
                    <button className="doc-link" onClick={() => downloadDoc(doc.name)}>⬇ ดาวน์โหลด</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selected.status==="pending" && (
            <div style={{display:"flex",justifyContent:"flex-end",marginTop:20}}>
              {/* UC2 — กดดำเนินการแล้ว */}
              <button className="btn btn-success btn-sm" onClick={() => handleResolve(selected)}>✓ ดำเนินการแล้ว</button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

// ============================================================
// UC11 — จัดการคำร้องขอเคลม
// ============================================================
function ClaimsPage({ notify }) {
  const [claims, setClaims] = useState(MOCK_CLAIMS);
  const [page, setPage]     = useState(1);
  const [selected, setSelected] = useState(null);

  const totalPages = Math.max(1, Math.ceil(claims.length / ITEMS_PER_PAGE));
  const paged = claims.slice((page-1)*ITEMS_PER_PAGE, page*ITEMS_PER_PAGE);

  // UC11 — กดดำเนินการแล้ว → ปิดคำขอ
  const handleResolve = (clm) => {
    setClaims(prev => prev.map(c => c.id===clm.id ? {...c, status:"resolved"} : c));
    setSelected(null);
    notify(`ปิดคำร้องเคลมของ "${clm.shop_name}" เรียบร้อย`, "success");
    // TODO: api → update status="resolved" + log
  };

  const statusBadge = (s) => {
    if (s==="pending")  return <span className="badge badge-yellow">⏳ รอดำเนินการ</span>;
    return <span className="badge badge-green">✓ ดำเนินการแล้ว</span>;
  };

  return (
    <div>
      <div className="page-title">⚖️ คำร้องขอเคลม</div>
      <div className="page-sub">UC11 — ติดตามและช่วยเหลือผู้ใช้ที่ประสบปัญหากับร้านค้า</div>

      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <table className="table">
          <thead>
            <tr><th>รหัส</th><th>ร้านค้า</th><th>ผู้ร้องเรียน</th><th>ช่องทางติดต่อ</th><th>วันที่</th><th>สถานะ</th><th>จัดการ</th></tr>
          </thead>
          <tbody>
            {paged.map(c => (
              <tr key={c.id}>
                <td style={{fontSize:11,color:"var(--text3)"}}>{c.id}</td>
                <td style={{fontWeight:600}}>{c.shop_name}</td>
                <td style={{fontSize:12,color:"var(--text3)"}}>{c.claimant_id}</td>
                <td style={{fontSize:12}}>{c.claimant_contact}</td>
                <td style={{fontSize:12,color:"var(--text3)"}}>{c.date}</td>
                <td>{statusBadge(c.status)}</td>
                <td><button className="btn btn-outline btn-xs" onClick={() => setSelected(c)}>จัดการ</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={page} totalPages={totalPages} onChange={setPage} />

      {/* UC11 — Modal รายละเอียดคำร้องเคลม */}
      {selected && (
        <Modal title={`คำร้องเคลม: ${selected.id}`} onClose={() => setSelected(null)} wide>
          <div className="detail-row"><div className="detail-label">ร้านค้า</div><div className="detail-value">{selected.shop_name}</div></div>
          <div className="detail-row"><div className="detail-label">ผู้ร้องเรียน</div><div className="detail-value">{selected.claimant_id}</div></div>
          {/* UC11 — ช่องทางติดต่อเพื่อติดต่อกลับ */}
          <div className="detail-row">
            <div className="detail-label">ช่องทางติดต่อ</div>
            <div className="detail-value">
              <span style={{background:"var(--green-light)",color:"var(--green)",padding:"2px 10px",borderRadius:100,fontSize:12,fontWeight:700}}>{selected.claimant_contact}</span>
            </div>
          </div>
          <div className="detail-row"><div className="detail-label">รายละเอียด</div><div className="detail-value">{selected.detail}</div></div>
          <div className="detail-row"><div className="detail-label">วันที่</div><div className="detail-value">{selected.date}</div></div>
          <div className="detail-row"><div className="detail-label">สถานะ</div><div className="detail-value">{statusBadge(selected.status)}</div></div>

          {/* UC11 — ดาวน์โหลดเอกสาร */}
          {selected.docs.length > 0 && (
            <div style={{marginTop:16,marginBottom:8}}>
              <div style={{fontSize:12,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:10}}>หลักฐาน</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {selected.docs.map((doc,i) => (
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"var(--surface2)",padding:"9px 12px",borderRadius:9,border:"1px solid var(--border)"}}>
                    <div><div style={{fontWeight:600,fontSize:13}}>{doc.label}</div><div style={{fontSize:11,color:"var(--text3)"}}>{doc.name}</div></div>
                    <button className="doc-link" onClick={() => downloadDoc(doc.name)}>⬇ ดาวน์โหลด</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selected.status==="pending" && (
            <div>
              <div className="alert alert-info" style={{marginTop:16,marginBottom:12}}>
                📞 ติดต่อผู้ร้องเรียนผ่าน: <strong>{selected.claimant_contact}</strong> เพื่อช่วยเหลือและชดเชย
              </div>
              {/* UC11 — กดดำเนินการแล้ว */}
              <div style={{display:"flex",justifyContent:"flex-end"}}>
                <button className="btn btn-success btn-sm" onClick={() => handleResolve(selected)}>✓ ดำเนินการแล้ว / ปิดคำร้อง</button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

// ============================================================
// ADMIN APP SHELL
// ============================================================
export default function AdminPanel() {
  const [activePage, setActivePage] = useState("dashboard");
  const [notification, setNotification] = useState(null);
  const notify = (msg, type="success") => setNotification({ msg, type });

  const renderPage = () => {
    switch(activePage) {
      case "dashboard":         return <DashboardPage />;
      case "shops":             return <ShopsPage notify={notify} />;
      case "blacklist":         return <BlacklistPage notify={notify} />;
      case "upgrade-tier3":     return <UpgradeTier3Page notify={notify} />;
      case "upgrade-requests":  return <UpgradeRequestsPage notify={notify} />;
      case "reports":           return <ReportsPage notify={notify} />;
      case "claims":            return <ClaimsPage notify={notify} />;
      default: return <DashboardPage />;
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="admin-layout">
        <Sidebar active={activePage} onNavigate={setActivePage} />
        <div className="main-content">{renderPage()}</div>
      </div>
      {notification && <Notification msg={notification.msg} type={notification.type} onClose={() => setNotification(null)} />}
    </>
  );
}