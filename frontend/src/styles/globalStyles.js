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
  .nav-tab { padding: 7px 14px; border-radius: 8px; font-size: 13.5px; font-weight: 600; cursor: pointer; border: 1.5px solid transparent; background: transparent; color: var(--text2); font-family: var(--font); transition: all 0.15s; text-decoration: none; display: inline-flex; align-items: center; }
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

export default styles;
