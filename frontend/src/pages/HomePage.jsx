import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShopCard, SkeletonGrid, Pagination } from "../components/shared/UIComponents";
import useShopSearch from "../hooks/useShopSearch";
import { ITEMS_PER_PAGE } from "../utils/helpers";

const CATEGORIES = ["ทั้งหมด", "อาหาร", "ขนม", "เครื่องดื่ม"];

export default function HomePage() {
  const navigate = useNavigate();
  const [inputVal, setInputVal] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ทั้งหมด");
  const [searchPage, setSearchPage] = useState(1);
  const isSearching = query !== "" || category !== "ทั้งหมด";

  const { items: featured, loading: loadFeatured } = useShopSearch({
    query: "",
    category: "ทั้งหมด",
    page: 1,
    featuredOnly: true,
  });

  const {
    items: results,
    totalItems,
    totalPages,
    currentPage,
    loading: loadSearch,
  } = useShopSearch({
    query,
    category,
    page: searchPage,
    tierFilter: "all",
    showClosed: true,
  });

  const handleSearch = () => {
    setQuery(inputVal);
    setSearchPage(1);
  };

  const handleClearSearch = () => {
    setInputVal("");
    setQuery("");
    setCategory("ทั้งหมด");
    setSearchPage(1);
  };

  // ShopCard expects onNavigate(path, data) — we push to /shop/:id with state
  const handleNavigate = (path, shop) => {
    navigate(`/shop/${shop.ref_id ?? shop.id}`, { state: { shop } });
  };

  return (
    <div className="page">
      <div className="hero">
        <h1 className="hero-title">
          ค้นหาร้านค้าที่คุณ<span>ไว้วางใจ</span>
        </h1>
        <p className="hero-sub">
          ค้นหาร้านค้าที่ผ่านการยืนยันตัวตนแล้ว ปลอดภัย มั่นใจ
        </p>
        <div className="search-box">
          <input
            className="search-input"
            placeholder="พิมพ์ชื่อร้าน..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          {isSearching && (
            <button
              onClick={handleClearSearch}
              style={{
                padding: "0 14px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--text3)",
                fontSize: 18,
              }}
            >
              ✕
            </button>
          )}
          <button className="search-btn" onClick={handleSearch}>
            🔍
          </button>
        </div>
      </div>

      <div className="section home-results">
        {isSearching && (
          <div className="category-pills">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                className={`pill ${category === c ? "active" : ""}`}
                onClick={() => {
                  setCategory(c);
                  setSearchPage(1);
                }}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        <div className="section-header">
          <div>
            <div className="section-title">
              {isSearching
                ? `ผลการค้นหา "${query || "ทุกร้าน"}"`
                : "⭐ ร้านค้าแนะนำ"}
            </div>
            <div className="section-sub">
              {isSearching
                ? loadSearch
                  ? "กำลังโหลด..."
                  : `พบ ${totalItems} ร้านค้า · หน้า ${currentPage} / ${totalPages}`
                : "คัดสรรจากร้านที่มีคะแนนสูง"}
            </div>
          </div>
          {isSearching && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={handleClearSearch}
            >
              ✕ ล้าง
            </button>
          )}
        </div>

        {isSearching ? (
          loadSearch ? (
            <SkeletonGrid count={ITEMS_PER_PAGE} />
          ) : results.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "var(--text3)",
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <p>ไม่พบร้านค้าที่ตรงกับการค้นหา</p>
              <button
                className="btn btn-ghost btn-sm"
                style={{ marginTop: 16 }}
                onClick={handleClearSearch}
              >
                กลับร้านแนะนำ
              </button>
            </div>
          ) : (
            <>
              <div className="shop-grid">
                {results.map((s, i) => (
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
                  setSearchPage(p);
                  document
                    .querySelector(".home-results")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              />
            </>
          )
        ) : loadFeatured ? (
          <SkeletonGrid count={10} />
        ) : (
          <div className="shop-grid">
            {featured.map((s, i) => (
              <ShopCard
                key={s.ref_id ?? i}
                shop={s}
                onNavigate={handleNavigate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
