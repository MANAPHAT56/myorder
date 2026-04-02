import { useState } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

import adminStyles from "../../styles/adminStyles";
import AdminLayout from "../../components/admin/AdminLayout";
import { Notification } from "../../components/admin/AdminUI";

import DashboardPage        from "./DashboardPage";
import ShopsPage            from "./ShopsPage";
import BlacklistPage        from "./BlacklistPage";
import UpgradeTier3Page     from "./UpgradeTier3Page";
import UpgradeRequestsPage  from "./UpgradeRequestsPage";
import ClaimsPage           from "./ClaimsPage";

// Wrapper ที่ inject styles + layout ให้ทุก sub-route
function AdminShell({ notify }) {
  return (
    <>
      <style>{adminStyles}</style>
      <AdminLayout>
        <Outlet context={{ notify }} />
      </AdminLayout>
    </>
  );
}

export default function AdminPanel() {
  const [notification, setNotification] = useState(null);
  const notify = (msg, type = "success") => setNotification({ msg, type });

  const token = localStorage.getItem("user_token");
  if (!token) {
    return (
      <>
        <style>{adminStyles}</style>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--bg)", fontFamily: "var(--font)" }}>
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔑</div>
            <h2 style={{ fontFamily: "var(--display)", fontSize: 20, marginBottom: 8 }}>กรุณาเข้าสู่ระบบก่อน</h2>
            <p style={{ color: "var(--text3)", fontSize: 14 }}>ต้องมี token ใน localStorage เพื่อเข้าใช้ Admin Panel</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Routes>
        <Route element={<AdminShell notify={notify} />}>
          <Route index                  element={<DashboardPage />} />
          <Route path="shops"           element={<ShopsPage notify={notify} />} />
          <Route path="blacklist"       element={<BlacklistPage />} />
          <Route path="upgrade-tier3"   element={<UpgradeTier3Page notify={notify} />} />
          <Route path="upgrade-requests" element={<UpgradeRequestsPage notify={notify} />} />
          <Route path="claims"          element={<ClaimsPage notify={notify} />} />
          {/* relative redirect — ไม่ใส่ /admin นำหน้า เพราะอยู่ใน nested Routes แล้ว */}
          <Route path="*"               element={<Navigate to="" replace />} />
        </Route>
      </Routes>
      {notification && (
        <Notification msg={notification.msg} type={notification.type} onClose={() => setNotification(null)} />
      )}
    </>
  );
}