import { useState, useEffect } from "react";
import adminApi from "../../api/adminApi";
import {
  ITEMS_PER_PAGE,
  Modal, Pagination, SkeletonRows,
  DocViewer, DocList, makeDocFromAttachment,
} from "../../components/admin/AdminUI";

export default function UpgradeRequestsPage({ notify }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewerDocs, setViewerDocs] = useState(null);
  const [viewerInitIdx, setViewerInitIdx] = useState(0);

  const load = (status = statusFilter, p = page) => {
    setLoading(true);
    adminApi.getUpgradeRequests({ status, page: p, per_page: ITEMS_PER_PAGE })
      .then((data) => { setRequests(data.data ?? []); setTotalPages(data.last_page ?? 1); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleApprove = async (req) => {
    setSaving(true);
    try {
      await adminApi.approveUpgrade(req.id);
      setRequests((prev) => prev.filter((r) => r.id !== req.id));
      setSelected(null);
      notify(`อนุมัติคำขอของ "${req.shop?.name}" แล้ว`, "success");
    } catch (e) { notify("ไม่สำเร็จ: " + e.message, "error"); }
    finally { setSaving(false); }
  };

  const handleReject = async (req) => {
    if (!rejectReason.trim()) return;
    setSaving(true);
    try {
      await adminApi.rejectUpgrade(req.id, rejectReason);
      setRequests((prev) => prev.filter((r) => r.id !== req.id));
      setSelected(null); setShowRejectModal(false); setRejectReason("");
      notify(`ปฏิเสธคำขอของ "${req.shop?.name}"`, "error");
    } catch (e) { notify("ไม่สำเร็จ: " + e.message, "error"); }
    finally { setSaving(false); }
  };

  const statusBadge = (s) => {
    if (s === "pending")  return <span className="badge badge-yellow">⏳ รอดำเนินการ</span>;
    if (s === "approved") return <span className="badge badge-green">✓ อนุมัติ</span>;
    if (s === "rejected") return <span className="badge badge-red">✕ ไม่อนุมัติ</span>;
    return <span className="badge badge-gray">{s}</span>;
  };

  return (
    <div>
      <div className="page-title">📋 คำร้องขอเลื่อนขั้น</div>
      <div className="page-sub">UC10 — รายการคำร้องจากร้านค้าที่ต้องการเลื่อนระดับ</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["pending", "approved", "rejected"].map((s) => (
          <button key={s} className={`btn btn-sm ${statusFilter === s ? "btn-primary" : "btn-outline"}`}
            onClick={() => { setStatusFilter(s); setPage(1); load(s, 1); }}>
            {s === "pending" ? "⏳ รอดำเนินการ" : s === "approved" ? "✓ อนุมัติแล้ว" : "✕ ไม่อนุมัติ"}
          </button>
        ))}
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="table">
          <thead><tr><th>ร้านค้า</th><th>ประเภทเจ้าของ</th><th>วันที่ยื่น</th><th>สถานะ</th><th>จัดการ</th></tr></thead>
          <tbody>
            {loading ? <SkeletonRows cols={5} /> : requests.length === 0
              ? <tr><td colSpan={5} style={{ textAlign: "center", padding: "24px", color: "var(--text3)" }}>ไม่มีคำร้อง</td></tr>
              : requests.map((req) => (
                <tr key={req.id}>
                  <td style={{ fontWeight: 600 }}>{req.shop?.name ?? req.shop_ref_id}</td>
                  <td><span className="badge badge-gray">{req.shop?.is_company ? "🏢 นิติบุคคล" : "👤 บุคคลธรรมดา"}</span></td>
                  <td style={{ fontSize: 12, color: "var(--text3)" }}>{req.created_at?.substring(0, 10)}</td>
                  <td>{statusBadge(req.status)}</td>
                  <td><button className="btn btn-outline btn-xs" onClick={() => setSelected(req)}>จัดการ</button></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={page} totalPages={totalPages} onChange={(p) => { setPage(p); load(statusFilter, p); }} />

      {selected && (
        <Modal title={`คำขอ: ${selected.shop?.name ?? selected.shop_ref_id}`} onClose={() => setSelected(null)} wide>
          <div className="detail-row"><div className="detail-label">ร้านค้า</div><div className="detail-value">{selected.shop?.name}</div></div>
          <div className="detail-row"><div className="detail-label">ประเภทเจ้าของ</div><div className="detail-value">{selected.shop?.is_company ? "🏢 นิติบุคคล" : "👤 บุคคลธรรมดา"}</div></div>
          <div className="detail-row"><div className="detail-label">วันที่ยื่น</div><div className="detail-value">{selected.created_at?.substring(0, 10)}</div></div>
          <div className="detail-row"><div className="detail-label">สถานะ</div><div className="detail-value">{statusBadge(selected.status)}</div></div>
          {selected.admin_remark && (
            <div className="detail-row"><div className="detail-label">เหตุผลไม่ผ่าน</div><div className="detail-value" style={{ color: "var(--red)" }}>{selected.admin_remark}</div></div>
          )}
          {selected.attachments?.length > 0 && (
            <div style={{ marginBottom: 20, marginTop: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>เอกสารที่ส่งมา</div>
              <DocList
                docs={selected.attachments.map(makeDocFromAttachment)}
                onView={(idx) => { setViewerDocs(selected.attachments.map(makeDocFromAttachment)); setViewerInitIdx(idx); }}
              />
            </div>
          )}
          {selected.status === "pending" && (
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-danger btn-sm" onClick={() => setShowRejectModal(true)} disabled={saving}>✕ ไม่อนุมัติ</button>
              <button className="btn btn-success btn-sm" onClick={() => handleApprove(selected)} disabled={saving}>✓ อนุมัติ</button>
            </div>
          )}
        </Modal>
      )}

      {showRejectModal && selected && (
        <Modal title="✕ ระบุเหตุผลที่ไม่อนุมัติ" onClose={() => { setShowRejectModal(false); setRejectReason(""); }}
          footer={<><button className="btn btn-ghost btn-sm" onClick={() => { setShowRejectModal(false); setRejectReason(""); }}>ยกเลิก</button><button className="btn btn-danger btn-sm" disabled={!rejectReason.trim() || saving} onClick={() => handleReject(selected)}>ยืนยันไม่อนุมัติ</button></>}>
          <div className="form-group">
            <label className="form-label">เหตุผลที่ไม่อนุมัติ *</label>
            <textarea className="input textarea" placeholder="เช่น เอกสารไม่ชัดเจน..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
            <div className="form-hint">เหตุผลนี้จะแสดงให้ร้านค้าเห็น</div>
          </div>
        </Modal>
      )}
      {viewerDocs && <DocViewer docs={viewerDocs} initialIndex={viewerInitIdx} onClose={() => setViewerDocs(null)} />}
    </div>
  );
}
