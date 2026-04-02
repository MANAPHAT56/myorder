import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Modal } from "./UIComponents";
import api from "../../api/api";

export default function LoginModal({ onClose, notify }) {
  const [googleLoading, setGoogleLoading] = useState(false);

  return (
    <Modal title="เข้าสู่ระบบ" onClose={onClose}>
      <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>👋</div>
        <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 8 }}>
          เข้าสู่ระบบเพื่อยื่นเรื่องเคลม หรือจัดการร้านของคุณ
        </p>
      </div>

      <div
        style={{ display: "flex", justifyContent: "center", paddingBottom: "20px" }}
      >
        {googleLoading ? (
          <p>กำลังรันระบบ...</p>
        ) : (
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              const idToken = credentialResponse.credential;
              setGoogleLoading(true);
              try {
                const result = await api.loginGoogle(idToken);
                if (result.token) {
                  localStorage.setItem("user_token", result.token);
                  localStorage.setItem(
                    "user_data",
                    JSON.stringify(result.user)
                  );
                  window.location.reload();
                }
              } catch (e) {
                notify("เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่", "error");
              } finally {
                setGoogleLoading(false);
                onClose();
              }
            }}
            onError={() => {
              notify("การเชื่อมต่อ Google ล้มเหลว", "error");
            }}
            useOneTap
          />
        )}
      </div>
    </Modal>
  );
}
