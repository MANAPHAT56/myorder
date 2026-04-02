import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { TierBadge, SkeletonGrid } from "../components/shared/UIComponents";
import api from "../api/api";
import { tierOf, COOLDOWN_DAYS } from "../utils/helpers";

// ── UpgradeCooldownBanner ─────────────────────────────────────
function UpgradeCooldownBanner({ shopRefId }) {
  const [status, setStatus] = useState("loading");
  const [daysLeft, setDaysLeft] = useState(0);
  const [lastRejectedDate, setLastRejectedDate] = useState(null);

  useEffect(() => {
    if (!shopRefId) return;
    api
      .getShopUpgradeRequests(shopRefId)
      .then((data) => {
        const list = Array.isArray(data) ? data : data.data ?? [];
        const rejected = list
          .filter((r) => r.status === "rejected")
          .sort(
            (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
          );
        if (rejected.length === 0) {
          setStatus("ok");
          return;
        }
        const latest = rejected[0];
        const rejectedAt = new Date(latest.updated_at || latest.created_at);
        const diffDays = Math.floor(
          (new Date() - rejectedAt) / 86400000
        );
        const left = COOLDOWN_DAYS - diffDays;
        setLastRejectedDate(
          rejectedAt.toLocaleDateString("th-TH", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        );
        if (left > 0) {
          setDaysLeft(left);
          setStatus("in_cooldown");
        } else {
          setStatus("ok");
        }
      })
      .catch(() => setStatus("error"));
  }, [shopRefId]);

  if (status === "loading")
    return (
      <div className="alert alert-info" style={{ marginTop: 12 }}>
        ⏳ กำลังตรวจสอบสถานะ...
      </div>
    );
  if (status === "error" || status === "ok") return null;

  return (
    <div
      className="alert alert-error"
      style={{
        marginTop: 12,
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 6,
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 14 }}>
        ⏳ ร้านนี้อยู่ในช่วง Cooldown การขอเลื่อนขั้น
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.7 }}>
        คำขอเลื่อนขั้นถูกปฏิเสธครบ 3 ครั้งแล้ว
        <br />
        {lastRejectedDate && (
          <>
            ครั้งล่าสุดถูกปฏิเสธเมื่อ:{" "}
            <strong>{lastRejectedDate}</strong>
            <br />
          </>
        )}
        ต้องรออีก <strong>{daysLeft} วัน</strong> ({COOLDOWN_DAYS}{" "}
        วันนับจากครั้งล่าสุด)
      </div>
    </div>
  );
}

// ── ShopDetailPage ────────────────────────────────────────────
export default function ShopDetailPage({ user, notify }) {
  const { refId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [shop, setShop] = useState(location.state?.shop ?? null);
  const [shopLoading, setShopLoading] = useState(!location.state?.shop);

  useEffect(() => {
    if (!refId) {
      setShopLoading(false);
      return;
    }
    api
      .getShopDetail(refId)
      .then((res) => {
        setShop(res.data ? res.data : res);
        setShopLoading(false);
      })
      .catch(() => setShopLoading(false));
  }, [refId]);

  const [showClaim, setShowClaim] = useState(false);
  const [claim, setClaim] = useState({
    fraud_type_id: "",
    reason: "",
    contact_info: "",
  });
  const [claimAttachments, setClaimAttachments] = useState([
    { id: Date.now(), file: null },
  ]);
  const [sending, setSending] = useState(false);

  const canClaim = user !== null;

  const addClaimAtt = () =>
    setClaimAttachments((p) => [...p, { id: Date.now(), file: null }]);
  const removeClaimAtt = (id) =>
    setClaimAttachments((p) => p.filter((a) => a.id !== id));
  const updateClaimAtt = (id, file) =>
    setClaimAttachments((p) =>
      p.map((a) => (a.id === id ? { ...a, file } : a))
    );
  const resetClaim = () => {
    setClaim({ fraud_type_id: "", reason: "", contact_info: "" });
    setClaimAttachments([{ id: Date.now(), file: null }]);
  };

  const handleClaim = async () => {
    if (!claim.fraud_type_id || !claim.reason || !claim.contact_info) return;
    setSending(true);
    try {
      const fd = new FormData();
      fd.append("fraud_type_id", claim.fraud_type_id);
      fd.append("reason", claim.reason);
      fd.append("contact_info", claim.contact_info);
      claimAttachments
        .filter((a) => a.file)
        .forEach((a) => fd.append("attachments[]", a.file));
      await api.claimShop(shop.ref_id ?? shop.id, fd);
      setShowClaim(false);
      notify("ส่งเรื่องเคลมเรียบร้อยแล้ว ทีมงานจะติดต่อกลับ", "success");
      resetClaim();
    } catch (e) {
      notify("ส่งเคลมไม่สำเร็จ: " + e.message, "error");
    } finally {
      setSending(false);
    }
  };

  if (shopLoading)
    return (
      <div className="page">
        <div className="section" style={{ paddingTop: 24 }}>
          <SkeletonGrid count={1} />
        </div>
      </div>
    );
  if (!shop) return null;

  const tier = tierOf(shop);
  const isClosed = !shop.is_active;
  const isBlacklist = shop.is_blacklist;
  const failedCount = shop.failed_upgrade_count ?? 0;
  const shopRefId = shop.ref_id ?? shop.id;
  const tierDesc = {
    1: "ร้านค้าทั่วไป ยังไม่ได้ยืนยันตัวตน",
    2: "ยืนยันตัวตนระดับเอกสาร",
    3: "ยืนยันตัวตนสูงสุด",
  };

  // Lazy import Modal only when needed
  const ClaimModal = showClaim ? (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && setShowClaim(false)}
    >
      <div className="modal modal-wide">
        <div className="modal-header">
          <h3>⚖️ เคลมปัญหากับร้านค้า</h3>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={() => {
              setShowClaim(false);
              resetClaim();
            }}
          >
            ✕
          </button>
        </div>
        <div className="modal-body">
          <div className="alert alert-info" style={{ marginBottom: 16 }}>
            💬 ระบุช่องทางติดต่อกลับ ทีมงานจะช่วยประสานงานให้
          </div>
          <div className="form-group">
            <label className="form-label">ประเภทปัญหา *</label>
            <select
              className="input"
              value={claim.fraud_type_id}
              onChange={(e) =>
                setClaim((p) => ({ ...p, fraud_type_id: e.target.value }))
              }
            >
              <option value="">-- เลือกประเภท --</option>
              <option value="1">สินค้าไม่ตรงรูป</option>
              <option value="2">โกงเงิน / ไม่ส่งของ</option>
              <option value="3">ร้านค้าปลอม</option>
              <option value="4">ข้อมูลร้านค้าผิด</option>
              <option value="5">อื่นๆ</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">รายละเอียดปัญหา *</label>
            <textarea
              className="input textarea"
              placeholder="อธิบายปัญหาที่ต้องการเคลม..."
              value={claim.reason}
              onChange={(e) =>
                setClaim((p) => ({ ...p, reason: e.target.value }))
              }
            />
          </div>
          <div className="form-group">
            <label className="form-label">ช่องทางติดต่อกลับ *</label>
            <input
              className="input"
              placeholder="เช่น LINE: @yourlineid หรือ 081-234-5678"
              value={claim.contact_info}
              onChange={(e) =>
                setClaim((p) => ({ ...p, contact_info: e.target.value }))
              }
            />
          </div>
          <div className="form-group">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <label className="form-label" style={{ margin: 0 }}>
                แนบหลักฐาน
              </label>
              <button
                className="btn btn-ghost btn-sm"
                onClick={addClaimAtt}
                style={{ color: "var(--accent)", fontSize: 13 }}
              >
                ＋ เพิ่มไฟล์
              </button>
            </div>
            {claimAttachments.map((att, idx) => (
              <div
                key={att.id}
                style={{
                  display: "flex",
                  gap: 8,
                  marginBottom: 8,
                  alignItems: "center",
                  background: "var(--surface2)",
                  padding: "8px 10px",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--text3)",
                    minWidth: 20,
                    textAlign: "center",
                    fontWeight: 700,
                  }}
                >
                  {idx + 1}
                </span>
                <label
                  className={`btn btn-sm ${att.file ? "btn-success" : "btn-outline"}`}
                  style={{ margin: 0, cursor: "pointer", fontSize: 12 }}
                >
                  {att.file ? "✅ เลือกแล้ว" : "📎 เลือกไฟล์"}
                  <input
                    type="file"
                    style={{ display: "none" }}
                    accept="image/*,.pdf"
                    onChange={(e) =>
                      updateClaimAtt(att.id, e.target.files[0])
                    }
                  />
                </label>
                {att.file && (
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--text3)",
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {att.file.name}
                  </span>
                )}
                {claimAttachments.length > 1 && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => removeClaimAtt(att.id)}
                    style={{ color: "var(--red)", padding: "4px 8px" }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 6 }}>
              PNG, JPG, PDF ขนาดไม่เกิน 10MB
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setShowClaim(false);
              resetClaim();
            }}
          >
            ยกเลิก
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleClaim}
            disabled={
              !claim.fraud_type_id ||
              !claim.reason ||
              !claim.contact_info ||
              sending
            }
          >
            {sending ? "กำลังส่ง..." : "ส่งเรื่องเคลม"}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="page">
      <div className="section" style={{ paddingTop: 24 }}>
        <button
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: 16 }}
          onClick={() => navigate(-1)}
        >
          ← กลับ
        </button>

        <div className="shop-detail-hero">
          <div className="shop-emoji">{shop.img_emoji ?? "🏪"}</div>
          <div className="shop-detail-info">
            <div className="shop-detail-name">{shop.name}</div>
            <div className="shop-detail-meta">
              <TierBadge tier={tier} />
              <span className="badge badge-gray">
                {shop.category ?? shop.channel ?? "ไม่ระบุ"}
              </span>
              <span
                className="badge"
                style={{
                  background: shop.is_company ? "#ede9fe" : "#fce7f3",
                  color: shop.is_company ? "#6d28d9" : "#be185d",
                  border: `1px solid ${
                    shop.is_company ? "#c4b5fd" : "#fbcfe8"
                  }`,
                }}
              >
                {shop.is_company ? "🏢 นิติบุคคล" : "👤 บุคคลธรรมดา"}
              </span>
            </div>
            {shop.description && (
              <p className="shop-detail-desc">{shop.description}</p>
            )}

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginBottom: 8,
              }}
            >
              {!isClosed &&
                !isBlacklist &&
                (shop.url || shop.link) && (
                  <a
                    href={shop.url ?? shop.link}
                    className="btn btn-primary"
                    target="_blank"
                    rel="noreferrer"
                  >
                    🔗 ติดต่อร้านค้า
                  </a>
                )}
              <button
                className="btn btn-outline"
                style={{
                  borderColor: "var(--blue)",
                  color: "var(--blue)",
                }}
                onClick={() => {
                  if (!canClaim) {
                    notify(
                      "กรุณาเข้าสู่ระบบก่อนยื่นเรื่องเคลม",
                      "error"
                    );
                    return;
                  }
                  setShowClaim(true);
                }}
              >
                ⚖️ เคลมปัญหา
                {!canClaim && (
                  <span
                    style={{
                      fontSize: 11,
                      marginLeft: 4,
                      opacity: 0.7,
                    }}
                  >
                    (ต้องล็อกอิน)
                  </span>
                )}
              </button>
            </div>

            {isClosed && (
              <div className="alert alert-warn" style={{ marginTop: 4 }}>
                🔒 ร้านนี้ปิดบริการแล้ว
              </div>
            )}
            {isBlacklist && (
              <div className="alert alert-error" style={{ marginTop: 4 }}>
                ⛔ ร้านนี้ถูกระงับจากระบบ
              </div>
            )}
            {failedCount >= 3 && (
              <UpgradeCooldownBanner shopRefId={shopRefId} />
            )}
          </div>
        </div>

        {/* Tier verification */}
        <div className="dash-card" style={{ marginBottom: 16 }}>
          <div className="dash-card-title">ระดับการยืนยันตัวตน</div>
          <div className="dash-card-sub">
            ระดับความน่าเชื่อถือของร้านค้านี้
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[1, 2, 3].map((t) => (
              <div
                key={t}
                style={{
                  flex: 1,
                  minWidth: 160,
                  padding: "14px 16px",
                  background:
                    t === tier
                      ? "var(--accent-light)"
                      : "var(--surface2)",
                  border: `1.5px solid ${
                    t === tier ? "var(--accent)" : "var(--border)"
                  }`,
                  borderRadius: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <TierBadge tier={t} />
                  {t === tier && (
                    <span
                      style={{
                        fontSize: 11,
                        background: "var(--accent)",
                        color: "#fff",
                        padding: "1px 7px",
                        borderRadius: 100,
                        fontWeight: 700,
                      }}
                    >
                      ปัจจุบัน
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: "var(--text2)" }}>
                  {tierDesc[t]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="dash-card">
          <div className="detail-row">
            <div className="detail-label">📅 สร้างเมื่อ</div>
            <div className="detail-value">{shop.created_at ?? "—"}</div>
          </div>
          <div className="detail-row">
            <div className="detail-label">📍 ที่อยู่</div>
            <div className="detail-value">{shop.location ?? "—"}</div>
          </div>
          <div className="detail-row">
            <div className="detail-label">👤 ประเภท</div>
            <div className="detail-value">
              {shop.is_company ? "นิติบุคคล" : "บุคคลธรรมดา"}
            </div>
          </div>
          <div className="detail-row">
            <div className="detail-label">🏷️ สถานะ</div>
            <div className="detail-value">
              {isBlacklist ? (
                <span className="badge badge-red">⛔ ถูกระงับ</span>
              ) : isClosed ? (
                <span className="badge badge-gray">🔒 ปิดบริการ</span>
              ) : (
                <span className="badge badge-green">✓ เปิดให้บริการ</span>
              )}
            </div>
          </div>
          {!isClosed && !isBlacklist && (shop.url || shop.link) && (
            <div className="detail-row">
              <div className="detail-label">🔗 ลิงก์</div>
              <div className="detail-value">
                <a
                  href={shop.url ?? shop.link}
                  style={{ color: "var(--accent)" }}
                  target="_blank"
                  rel="noreferrer"
                >
                  {shop.url ?? shop.link}
                </a>
              </div>
            </div>
          )}
          {failedCount > 0 && (
            <div className="detail-row">
              <div className="detail-label">📊 ขอเลื่อนขั้นไม่ผ่าน</div>
              <div className="detail-value">
                <span
                  style={{
                    color:
                      failedCount >= 3
                        ? "var(--red)"
                        : "var(--yellow)",
                    fontWeight: 700,
                  }}
                >
                  {failedCount} / 3 ครั้ง
                </span>
                {failedCount >= 3 && (
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 12,
                      color: "var(--text3)",
                    }}
                  >
                    (cooldown {COOLDOWN_DAYS} วัน)
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {ClaimModal}
    </div>
  );
}
