import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserAvatar, RoleBadge } from "../components/shared/UIComponents";
import api from "../api/api";

export default function ProfilePage({ user }) {
  const navigate = useNavigate();
  const [hasShop, setHasShop] = useState(false);
  const [loadingShop, setLoadingShop] = useState(true);

  useEffect(() => {
    api
      .getMyShop()
      .then(() => setHasShop(true))
      .catch(() => setHasShop(false))
      .finally(() => setLoadingShop(false));
  }, []);

  if (!user) {
    navigate("/");
    return null;
  }

  const handleLogout = () => {
    api.logout().catch(() => {});
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="page">
      <div className="section" style={{ paddingTop: 28 }}>
        {/* Profile header */}
        <div className="profile-header">
          <UserAvatar user={user} size={72} fontSize={28} />
          <div style={{ flex: 1 }}>
            <div className="profile-name">{user.name ?? user.display_name}</div>
            <div className="profile-email">{user.email}</div>
            <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
              <span className="badge badge-green">✓ เข้าสู่ระบบแล้ว</span>
              <RoleBadge role={user.role} />
            </div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={handleLogout}>
            ออกจากระบบ
          </button>
        </div>

        {/* Shop card */}
        <div className="dash-card">
          <div className="dash-card-title">ร้านค้าของฉัน</div>
          <div className="dash-card-sub">
            จัดการร้านค้าและดูสถานะการยืนยันตัวตน
          </div>
          <hr className="divider" />
          {loadingShop ? (
            <div className="alert alert-info">⏳ กำลังตรวจสอบ...</div>
          ) : hasShop ? (
            <div>
              <div className="alert alert-info" style={{ marginBottom: 16 }}>
                🏪 คุณมีร้านค้าในระบบแล้ว
              </div>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/myshop")}
              >
                🏪 ดูรายละเอียดร้านค้า →
              </button>
            </div>
          ) : (
            <div>
              <div className="alert alert-info" style={{ marginBottom: 16 }}>
                💡 คุณยังไม่มีร้านค้าในระบบ
              </div>
              <a
                href="https://line.me/myorder-register"
                className="btn btn-primary"
                target="_blank"
                rel="noreferrer"
              >
                📩 ติดต่อ myOrder เพื่อลงทะเบียน
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
