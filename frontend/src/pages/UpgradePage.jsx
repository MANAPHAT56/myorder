import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { tierOf } from "../utils/helpers";
import "../styles/myShopStyles.css"; // ← import CSS แยก

const LOGO_SRC = "https://myorder14.s3.ap-southeast-1.amazonaws.com/icon/Logomyorder.png";

// ── Badge Components ──
const BadgeYellow = ({ children }) => <span className="badge-yellow">{children}</span>;
const BadgeGreen  = ({ children }) => <span className="badge-green">{children}</span>;
const BadgeRed    = ({ children }) => <span className="badge-red">{children}</span>;

const statusBadge = (s) => {
  if (s === "pending")  return <BadgeYellow>⏳ รอตรวจสอบ</BadgeYellow>;
  if (s === "approved") return <BadgeGreen>✓ อนุมัติ</BadgeGreen>;
  return <BadgeRed>✕ ไม่ผ่าน</BadgeRed>;
};

// dot class แบบ dynamic (ยังต้องใช้ JS เพราะขึ้นอยู่กับ status)
const dotClass = (status) => {
  if (status === "approved") return "myshop-dot approved";
  if (status === "pending")  return "myshop-dot pending";
  return "myshop-dot rejected";
};

export default function MyShopPage({ user, notify }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null); // สำหรับอ้างอิง input file

  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [previewUrl, setPreviewUrl] = useState(null); // สำหรับแสดงรูปตัวอย่างตอนเลือกไฟล์
  const [activeSection, setActiveSection] = useState("shop");

  useEffect(() => {
    api.getMyShop()
      .then((res) => {
        const data = res.data ? res.data : res;
        setShop(data);
        setEditForm({ name: data.name, url: data.url });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (!user) { navigate("/"); return null; }

  if (loading)
    return (
      <div className="myshop-page">
        <div style={{ color: "#aaa", fontSize: 14 }}>กำลังโหลด...</div>
      </div>
    );

  if (!shop)
    return (
      <div className="myshop-page">
        <div className="myshop-profile-card myshop-no-shop-card">
          <div className="myshop-no-shop-icon">🏪</div>
          <h2 className="myshop-no-shop-title">คุณยังไม่มีร้านค้าในระบบ</h2>
          <p className="myshop-no-shop-desc">
            กรุณาติดต่อทีมงาน myOrder เพื่อลงทะเบียนและรับสิทธิ์ใช้งาน
          </p>
          <a href="https://line.me/myorder-register" target="_blank" rel="noreferrer"
            className="myshop-btn-confirm" style={{ display: "inline-block", textDecoration: "none" }}>
            💬 ติดต่อ myOrder เพื่อลงทะเบียน
          </a>
        </div>
      </div>
    );

  const tier = tierOf(shop);
  const failedCount = shop.failed_upgrade_count ?? 0;
  const upgradeHistory = shop.upgrade_requests ?? [];

  // ฟังก์ชันเมื่อเลือกไฟล์รูปภาพใหม่
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setEditForm((p) => ({ ...p, url_profile_shop: file }));
  };

  const handleSave = async () => {
    try {
      // ใช้ FormData เพื่อให้รองรับการอัปโหลดไฟล์รูปภาพ
      const formData = new FormData();
      if (editForm.name) formData.append("name", editForm.name);
      if (editForm.url) formData.append("url", editForm.url);
      if (editForm.url_profile_shop instanceof File) {
        formData.append("url_profile_shop", editForm.url_profile_shop);
      }

      const res = await api.updateMyShop(formData);
      const updated = res.data?.data || res.data || res;
      setShop(updated);
      setEditForm({ name: updated.name, url: updated.url });
      setPreviewUrl(null);
      setEditing(false);
      notify("บันทึกข้อมูลเรียบร้อย", "success");
    } catch (e) {
      const msg = e.response?.data?.message || e.message;
      notify("บันทึกไม่สำเร็จ: " + msg, "error");
    }
  };

  const handleCancel = () => {
    setEditForm({ name: shop.name, url: shop.url });
    setPreviewUrl(null);
    setEditing(false);
  };

  // รูปที่จะแสดง: ถ้ามี previewUrl ให้แสดงก่อน, ถ้าไม่มีใช้รูปจาก db, ถ้าไม่มีใช้อัน default
  const displayProfileImg = previewUrl || shop.url_profile_shop || "https://myorder14.s3.ap-southeast-1.amazonaws.com/icon/add_a_photo.png";

  const renderContent = () => {
    /* ── Upgrade section ── */
    if (activeSection === "upgrade") {
      return (
        <>
          <div className="myshop-profile-card">
            <div className="myshop-profile-card-header">
              <span className="myshop-profile-label">โปรไฟล์ร้านค้า</span>
            </div>
            <div className="myshop-profile-photo-area">
              <div style={{ position: "relative", display: "inline-block" }}>
                <div className="myshop-shop-avatar">
                  <img src={displayProfileImg} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                </div>
              </div>
            </div>
          </div>

          <div className="myshop-info-card">
            <div className="myshop-info-card-header">
              <span className="myshop-info-label">ข้อมูลร้านค้า</span>
            </div>
            <div className="myshop-info-body">
              <div className="myshop-info-row">
                <span className="myshop-info-key">ชื่อร้าน:</span>
                <span className="myshop-info-val">{shop.name}</span>
              </div>
              <div className="myshop-info-row">
                <span className="myshop-info-key">ติดต่อร้านได้ที่:</span>
                <a href={shop.url} target="_blank" rel="noreferrer" className="myshop-info-link">{shop.url}</a>
              </div>
              <div className="myshop-info-row">
                <span className="myshop-info-key">ที่อยู่:</span>
                <span className="myshop-info-val">{shop.address ?? "-"}</span>
              </div>
              <div className="myshop-info-row">
                <span className="myshop-info-key">ประวัติการโกง:</span>
                <span className="myshop-info-val">{failedCount > 0 ? `ไม่ผ่าน ${failedCount}/3 ครั้ง` : "ไม่มี"}</span>
              </div>
              <div className="myshop-info-row-last">
                <span className="myshop-info-key">ระดับขั้นการยืนยันตัว:</span>
                <span className="myshop-info-val">ขั้น {tier}</span>
              </div>
            </div>
          </div>

          <div className="myshop-footer">
            <button className="myshop-btn-cancel" onClick={() => setActiveSection("shop")}>ยกเลิก</button>
            <button className="myshop-btn-confirm" onClick={() => navigate("/upgrade")}>ยืนยัน</button>
          </div>
        </>
      );
    }

    /* ── History section ── */
    if (activeSection === "history") {
      return (
        <div className="myshop-info-card">
          <div className="myshop-info-card-header">
            <span className="myshop-info-label">ประวัติการขอเลื่อนขั้น</span>
          </div>
          <div className="myshop-info-body">
            {upgradeHistory.length === 0 ? (
              <p style={{ color: "#666", fontSize: 14 }}>ยังไม่มีประวัติ</p>
            ) : (
              upgradeHistory.map((h, i) => (
                <div className="myshop-history-item" key={i}>
                  <div className={dotClass(h.status)} />
                  <div style={{ flex: 1 }}>
                    <div className="myshop-history-title">
                      คำขอเลื่อนขั้น {statusBadge(h.status)}
                    </div>
                    {h.admin_remark && (
                      <div className="myshop-history-remark">เหตุผลที่ไม่ผ่าน: {h.admin_remark}</div>
                    )}
                    <div className="myshop-history-date">{h.created_at?.substring(0, 10)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="myshop-history-footer">
            <button className="myshop-btn-cancel" onClick={() => setActiveSection("shop")}>← กลับ</button>
          </div>
        </div>
      );
    }

    /* ── Default: shop info ── */
    return (
      <>
        {/* Profile photo card */}
        <div className="myshop-profile-card">
          <div className="myshop-profile-card-header">
            <span className="myshop-profile-label">โปรไฟล์ร้านค้า</span>
          </div>
          <div className="myshop-profile-photo-area">
            <div style={{ position: "relative", display: "inline-block" }}>
              <div className="myshop-shop-avatar">
                <img 
                  src={displayProfileImg} 
                  alt="Shop Profile" 
                  style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} 
                />
              </div>
              
              {/* ซ่อน Input File ไว้ แล้วใช้ Ref ในการคลิกจากปุ่มกล้องแทน */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />

              {editing && (
                <div 
                  className="myshop-camera-btn" 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ cursor: "pointer" }}
                >
                  📷
                </div>
              )}
            </div>
            {!editing && (
              <div style={{ marginLeft: 20 }}>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{shop.name}</div>
                <span style={{
                  background: "#fff",
                  color: "#333",
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "3px 12px",
                  borderRadius: 20,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}>
                  ขั้น {tier}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Info card */}
        <div className="myshop-info-card">
          <div className="myshop-info-card-header">
            <span className="myshop-info-label">ข้อมูลร้านค้า</span>
          </div>
          <div className="myshop-info-body">
            <div className="myshop-info-row">
              <span className="myshop-info-key">ชื่อร้าน :</span>
              {editing
                ? <input className="myshop-input-field" value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} />
                : <span className="myshop-info-val">{shop.name}</span>}
            </div>
            <div className="myshop-info-row">
              <span className="myshop-info-key">ติดต่อร้านได้ที่ :</span>
              {editing
                ? <input className="myshop-input-field" value={editForm.url} onChange={(e) => setEditForm((p) => ({ ...p, url: e.target.value }))} />
                : <a href={shop.url} target="_blank" rel="noreferrer" className="myshop-info-link">{shop.url}</a>}
            </div>
            <div className="myshop-info-row">
              <span className="myshop-info-key">ที่อยู่ :</span>
              <span className="myshop-info-val">{shop.address ?? "-"}</span>
            </div>
            <div className="myshop-info-row">
              <span className="myshop-info-key">ประวัติการโกง :</span>
              <span className="myshop-info-val">{failedCount > 0 ? `ไม่ผ่าน ${failedCount}/3 ครั้ง` : "-"}</span>
            </div>
            <div className="myshop-info-row-last">
              <span className="myshop-info-key">ระดับขั้นการยืนยันตัว :</span>
              <span className="myshop-info-val">{tier ? `ขั้น ${tier}` : "-"}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {!editing ? (
          <div className="myshop-edit-btn-container">
            <button className="myshop-edit-btn" onClick={() => setEditing(true)}>แก้ไข</button>
          </div>
        ) : (
          <div className="myshop-footer">
            <button className="myshop-btn-confirm" onClick={handleSave}>ยืนยัน</button>
            <button className="myshop-btn-cancel" onClick={handleCancel}>ยกเลิก</button>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="myshop-page">
      <div className="myshop-wrapper">
        {/* ── Left panel ── */}
        <div className="myshop-left-panel">
          <div className="myshop-logo">
            <img src={LOGO_SRC} alt="MyOrder" />
          </div>

          {/* User avatar */}
          <div className="myshop-avatar">
            {user.avatar
              ? <img src={user.avatar} alt="" />
              : "👤"}
          </div>
          <div className="myshop-user-name">{user.name ?? "ผู้ใช้งาน"}</div>
          <div className="myshop-user-email">{user.email ?? ""}</div>

          {/* Side nav */}
          <nav className="myshop-side-nav">
            <button
              className={activeSection === "shop" ? "myshop-nav-item" : "myshop-nav-item-ghost"}
              onClick={() => setActiveSection("shop")}
            >
              ข้อมูลร้านค้า
            </button>

            {tier === 1 && (
              <button
                className={activeSection === "upgrade" ? "myshop-nav-item" : "myshop-nav-item-ghost"}
                onClick={() => navigate("/upgrade")}
              >
                ยื่นขอเลื่อนขั้นการยืนยันตัว
              </button>
            )}
            
            <button
              className={activeSection === "history" ? "myshop-nav-item" : "myshop-nav-item-ghost"}
              onClick={() => setActiveSection("history")}
            >
              ประวัติการขอเลื่อนขั้น
            </button>
          </nav>
        </div>

        {/* ── Right panel ── */}
        <div className="myshop-right-panel">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}