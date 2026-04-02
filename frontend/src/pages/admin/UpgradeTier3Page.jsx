import { useState, useEffect } from "react";
import adminApi from "../../api/adminApi";
import { ITEMS_PER_PAGE, Modal, Pagination, SkeletonRows, TierBadge } from "../../components/admin/AdminUI";

export default function UpgradeTier3Page({ notify }) {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedShop, setSelectedShop] = useState(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = (q = query, p = page) => {
    setLoading(true);
    adminApi.getShops({ q, tier: "TIER_2", page: p, per_page: ITEMS_PER_PAGE })
      .then((data) => { setShops(data.data ?? []); setTotalPages(data.last_page ?? 1); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handlePromote = async () => {
    setSaving(true);
    try {
      await adminApi.promoteTier3(selectedShop.ref_id);
      setShops((prev) => prev.filter((s) => s.ref_id !== selectedShop.ref_id));
      setSelectedShop(null); setConfirmModal(false);
      notify(`เลื่อน "${selectedShop.name}" เป็น ขั้น 3 เรียบร้อย`, "success");
    } catch (e) { notify("ไม่สำเร็จ: " + e.message, "error"); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="page-title">🥇 เลื่อนขั้นที่ 3 ให้ร้านค้า</div>
      <div className="page-sub">UC9 — ร้านค้าระดับ 2 ที่ myOrder ทดลองสั่งของแล้ว</div>
      <div className="search-bar">
        <input className="search-input" placeholder="ค้นหาชื่อร้าน..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load(query, 1)} />
        <button className="btn btn-outline btn-sm" onClick={() => load(query, 1)}>🔍</button>
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="table">
          <thead><tr><th>ร้านค้า</th><th>ระดับปัจจุบัน</th><th>เจ้าของ</th><th>จัดการ</th></tr></thead>
          <tbody>
            {loading ? <SkeletonRows cols={4} /> : shops.length === 0
              ? <tr><td colSpan={4} style={{ textAlign: "center", padding: "24px", color: "var(--text3)" }}>ไม่มีร้านค้าระดับ 2 รอเลื่อนขั้น</td></tr>
              : shops.map((s) => (
                <tr key={s.ref_id}>
                  <td><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 18 }}>🏪</span><div style={{ fontWeight: 600 }}>{s.name}</div></div></td>
                  <td><TierBadge tier={2} /></td>
                  <td style={{ fontSize: 12, color: "var(--text3)" }}>{s.owner_account_id ?? "—"}</td>
                  <td><button className="btn btn-outline btn-xs" onClick={() => { setSelectedShop(s); setConfirmModal(false); }}>จัดการ</button></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={page} totalPages={totalPages} onChange={(p) => { setPage(p); load(query, p); }} />

      {selectedShop && !confirmModal && (
        <Modal title={`เลื่อนขั้น: ${selectedShop.name}`} onClose={() => setSelectedShop(null)}>
          <div className="alert alert-info" style={{ marginBottom: 16 }}>💡 ยืนยันว่า myOrder ทดลองสั่งสินค้าแล้วและไม่พบการโกง</div>
          <div className="detail-row"><div className="detail-label">เจ้าของ</div><div className="detail-value">{selectedShop.owner_account_id}</div></div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelectedShop(null)}>ยกเลิก</button>
            <button className="btn btn-success btn-sm" onClick={() => setConfirmModal(true)}>✓ ทดลองสั่งของแล้ว → เลื่อนขั้น 3</button>
          </div>
        </Modal>
      )}
      {selectedShop && confirmModal && (
        <Modal title="ยืนยันการเลื่อนขั้น" onClose={() => setConfirmModal(false)}
          footer={<><button className="btn btn-ghost btn-sm" onClick={() => setConfirmModal(false)}>ยกเลิก</button><button className="btn btn-success btn-sm" onClick={handlePromote} disabled={saving}>ยืนยัน เลื่อนขั้น 3</button></>}>
          <div className="alert alert-warn" style={{ marginBottom: 14 }}>⚠️ จะเลื่อน <strong>"{selectedShop.name}"</strong> เป็น ขั้น 3 ทันที</div>
        </Modal>
      )}
    </div>
  );
}
