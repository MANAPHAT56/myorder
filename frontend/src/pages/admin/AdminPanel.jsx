import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

import adminStyles from "../../styles/adminStyles";
import AdminLayout from "../../components/admin/AdminLayout";
import { Notification } from "../../components/admin/AdminUI";

export default function AdminPanel() {
  const [notification, setNotification] = useState(null);
  const notify = (msg, type = "success") => setNotification({ msg, type });

  const token = localStorage.getItem("user_token");
  
  let user = null;
  try {
    const userDataStr = localStorage.getItem("user_data");
    if (userDataStr) {
      user = JSON.parse(userDataStr);
    }
  } catch (error) {
    console.error("Failed to parse user data", error);
  }

  // เช็คความปลอดภัย
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

  // ถ้าผ่านหมด ให้คืนค่าแค่ Layout + Outlet
  return (
    <>
      <style>{adminStyles}</style>
      
      {/* ครอบหน้าย่อยทั้งหมดด้วย Layout ของ Admin */}
      <AdminLayout>
        {/* <Outlet /> คือจุดที่จะเอา Dashboard, Shops ฯลฯ จาก App.jsx มาเสียบ */}
        <Outlet context={{ notify }} />
      </AdminLayout>

      {/* แจ้งเตือน */}
      {notification && (
        <Notification 
          msg={notification.msg} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}
    </>
  );
}