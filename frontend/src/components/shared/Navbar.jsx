// Navbar.jsx
export default function Navbar({ user, darkMode, toggleDark, onLoginClick }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    api.logout().catch(() => {});
    localStorage.clear();
    window.location.reload();
  };

  return (
    <nav className="navbar">
      {/* Logo ซ้าย */}
      <div className="nav-brand" onClick={() => navigate("/")}>
        my<span>Order</span>
      </div>

      {/* ขวา — เปลี่ยนตาม login */}
      <div className="nav-right">
        <NavLink to="/about" className="nav-tab">
          เกี่ยวกับเรา
        </NavLink>

        {user ? (
          // หลัง login: ฉัน + ร้านค้าของฉัน
          <>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate("/profile")}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <UserAvatar user={user} size={26} fontSize={13} />
              ฉัน
            </button>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => navigate("/myshop")}
            >
              ร้านค้าของฉัน
            </button>
          </>
        ) : (
          // ก่อน login: เข้าสู่ระบบ
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