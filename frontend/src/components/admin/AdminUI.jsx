import { useState, useEffect, useRef, useCallback } from "react";

export const ITEMS_PER_PAGE = 8;
export const INVALID_CHARS = /[^\u0E00-\u0E7Fa-zA-Z0-9\s\-_.@/:,()]/;

// ── Validators ───────────────────────────────────────────────
export function validateText(val) {
  if (!val || val.trim() === "") return "กรุณากรอกข้อมูลให้ครบถ้วน";
  if (INVALID_CHARS.test(val)) return "ไม่อนุญาตให้ใช้อักขระพิเศษหรืออีโมจิ";
  return null;
}
export function validateUrl(val) {
  if (!val || val.trim() === "") return "กรุณากรอก URL";
  if (!/^https?:\/\/.+/.test(val)) return "URL ต้องขึ้นต้นด้วย http:// หรือ https://";
  return null;
}
export function validateUserId(val) {
  if (!val || val.trim() === "") return "กรุณากรอก Account ID";
  return null;
}

// ── Helpers ──────────────────────────────────────────────────
export function makeDocFromAttachment(att) {
  const url = att.file_url ?? att.url ?? "";
  const isPdf = url.toLowerCase().endsWith(".pdf");
  return {
    id: att.id,
    name: url.split("/").pop(),
    label: att.label ?? url.split("/").pop(),
    fileType: isPdf ? "pdf" : "image",
    previewUrl: isPdf ? null : url,
  };
}

export const tierOf = (s) =>
  s.current_tier === "TIER_3" ? 3 : s.current_tier === "TIER_2" ? 2 : 1;

// ── UI Components ─────────────────────────────────────────────
export function TierBadge({ tier }) {
  const map = {
    1: ["badge-tier1", "⚪ ขั้น 1"],
    2: ["badge-tier2", "🔵 ขั้น 2"],
    3: ["badge-tier3", "🥇 ขั้น 3"],
  };
  const [cls, label] = map[tier] || map[1];
  return <span className={`badge ${cls}`}>{label}</span>;
}

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

export function Modal({ title, onClose, children, footer, wide }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? "modal-wide" : ""}`}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function Pagination({ currentPage, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1);
  return (
    <div className="pagination-wrap">
      <button className="page-btn" onClick={() => onChange(currentPage - 1)} disabled={currentPage === 1}>‹</button>
      {pages.map((p) => (
        <button key={p} className={`page-btn ${p === currentPage ? "active" : ""}`} onClick={() => onChange(p)}>{p}</button>
      ))}
      <button className="page-btn" onClick={() => onChange(currentPage + 1)} disabled={currentPage === totalPages}>›</button>
    </div>
  );
}

export function SkeletonRows({ cols = 6, rows = 4 }) {
  return Array.from({ length: rows }).map((_, i) => (
    <tr key={i} className="skeleton-row">
      {Array.from({ length: cols }).map((_, j) => <td key={j}>&nbsp;</td>)}
    </tr>
  ));
}

// ── Doc Viewer ───────────────────────────────────────────────
const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];
const DEFAULT_ZOOM_IDX = 2;

export function DocViewer({ docs, initialIndex = 0, onClose }) {
  const [docIdx, setDocIdx] = useState(initialIndex);
  const [zoomIdx, setZoomIdx] = useState(DEFAULT_ZOOM_IDX);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(null);
  const mainRef = useRef(null);
  const doc = docs[docIdx];
  const zoom = ZOOM_LEVELS[zoomIdx];

  useEffect(() => { setZoomIdx(DEFAULT_ZOOM_IDX); setPan({ x: 0, y: 0 }); }, [docIdx]);
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" || e.key === "ArrowDown") setDocIdx((i) => Math.min(i + 1, docs.length - 1));
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") setDocIdx((i) => Math.max(i - 1, 0));
      if (e.key === "+" || e.key === "=") setZoomIdx((i) => Math.min(i + 1, ZOOM_LEVELS.length - 1));
      if (e.key === "-") setZoomIdx((i) => Math.max(i - 1, 0));
      if (e.key === "0") { setZoomIdx(DEFAULT_ZOOM_IDX); setPan({ x: 0, y: 0 }); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [docs.length, onClose]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    if (e.deltaY < 0) setZoomIdx((i) => Math.min(i + 1, ZOOM_LEVELS.length - 1));
    else setZoomIdx((i) => Math.max(i - 1, 0));
  }, []);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  const onPointerDown = (e) => {
    if (zoom <= 1) return;
    setDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!dragging || !dragStart.current) return;
    setPan({ x: dragStart.current.px + (e.clientX - dragStart.current.mx), y: dragStart.current.py + (e.clientY - dragStart.current.my) });
  };
  const onPointerUp = () => { setDragging(false); dragStart.current = null; };

  return (
    <div className="doc-viewer-overlay">
      <div className="doc-viewer-topbar">
        <div className="doc-viewer-title">
          <span style={{ fontSize: 18 }}>{doc.fileType === "pdf" ? "📄" : "🖼️"}</span>
          <span>{doc.label}</span>
          {docs.length > 1 && <span style={{ fontSize: 12, color: "#9a8a7a" }}>({docIdx + 1}/{docs.length})</span>}
        </div>
        <div className="doc-viewer-controls">
          <button className="doc-ctrl-btn" onClick={() => setZoomIdx((i) => Math.max(i - 1, 0))} disabled={zoomIdx === 0}>−</button>
          <span className="doc-zoom-label">{Math.round(zoom * 100)}%</span>
          <button className="doc-ctrl-btn" onClick={() => setZoomIdx((i) => Math.min(i + 1, ZOOM_LEVELS.length - 1))} disabled={zoomIdx === ZOOM_LEVELS.length - 1}>+</button>
          <button className="doc-ctrl-btn" onClick={() => { setZoomIdx(DEFAULT_ZOOM_IDX); setPan({ x: 0, y: 0 }); }} style={{ fontSize: 13 }}>⊙</button>
          {docs.length > 1 && (
            <>
              <button className="doc-ctrl-btn" onClick={() => setDocIdx((i) => Math.max(i - 1, 0))} disabled={docIdx === 0}>‹</button>
              <button className="doc-ctrl-btn" onClick={() => setDocIdx((i) => Math.min(i + 1, docs.length - 1))} disabled={docIdx === docs.length - 1}>›</button>
            </>
          )}
          <button className="doc-ctrl-btn" onClick={onClose} style={{ background: "rgba(220,38,38,0.25)", marginLeft: 4 }}>✕</button>
        </div>
      </div>
      <div className="doc-viewer-body">
        {docs.length > 1 && (
          <div className="doc-viewer-sidebar">
            {docs.map((d, i) => (
              <button key={i} className={`doc-thumb-btn ${i === docIdx ? "active" : ""}`} onClick={() => setDocIdx(i)}>
                <span style={{ fontSize: 15 }}>{d.fileType === "pdf" ? "📄" : "🖼️"}</span>
                <span style={{ display: "block", marginTop: 3, fontSize: 11 }}>{d.label}</span>
              </button>
            ))}
          </div>
        )}
        <div
          ref={mainRef}
          className={`doc-viewer-main ${dragging ? "grabbing" : ""}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onDoubleClick={() => {
            if (zoomIdx < ZOOM_LEVELS.length - 1) setZoomIdx((i) => i + 1);
            else { setZoomIdx(DEFAULT_ZOOM_IDX); setPan({ x: 0, y: 0 }); }
          }}
        >
          <div className="doc-img-wrap" style={{ transform: `scale(${zoom}) translate(${pan.x / zoom}px,${pan.y / zoom}px)` }}>
            {doc.fileType === "pdf" ? (
              <div className="doc-pdf-placeholder">
                <div style={{ fontSize: 56, marginBottom: 14 }}>📄</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 6 }}>{doc.name}</div>
                <div style={{ fontSize: 12, color: "#888" }}>{doc.label}</div>
              </div>
            ) : (
              <img className="doc-img" src={doc.previewUrl} alt={doc.label} draggable={false} />
            )}
          </div>
          <div className="doc-page-indicator">scroll ซูม · ดับเบิ้ลคลิกซูมเข้า · ลากเลื่อน · Esc ปิด</div>
        </div>
      </div>
    </div>
  );
}

export function DocList({ docs, onView }) {
  if (!docs || docs.length === 0)
    return <div style={{ fontSize: 13, color: "var(--text3)", fontStyle: "italic", padding: "8px 0" }}>ไม่มีเอกสารแนบ</div>;
  return (
    <div>
      {docs.map((doc, i) => (
        <div key={i} className="doc-item">
          <div className="doc-item-info">
            <span className="doc-item-label">{doc.fileType === "pdf" ? "📄" : "🖼️"} {doc.label}</span>
            <span className="doc-item-name">{doc.name}</span>
          </div>
          <button className="doc-view-btn" onClick={() => onView(i)}>🔍 ดูเอกสาร</button>
        </div>
      ))}
    </div>
  );
}
