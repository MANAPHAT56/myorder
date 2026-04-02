import { useState, useEffect } from "react";
import adminApi from "../../api/adminApi";
import { ITEMS_PER_PAGE, Modal, Pagination, SkeletonRows } from "../../components/admin/AdminUI";

export default function BlacklistPage() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState(null);

  const load = (q = query, p = page) => {
    setLoading(true);
    adminApi.getShops({ q, blacklisted: 1, page: p, per_page: ITEMS_PER_PAGE })
      .then((data) => { setShops(data.data ?? []); setTotalPages(data.last_page ?? 1); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="page-title">⛔ รายการร้านค้า Blacklist</div>
      <div className="page-sub">UC7 — ร้านค้าที่ถูกระงับจากระบบ</div>
      <div className="search-bar">
        <input className="search-input" placeholder="ค้นหาชื่อร้าน..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load(query, 1)} />
        <button className="btn btn-outline btn-sm" onClick={() => load(query, 1)}>🔍</button>
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="table">
          <thead><tr><th>ร้านค้า</th><th>สถานะ</th><th>เจ้าของ</th><th>จัดการ</th></tr></thead>
          <tbody>
            {loading ? <SkeletonRows cols={4} /> : shops.length === 0
              ? <tr><td colSpan={4} style={{ textAlign: "center", padding: "24px", color: "var(--text3)" }}>ไม่พบร้านค้าใน Blacklist</td></tr>
              : shops.map((s) => (
                <tr key={s.ref_id}>
                  <td><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 18 }}>🏪</span><div><div style={{ fontWeight: 600 }}>{s.name}</div><div style={{ fontSize: 11, color: "var(--text3)" }}>{s.ref_id}</div></div></div></td>
                  <td><span className="badge badge-red">⛔ ระงับ</span></td>
                  <td style={{ fontSize: 12, color: "var(--text3)" }}>{s.owner_account_id ?? "—"}</td>
                  <td><button className="btn btn-outline btn-xs" onClick={() => setSelected(s)}>ดูรายละเอียด</button></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={page} totalPages={totalPages} onChange={(p) => { setPage(p); load(query, p); }} />
      {selected && (
        <Modal title={`รายละเอียด: ${selected.name}`} onClose={() => setSelected(null)}>
          <div className="alert alert-error" style={{ marginBottom: 16 }}>⛔ ร้านนี้อยู่ใน Blacklist</div>
          <div className="detail-row"><div className="detail-label">ชื่อร้าน</div><div className="detail-value">{selected.name}</div></div>
          <div className="detail-row"><div className="detail-label">ref_id</div><div className="detail-value">{selected.ref_id}</div></div>
          <div className="detail-row"><div className="detail-label">เจ้าของ</div><div className="detail-value">{selected.owner_account_id}</div></div>
        </Modal>
      )}
    </div>
  );
}
