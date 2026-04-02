import { useNavigate, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { path: "/admin",                icon: "📊", label: "ภาพรวม",            section: "ภาพรวม" },
  { path: "/admin/shops",          icon: "🏪", label: "จัดการร้านค้า",      section: "ร้านค้า" },
  { path: "/admin/blacklist",      icon: "⛔", label: "รายการ Blacklist" },
  { path: "/admin/upgrade-tier3",  icon: "🥇", label: "เลื่อนขั้นที่ 3",    section: "คำร้อง" },
  { path: "/admin/upgrade-requests", icon: "📋", label: "คำร้องขอเลื่อนขั้น" },
  { path: "/admin/claims",         icon: "⚖️", label: "คำร้องเคลม" },
];

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  // match exact for dashboard, startsWith for others
  const isActive = (path) =>
    path === "/admin"
      ? location.pathname === "/admin" || location.pathname === "/admin/"
      : location.pathname.startsWith(path);

  let lastSection = "";

  return (
    <div className="admin-layout">
      <div className="sidebar">
        <div className="sidebar-brand">my<span>Order</span> <span style={{ fontSize: 11, opacity: 0.6 }}>Admin</span></div>
        {NAV_ITEMS.map((item) => {
          const showSection = item.section && item.section !== lastSection;
          if (showSection) lastSection = item.section;
          return (
            <div key={item.path}>
              {showSection && <div className="sidebar-section">{item.section}</div>}
              <div
                className={`sidebar-item ${isActive(item.path) ? "active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                <span className="sidebar-item-icon">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="main-content">{children}</div>
    </div>
  );
}
