import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShopCard, SkeletonGrid, Pagination } from "../components/shared/UIComponents";
import useShopSearch from "../hooks/useShopSearch";

const CATEGORIES = ["ทั้งหมด", "อาหาร", "ขนม", "เครื่องดื่ม"];
const TIER_FILTERS = [
  { val: "all", label: "ทุกร้าน" },
  { val: "tier1+", label: "⚪ ขั้น 1+" },
  { val: "tier2+", label: "🔵 ขั้น 2+" },
  { val: "tier3", label: "🥇 ขั้น 3" },
  { val: "blacklist", label: "⛔ Blacklist" },
];

export default function ShopListPage() {
  const navigate = useNavigate();
  const [inputVal, setInputVal] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ทั้งหมด");
  const [tierFilter, setTierFilter] = useState("all");
  const [showClosed, setShowClosed] = useState(false);
  const [page, setPage] = useState(1);

  const { items, totalItems, totalPages, currentPage, loading, error } =
    useShopSearch({ query, category, page, tierFilter, showClosed });

  const handleNavigate = (path, shop) => {
    navigate(`/shop/${shop.ref_id ?? shop.id}`, { state: { shop } });
  };

  return (
    <div className="page">
      {/* Filter bar */}
      <div
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          padding: "16px 24px",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div
            className="search-box"
            style={{ marginBottom: 14, maxWidth: "100%" }}
          >
            <input
              className="search-input"
              placeholder="ค้นหาชื่อร้านค้า..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setQuery(inputVal);
                  setPage(1);
                }
              }}
            />
            <button
              className="search-btn"
              onClick={() => {
                setQuery(inputVal);
                setPage(1);
              }}
            >
              🔍
            </button>
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: "var(--text3)",
                fontWeight: 700,
                marginRight: 4,
              }}
            >
              หมวดหมู่:
            </span>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                className={`pill ${category === c ? "active" : ""}`}
                style={{ padding: "5px 12px", fontSize: 12 }}
                onClick={() => {
                  setCategory(c);
                  setPage(1);
                }}
              >
                {c}
              </button>
            ))}

            <div
              style={{
                width: 1,
                height: 20,
                background: "var(--border2)",
                margin: "0 4px",
              }}
            />

            <span
              style={{
                fontSize: 12,
                color: "var(--text3)",
                fontWeight: 700,
                marginRight: 4,
              }}
            >
              ระดับ:
            </span>
            {TIER_FILTERS.map((f) => (
              <button
                key={f.val}
                className={`pill ${tierFilter === f.val ? "active" : ""}`}
                style={{ padding: "5px 12px", fontSize: 12 }}
                onClick={() => {
                  setTierFilter(f.val);
                  setPage(1);
                }}
              >
                {f.label}
              </button>
            ))}

            <div
              style={{
                width: 1,
                height: 20,
                background: "var(--border2)",
                margin: "0 4px",
              }}
            />
            <button
              className={`pill ${showClosed ? "active" : ""}`}
              style={{ padding: "5px 12px", fontSize: 12 }}
              onClick={() => {
                setShowClosed((v) => !v);
                setPage(1);
              }}
            >
              🔒 รวมร้านปิด
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="section" style={{ paddingTop: 24 }}>
        <div className="section-header">
          <div>
            <div className="section-title">รายการร้านค้า</div>
            <div className="section-sub">
              {loading
                ? "กำลังโหลด..."
                : `พบ ${totalItems} ร้านค้า · หน้า ${currentPage} / ${totalPages}`}
            </div>
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: 20,
              color: "var(--red)",
              background: "var(--red-light)",
              borderRadius: 12,
              marginBottom: 20,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <SkeletonGrid />
        ) : items.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "var(--text3)",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <p>ไม่พบร้านค้า</p>
          </div>
        ) : (
          <>
            <div className="shop-grid">
              {items.map((s, i) => (
                <ShopCard
                  key={s.ref_id ?? i}
                  shop={s}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onChange={(p) => {
                setPage(p);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
