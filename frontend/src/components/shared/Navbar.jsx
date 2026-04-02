import { NavLink, useNavigate } from "react-router-dom";
import { UserAvatar } from "./UIComponents";
import api from "../../api/api";

export default function Navbar({ user, darkMode, toggleDark, onLoginClick }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    api.logout().catch(() => {});
    localStorage.clear();
    window.location.reload();
  };

  return (
    <nav className="navbar">
      {/* Brand */}
      <div className="nav-brand" onClick={() => navigate("/")}>
        my<span>Order</span>
      </div>

      {/* Center tabs */}
      <div className="nav-center">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-tab${isActive ? " active" : ""}`}
        >
          🏠 หน้าหลัก
        </NavLink>
        <NavLink
          to="/shops"
          className={({ isActive }) => `nav-tab${isActive ? " active" : ""}`}
        >
          🏪 ร้านค้าทั้งหมด
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) => `nav-tab${isActive ? " active" : ""}`}
        >
          ℹ️ เกี่ยวกับ
        </NavLink>
      </div>

      {/* Right side */}
      <div className="nav-right">
        {user && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate("/profile")}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <UserAvatar user={user} size={26} fontSize={13} />
            {user.name?.split(" ")[0]}
          </button>
        )}

        {(!user || user.role !== "admin") && (
          <button
            className="btn btn-outline btn-sm"
            onClick={() => {
              if (!user) {
                onLoginClick();
              } else {
                navigate("/myshop");
              }
            }}
          >
            🏪 ร้านของฉัน
          </button>
        )}

        {!user && (
          <button className="btn btn-primary btn-sm" onClick={onLoginClick}>
            เข้าสู่ระบบ
          </button>
        )}

        <button className="theme-toggle" onClick={toggleDark}>
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>
    </nav>
  );
}
