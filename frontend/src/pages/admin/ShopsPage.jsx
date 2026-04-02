import { useState, useEffect } from "react";
import adminApi from "../../api/adminApi";
import {
  ITEMS_PER_PAGE,
  validateText, validateUrl, validateUserId,
  TierBadge, Modal, Pagination, SkeletonRows, tierOf,
} from "../../components/admin/AdminUI";

export default function ShopsPage({ notify }) {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedShop, setSelectedShop] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [confirmShop, setConfirmShop] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [addForm, setAddForm] = useState({ name: "", url: "", owner_account_id: "" });
  const [addErrors, setAddErrors] = useState({});
  const [blacklistReason, setBlacklistReason] = useState("");
  const [blacklistError, setBlacklistError] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadShops = (q = query, p = page) => {
    setLoading(true);
    adminApi.getShops({ q, page: p, per_page: ITEMS_PER_PAGE })
      .then((data) => { setShops(data.data ?? []); setTotalPages(data.last_page ?? 1); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(() => { loadShops(); }, []);

  const openManage = (shop) => {
    setSelectedShop(shop);
    setEditForm({ name: shop.name, url: shop.url ?? "" });
    setEditErrors({});
  };

  const handleSaveEdit = async () => {
    const errors = {};
    const ne = validateText(editForm.name); if (ne) errors.name = ne;
    const le = validateUrl(editForm.url);   if (le) errors.url = le;
    if (Object.keys(errors).length) { setEditErrors(errors); return; }
    setSaving(true);
    try {
      const updated = await adminApi.updateShop(selectedShop.ref_id, editForm);
      setShops((prev) => prev.map((s) => s.ref_id === selectedShop.ref_id ? { ...s, ...updated } : s));
      setSelectedShop((s) => ({ ...s, ...updated }));
      setShowEditModal(false);
      notify("แก้ไขข้อมูลร้านค้าเรียบร้อย", "success");
    } catch (e) { notify("บันทึกไม่สำเร็จ: " + e.message, "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (shop) => {
    if (!deleteReason.trim()) { setDeleteError("กรุณาระบุเหตุผลการลบ"); return; }
    setSaving(true);
    try {
      await adminApi.deleteShop(shop.ref_id, deleteReason);
      setShops((prev) => prev.filter((s) => s.ref_id !== shop.ref_id));
      setSelectedShop(null); setShowDeleteConfirm(false); setDeleteReason("");
      notify(`ลบร้านค้า "${shop.name}" เรียบร้อย`, "success");
    } catch (e) { notify("ลบไม่สำเร็จ: " + e.message, "error"); }
    finally { setSaving(false); }
  };

  const handleBlacklist = async () => {
    if (!blacklistReason.trim()) { setBlacklistError("กรุณาระบุเหตุผล"); return; }
    setSaving(true);
    try {
      await adminApi.blacklistShop(selectedShop.ref_id, blacklistReason, null);
      setShops((prev) => prev.map((s) => s.ref_id === selectedShop.ref_id ? { ...s, is_blacklist: true } : s));
      setShowBlacklistModal(false); setSelectedShop(null);
      notify(`เพิ่ม "${selectedShop.name}" ใน Blacklist แล้ว`, "success");
    } catch (e) { notify("Blacklist ไม่สำเร็จ: " + e.message, "error"); }
    finally { setSaving(false); }
  };

  const handleAddShop = async () => {
    const errors = {};
    const ne = validateText(addForm.name);               if (ne) errors.name = ne;
    const le = validateUrl(addForm.url);                 if (le) errors.url = le;
    const oe = validateUserId(addForm.owner_account_id); if (oe) errors.owner_account_id = oe;
    if (Object.keys(errors).length) { setAddErrors(errors); return; }
    setSaving(true);
    try {
      const newShop = await adminApi.createShop(addForm);
      setShops((prev) => [newShop, ...prev]);
      setShowAddModal(false); setAddForm({ name: "", url: "", owner_account_id: "" });
      notify("เพิ่มร้านค้าใหม่เรียบร้อย", "success");
    } catch (e) { notify("เพิ่มไม่สำเร็จ: " + e.message, "error"); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div><div className="page-title">🏪 จัดการร้านค้า</div><div className="page-sub">รายการร้านค้าทั้งหมดในระบบ</div></div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>＋ เพิ่มร้านค้า</button>
      </div>
      <div className="search-bar">
        <input className="search-input" placeholder="ค้นหาชื่อร้าน..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && loadShops(query, 1)} />
        <button className="btn btn-outline btn-sm" onClick={() => loadShops(query, 1)}>🔍 ค้นหา</button>
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="table">
          <thead><tr><th>ร้านค้า</th><th>ระดับ</th><th>สถานะ</th><th>เจ้าของ</th><th>จัดการ</th></tr></thead>
          <tbody>
            {loading ? <SkeletonRows cols={5} /> : shops.length === 0
              ? <tr><td colSpan={5} style={{ textAlign: "center", padding: "24px", color: "var(--text3)" }}>ไม่พบร้านค้า</td></tr>
              : shops.map((s) => (
                <tr key={s.ref_id}>
                  <td><div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 20 }}>🏪</span>
                    <div><div style={{ fontWeight: 600 }}>{s.name}</div><div style={{ fontSize: 11, color: "var(--text3)" }}>{s.ref_id}</div></div>
                  </div></td>
                  <td><TierBadge tier={tierOf(s)} /></td>
                  <td>{s.is_blacklist
                    ? <span className="badge badge-red">⛔ Blacklist</span>
                    : s.is_active
                      ? <span className="badge badge-green">✓ เปิด</span>
                      : <span className="badge badge-gray">🔒 ปิด</span>}
                  </td>
                  <td style={{ fontSize: 12, color: "var(--text3)" }}>{s.owner_account_id ?? "—"}</td>
                  <td><button className="btn btn-outline btn-xs" onClick={() => openManage(s)}>จัดการ</button></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={page} totalPages={totalPages} onChange={(p) => { setPage(p); loadShops(query, p); }} />

      {/* Manage Modal */}
      {selectedShop && (
        <Modal title={`จัดการ: ${selectedShop.name}`} onClose={() => setSelectedShop(null)} wide>
          <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 20, padding: "0 0 16px", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: 36 }}>🏪</span>
            <div>
              <div style={{ fontFamily: "var(--display)", fontSize: 16, fontWeight: 600 }}>{selectedShop.name}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 4 }}><TierBadge tier={tierOf(selectedShop)} /></div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            <button className="btn btn-outline" onClick={() => setShowEditModal(true)}>✏️ แก้ไขข้อมูล</button>
            <button className="btn btn-warn"
              onClick={() => { setBlacklistReason(""); setBlacklistError(""); setShowBlacklistModal(true); }}
              disabled={!!selectedShop.is_blacklist}>
              {selectedShop.is_blacklist ? "⛔ Blacklist แล้ว" : "⛔ เพิ่ม Blacklist"}
            </button>
            <button className="btn btn-danger" onClick={() => { setConfirmShop(selectedShop); setDeleteReason(""); setDeleteError(""); setShowDeleteConfirm(true); }}>🗑️ ลบร้านค้า</button>
          </div>
          <div className="detail-row"><div className="detail-label">🔗 ลิงก์</div><div className="detail-value" style={{ wordBreak: "break-all" }}>{selectedShop.url || "—"}</div></div>
          <div className="detail-row"><div className="detail-label">👤 เจ้าของ</div><div className="detail-value">{selectedShop.owner_account_id || "—"}</div></div>
          <div className="detail-row"><div className="detail-label">📅 สร้างเมื่อ</div><div className="detail-value">{selectedShop.created_at?.substring(0, 10) || "—"}</div></div>
          <div className="detail-row"><div className="detail-label">📊 Upgrade fails</div>
            <div className="detail-value">
              <span style={{ color: selectedShop.failed_upgrade_count >= 3 ? "var(--red)" : "var(--text)", fontWeight: selectedShop.failed_upgrade_count >= 3 ? 700 : 400 }}>
                {selectedShop.failed_upgrade_count ?? 0} / 3 ครั้ง
              </span>
              {selectedShop.failed_upgrade_count >= 3 && <span style={{ marginLeft: 8, fontSize: 11, color: "var(--text3)" }}>(cooldown 30 วัน)</span>}
            </div>
          </div>
        </Modal>
      )}

      {/* Blacklist Modal */}
      {showBlacklistModal && selectedShop && (
        <Modal title="⛔ ยืนยันการแบนร้านค้า" onClose={() => setShowBlacklistModal(false)}
          footer={<><button className="btn btn-ghost btn-sm" onClick={() => setShowBlacklistModal(false)}>ยกเลิก</button><button className="btn btn-warn btn-sm" onClick={handleBlacklist} disabled={saving}>ยืนยันการแบน</button></>}>
          <div className="alert alert-warn" style={{ marginBottom: 16 }}>⚠️ ร้านค้านี้จะหายไปจากระบบทันที</div>
          <p style={{ fontSize: 14, marginBottom: 12 }}>แบน <strong>"{selectedShop.name}"</strong></p>
          <div className="form-group">
            <label className="form-label">เหตุผลในการแบน *</label>
            <textarea className={`input textarea ${blacklistError ? "error" : ""}`} placeholder="ระบุเหตุผล..." value={blacklistReason} onChange={(e) => { setBlacklistReason(e.target.value); setBlacklistError(""); }} rows={3} />
            {blacklistError && <div className="form-error">{blacklistError}</div>}
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedShop && (
        <Modal title="✏️ แก้ไขข้อมูลร้านค้า" onClose={() => { setShowEditModal(false); setEditErrors({}); }}
          footer={<><button className="btn btn-ghost btn-sm" onClick={() => setShowEditModal(false)}>ยกเลิก</button><button className="btn btn-primary btn-sm" onClick={handleSaveEdit} disabled={saving}>บันทึก</button></>}>
          <div className="form-group">
            <label className="form-label">ชื่อร้านค้า *</label>
            <input className={`input ${editErrors.name ? "error" : ""}`} value={editForm.name} onChange={(e) => { setEditForm((p) => ({ ...p, name: e.target.value })); setEditErrors((p) => ({ ...p, name: null })); }} />
            {editErrors.name && <div className="form-error">{editErrors.name}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">ลิงก์ติดต่อ *</label>
            <input className={`input ${editErrors.url ? "error" : ""}`} value={editForm.url} onChange={(e) => { setEditForm((p) => ({ ...p, url: e.target.value })); setEditErrors((p) => ({ ...p, url: null })); }} />
            {editErrors.url && <div className="form-error">{editErrors.url}</div>}
          </div>
        </Modal>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && confirmShop && (
        <Modal title="🗑️ ยืนยันการลบ" onClose={() => setShowDeleteConfirm(false)}
          footer={<><button className="btn btn-ghost btn-sm" onClick={() => setShowDeleteConfirm(false)}>ยกเลิก</button><button className="btn btn-danger btn-sm" onClick={() => handleDelete(confirmShop)} disabled={saving}>ยืนยันลบ</button></>}>
          <div className="alert alert-warn" style={{ marginBottom: 16 }}>⚠️ ร้านค้าจะไม่ปรากฏในระบบอีกต่อไป</div>
          <p style={{ fontSize: 14, marginBottom: 12 }}>ลบ <strong>"{confirmShop.name}"</strong>?</p>
          <div className="form-group">
            <label className="form-label">เหตุผลการลบ *</label>
            <textarea className={`input textarea ${deleteError ? "error" : ""}`} placeholder="เช่น ร้านค้ายกเลิกกิจการ..." value={deleteReason} onChange={(e) => { setDeleteReason(e.target.value); setDeleteError(""); }} rows={2} />
            {deleteError && <div className="form-error">{deleteError}</div>}
          </div>
        </Modal>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <Modal title="＋ เพิ่มร้านค้าใหม่" onClose={() => { setShowAddModal(false); setAddErrors({}); }} wide
          footer={<><button className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)}>ยกเลิก</button><button className="btn btn-primary btn-sm" onClick={handleAddShop} disabled={saving}>เพิ่มร้านค้า</button></>}>
          <div className="form-group">
            <label className="form-label">ชื่อร้านค้า *</label>
            <input className={`input ${addErrors.name ? "error" : ""}`} value={addForm.name} onChange={(e) => { setAddForm((p) => ({ ...p, name: e.target.value })); setAddErrors((p) => ({ ...p, name: null })); }} />
            {addErrors.name && <div className="form-error">{addErrors.name}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Account ID เจ้าของ *</label>
            <input className={`input ${addErrors.owner_account_id ? "error" : ""}`} placeholder="ULID ของ account" value={addForm.owner_account_id} onChange={(e) => { setAddForm((p) => ({ ...p, owner_account_id: e.target.value })); setAddErrors((p) => ({ ...p, owner_account_id: null })); }} />
            {addErrors.owner_account_id && <div className="form-error">{addErrors.owner_account_id}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">ลิงก์ติดต่อ *</label>
            <input className={`input ${addErrors.url ? "error" : ""}`} placeholder="https://line.me/..." value={addForm.url} onChange={(e) => { setAddForm((p) => ({ ...p, url: e.target.value })); setAddErrors((p) => ({ ...p, url: null })); }} />
            {addErrors.url && <div className="form-error">{addErrors.url}</div>}
          </div>
        </Modal>
      )}
    </div>
  );
}
