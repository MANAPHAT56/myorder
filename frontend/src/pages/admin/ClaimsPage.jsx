import { useState, useEffect } from "react";
import adminApi from "../../api/adminApi";
import {
  ITEMS_PER_PAGE,
  Modal, Pagination, SkeletonRows,
  DocViewer, DocList, makeDocFromAttachment,
} from "../../components/admin/AdminUI";

export default function ClaimsPage({ notify }) {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [viewerDocs, setViewerDocs] = useState(null);
  const [viewerInitIdx, setViewerInitIdx] = useState(0);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveForm, setResolveForm] = useState({ resolution: "NOTED", refund_amount: "", admin_note: "" });

  const load = (status = statusFilter, p = page) => {
    setLoading(true);
    adminApi.getClaims({ status, page: p, per_page: ITEMS_PER_PAGE })
      .then((data) => { setClaims(data.data ?? []); setTotalPages(data.last_page ?? 1); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleResolve = async () => {
    setSaving(true);
    try {
      await adminApi.resolveClaim(
        selected.id,
        resolveForm.resolution,
        resolveForm.refund_amount ? parseFloat(resolveForm.refund_amount) : null,
        resolveForm.admin_note,
      );
      setClaims((prev) => prev.filter((c) => c.id !== selected.id));
      setSelected(null); setShowResolveModal(false);
      notify(`ปิดคำร้องเคลม #${selected.id} เรียบร้อย`, "success");
    } catch (e) { notify("ไม่สำเร็จ: " + e.message, "error"); }
    finally { setSaving(false); }
  };

  const handleBlacklist = async (clm) => {
    const reason = window.prompt(`ระบุเหตุผลในการแบล็คลิสต์ร้านค้า "${clm.shop?.name}":`, "ทำผิดกฎระเบียบ/ฉ้อโกง");
    if (reason) {
      setSaving(true);
      try {
        await adminApi.blacklistShop(clm.shop_ref_id, reason, clm.id);
        notify(`เพิ่มร้าน "${clm.shop?.name}" ลงในบัญชีดำเรียบร้อยแล้ว`, "error");
        setSelected(null);
        load();
      } catch (e) { notify("แบล็คลิสต์ไม่สำเร็จ: " + e.message, "error"); }
      finally { setSaving(false); }
    }
  };

  const statusBadge = (s) => s === "pending"
    ? <span className="badge badge-yellow">⏳ รอดำเนินการ</span>
    : <span className="badge badge-green">✓ ดำเนินการแล้ว</span>;

  return (
    <div>
      <div className="page-title">⚖️ คำร้องขอเคลม</div>
      <div className="page-sub">UC11 — ติดตามและช่วยเหลือผู้ใช้ที่ประสบปัญหา</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["pending", "resolved"].map((s) => (
          <button key={s} className={`btn btn-sm ${statusFilter === s ? "btn-primary" : "btn-outline"}`}
            onClick={() => { setStatusFilter(s); setPage(1); load(s, 1); }}>
            {s === "pending" ? "⏳ รอดำเนินการ" : "✓ ดำเนินการแล้ว"}
          </button>
        ))}
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="table">
          <thead><tr><th>รหัส</th><th>ร้านค้า</th><th>ผู้ร้องเรียน</th><th>ช่องทางติดต่อ</th><th>วันที่</th><th>สถานะ</th><th>จัดการ</th></tr></thead>
          <tbody>
            {loading ? <SkeletonRows cols={7} /> : claims.length === 0
              ? <tr><td colSpan={7} style={{ textAlign: "center", padding: "24px", color: "var(--text3)" }}>ไม่มีคำร้อง</td></tr>
              : claims.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontSize: 11, color: "var(--text3)" }}>{c.id}</td>
                  <td style={{ fontWeight: 600 }}>{c.shop?.name ?? c.shop_ref_id}</td>
                  <td style={{ fontSize: 12, color: "var(--text3)" }}>{c.claimer?.email ?? c.claimer_account_id}</td>
                  <td style={{ fontSize: 12 }}>{c.contact_info}</td>
                  <td style={{ fontSize: 12, color: "var(--text3)" }}>{c.created_at?.substring(0, 10)}</td>
                  <td>{statusBadge(c.status)}</td>
                  <td>
                    <button className="btn btn-outline btn-xs" onClick={() => {
                      setSelected(c);
                      setResolveForm({ resolution: "NOTED", refund_amount: "", admin_note: "" });
                    }}>จัดการ</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={page} totalPages={totalPages} onChange={(p) => { setPage(p); load(statusFilter, p); }} />

      {selected && (
        <Modal title={`เคลม #${selected.id}`} onClose={() => setSelected(null)} wide>
          <div className="detail-row"><div className="detail-label">ร้านค้า</div><div className="detail-value">{selected.shop?.name}</div></div>
          <div className="detail-row"><div className="detail-label">ผู้ร้องเรียน</div><div className="detail-value">{selected.claimer?.email ?? selected.claimer_account_id}</div></div>
          <div className="detail-row">
            <div className="detail-label">ช่องทางติดต่อ</div>
            <div className="detail-value">
              <span style={{ background: "var(--green-light)", color: "var(--green)", padding: "2px 10px", borderRadius: 100, fontSize: 12, fontWeight: 700 }}>
                {selected.contact_info}
              </span>
            </div>
          </div>
          <div className="detail-row"><div className="detail-label">รายละเอียด</div><div className="detail-value">{selected.reason}</div></div>
          <div className="detail-row"><div className="detail-label">ประเภทการโกง</div><div className="detail-value">{selected.fraud_type?.name ?? "—"}</div></div>
          <div className="detail-row"><div className="detail-label">วันที่</div><div className="detail-value">{selected.created_at?.substring(0, 10)}</div></div>
          <div className="detail-row"><div className="detail-label">สถานะ</div><div className="detail-value">{statusBadge(selected.status)}</div></div>

          {selected.attachments?.length > 0 && (
            <div style={{ marginTop: 16, marginBottom: 4 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>หลักฐาน</div>
              <DocList
                docs={selected.attachments.map(makeDocFromAttachment)}
                onView={(idx) => { setViewerDocs(selected.attachments.map(makeDocFromAttachment)); setViewerInitIdx(idx); }}
              />
            </div>
          )}

          <hr style={{ margin: "20px 0", border: 0, borderTop: "1px solid var(--border)" }} />

          {selected.status === "pending" && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleBlacklist(selected)}
                disabled={saving}
              >
                🚫 แบล็คลิสต์ร้านค้า
              </button>
              <button className="btn btn-success btn-sm" onClick={() => setShowResolveModal(true)} disabled={saving}>
                ✓ ปิดคำร้อง / ดำเนินการแล้ว
              </button>
            </div>
          )}

          {selected.status === "pending" && (
            <div className="alert alert-info" style={{ marginTop: 12 }}>
              📞 ติดต่อผู้ร้องเรียนผ่าน: <strong>{selected.contact_info}</strong>
            </div>
          )}
        </Modal>
      )}

      {/* Resolve Modal */}
      {showResolveModal && selected && (
        <Modal title={`ปิดคำร้อง #${selected.id}`} onClose={() => setShowResolveModal(false)}
          footer={<><button className="btn btn-ghost btn-sm" onClick={() => setShowResolveModal(false)}>ยกเลิก</button><button className="btn btn-success btn-sm" onClick={handleResolve} disabled={saving}>ยืนยันปิดคำร้อง</button></>}>
          <div className="form-group">
            <label className="form-label">ผลการดำเนินการ *</label>
            <select className="input" value={resolveForm.resolution} onChange={(e) => setResolveForm((p) => ({ ...p, resolution: e.target.value }))}>
              <option value="NOTED">NOTED — รับทราบ ไม่มีการคืนเงิน</option>
              <option value="REFUNDED">REFUNDED — คืนเงินแล้ว</option>
              <option value="REJECTED">REJECTED — ปฏิเสธคำร้อง</option>
            </select>
          </div>
          {resolveForm.resolution === "REFUNDED" && (
            <div className="form-group">
              <label className="form-label">จำนวนเงินที่คืน (บาท)</label>
              <input className="input" type="number" min="0" step="0.01" placeholder="0.00" value={resolveForm.refund_amount} onChange={(e) => setResolveForm((p) => ({ ...p, refund_amount: e.target.value }))} />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">หมายเหตุแอดมิน</label>
            <textarea className="input textarea" placeholder="บันทึกการดำเนินการ..." value={resolveForm.admin_note} onChange={(e) => setResolveForm((p) => ({ ...p, admin_note: e.target.value }))} rows={3} />
          </div>
        </Modal>
      )}

      {viewerDocs && <DocViewer docs={viewerDocs} initialIndex={viewerInitIdx} onClose={() => setViewerDocs(null)} />}
    </div>
  );
}
