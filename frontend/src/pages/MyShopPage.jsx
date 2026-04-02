import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TierBadge, SkeletonGrid, Modal } from "../components/shared/UIComponents";
import api from "../api/api";
import { tierOf } from "../utils/helpers";

export default function MyShopPage({ user, notify }) {
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    api
      .getMyShop()
      .then((res) => {
        const data = res.data ? res.data : res;
        setShop(data);
        setEditForm({ name: data.name, url: data.url });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (!user) {
    navigate("/");
    return null;
  }

  if (loading)
    return (
      <div className="page">
        <div className="section" style={{ paddingTop: 28 }}>
          <SkeletonGrid count={3} />
        </div>
      </div>
    );

  if (!shop)
    return (
      <div className="page">
        <div className="section" style={{ paddingTop: 28, maxWidth: 640 }}>
          <div className="dash-card" style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🏪</div>
            <h2 style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 600, marginBottom: 16 }}>
              คุณยังไม่มีร้านค้าในระบบ
            </h2>
            <div style={{ color: "var(--text3)", marginBottom: 24, lineHeight: "1.6" }}>
              กรุณาติดต่อทีมงาน myOrder เพื่อลงทะเบียนและรับสิทธิ์ใช้งาน
            </div>
            <a href="https://line.me/myorder-register" target="_blank" rel="noreferrer" className="btn btn-primary btn-lg">
              💬 ติดต่อ myOrder เพื่อลงทะเบียน
            </a>
          </div>
        </div>
      </div>
    );

  const tier = tierOf(shop);
  const failedCount = shop.failed_upgrade_count ?? 0;
  const upgradeHistory = shop.upgrade_requests ?? [];

  const handleSave = async () => {
    try {
      const res = await api.updateMyShop(editForm);
      // unwrap เหมือน useEffect — API อาจ return { data: {...} } หรือ object ตรงๆ
      const updated = res.data ? res.data : res;
      setShop(updated);
      setEditForm({ name: updated.name, url: updated.url });
      setEditing(false);
      notify("บันทึกข้อมูลเรียบร้อย", "success");
    } catch (e) {
      notify("บันทึกไม่สำเร็จ: " + e.message, "error");
    }
  };

  const statusBadge = (s) => {
    if (s === "pending") return <span className="badge badge-yellow">⏳ รอตรวจสอบ</span>;
    if (s === "approved") return <span className="badge badge-green">✓ อนุมัติ</span>;
    return <span className="badge badge-red">✕ ไม่ผ่าน</span>;
  };

  return (
    <div className="page">
      <div className="section" style={{ paddingTop: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontFamily: "var(--display)", fontSize: 22, fontWeight: 600 }}>
              รายละเอียดร้านค้าของฉัน
            </h2>
            <p style={{ color: "var(--text3)", fontSize: 13 }}>จัดการข้อมูลและสถานะร้านค้า</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/profile")}>← กลับ</button>
        </div>

        {/* Stats */}
        <div className="stat-row" style={{ marginBottom: 20 }}>
          <div className="stat-mini">
            <div className="stat-mini-val">{shop.rating ?? "-"}</div>
            <div className="stat-mini-label">คะแนน</div>
          </div>
          <div className="stat-mini">
            <div className="stat-mini-val">{shop.orders_count ?? 0}</div>
            <div className="stat-mini-label">ออเดอร์</div>
          </div>
          <div className="stat-mini">
            <div className="stat-mini-val">ขั้น {tier}</div>
            <div className="stat-mini-label">ระดับ</div>
          </div>
        </div>

        {/* Main info card */}
        <div className="dash-card" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <span style={{ fontSize: 40 }}>{shop.img_emoji ?? "🏪"}</span>
              <div>
                <div style={{ fontFamily: "var(--display)", fontSize: 18, fontWeight: 600 }}>{shop.name}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                  <TierBadge tier={tier} />
                </div>
              </div>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>✏️ แก้ไข</button>
          </div>
          <div className="detail-row">
            <div className="detail-label">🔗 ลิงก์</div>
            <div className="detail-value">
              <a href={shop.url} style={{ color: "var(--accent)" }} target="_blank" rel="noreferrer">{shop.url}</a>
            </div>
          </div>
          <div className="detail-row">
            <div className="detail-label">📅 สร้างเมื่อ</div>
            <div className="detail-value" style={{ color: "var(--text3)" }}>{shop.created_at?.substring(0, 10)}</div>
          </div>
        </div>

        {/* Upgrade CTA */}
        {tier === 1 && (
          <div className="dash-card" style={{ marginBottom: 16, background: "linear-gradient(135deg,#fff7f5,#fef3ee)", border: "1.5px solid rgba(232,93,38,0.2)" }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ fontSize: 36 }}>🚀</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--display)", fontSize: 16, fontWeight: 600, marginBottom: 4 }}>ขอเลื่อนขั้น 1 → 2</div>
                <p style={{ fontSize: 13, color: "var(--text2)" }}>
                  ยืนยันตัวตนด้วยเอกสาร เพื่อเพิ่มความน่าเชื่อถือ
                  {failedCount > 0 && (
                    <span style={{ marginLeft: 6, color: "var(--yellow)", fontWeight: 700 }}>(ไม่ผ่าน {failedCount}/3 ครั้ง)</span>
                  )}
                </p>
              </div>
              <button className="btn btn-primary" onClick={() => navigate("/upgrade")}>ยื่นขอเลื่อนขั้น →</button>
            </div>
          </div>
        )}

        {/* Upgrade history */}
        <div className="dash-card">
          <div className="dash-card-title">ประวัติการขอเลื่อนขั้น</div>
          <div className="dash-card-sub">บันทึกคำขอและผลการพิจารณา</div>
          {upgradeHistory.length === 0 ? (
            <p style={{ color: "var(--text3)", fontSize: 14 }}>ยังไม่มีประวัติ</p>
          ) : (
            upgradeHistory.map((h, i) => (
              <div className="history-item" key={i}>
                <div className={`history-dot ${h.status === "approved" ? "dot-success" : h.status === "pending" ? "dot-pending" : "dot-fail"}`} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>คำขอเลื่อนขั้น {statusBadge(h.status)}</div>
                  {h.admin_remark && (
                    <div style={{ fontSize: 13, color: "var(--red)", marginTop: 4 }}>เหตุผลที่ไม่ผ่าน: {h.admin_remark}</div>
                  )}
                  <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>{h.created_at?.substring(0, 10)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {editing && (
        <Modal
          title="✏️ แก้ไขรายละเอียดร้านค้า"
          onClose={() => setEditing(false)}
          footer={
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>ยกเลิก</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave}>บันทึก</button>
            </>
          }
        >
          <div className="form-group">
            <label className="form-label">ชื่อร้านค้า</label>
            <input
              className="input"
              value={editForm.name}
              onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">ลิงก์ติดต่อ</label>
            <input
              className="input"
              value={editForm.url}
              onChange={(e) => setEditForm((p) => ({ ...p, url: e.target.value }))}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}