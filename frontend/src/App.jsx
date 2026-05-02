import { useState, useEffect } from "react";
import { HashRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

// --- Global Styles & Public Components ---
import styles from "./styles/globalStyles";
import Navbar from "./components/shared/Navbar";
import LoginModal from "./components/shared/LoginModal";
import { Notification } from "./components/shared/UIComponents";

import HomePage       from "./pages/HomePage";
import ShopListPage   from "./pages/ShopListPage";
import ShopDetailPage from "./pages/ShopDetailPage";
import ProfilePage    from "./pages/ProfilePage";
import MyShopPage     from "./pages/MyShopPage";
import UpgradePage    from "./pages/UpgradePage";
import AboutPage      from "./pages/About";

// --- Admin Imports ---
import adminStyles from "./styles/adminStyles"; // ปรับ path ให้ตรงกับโครงสร้างจริงของคุณ
import AdminLayout from "./components/admin/AdminLayout";
import DashboardPage       from "./pages/admin/DashboardPage";
import ShopsPage           from "./pages/admin/ShopsPage";
import BlacklistPage       from "./pages/admin/BlacklistPage";
import UpgradeTier3Page    from "./pages/admin/UpgradeTier3Page";
import UpgradeRequestsPage from "./pages/admin/UpgradeRequestsPage";
import ClaimsPage          from "./pages/admin/ClaimsPage";

const GOOGLE_CLIENT_ID = "687095367345-mfbmo1n0skvcfq7amilnk0a1dm746ii7.apps.googleusercontent.com";

// -------------------------------------------------------------
// Wrapper สำหรับป้องกัน Route ของ Admin และใส่ Layout
// -------------------------------------------------------------
function AdminWrapper({ user, notify }) {
  const token = localStorage.getItem("user_token");

  // ตรวจสอบทั้ง Token และ สิทธิ์ระดับ ADMIN
  if (!token || user?.role !== "ADMIN") {
    return (
      <>
        <style>{adminStyles}</style>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--bg)", fontFamily: "var(--font)" }}>
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔑</div>
            <h2 style={{ fontFamily: "var(--display)", fontSize: 20, marginBottom: 8 }}>
              {!token ? "กรุณาเข้าสู่ระบบก่อน" : "สิทธิ์การเข้าถึงถูกปฏิเสธ"}
            </h2>
            <p style={{ color: "var(--text3)", fontSize: 14 }}>
              {!token 
                ? "ต้องมี token ใน localStorage เพื่อเข้าใช้ Admin Panel" 
                : "บัญชีของคุณไม่มีสิทธิ์เข้าถึงส่วนของผู้ดูแลระบบ"}
            </p>
          </div>
        </div>
      </>
    );
  }

  // ถ้าผ่านการตรวจสอบ ให้ render AdminLayout และ sub-routes (Outlet)
  return (
    <>
      <style>{adminStyles}</style>
      <AdminLayout>
        <Outlet context={{ notify }} />
      </AdminLayout>
    </>
  );
}

// -------------------------------------------------------------
// Component หลักของ App
// -------------------------------------------------------------
export default function App() {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [notification, setNotification] = useState(null);

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user_data"));
    } catch {
      return null;
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const notify = (msg, type = "success") => setNotification({ msg, type });

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <style>{styles}</style>
      <HashRouter>
        <Navbar
          user={user}
          darkMode={darkMode}
          toggleDark={() => setDarkMode((d) => !d)}
          onLoginClick={() => setShowLoginModal(true)}
        />

        <Routes>
          {/* ── Public routes ───────────────────────────────── */}
          <Route path="/"       element={<HomePage />} />
          <Route path="/shops"  element={<ShopListPage />} />
          <Route path="/shop/:refId" element={<ShopDetailPage user={user} notify={notify} />} />
          <Route path="/about"  element={<AboutPage user={user} darkMode={darkMode} toggleDark={() => setDarkMode((d) => !d)} />} />

          {/* ── Auth-required routes ─────────────────────────── */}
          <Route path="/profile" element={user ? <ProfilePage user={user} /> : <Navigate to="/" replace />} />
          <Route path="/upgrade" element={user ? <UpgradePage user={user} notify={notify} /> : <Navigate to="/" replace />} />
          <Route
            path="/myshop"
            element={user
              ? <MyShopPage user={user} notify={notify} />
              : <RedirectWithLogin onLogin={() => setShowLoginModal(true)} />
            }
          />

          {/* ── Admin routes ─────────────────────────────────── */}
          {/* รวม Route Admin ไว้ที่นี่เลย โดยครอบด้วย AdminWrapper 
            ใช้ path="/admin" (ไม่มี /*) แล้วใส่ nested routes ข้างใน 
          */}
          <Route path="/admin" element={<AdminWrapper user={user} notify={notify} />}>
            <Route index element={<DashboardPage />} />
            <Route path="shops" element={<ShopsPage notify={notify} />} />
            <Route path="blacklist" element={<BlacklistPage />} />
            <Route path="upgrade-tier3" element={<UpgradeTier3Page notify={notify} />} />
            <Route path="upgrade-requests" element={<UpgradeRequestsPage notify={notify} />} />
            <Route path="claims" element={<ClaimsPage notify={notify} />} />
          </Route>

          {/* ── Fallback ─────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {notification && (
          <Notification msg={notification.msg} type={notification.type} onClose={() => setNotification(null)} />
        )}

        {showLoginModal && (
          <LoginModal onClose={() => setShowLoginModal(false)} notify={notify} />
        )}
      </HashRouter>
    </GoogleOAuthProvider>
  );
}

// Component สำหรับหน้าจอแจ้งเตือนให้ Login
function RedirectWithLogin({ onLogin }) {
  useEffect(() => { onLogin(); }, []);
  return (
    <div className="page">
      <div className="section" style={{ paddingTop: 60, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
        <p style={{ color: "var(--text2)" }}>กรุณาเข้าสู่ระบบก่อนเข้าใช้งานหน้านี้</p>
      </div>
    </div>
  );
}