import { useState, useEffect } from "react";
import { tierOf } from "../../utils/helpers";

// ── TierBadge ─────────────────────────────────────────────────
export function TierBadge({ tier }) {
  const map = {
    1: ["badge-tier1", "⚪ ขั้น 1"],
    2: ["badge-tier2", "🔵 ขั้น 2"],
    3: ["badge-tier3", "🥇 ขั้น 3"],
  };
  const [cls, label] = map[tier] || map[1];
  return <span className={`badge ${cls}`}>{label}</span>;
}

// ── RoleBadge ─────────────────────────────────────────────────
export function RoleBadge({ role }) {
  const map = {
    visitor: ["badge-role-visitor", "👁️ ผู้เยี่ยมชม"],
    user: ["badge-role-user", "👤 ผู้ใช้"],
    shop: ["badge-role-shop", "🏪 ร้านค้า"],
    admin: ["badge-role-admin", "🔑 แอดมิน"],
  };
  const [cls, label] = map[role] || map["visitor"];
  return <span className={`badge ${cls}`}>{label}</span>;
}

// ── Notification ──────────────────────────────────────────────
export function Notification({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className={`notification ${type}`}>
      <span>{type === "success" ? "✓" : "✕"}</span>
      <span>{msg}</span>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────
export function Modal({ title, onClose, children, footer, wide }) {
  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`modal ${wide ? "modal-wide" : ""}`}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────
export function Pagination({ currentPage, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const getPages = () => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    )
      pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };
  return (
    <div className="pagination-wrap">
      <button
        className="page-btn"
        onClick={() => onChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ‹
      </button>
      {getPages().map((p, i) =>
        p === "..." ? (
          <span key={`d${i}`} className="page-dots">
            ···
          </span>
        ) : (
          <button
            key={p}
            className={`page-btn ${p === currentPage ? "active" : ""}`}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        )
      )}
      <button
        className="page-btn"
        onClick={() => onChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        ›
      </button>
    </div>
  );
}

// ── ShopCard ──────────────────────────────────────────────────
export function ShopCard({ shop, onNavigate }) {
  const isBad = shop.is_blacklist || !shop.is_active;
  const tier = tierOf(shop);
  return (
    <div
      className={`shop-card ${isBad ? "shop-card-muted" : ""}`}
      onClick={() => onNavigate(`/shop/${shop.ref_id ?? shop.id}`, shop)}
    >
      <div className="shop-card-thumb">
        {shop.img_emoji ?? "🏪"}
        <div className="tier-badge-abs">
          {shop.is_blacklist ? (
            <span className="badge badge-red">⛔ Blacklist</span>
          ) : !shop.is_active ? (
            <span className="badge badge-gray">🔒 ปิดแล้ว</span>
          ) : (
            <TierBadge tier={tier} />
          )}
        </div>
      </div>
      <div className="shop-card-body">
        <div
          className="shop-card-name"
          style={isBad ? { color: "var(--text3)" } : {}}
        >
          {shop.name}
        </div>
        <div className="shop-card-desc">{shop.description}</div>
        <div className="shop-card-meta">
          <span
            style={{ fontSize: 13, color: "var(--yellow)", fontWeight: 700 }}
          >
            ⭐ {shop.rating ?? "-"}
          </span>
          <span style={{ fontSize: 12, color: "var(--text3)" }}>
            📍 {(shop.location ?? "").split(",")[0]}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── SkeletonGrid ──────────────────────────────────────────────
export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="shop-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="shop-card skeleton-card">
          <div className="skeleton-thumb" />
          <div className="skeleton-body">
            <div className="skeleton-line" style={{ width: "70%" }} />
            <div className="skeleton-line" style={{ width: "90%" }} />
            <div className="skeleton-line" style={{ width: "50%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── UserAvatar ────────────────────────────────────────────────
export function UserAvatar({ user, size = 72, fontSize = 28 }) {
  const [imgError, setImgError] = useState(false);
  const picture = user?.picture ?? user?.avatar ?? user?.profile_image;
  const fallback =
    user?.role === "admin" ? "🔑" : user?.role === "shop" ? "🏪" : "👤";

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "var(--accent-light)",
        border: "3px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: picture && !imgError ? 0 : fontSize,
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {picture && !imgError ? (
        <img
          src={picture}
          alt="profile"
          referrerPolicy="no-referrer"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={() => setImgError(true)}
        />
      ) : (
        fallback
      )}
    </div>
  );
}
