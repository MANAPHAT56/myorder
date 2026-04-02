import { useState, useEffect } from "react";
import adminApi from "../../api/adminApi";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentClaims, setRecentClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.getDashboard().catch(() => null),
      adminApi.getClaims({ status: "pending", per_page: 5 }).catch(() => ({ data: [] })),
    ]).then(([dashData, claimsData]) => {
      setStats(dashData);
      setRecentClaims(claimsData?.data ?? []);
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
          ["ร้านค้าทั้งหมด", s.total_shops ?? "—", "var(--accent)"],
          ["Blacklist",      s.blacklisted ?? "—", "var(--red)"],
          ["รอเลื่อนขั้น",  s.pending_upgrades ?? "—", "var(--yellow)"],
          ["คำร้องเคลม",    s.pending_claims ?? "—", "var(--blue)"],
        ].map(([label, val, color]) => (
          <div key={label} className="stat-card">
            <div className="stat-val" style={{ color }}>{loading ? "…" : val}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-title">คำร้องเคลมล่าสุดที่รอดำเนินการ</div>
        <div className="card-sub">คำร้องที่ยังไม่ได้จัดการ</div>
        {loading
          ? <div style={{ color: "var(--text3)", fontSize: 13 }}>กำลังโหลด...</div>
          : recentClaims.length === 0
            ? <div style={{ color: "var(--text3)", fontSize: 13 }}>ไม่มีคำร้องที่รอดำเนินการ</div>
            : recentClaims.map((c) => (
              <div key={c.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{c.shop?.name ?? c.shop_ref_id}</div>
                  <div style={{ fontSize: 12, color: "var(--text3)" }}>{c.fraud_type?.name ?? c.reason} · {c.created_at?.substring(0, 10)}</div>
                </div>
                <span className="badge badge-yellow">⏳ รอดำเนินการ</span>
              </div>
            ))}
      </div>
    </div>
  );
}
