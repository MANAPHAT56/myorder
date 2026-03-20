import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// ADMIN PANEL — ครอบคลุม UC1-UC11
// ============================================================

const ITEMS_PER_PAGE = 8;
const INVALID_CHARS  = /[^\u0E00-\u0E7Fa-zA-Z0-9\s\-_.@/:,()]/;

// ============================================================
// MOCK DATA
// ============================================================
const ALL_SHOPS = [
  { id:1,  name:"ร้านข้าวมันไก่สมชาย",    category:"อาหาร",       tier:3, entity_type:"individual", is_closed:false, is_blacklisted:false, is_deleted:false, link:"https://line.me/shop1",  description:"ข้าวมันไก่ต้มและทอด", rating:4.8, location:"สุขุมวิท 11",  owner_id:"USR001", img_emoji:"🍗" },
  { id:2,  name:"ก๋วยเตี๋ยวเรือป้าแดง",    category:"อาหาร",       tier:2, entity_type:"company",    is_closed:false, is_blacklisted:false, is_deleted:false, link:"https://line.me/shop2",  description:"ก๋วยเตี๋ยวเรือสูตรดั้งเดิม", rating:4.6, location:"รามคำแหง 24", owner_id:"USR002", img_emoji:"🍜" },
  { id:3,  name:"ขนมครกบ้านนา",            category:"ขนม",         tier:1, entity_type:"individual", is_closed:false, is_blacklisted:false, is_deleted:false, link:"https://line.me/shop3",  description:"ขนมครกหอมมะพร้าว", rating:4.3, location:"ลาดพร้าว 41",  owner_id:"USR003", img_emoji:"🥥" },
  { id:4,  name:"ส้มตำอีสานแม่ตุ๋ย",       category:"อาหาร",       tier:2, entity_type:"individual", is_closed:false, is_blacklisted:false, is_deleted:false, link:"https://line.me/shop4",  description:"ส้มตำลาบรสเด็ด", rating:4.7, location:"พระโขนง",      owner_id:"USR004", img_emoji:"🥗" },
  { id:5,  name:"ชานมไข่มุกไต้หวันแท้",    category:"เครื่องดื่ม", tier:3, entity_type:"company",    is_closed:false, is_blacklisted:false, is_deleted:false, link:"https://line.me/shop5",  description:"ชานมไข่มุก", rating:4.9, location:"ทองหล่อ",       owner_id:"USR005", img_emoji:"🧋" },
  { id:6,  name:"ร้านหมูกระทะแซ่บโอ้โห",   category:"อาหาร",       tier:2, entity_type:"company",    is_closed:false, is_blacklisted:false, is_deleted:false, link:"https://line.me/shop7",  description:"หมูกระทะบุฟเฟ่ต์", rating:4.5, location:"บางนา",         owner_id:"USR006", img_emoji:"🥩" },
  { id:7,  name:"กาแฟดริปคั่วสด",          category:"เครื่องดื่ม", tier:2, entity_type:"individual", is_closed:false, is_blacklisted:false, is_deleted:false, link:"https://line.me/shop8",  description:"กาแฟดริปสด", rating:4.7, location:"เชียงใหม่",     owner_id:"USR007", img_emoji:"☕" },
  { id:8,  name:"เค้กวันเกิดสั่งทำพิเศษ",  category:"ขนม",         tier:3, entity_type:"company",    is_closed:false, is_blacklisted:false, is_deleted:false, link:"https://line.me/shop15", description:"เค้กวันเกิด Custom", rating:4.9, location:"จตุจักร",       owner_id:"USR008", img_emoji:"🎂" },
  { id:9,  name:"ข้าวหน้าเป็ดพะโล้",        category:"อาหาร",       tier:2, entity_type:"company",    is_closed:false, is_blacklisted:false, is_deleted:false, link:"https://line.me/shop11", description:"ข้าวหน้าเป็ดพะโล้", rating:4.8, location:"เยาวราช",      owner_id:"USR009", img_emoji:"🦆" },
  { id:10, name:"คุกกี้อบสดออเดอร์เมด",    category:"ขนม",         tier:2, entity_type:"individual", is_closed:false, is_blacklisted:false, is_deleted:false, link:"https://line.me/shop12", description:"คุกกี้อบสด", rating:4.6, location:"ปทุมธานี",      owner_id:"USR010", img_emoji:"🍪" },
  { id:26, name:"ร้านต้มยำโกงเงินลูกค้า",  category:"อาหาร",       tier:1, entity_type:"individual", is_closed:false, is_blacklisted:true,  is_deleted:false, link:"", description:"ต้มยำกุ้ง", rating:2.1, location:"มีนบุรี",        owner_id:"USR026", img_emoji:"🦐" },
  { id:27, name:"ร้านขนมปลอมแปลงสินค้า",   category:"ขนม",         tier:1, entity_type:"company",    is_closed:false, is_blacklisted:true,  is_deleted:false, link:"", description:"ขนมปังแซนด์วิช", rating:1.8, location:"ลาดพร้าว",      owner_id:"USR027", img_emoji:"🥪" },
];

// เอกสาร mock — ใช้ placeholder image จริงๆ จาก picsum เพื่อทดสอบ viewer
const makeDocs = (items) => items.map(d => ({
  ...d,
  // mock URL — ในระบบจริงจะเป็น signed URL จาก backend
  previewUrl: d.type === "pdf"
    ? null   // PDF ไม่มี preview ตรงๆ (แสดง placeholder)
    : `https://picsum.photos/seed/${d.seed}/800/1100`,
  fileType: d.type || "image",
}));

const MOCK_REPORTS = [
  { id:"RPT001", shop_id:3,  shop_name:"ขนมครกบ้านนา",  reporter_id:"USR099", reason:"สินค้าไม่ตรงรูป",   detail:"ของที่ได้รับแตกต่างจากรูปโปรไฟล์มาก", date:"12/03/2568", status:"pending",
    docs: makeDocs([{ name:"สลิปโอนเงิน.jpg", label:"สลิปโอนเงิน", type:"image", seed:"slip1" }, { name:"รูปสินค้า.jpg", label:"รูปสินค้า", type:"image", seed:"product1" }]) },
  { id:"RPT002", shop_id:6,  shop_name:"ร้านหมูกระทะ",   reporter_id:"USR088", reason:"โกงเงิน",            detail:"โอนเงินแล้วร้านหายไม่ตอบ", date:"14/03/2568", status:"pending",
    docs: makeDocs([{ name:"แชท.pdf", label:"แชทสนทนา", type:"pdf", seed:"chat1" }]) },
  { id:"RPT003", shop_id:2,  shop_name:"ก๋วยเตี๋ยวเรือ", reporter_id:"USR077", reason:"ข้อมูลร้านค้าผิด",  detail:"ที่อยู่ไม่ตรง", date:"10/03/2568", status:"resolved", docs:[] },
];

const MOCK_UPGRADE_REQUESTS = [
  { id:"UPG001", shop_id:3,  shop_name:"ขนมครกบ้านนา",   shop_emoji:"🥥", current_tier:1, requested_tier:2, entity_type:"individual", date:"08/03/2568", status:"pending",
    docs: makeDocs([{ name:"บัตรประชาชน.jpg", label:"บัตรประชาชน", type:"image", seed:"id1" }, { name:"รูปถ่ายคู่บัตร.jpg", label:"รูปถ่ายคู่บัตรประชาชน", type:"image", seed:"selfie1" }]) },
  { id:"UPG002", shop_id:7,  shop_name:"กาแฟดริปคั่วสด", shop_emoji:"☕", current_tier:1, requested_tier:2, entity_type:"company",    date:"09/03/2568", status:"pending",
    docs: makeDocs([{ name:"ภพ20.pdf", label:"ภพ.20", type:"pdf", seed:"vat1" }, { name:"บัตรกรรมการ.jpg", label:"บัตรประชาชนกรรมการ", type:"image", seed:"dir1" }]) },
  { id:"UPG003", shop_id:10, shop_name:"คุกกี้อบสด",      shop_emoji:"🍪", current_tier:1, requested_tier:2, entity_type:"individual", date:"11/03/2568", status:"rejected", reject_reason:"เอกสารไม่ชัดเจน",
    docs: makeDocs([{ name:"บัตร.jpg", label:"บัตรประชาชน", type:"image", seed:"id2" }]) },
];

const MOCK_CLAIMS = [
  { id:"CLM001", shop_id:3, shop_name:"ขนมครกบ้านนา", claimant_id:"USR099", claimant_contact:"LINE: @user99", detail:"สั่งของแล้วไม่ส่ง โอนเงินไปแล้ว 500 บาท", date:"13/03/2568", status:"pending",
    docs: makeDocs([{ name:"สลิปโอนเงิน.jpg", label:"สลิปโอนเงิน", type:"image", seed:"slip2" }]) },
  { id:"CLM002", shop_id:6, shop_name:"ร้านหมูกระทะ",  claimant_id:"USR088", claimant_contact:"081-234-5678",  detail:"ของมาไม่ครบ ขาดหมู 2 ถาด", date:"14/03/2568", status:"resolved", docs:[] },
];

// ============================================================
// VALIDATION
// ============================================================
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

  /* ── DOC VIEWER OVERLAY ── */
  .doc-viewer-overlay {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(0,0,0,0.88);
    display: flex; flex-direction: column;
    animation: fadeIn 0.18s ease;
  }
  .doc-viewer-topbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 20px;
    background: rgba(255,255,255,0.06);
    border-bottom: 1px solid rgba(255,255,255,0.1);
    flex-shrink: 0;
  }
  .doc-viewer-title {
    font-family: var(--display); font-size: 15px; font-weight: 600; color: #f0ede8;
    display: flex; align-items: center; gap: 10px;
  }
  .doc-viewer-controls {
    display: flex; align-items: center; gap: 8px;
  }
  .doc-ctrl-btn {
    width: 36px; height: 36px; border-radius: 9px;
    background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
    color: #f0ede8; font-size: 16px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.15s; font-family: var(--font); font-weight: 700;
  }
  .doc-ctrl-btn:hover { background: rgba(255,255,255,0.18); }
  .doc-ctrl-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .doc-zoom-label {
    min-width: 52px; text-align: center; font-size: 13px; font-weight: 700;
    color: #d0c8be; font-family: var(--font);
  }
  .doc-viewer-sidebar {
    display: flex; flex-direction: column; gap: 6px;
    padding: 14px 10px;
    background: rgba(255,255,255,0.04);
    border-right: 1px solid rgba(255,255,255,0.08);
    min-width: 130px; overflow-y: auto; flex-shrink: 0;
  }
  .doc-thumb-btn {
    padding: 8px 10px; border-radius: 8px; cursor: pointer;
    border: 1.5px solid transparent;
    background: rgba(255,255,255,0.06);
    color: #c4b5a0; font-size: 12px; font-family: var(--font);
    transition: all 0.15s; text-align: left; line-height: 1.4;
  }
  .doc-thumb-btn:hover { background: rgba(255,255,255,0.12); color: #f0e8dc; }
  .doc-thumb-btn.active {
    background: rgba(249,115,22,0.2);
    border-color: rgba(249,115,22,0.5);
    color: #fb923c;
  }
  .doc-viewer-main {
    flex: 1; overflow: hidden; display: flex; align-items: center; justify-content: center;
    position: relative; cursor: grab; user-select: none;
  }
  .doc-viewer-main.grabbing { cursor: grabbing; }
  .doc-viewer-main.zoom-in-cursor { cursor: zoom-in; }
  .doc-img-wrap {
    transition: transform 0.05s linear;
    transform-origin: center center;
    display: flex; align-items: center; justify-content: center;
  }
  .doc-img {
    max-width: 90vw; max-height: 78vh;
    border-radius: 6px;
    box-shadow: 0 8px 48px rgba(0,0,0,0.6);
    display: block; pointer-events: none;
    object-fit: contain;
  }
  .doc-pdf-placeholder {
    background: #fff; border-radius: 10px;
    padding: 40px 60px; text-align: center;
    box-shadow: 0 8px 48px rgba(0,0,0,0.6);
  }
  .doc-pdf-icon { font-size: 56px; margin-bottom: 14px; }
  .doc-pdf-name { font-size: 15px; font-weight: 700; color: #333; margin-bottom: 6px; }
  .doc-pdf-sub { font-size: 12px; color: #888; }
  .doc-viewer-body {
    flex: 1; display: flex; overflow: hidden;
  }
  .doc-page-indicator {
    position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%);
    background: rgba(0,0,0,0.55); border-radius: 100px;
    padding: 4px 14px; font-size: 12px; color: #ccc; font-family: var(--font);
    pointer-events: none;
  }
  /* doc item in list */
  .doc-item {
    display: flex; justify-content: space-between; align-items: center;
    background: var(--surface2); padding: 10px 14px;
    border-radius: 10px; border: 1px solid var(--border);
    margin-bottom: 8px;
  }
  .doc-item-info { display: flex; flex-direction: column; gap: 2px; }
  .doc-item-label { font-weight: 600; font-size: 13px; }
  .doc-item-name { font-size: 11px; color: var(--text3); }
  .doc-view-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 12px; border-radius: 6px;
    background: var(--blue-light); color: var(--blue);
    font-size: 12px; font-weight: 700; cursor: pointer;
    border: 1px solid rgba(29,78,216,0.18);
    transition: background 0.15s; font-family: var(--font);
  }
  .doc-view-btn:hover { background: rgba(29,78,216,0.14); }

  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes slideUp{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}
  @keyframes slideIn{from{transform:translateX(14px);opacity:0}to{transform:translateX(0);opacity:1}}
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
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="pagination-wrap">
      <button className="page-btn" onClick={() => onChange(currentPage-1)} disabled={currentPage===1}>‹</button>
      {pages.map(p => <button key={p} className={`page-btn ${p===currentPage?"active":""}`} onClick={() => onChange(p)}>{p}</button>)}
      <button className="page-btn" onClick={() => onChange(currentPage+1)} disabled={currentPage===totalPages}>›</button>
    </div>
  );
}

// ============================================================
// DOCUMENT VIEWER — หน้าต่างลอยดูเอกสาร + ซูมได้
// ============================================================
const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];
const DEFAULT_ZOOM_IDX = 2; // 1.0

function DocViewer({ docs, initialIndex = 0, onClose }) {
  const [docIdx, setDocIdx]   = useState(initialIndex);
  const [zoomIdx, setZoomIdx] = useState(DEFAULT_ZOOM_IDX);
  const [pan, setPan]         = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(null);
  const mainRef   = useRef(null);

  const doc = docs[docIdx];
  const zoom = ZOOM_LEVELS[zoomIdx];

  // reset pan + zoom เมื่อเปลี่ยนเอกสาร
  useEffect(() => {
    setZoomIdx(DEFAULT_ZOOM_IDX);
    setPan({ x: 0, y: 0 });
  }, [docIdx]);

  // keyboard
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" || e.key === "ArrowDown") setDocIdx(i => Math.min(i+1, docs.length-1));
      if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   setDocIdx(i => Math.max(i-1, 0));
      if (e.key === "+" || e.key === "=") setZoomIdx(i => Math.min(i+1, ZOOM_LEVELS.length-1));
      if (e.key === "-")                  setZoomIdx(i => Math.max(i-1, 0));
      if (e.key === "0") { setZoomIdx(DEFAULT_ZOOM_IDX); setPan({ x:0, y:0 }); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [docs.length, onClose]);

  // wheel zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    if (e.deltaY < 0) setZoomIdx(i => Math.min(i+1, ZOOM_LEVELS.length-1));
    else              setZoomIdx(i => Math.max(i-1, 0));
  }, []);
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  // drag-to-pan
  const onPointerDown = (e) => {
    if (zoom <= 1) return;
    setDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!dragging || !dragStart.current) return;
    setPan({
      x: dragStart.current.px + (e.clientX - dragStart.current.mx),
      y: dragStart.current.py + (e.clientY - dragStart.current.my),
    });
  };
  const onPointerUp = () => { setDragging(false); dragStart.current = null; };

  // double-click zoom
  const onDoubleClick = () => {
    if (zoomIdx < ZOOM_LEVELS.length - 1) setZoomIdx(i => i + 1);
    else { setZoomIdx(DEFAULT_ZOOM_IDX); setPan({ x:0, y:0 }); }
  };

  const resetView = () => { setZoomIdx(DEFAULT_ZOOM_IDX); setPan({ x:0, y:0 }); };

  return (
    <div className="doc-viewer-overlay">
      {/* Top bar */}
      <div className="doc-viewer-topbar">
        <div className="doc-viewer-title">
          <span style={{ fontSize:18 }}>{doc.fileType === "pdf" ? "📄" : "🖼️"}</span>
          <span>{doc.label}</span>
          <span style={{ fontSize:12, opacity:0.5, fontFamily:"var(--font)", fontWeight:400 }}>{doc.name}</span>
          {docs.length > 1 && (
            <span style={{ fontSize:12, color:"#9a8a7a" }}>
              ({docIdx+1} / {docs.length})
            </span>
          )}
        </div>

        <div className="doc-viewer-controls">
          {/* Zoom out */}
          <button className="doc-ctrl-btn" onClick={() => setZoomIdx(i => Math.max(i-1,0))} disabled={zoomIdx===0} title="ซูมออก (-)">−</button>
          {/* Zoom label */}
          <span className="doc-zoom-label">{Math.round(zoom*100)}%</span>
          {/* Zoom in */}
          <button className="doc-ctrl-btn" onClick={() => setZoomIdx(i => Math.min(i+1,ZOOM_LEVELS.length-1))} disabled={zoomIdx===ZOOM_LEVELS.length-1} title="ซูมเข้า (+)">+</button>
          {/* Reset */}
          <button className="doc-ctrl-btn" onClick={resetView} title="รีเซ็ตมุมมอง (0)" style={{ fontSize:13 }}>⊙</button>
          {/* Divider */}
          <div style={{ width:1, height:24, background:"rgba(255,255,255,0.15)", margin:"0 4px" }} />
          {/* Prev / Next (ถ้ามีหลายไฟล์) */}
          {docs.length > 1 && <>
            <button className="doc-ctrl-btn" onClick={() => setDocIdx(i => Math.max(i-1,0))} disabled={docIdx===0} title="เอกสารก่อนหน้า">‹</button>
            <button className="doc-ctrl-btn" onClick={() => setDocIdx(i => Math.min(i+1,docs.length-1))} disabled={docIdx===docs.length-1} title="เอกสารถัดไป">›</button>
          </>}
          {/* Close */}
          <button className="doc-ctrl-btn" onClick={onClose} title="ปิด (Esc)" style={{ background:"rgba(220,38,38,0.25)", marginLeft:4 }}>✕</button>
        </div>
      </div>

      <div className="doc-viewer-body">
        {/* Sidebar — รายการเอกสาร (ถ้ามีหลายไฟล์) */}
        {docs.length > 1 && (
          <div className="doc-viewer-sidebar">
            <div style={{ fontSize:10, fontWeight:700, color:"#6b5d4e", textTransform:"uppercase", letterSpacing:"0.1em", padding:"0 4px 8px" }}>เอกสาร</div>
            {docs.map((d, i) => (
              <button key={i} className={`doc-thumb-btn ${i===docIdx?"active":""}`} onClick={() => setDocIdx(i)}>
                <span style={{ fontSize:15 }}>{d.fileType==="pdf"?"📄":"🖼️"}</span>
                <span style={{ display:"block", marginTop:3, fontSize:11 }}>{d.label}</span>
                <span style={{ display:"block", fontSize:10, opacity:0.6 }}>{d.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Main viewer */}
        <div
          ref={mainRef}
          className={`doc-viewer-main ${dragging?"grabbing":zoom>1?"":"zoom-in-cursor"}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onDoubleClick={onDoubleClick}
        >
          <div
            className="doc-img-wrap"
            style={{ transform: `scale(${zoom}) translate(${pan.x/zoom}px, ${pan.y/zoom}px)` }}
          >
            {doc.fileType === "pdf" ? (
              // PDF — แสดง placeholder เพราะดู inline ไม่ได้ในกรณีนี้
              <div className="doc-pdf-placeholder">
                <div className="doc-pdf-icon">📄</div>
                <div className="doc-pdf-name">{doc.name}</div>
                <div className="doc-pdf-sub">{doc.label}</div>
                <div style={{ marginTop:16, fontSize:12, color:"#888" }}>
                  ไฟล์ PDF — ในระบบจริงจะแสดง PDF viewer<br/>หรือฝัง iframe จาก backend
                </div>
              </div>
            ) : (
              <img
                className="doc-img"
                src={doc.previewUrl}
                alt={doc.label}
                draggable={false}
              />
            )}
          </div>

          {/* hint */}
          <div className="doc-page-indicator">
            scroll เพื่อซูม · ดับเบิ้ลคลิกเพื่อซูมเข้า · ลากเพื่อเลื่อน · Esc ปิด
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DOC LIST — component แสดงรายการเอกสารพร้อมปุ่ม "ดูเอกสาร"
// ============================================================
function DocList({ docs, onView }) {
  if (!docs || docs.length === 0) return (
    <div style={{ fontSize:13, color:"var(--text3)", fontStyle:"italic", padding:"8px 0" }}>
      ไม่มีเอกสารแนบ
    </div>
  );
  return (
    <div>
      {docs.map((doc, i) => (
        <div key={i} className="doc-item">
          <div className="doc-item-info">
            <span className="doc-item-label">
              {doc.fileType==="pdf" ? "📄" : "🖼️"} {doc.label}
            </span>
            <span className="doc-item-name">{doc.name}</span>
          </div>
          {/* ปุ่มดูเอกสาร — เปิด viewer ที่ index นี้ */}
          <button className="doc-view-btn" onClick={() => onView(i)}>
            🔍 ดูเอกสาร
          </button>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// UC8 — ค้นหาร้านค้า
// ============================================================
function useShopList(shops, query) {
  return shops.filter(s =>
    !query ||
    s.name.toLowerCase().includes(query.toLowerCase()) ||
    s.location.toLowerCase().includes(query.toLowerCase()) ||
    s.owner_id.toLowerCase().includes(query.toLowerCase())
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
      <div className="sidebar-brand">my<span>Order</span> <span style={{ fontSize:11, opacity:0.6 }}>Admin</span></div>
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
  const total           = ALL_SHOPS.filter(s => !s.is_deleted).length;
  const blacklisted     = ALL_SHOPS.filter(s => s.is_blacklisted).length;
  const pendingUpgrade  = MOCK_UPGRADE_REQUESTS.filter(r => r.status==="pending").length;
  const pendingClaims   = MOCK_CLAIMS.filter(c => c.status==="pending").length;

  return (
    <div>
      <div className="page-title">📊 ภาพรวมระบบ</div>
      <div className="page-sub">ข้อมูลสถานะรวมของระบบ myOrder</div>
      <div className="stat-grid">
        <div className="stat-card"><div className="stat-val" style={{ color:"var(--accent)" }}>{total}</div><div className="stat-label">ร้านค้าทั้งหมด</div></div>
        <div className="stat-card"><div className="stat-val" style={{ color:"var(--red)" }}>{blacklisted}</div><div className="stat-label">Blacklist</div></div>
        <div className="stat-card"><div className="stat-val" style={{ color:"var(--yellow)" }}>{pendingUpgrade}</div><div className="stat-label">รอเลื่อนขั้น</div></div>
        <div className="stat-card"><div className="stat-val" style={{ color:"var(--blue)" }}>{pendingClaims}</div><div className="stat-label">คำร้องเคลม</div></div>
      </div>
      <div className="card">
        <div className="card-title">คำร้องล่าสุดที่รอดำเนินการ</div>
        <div className="card-sub">คำร้องที่ยังไม่ได้จัดการ</div>
        {MOCK_REPORTS.filter(r => r.status==="pending").map(r => (
          <div key={r.id} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid var(--border)", alignItems:"center" }}>
            <div><div style={{ fontWeight:600 }}>{r.shop_name}</div><div style={{ fontSize:12, color:"var(--text3)" }}>{r.reason} · {r.date}</div></div>
            <span className="badge badge-yellow">⏳ รอดำเนินการ</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// UC6 + UC3 + UC1 + UC4 + UC5
// ============================================================
function ShopsPage({ notify }) {
  const [shops, setShops] = useState(ALL_SHOPS.filter(s => !s.is_blacklisted && !s.is_deleted));
  const [query, setQuery] = useState("");
  const [page, setPage]   = useState(1);
  const [selectedShop, setSelectedShop] = useState(null);
  const [showAddModal, setShowAddModal]  = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmShop, setConfirmShop] = useState(null);
  const [editForm, setEditForm]   = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [addForm, setAddForm]     = useState({ name:"", category:"อาหาร", entity_type:"individual", link:"", description:"", location:"", owner_id:"" });
  const [addErrors, setAddErrors] = useState({});

  const filtered   = useShopList(shops, query);
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paged      = filtered.slice((page-1)*ITEMS_PER_PAGE, page*ITEMS_PER_PAGE);

  const openManage = (shop) => { setSelectedShop(shop); setEditForm({ name:shop.name, link:shop.link, description:shop.description, location:shop.location }); setEditErrors({}); };

  const handleSaveEdit = () => {
    const errors = {};
    const ne = validateText(editForm.name);        if (ne) errors.name = ne;
    const le = validateUrl(editForm.link);         if (le) errors.link = le;
    const de = validateText(editForm.description); if (de) errors.description = de;
    const loe = validateText(editForm.location);   if (loe) errors.location = loe;
    if (Object.keys(errors).length) { setEditErrors(errors); return; }
    setShops(prev => prev.map(s => s.id===selectedShop.id ? { ...s, ...editForm } : s));
    setSelectedShop(s => ({ ...s, ...editForm }));
    setShowEditModal(false);
    notify("แก้ไขข้อมูลร้านค้าเรียบร้อย", "success");
  };

  const handleDelete = (shop) => {
    setShops(prev => prev.filter(s => s.id!==shop.id));
    setSelectedShop(null); setShowDeleteConfirm(false);
    notify(`ลบร้านค้า "${shop.name}" เรียบร้อยแล้ว`, "success");
  };

  const handleBlacklist = (shop) => {
    setShops(prev => prev.map(s => s.id===shop.id ? { ...s, is_blacklisted:true } : s));
    setSelectedShop(null);
    notify(`เพิ่ม "${shop.name}" ใน Blacklist แล้ว`, "success");
  };

  const handleAddShop = () => {
    const errors = {};
    const ne = validateText(addForm.name);        if (ne) errors.name = ne;
    const le = validateUrl(addForm.link);         if (le) errors.link = le;
    const de = validateText(addForm.description); if (de) errors.description = de;
    const loe = validateText(addForm.location);   if (loe) errors.location = loe;
    const oe = validateUserId(addForm.owner_id);  if (oe) errors.owner_id = oe;
    if (Object.keys(errors).length) { setAddErrors(errors); return; }
    const newShop = { ...addForm, id:Date.now(), tier:1, rating:0, is_closed:false, is_blacklisted:false, is_deleted:false, img_emoji:"🏪" };
    setShops(prev => [newShop, ...prev]);
    setShowAddModal(false);
    setAddForm({ name:"", category:"อาหาร", entity_type:"individual", link:"", description:"", location:"", owner_id:"" });
    setAddErrors({});
    notify("เพิ่มร้านค้าใหม่เรียบร้อยแล้ว", "success");
  };

  const categories = ["อาหาร","ขนม","เครื่องดื่ม","อื่นๆ"];

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
        <div><div className="page-title">🏪 จัดการร้านค้า</div><div className="page-sub">รายการร้านค้าทั้งหมดในระบบ</div></div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>＋ เพิ่มร้านค้า</button>
      </div>
      <div className="search-bar">
        <input className="search-input" placeholder="ค้นหาชื่อร้าน, ที่อยู่, หรือ User ID..."
          value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} />
      </div>
      {filtered.length===0 && <div className="alert alert-info">🔍 ไม่พบร้านค้าที่ตรงกับ "{query}"</div>}
      <div className="card" style={{ padding:0, overflow:"hidden" }}>
        <table className="table">
          <thead><tr><th>ร้านค้า</th><th>หมวดหมู่</th><th>ระดับ</th><th>เจ้าของ</th><th>คะแนน</th><th>จัดการ</th></tr></thead>
          <tbody>
            {paged.map(s => (
              <tr key={s.id}>
                <td><div style={{ display:"flex", alignItems:"center", gap:8 }}><span style={{ fontSize:20 }}>{s.img_emoji}</span><div><div style={{ fontWeight:600 }}>{s.name}</div><div style={{ fontSize:11, color:"var(--text3)" }}>📍 {s.location}</div></div></div></td>
                <td><span className="badge badge-gray">{s.category}</span></td>
                <td><TierBadge tier={s.tier} /></td>
                <td style={{ fontSize:12, color:"var(--text3)" }}>{s.owner_id}</td>
                <td style={{ fontWeight:700, color:"var(--yellow)" }}>⭐ {s.rating}</td>
                <td><button className="btn btn-outline btn-xs" onClick={() => openManage(s)}>จัดการ</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={page} totalPages={totalPages} onChange={setPage} />

      {selectedShop && (
        <Modal title={`จัดการ: ${selectedShop.name}`} onClose={() => setSelectedShop(null)} wide>
          <div style={{ display:"flex", gap:14, alignItems:"center", marginBottom:20, padding:"0 0 16px", borderBottom:"1px solid var(--border)" }}>
            <span style={{ fontSize:36 }}>{selectedShop.img_emoji}</span>
            <div>
              <div style={{ fontFamily:"var(--display)", fontSize:16, fontWeight:600 }}>{selectedShop.name}</div>
              <div style={{ display:"flex", gap:6, marginTop:4 }}><TierBadge tier={selectedShop.tier} /><span className="badge badge-gray">{selectedShop.category}</span></div>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
            <button className="btn btn-outline" onClick={() => setShowEditModal(true)}>✏️ แก้ไขข้อมูล</button>
            <button className="btn btn-warn" onClick={() => handleBlacklist(selectedShop)} disabled={selectedShop.is_blacklisted}>
              {selectedShop.is_blacklisted ? "⛔ Blacklist แล้ว" : "⛔ เพิ่ม Blacklist"}
            </button>
            <button className="btn btn-danger" onClick={() => { setConfirmShop(selectedShop); setShowDeleteConfirm(true); }}>🗑️ ลบร้านค้า</button>
          </div>
          <div className="detail-row"><div className="detail-label">📝 รายละเอียด</div><div className="detail-value">{selectedShop.description}</div></div>
          <div className="detail-row"><div className="detail-label">📍 ที่อยู่</div><div className="detail-value">{selectedShop.location}</div></div>
          <div className="detail-row"><div className="detail-label">🔗 ลิงก์</div><div className="detail-value" style={{ wordBreak:"break-all" }}>{selectedShop.link||"—"}</div></div>
          <div className="detail-row"><div className="detail-label">👤 เจ้าของ</div><div className="detail-value">{selectedShop.owner_id}</div></div>
          <div className="detail-row"><div className="detail-label">👥 ประเภท</div><div className="detail-value">{selectedShop.entity_type==="company"?"🏢 นิติบุคคล":"👤 บุคคลธรรมดา"}</div></div>
        </Modal>
      )}

      {showEditModal && selectedShop && (
        <Modal title="✏️ แก้ไขข้อมูลร้านค้า" onClose={() => { setShowEditModal(false); setEditErrors({}); }}
          footer={<><button className="btn btn-ghost btn-sm" onClick={() => { setShowEditModal(false); setEditErrors({}); }}>ยกเลิก</button><button className="btn btn-primary btn-sm" onClick={handleSaveEdit}>บันทึก</button></>}>
          <div className="form-group"><label className="form-label">ชื่อร้านค้า *</label><input className={`input ${editErrors.name?"error":""}`} value={editForm.name} onChange={e => { setEditForm(p=>({...p,name:e.target.value})); setEditErrors(p=>({...p,name:null})); }} />{editErrors.name && <div className="form-error">{editErrors.name}</div>}</div>
          <div className="form-group"><label className="form-label">ลิงก์ติดต่อ *</label><input className={`input ${editErrors.link?"error":""}`} value={editForm.link} onChange={e => { setEditForm(p=>({...p,link:e.target.value})); setEditErrors(p=>({...p,link:null})); }} />{editErrors.link && <div className="form-error">{editErrors.link}</div>}</div>
          <div className="form-group"><label className="form-label">รายละเอียด *</label><textarea className={`input textarea ${editErrors.description?"error":""}`} value={editForm.description} onChange={e => { setEditForm(p=>({...p,description:e.target.value})); setEditErrors(p=>({...p,description:null})); }} />{editErrors.description && <div className="form-error">{editErrors.description}</div>}</div>
          <div className="form-group"><label className="form-label">ที่อยู่ *</label><input className={`input ${editErrors.location?"error":""}`} value={editForm.location} onChange={e => { setEditForm(p=>({...p,location:e.target.value})); setEditErrors(p=>({...p,location:null})); }} />{editErrors.location && <div className="form-error">{editErrors.location}</div>}</div>
        </Modal>
      )}

      {showDeleteConfirm && confirmShop && (
        <Modal title="🗑️ ยืนยันการลบร้านค้า" onClose={() => setShowDeleteConfirm(false)}
          footer={<><button className="btn btn-ghost btn-sm" onClick={() => setShowDeleteConfirm(false)}>ยกเลิก</button><button className="btn btn-danger btn-sm" onClick={() => handleDelete(confirmShop)}>ยืนยันลบ</button></>}>
          <div className="alert alert-warn" style={{ marginBottom:16 }}>⚠️ การลบจะทำให้ร้านนี้ไม่ปรากฏในระบบอีก</div>
          <p style={{ fontSize:14 }}>ลบ <strong>"{confirmShop.name}"</strong> ออกจากระบบ?</p>
          <p style={{ fontSize:12, color:"var(--text3)", marginTop:8 }}>สถานะในฐานข้อมูลจะเปลี่ยนเป็น "ถูกลบ"</p>
        </Modal>
      )}

      {showAddModal && (
        <Modal title="＋ เพิ่มร้านค้าใหม่" onClose={() => { setShowAddModal(false); setAddErrors({}); }} wide
          footer={<><button className="btn btn-ghost btn-sm" onClick={() => { setShowAddModal(false); setAddErrors({}); }}>ยกเลิก</button><button className="btn btn-primary btn-sm" onClick={handleAddShop}>เพิ่มร้านค้า</button></>}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div className="form-group" style={{ gridColumn:"1/-1" }}><label className="form-label">ชื่อร้านค้า *</label><input className={`input ${addErrors.name?"error":""}`} value={addForm.name} onChange={e => { setAddForm(p=>({...p,name:e.target.value})); setAddErrors(p=>({...p,name:null})); }} />{addErrors.name && <div className="form-error">{addErrors.name}</div>}</div>
            <div className="form-group"><label className="form-label">หมวดหมู่ *</label><select className="input" value={addForm.category} onChange={e => setAddForm(p=>({...p,category:e.target.value}))}>{categories.map(c=><option key={c}>{c}</option>)}</select></div>
            <div className="form-group"><label className="form-label">ประเภทเจ้าของ *</label><select className="input" value={addForm.entity_type} onChange={e => setAddForm(p=>({...p,entity_type:e.target.value}))}><option value="individual">บุคคลธรรมดา</option><option value="company">นิติบุคคล</option></select></div>
            <div className="form-group" style={{ gridColumn:"1/-1" }}><label className="form-label">User ID เจ้าของ *</label><input className={`input ${addErrors.owner_id?"error":""}`} placeholder="เช่น USR0042" value={addForm.owner_id} onChange={e => { setAddForm(p=>({...p,owner_id:e.target.value})); setAddErrors(p=>({...p,owner_id:null})); }} />{addErrors.owner_id && <div className="form-error">{addErrors.owner_id}</div>}</div>
            <div className="form-group" style={{ gridColumn:"1/-1" }}><label className="form-label">ลิงก์ติดต่อ *</label><input className={`input ${addErrors.link?"error":""}`} placeholder="https://line.me/..." value={addForm.link} onChange={e => { setAddForm(p=>({...p,link:e.target.value})); setAddErrors(p=>({...p,link:null})); }} />{addErrors.link && <div className="form-error">{addErrors.link}</div>}</div>
            <div className="form-group" style={{ gridColumn:"1/-1" }}><label className="form-label">ที่อยู่ *</label><input className={`input ${addErrors.location?"error":""}`} value={addForm.location} onChange={e => { setAddForm(p=>({...p,location:e.target.value})); setAddErrors(p=>({...p,location:null})); }} />{addErrors.location && <div className="form-error">{addErrors.location}</div>}</div>
            <div className="form-group" style={{ gridColumn:"1/-1" }}><label className="form-label">รายละเอียด *</label><textarea className={`input textarea ${addErrors.description?"error":""}`} value={addForm.description} onChange={e => { setAddForm(p=>({...p,description:e.target.value})); setAddErrors(p=>({...p,description:null})); }} />{addErrors.description && <div className="form-error">{addErrors.description}</div>}</div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ============================================================
// UC7 — Blacklist
// ============================================================
function BlacklistPage() {
  const [shops]   = useState(ALL_SHOPS.filter(s => s.is_blacklisted && !s.is_deleted));
  const [query, setQuery] = useState("");
  const [page, setPage]   = useState(1);
  const [selected, setSelected] = useState(null);

  const filtered   = useShopList(shops, query);
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paged      = filtered.slice((page-1)*ITEMS_PER_PAGE, page*ITEMS_PER_PAGE);

  return (
    <div>
      <div className="page-title">⛔ รายการร้านค้า Blacklist</div>
      <div className="page-sub">UC7 — ร้านค้าที่ถูกระงับจากระบบ</div>
      <div className="search-bar">
        <input className="search-input" placeholder="ค้นหาชื่อร้าน..." value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} />
      </div>
      <div className="card" style={{ padding:0, overflow:"hidden" }}>
        <table className="table">
          <thead><tr><th>ร้านค้า</th><th>หมวดหมู่</th><th>ที่อยู่</th><th>เจ้าของ</th><th>จัดการ</th></tr></thead>
          <tbody>
            {paged.length===0 && <tr><td colSpan={5} style={{ textAlign:"center", padding:"24px", color:"var(--text3)" }}>ไม่พบร้านค้าใน Blacklist</td></tr>}
            {paged.map(s => (
              <tr key={s.id}>
                <td><div style={{ display:"flex", alignItems:"center", gap:8 }}><span style={{ fontSize:18 }}>{s.img_emoji}</span><div><div style={{ fontWeight:600 }}>{s.name}</div><span className="badge badge-red" style={{ fontSize:10 }}>⛔ Blacklist</span></div></div></td>
                <td><span className="badge badge-gray">{s.category}</span></td>
                <td style={{ fontSize:12, color:"var(--text3)" }}>📍 {s.location}</td>
                <td style={{ fontSize:12, color:"var(--text3)" }}>{s.owner_id}</td>
                <td><button className="btn btn-outline btn-xs" onClick={() => setSelected(s)}>ดูรายละเอียด</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={page} totalPages={totalPages} onChange={setPage} />
      {selected && (
        <Modal title={`รายละเอียด: ${selected.name}`} onClose={() => setSelected(null)}>
          <div className="alert alert-error" style={{ marginBottom:16 }}>⛔ ร้านนี้อยู่ใน Blacklist</div>
          <div className="detail-row"><div className="detail-label">ชื่อร้าน</div><div className="detail-value">{selected.name}</div></div>
          <div className="detail-row"><div className="detail-label">หมวดหมู่</div><div className="detail-value">{selected.category}</div></div>
          <div className="detail-row"><div className="detail-label">ที่อยู่</div><div className="detail-value">{selected.location}</div></div>
          <div className="detail-row"><div className="detail-label">เจ้าของ</div><div className="detail-value">{selected.owner_id}</div></div>
          <div className="detail-row"><div className="detail-label">รายละเอียด</div><div className="detail-value">{selected.description}</div></div>
        </Modal>
      )}
    </div>
  );
}

// ============================================================
// UC9 — เลื่อนขั้นที่ 3
// ============================================================
function UpgradeTier3Page({ notify }) {
  const [shops, setShops] = useState(ALL_SHOPS.filter(s => s.tier===2 && !s.is_blacklisted && !s.is_deleted));
  const [query, setQuery] = useState("");
  const [page, setPage]   = useState(1);
  const [selectedShop, setSelectedShop] = useState(null);
  const [confirmModal, setConfirmModal] = useState(false);

  const filtered   = useShopList(shops, query);
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paged      = filtered.slice((page-1)*ITEMS_PER_PAGE, page*ITEMS_PER_PAGE);

  const handleConfirmOrder = () => {
    setShops(prev => prev.filter(s => s.id!==selectedShop.id));
    setSelectedShop(null); setConfirmModal(false);
    notify(`เลื่อน "${selectedShop.name}" เป็น ขั้น 3 เรียบร้อย`, "success");
  };

  return (
    <div>
      <div className="page-title">🥇 เลื่อนขั้นที่ 3 ให้ร้านค้า</div>
      <div className="page-sub">UC9 — ร้านค้าระดับ 2 ที่ myOrder ทดลองสั่งของแล้ว</div>
      <div className="search-bar">
        <input className="search-input" placeholder="ค้นหาชื่อร้าน..." value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} />
      </div>
      <div className="card" style={{ padding:0, overflow:"hidden" }}>
        <table className="table">
          <thead><tr><th>ร้านค้า</th><th>หมวดหมู่</th><th>ระดับปัจจุบัน</th><th>เจ้าของ</th><th>จัดการ</th></tr></thead>
          <tbody>
            {paged.length===0 && <tr><td colSpan={5} style={{ textAlign:"center", padding:"24px", color:"var(--text3)" }}>ไม่มีร้านค้าระดับ 2 รอเลื่อนขั้น</td></tr>}
            {paged.map(s => (
              <tr key={s.id}>
                <td><div style={{ display:"flex", alignItems:"center", gap:8 }}><span style={{ fontSize:18 }}>{s.img_emoji}</span><div style={{ fontWeight:600 }}>{s.name}</div></div></td>
                <td><span className="badge badge-gray">{s.category}</span></td>
                <td><TierBadge tier={s.tier} /></td>
                <td style={{ fontSize:12, color:"var(--text3)" }}>{s.owner_id}</td>
                <td><button className="btn btn-outline btn-xs" onClick={() => { setSelectedShop(s); setConfirmModal(false); }}>จัดการ</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={page} totalPages={totalPages} onChange={setPage} />

      {selectedShop && !confirmModal && (
        <Modal title={`จัดการเลื่อนขั้น: ${selectedShop.name}`} onClose={() => setSelectedShop(null)}>
          <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:18, padding:"0 0 14px", borderBottom:"1px solid var(--border)" }}>
            <span style={{ fontSize:32 }}>{selectedShop.img_emoji}</span>
            <div>
              <div style={{ fontFamily:"var(--display)", fontSize:15, fontWeight:600 }}>{selectedShop.name}</div>
              <div style={{ display:"flex", gap:6, marginTop:4 }}><TierBadge tier={selectedShop.tier} /><span className="badge badge-gray">{selectedShop.category}</span></div>
            </div>
          </div>
          <div className="alert alert-info" style={{ marginBottom:16 }}>
            💡 กดปุ่มด้านล่างเพื่อยืนยันว่า myOrder ทดลองสั่งสินค้าแล้วและไม่พบการโกง
          </div>
          <div className="detail-row"><div className="detail-label">ที่อยู่</div><div className="detail-value">{selectedShop.location}</div></div>
          <div className="detail-row"><div className="detail-label">เจ้าของ</div><div className="detail-value">{selectedShop.owner_id}</div></div>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:20 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelectedShop(null)}>ยกเลิก</button>
            <button className="btn btn-success btn-sm" onClick={() => setConfirmModal(true)}>✓ ทดลองสั่งของแล้ว → เลื่อนขั้น 3</button>
          </div>
        </Modal>
      )}

      {selectedShop && confirmModal && (
        <Modal title="ยืนยันการเลื่อนขั้น" onClose={() => setConfirmModal(false)}
          footer={<><button className="btn btn-ghost btn-sm" onClick={() => setConfirmModal(false)}>ยกเลิก</button><button className="btn btn-success btn-sm" onClick={handleConfirmOrder}>ยืนยัน เลื่อนขั้น 3</button></>}>
          <div className="alert alert-warn" style={{ marginBottom:14 }}>⚠️ จะเลื่อน <strong>"{selectedShop.name}"</strong> เป็น ขั้น 3 ทันที</div>
          <p style={{ fontSize:13 }}>ข้อมูลการดำเนินการจะถูกบันทึกในระบบ</p>
        </Modal>
      )}
    </div>
  );
}

// ============================================================
// UC10 — คำร้องขอเลื่อนขั้น (พร้อม DocViewer)
// ============================================================
function UpgradeRequestsPage({ notify }) {
  const [requests, setRequests] = useState(MOCK_UPGRADE_REQUESTS);
  const [page, setPage]         = useState(1);
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  // viewer state
  const [viewerDocs, setViewerDocs]       = useState(null);
  const [viewerInitIdx, setViewerInitIdx] = useState(0);

  const openViewer = (docs, idx) => { setViewerDocs(docs); setViewerInitIdx(idx); };
  const closeViewer = () => setViewerDocs(null);

  const totalPages = Math.max(1, Math.ceil(requests.length / ITEMS_PER_PAGE));
  const paged      = requests.slice((page-1)*ITEMS_PER_PAGE, page*ITEMS_PER_PAGE);

  const handleApprove = (req) => {
    setRequests(prev => prev.map(r => r.id===req.id ? {...r, status:"approved"} : r));
    setSelected(null);
    notify(`อนุมัติคำขอของ "${req.shop_name}" แล้ว`, "success");
  };

  const handleReject = (req) => {
    if (!rejectReason.trim()) return;
    setRequests(prev => prev.map(r => r.id===req.id ? {...r, status:"rejected", reject_reason:rejectReason} : r));
    setSelected(null); setShowRejectModal(false); setRejectReason("");
    notify(`ปฏิเสธคำขอของ "${req.shop_name}"`, "error");
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

      <div style={{ display:"flex", gap:12, marginBottom:20 }}>
        {[["รอดำเนินการ","yellow",requests.filter(r=>r.status==="pending").length],["อนุมัติแล้ว","green",requests.filter(r=>r.status==="approved").length],["ไม่ผ่าน","red",requests.filter(r=>r.status==="rejected").length]].map(([label,color,val]) => (
          <div key={label} className="card" style={{ flex:1, padding:"14px 18px", textAlign:"center" }}>
            <div style={{ fontSize:22, fontWeight:800, color:`var(--${color})` }}>{val}</div>
            <div style={{ fontSize:11, color:"var(--text3)", fontWeight:700, textTransform:"uppercase" }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding:0, overflow:"hidden" }}>
        <table className="table">
          <thead><tr><th>ร้านค้า</th><th>ขอเลื่อนจาก→ถึง</th><th>ประเภท</th><th>วันที่ยื่น</th><th>สถานะ</th><th>จัดการ</th></tr></thead>
          <tbody>
            {paged.map(req => (
              <tr key={req.id}>
                <td><div style={{ display:"flex", alignItems:"center", gap:6 }}><span>{req.shop_emoji}</span><span style={{ fontWeight:600 }}>{req.shop_name}</span></div></td>
                <td><div style={{ display:"flex", alignItems:"center", gap:6 }}><TierBadge tier={req.current_tier} /><span style={{ color:"var(--text3)" }}>→</span><TierBadge tier={req.requested_tier} /></div></td>
                <td><span className="badge badge-gray">{req.entity_type==="company"?"🏢 นิติบุคคล":"👤 บุคคลธรรมดา"}</span></td>
                <td style={{ fontSize:12, color:"var(--text3)" }}>{req.date}</td>
                <td>{statusBadge(req.status)}</td>
                <td><button className="btn btn-outline btn-xs" onClick={() => setSelected(req)}>จัดการ</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={page} totalPages={totalPages} onChange={setPage} />

      {selected && (
        <Modal title={`จัดการคำขอ: ${selected.shop_name}`} onClose={() => setSelected(null)} wide>
          <div style={{ marginBottom:16 }}>
            <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:12 }}>
              <span style={{ fontSize:28 }}>{selected.shop_emoji}</span>
              <div>
                <div style={{ fontFamily:"var(--display)", fontSize:15, fontWeight:600 }}>{selected.shop_name}</div>
                <div style={{ display:"flex", gap:6, marginTop:4 }}>
                  <TierBadge tier={selected.current_tier} />
                  <span style={{ color:"var(--text3)" }}>→</span>
                  <TierBadge tier={selected.requested_tier} />
                  {statusBadge(selected.status)}
                </div>
              </div>
            </div>
            <div className="detail-row"><div className="detail-label">ประเภทเจ้าของ</div><div className="detail-value">{selected.entity_type==="company"?"🏢 นิติบุคคล":"👤 บุคคลธรรมดา"}</div></div>
            <div className="detail-row"><div className="detail-label">วันที่ยื่น</div><div className="detail-value">{selected.date}</div></div>
            {selected.reject_reason && <div className="detail-row"><div className="detail-label">เหตุผลไม่ผ่าน</div><div className="detail-value" style={{ color:"var(--red)" }}>{selected.reject_reason}</div></div>}
          </div>

          {/* เอกสาร — ใช้ DocList + DocViewer */}
          {selected.docs.length > 0 && (
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:12, fontWeight:700, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:10 }}>
                เอกสารที่ส่งมา
              </div>
              <DocList docs={selected.docs} onView={(idx) => openViewer(selected.docs, idx)} />
            </div>
          )}

          {selected.status==="pending" && (
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
              <button className="btn btn-danger btn-sm" onClick={() => setShowRejectModal(true)}>✕ ไม่อนุมัติ</button>
              <button className="btn btn-success btn-sm" onClick={() => handleApprove(selected)}>✓ อนุมัติ</button>
            </div>
          )}
        </Modal>
      )}

      {showRejectModal && selected && (
        <Modal title="✕ ระบุเหตุผลที่ไม่อนุมัติ" onClose={() => { setShowRejectModal(false); setRejectReason(""); }}
          footer={<><button className="btn btn-ghost btn-sm" onClick={() => { setShowRejectModal(false); setRejectReason(""); }}>ยกเลิก</button><button className="btn btn-danger btn-sm" disabled={!rejectReason.trim()} onClick={() => handleReject(selected)}>ยืนยันไม่อนุมัติ</button></>}>
          <div className="form-group">
            <label className="form-label">เหตุผลที่ไม่อนุมัติ *</label>
            <textarea className="input textarea" placeholder="เช่น เอกสารไม่ชัดเจน, ข้อมูลไม่ครบถ้วน..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
            <div className="form-hint">เหตุผลนี้จะแสดงให้ร้านค้าเห็นในประวัติคำขอ</div>
          </div>
        </Modal>
      )}

      {/* DocViewer — ลอยอยู่นอก modal stack */}
      {viewerDocs && <DocViewer docs={viewerDocs} initialIndex={viewerInitIdx} onClose={closeViewer} />}
    </div>
  );
}

// ============================================================
// UC2 — คำร้องรายงาน (พร้อม DocViewer)
// ============================================================
function ReportsPage({ notify }) {
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [page, setPage]       = useState(1);
  const [selected, setSelected] = useState(null);
  const [viewerDocs, setViewerDocs]       = useState(null);
  const [viewerInitIdx, setViewerInitIdx] = useState(0);

  const openViewer  = (docs, idx) => { setViewerDocs(docs); setViewerInitIdx(idx); };
  const closeViewer = () => setViewerDocs(null);

  const totalPages = Math.max(1, Math.ceil(reports.length / ITEMS_PER_PAGE));
  const paged      = reports.slice((page-1)*ITEMS_PER_PAGE, page*ITEMS_PER_PAGE);

  const handleResolve = (req) => {
    setReports(prev => prev.map(r => r.id===req.id ? {...r, status:"resolved"} : r));
    setSelected(null);
    notify(`ดำเนินการคำร้อง "${req.shop_name}" เรียบร้อย`, "success");
  };

  const statusBadge = (s) => s==="pending"
    ? <span className="badge badge-yellow">⏳ รอดำเนินการ</span>
    : <span className="badge badge-green">✓ ดำเนินการแล้ว</span>;

  return (
    <div>
      <div className="page-title">🚩 คำร้องรายงาน</div>
      <div className="page-sub">UC2 — รายการร้านค้าที่ถูกรายงานโดยผู้ใช้</div>
      <div className="card" style={{ padding:0, overflow:"hidden" }}>
        <table className="table">
          <thead><tr><th>ร้านค้า</th><th>ประเภท</th><th>ผู้รายงาน</th><th>วันที่</th><th>สถานะ</th><th>จัดการ</th></tr></thead>
          <tbody>
            {paged.map(r => (
              <tr key={r.id}>
                <td style={{ fontWeight:600 }}>{r.shop_name}</td>
                <td><span className="badge badge-red" style={{ fontSize:10 }}>{r.reason}</span></td>
                <td style={{ fontSize:12, color:"var(--text3)" }}>{r.reporter_id}</td>
                <td style={{ fontSize:12, color:"var(--text3)" }}>{r.date}</td>
                <td>{statusBadge(r.status)}</td>
                <td><button className="btn btn-outline btn-xs" onClick={() => setSelected(r)}>จัดการ</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={page} totalPages={totalPages} onChange={setPage} />

      {selected && (
        <Modal title={`คำร้อง: ${selected.shop_name}`} onClose={() => setSelected(null)} wide>
          <div className="detail-row"><div className="detail-label">รหัสคำร้อง</div><div className="detail-value">{selected.id}</div></div>
          <div className="detail-row"><div className="detail-label">ร้านค้า</div><div className="detail-value">{selected.shop_name}</div></div>
          <div className="detail-row"><div className="detail-label">ประเภท</div><div className="detail-value">{selected.reason}</div></div>
          <div className="detail-row"><div className="detail-label">รายละเอียด</div><div className="detail-value">{selected.detail}</div></div>
          <div className="detail-row"><div className="detail-label">ผู้รายงาน</div><div className="detail-value">{selected.reporter_id}</div></div>
          <div className="detail-row"><div className="detail-label">วันที่</div><div className="detail-value">{selected.date}</div></div>
          <div className="detail-row"><div className="detail-label">สถานะ</div><div className="detail-value">{statusBadge(selected.status)}</div></div>

          {/* เอกสารแนบ */}
          <div style={{ marginTop:16, marginBottom:4 }}>
            <div style={{ fontSize:12, fontWeight:700, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:10 }}>
              เอกสารแนบ
            </div>
            <DocList docs={selected.docs} onView={(idx) => openViewer(selected.docs, idx)} />
          </div>

          {selected.status==="pending" && (
            <div style={{ display:"flex", justifyContent:"flex-end", marginTop:16 }}>
              <button className="btn btn-success btn-sm" onClick={() => handleResolve(selected)}>✓ ดำเนินการแล้ว</button>
            </div>
          )}
        </Modal>
      )}

      {viewerDocs && <DocViewer docs={viewerDocs} initialIndex={viewerInitIdx} onClose={closeViewer} />}
    </div>
  );
}

// ============================================================
// UC11 — คำร้องขอเคลม (พร้อม DocViewer)
// ============================================================
function ClaimsPage({ notify }) {
  const [claims, setClaims] = useState(MOCK_CLAIMS);
  const [page, setPage]     = useState(1);
  const [selected, setSelected] = useState(null);
  const [viewerDocs, setViewerDocs]       = useState(null);
  const [viewerInitIdx, setViewerInitIdx] = useState(0);

  const openViewer  = (docs, idx) => { setViewerDocs(docs); setViewerInitIdx(idx); };
  const closeViewer = () => setViewerDocs(null);

  const totalPages = Math.max(1, Math.ceil(claims.length / ITEMS_PER_PAGE));
  const paged      = claims.slice((page-1)*ITEMS_PER_PAGE, page*ITEMS_PER_PAGE);

  const handleResolve = (clm) => {
    setClaims(prev => prev.map(c => c.id===clm.id ? {...c, status:"resolved"} : c));
    setSelected(null);
    notify(`ปิดคำร้องเคลมของ "${clm.shop_name}" เรียบร้อย`, "success");
  };

  const statusBadge = (s) => s==="pending"
    ? <span className="badge badge-yellow">⏳ รอดำเนินการ</span>
    : <span className="badge badge-green">✓ ดำเนินการแล้ว</span>;

  return (
    <div>
      <div className="page-title">⚖️ คำร้องขอเคลม</div>
      <div className="page-sub">UC11 — ติดตามและช่วยเหลือผู้ใช้ที่ประสบปัญหากับร้านค้า</div>
      <div className="card" style={{ padding:0, overflow:"hidden" }}>
        <table className="table">
          <thead><tr><th>รหัส</th><th>ร้านค้า</th><th>ผู้ร้องเรียน</th><th>ช่องทางติดต่อ</th><th>วันที่</th><th>สถานะ</th><th>จัดการ</th></tr></thead>
          <tbody>
            {paged.map(c => (
              <tr key={c.id}>
                <td style={{ fontSize:11, color:"var(--text3)" }}>{c.id}</td>
                <td style={{ fontWeight:600 }}>{c.shop_name}</td>
                <td style={{ fontSize:12, color:"var(--text3)" }}>{c.claimant_id}</td>
                <td style={{ fontSize:12 }}>{c.claimant_contact}</td>
                <td style={{ fontSize:12, color:"var(--text3)" }}>{c.date}</td>
                <td>{statusBadge(c.status)}</td>
                <td><button className="btn btn-outline btn-xs" onClick={() => setSelected(c)}>จัดการ</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={page} totalPages={totalPages} onChange={setPage} />

      {selected && (
        <Modal title={`คำร้องเคลม: ${selected.id}`} onClose={() => setSelected(null)} wide>
          <div className="detail-row"><div className="detail-label">ร้านค้า</div><div className="detail-value">{selected.shop_name}</div></div>
          <div className="detail-row"><div className="detail-label">ผู้ร้องเรียน</div><div className="detail-value">{selected.claimant_id}</div></div>
          <div className="detail-row">
            <div className="detail-label">ช่องทางติดต่อ</div>
            <div className="detail-value">
              <span style={{ background:"var(--green-light)", color:"var(--green)", padding:"2px 10px", borderRadius:100, fontSize:12, fontWeight:700 }}>
                {selected.claimant_contact}
              </span>
            </div>
          </div>
          <div className="detail-row"><div className="detail-label">รายละเอียด</div><div className="detail-value">{selected.detail}</div></div>
          <div className="detail-row"><div className="detail-label">วันที่</div><div className="detail-value">{selected.date}</div></div>
          <div className="detail-row"><div className="detail-label">สถานะ</div><div className="detail-value">{statusBadge(selected.status)}</div></div>

          {/* หลักฐาน */}
          <div style={{ marginTop:16, marginBottom:4 }}>
            <div style={{ fontSize:12, fontWeight:700, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:10 }}>
              หลักฐาน
            </div>
            <DocList docs={selected.docs} onView={(idx) => openViewer(selected.docs, idx)} />
          </div>

          {selected.status==="pending" && (
            <div>
              <div className="alert alert-info" style={{ marginTop:12, marginBottom:12 }}>
                📞 ติดต่อผู้ร้องเรียนผ่าน: <strong>{selected.claimant_contact}</strong> เพื่อช่วยเหลือและชดเชย
              </div>
              <div style={{ display:"flex", justifyContent:"flex-end" }}>
                <button className="btn btn-success btn-sm" onClick={() => handleResolve(selected)}>✓ ดำเนินการแล้ว / ปิดคำร้อง</button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {viewerDocs && <DocViewer docs={viewerDocs} initialIndex={viewerInitIdx} onClose={closeViewer} />}
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
      {notification && <Notification msg={notification.msg} type={notification.type} onClose={() => setNotification(null)} />}
    </>
  );
}