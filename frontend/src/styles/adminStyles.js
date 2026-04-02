const adminStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700;800&family=Mitr:wght@300;400;500;600&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  :root {
    --bg:#f4f1ec;--surface:#ffffff;--surface2:#f0ece4;--border:#e5ddd0;--border2:#ccc5b5;
    --accent:#c0392b;--accent2:#a93226;--accent-light:#fdf2f1;--accent-glow:rgba(192,57,43,0.12);
    --green:#16a34a;--green-light:#f0fdf4;--yellow:#d97706;--yellow-light:#fffbeb;
    --blue:#1d4ed8;--blue-light:#eff6ff;--red:#dc2626;--red-light:#fef2f2;
    --text:#18130e;--text2:#584f42;--text3:#96887a;
    --shadow:0 1px 3px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.04);
    --shadow-md:0 4px 20px rgba(0,0,0,0.08);--shadow-lg:0 8px 40px rgba(0,0,0,0.14);
    --font:'Sarabun',sans-serif;--display:'Mitr',sans-serif;
    --radius:12px;--radius-sm:8px;--sidebar-w:220px;
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
  .doc-img-wrap{transition:transform 0.05s linear;transform-origin:center center;display:flex;align-items:center;justify-content:center;}
  .doc-img{max-width:90vw;max-height:78vh;border-radius:6px;box-shadow:0 8px 48px rgba(0,0,0,0.6);display:block;pointer-events:none;object-fit:contain;}
  .doc-pdf-placeholder{background:#fff;border-radius:10px;padding:40px 60px;text-align:center;box-shadow:0 8px 48px rgba(0,0,0,0.6);}
  .doc-viewer-body{flex:1;display:flex;overflow:hidden;}
  .doc-page-indicator{position:absolute;bottom:16px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.55);border-radius:100px;padding:4px 14px;font-size:12px;color:#ccc;font-family:var(--font);pointer-events:none;}
  .doc-item{display:flex;justify-content:space-between;align-items:center;background:var(--surface2);padding:10px 14px;border-radius:10px;border:1px solid var(--border);margin-bottom:8px;}
  .doc-item-info{display:flex;flex-direction:column;gap:2px;}
  .doc-item-label{font-weight:600;font-size:13px;}
  .doc-item-name{font-size:11px;color:var(--text3);}
  .doc-view-btn{display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:6px;background:var(--blue-light);color:var(--blue);font-size:12px;font-weight:700;cursor:pointer;border:1px solid rgba(29,78,216,0.18);transition:background 0.15s;font-family:var(--font);}
  .doc-view-btn:hover{background:rgba(29,78,216,0.14);}
  .skeleton-row td{background:linear-gradient(90deg,var(--surface2) 25%,var(--border) 50%,var(--surface2) 75%);background-size:400px 100%;animation:shimmer 1.4s infinite linear;}
  select.input{cursor:pointer;}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes slideUp{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}
  @keyframes slideIn{from{transform:translateX(14px);opacity:0}to{transform:translateX(0);opacity:1}}
  @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
`;

export default adminStyles;
