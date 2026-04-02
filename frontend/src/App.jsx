import { useState, useEffect } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import styles from "./styles/globalStyles";
import Navbar from "./components/shared/Navbar";
import LoginModal from "./components/shared/LoginModal";
import { Notification } from "./components/shared/UIComponents";

import HomePage    from "./pages/HomePage";
import ShopListPage  from "./pages/ShopListPage";
import ShopDetailPage from "./pages/ShopDetailPage";
import ProfilePage from "./pages/ProfilePage";
import MyShopPage  from "./pages/MyShopPage";
import UpgradePage from "./pages/UpgradePage";
import AboutPage   from "./pages/About";

// Admin — import จาก folder ใหม่
import AdminPanel from "./pages/admin/AdminPanel";

const GOOGLE_CLIENT_ID =
  "687095367345-mfbmo1n0skvcfq7amilnk0a1dm746ii7.apps.googleusercontent.com";

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

          {/* ── Admin routes (/admin/*) ──────────────────────── */}
          {/*
            AdminPanel เป็น <Routes> ของตัวเอง ดังนั้น App ต้องใช้ path="/admin/*"
            เพื่อให้ sub-routes เช่น /admin/shops, /admin/claims ทำงานได้
          */}
          {/*
            ⚠️  ต้องใช้ path="/admin/*" (มี /*) เพื่อให้ React Router
            ส่ง sub-path (/admin/shops, /admin/claims ฯลฯ) เข้าไปใน
            <Routes> ที่อยู่ข้างใน AdminPanel ได้
          */}
          <Route
            path="/admin/*"
            element={
              user?.role === "ADMIN"
                ? <AdminPanel />
                : <Navigate to="/" replace />
            }
          />

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