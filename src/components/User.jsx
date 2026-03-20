import { useState, useEffect, useRef } from "react";

// ============================================================
// API CONFIG — เปลี่ยน BASE_URL เป็น PHP server
// ============================================================
const API_BASE = "https://your-php-server.com/api";

const api = {
  loginGoogle: (token) => fetch(`${API_BASE}/auth/google`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) }).then(r => r.json()),
  getProfile: () => fetch(`${API_BASE}/user/profile`, { headers: authHeaders() }).then(r => r.json()),
  searchShops: (q, page = 1) => fetch(`${API_BASE}/shops?q=${encodeURIComponent(q)}&page=${page}`).then(r => r.json()),
  getFeaturedShops: () => fetch(`${API_BASE}/shops/featured`).then(r => r.json()),
  getShopDetail: (id) => fetch(`${API_BASE}/shops/${id}`).then(r => r.json()),
  reportShop: (id, data) => fetch(`${API_BASE}/shops/${id}/report`, { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify(data) }).then(r => r.json()),
  getMyShop: () => fetch(`${API_BASE}/my-shop`, { headers: authHeaders() }).then(r => r.json()),
  updateMyShop: (data) => fetch(`${API_BASE}/my-shop`, { method: "PATCH", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify(data) }).then(r => r.json()),
  checkUpgradeEligibility: (tier) => fetch(`${API_BASE}/my-shop/upgrade/check?tier=${tier}`, { headers: authHeaders() }).then(r => r.json()),
  submitUpgrade: (formData) => fetch(`${API_BASE}/my-shop/upgrade`, { method: "POST", headers: authHeaders(), body: formData }).then(r => r.json()),
};

const authHeaders = () => {
  const t = localStorage.getItem("user_token");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

// ============================================================
// USER ROLES (ตาม Use Cases)
// ============================================================
// ผู้เยี่ยมชม (visitor)  — ไม่ได้ login → user = null
// ผู้ใช้ (user)          — login แล้ว ไม่มีร้าน → user.role = "user"
// ร้านค้า (shop)         — login แล้ว มีร้าน   → user.role = "shop"
// แอดมิน (admin)         — login แล้ว เป็นแอดมิน → user.role = "admin"

// ============================================================
// MOCK DATA
// ============================================================

// Mock user ที่ยังไม่มีร้านค้า (role = "user") — ใช้ UC12, UC14, UC15, UC18
const MOCK_USER_NO_SHOP = {
  id: "USR0042",
  name: "ปิยะ ใจดี",
  email: "piya@gmail.com",
  avatar: null,
  role: "user",   // ผู้ใช้ทั่วไป ยังไม่มีร้าน
};

// Mock user ที่มีร้านค้า (role = "shop") — ใช้ UC15, UC16, UC17, UC19, UC20
const MOCK_USER_WITH_SHOP = {
  id: "USR0099",
  name: "สมชาย มีร้าน",
  email: "somchai@gmail.com",
  avatar: null,
  role: "shop",   // เจ้าของร้านค้าในระบบ
};

// สลับ mock user ตรงนี้เพื่อทดสอบ
// const MOCK_USER = MOCK_USER_NO_SHOP;
const MOCK_USER = MOCK_USER_WITH_SHOP;

const MOCK_SHOPS_ALL = [
  { id: 1,  name: "ร้านข้าวมันไก่สมชาย",      category: "อาหาร",      tier: 3, entity_type: "individual", link: "https://line.me/shop1",  description: "ข้าวมันไก่ต้มและทอด สูตรโบราณ รสชาติเข้มข้น เปิดมากว่า 20 ปี",              rating: 4.8, reviews: 312, verified: true,  location: "สุขุมวิท 11, กรุงเทพฯ",  is_closed: false, is_blacklisted: false, img_emoji: "🍗", tags: ["ข้าว","ไก่","อาหารจานเดียว"] },
  { id: 2,  name: "ก๋วยเตี๋ยวเรือป้าแดง",      category: "อาหาร",      tier: 2, entity_type: "company",    link: "https://line.me/shop2",  description: "ก๋วยเตี๋ยวเรือสูตรดั้งเดิม น้ำซุปเข้มข้น หมูนุ่มลูกชิ้นเด้ง",             rating: 4.6, reviews: 187, verified: true,  location: "รามคำแหง 24, กรุงเทพฯ",  is_closed: false, is_blacklisted: false, img_emoji: "🍜", tags: ["ก๋วยเตี๋ยว","หมู","เรือ"] },
  { id: 3,  name: "ขนมครกบ้านนา",              category: "ขนม",        tier: 1, entity_type: "individual", link: "https://line.me/shop3",  description: "ขนมครกหอมมะพร้าว ใส่ต้นหอมหน้าขาว ทำสดทุกวัน",                           rating: 4.3, reviews: 94,  verified: false, location: "ลาดพร้าว 41, กรุงเทพฯ",  is_closed: false, is_blacklisted: false, img_emoji: "🥥", tags: ["ขนม","มะพร้าว","ของหวาน"] },
  { id: 4,  name: "ส้มตำอีสานแม่ตุ๋ย",        category: "อาหาร",      tier: 2, entity_type: "individual", link: "https://line.me/shop4",  description: "ส้มตำ ลาบ ก้อยรสเด็ด แซ่บอีหลี ข้าวเหนียวหุงใหม่ทุกวัน",              rating: 4.7, reviews: 256, verified: true,  location: "พระโขนง, กรุงเทพฯ",      is_closed: false, is_blacklisted: false, img_emoji: "🥗", tags: ["ส้มตำ","อีสาน","แซ่บ"] },
  { id: 5,  name: "ชานมไข่มุกไต้หวันแท้",     category: "เครื่องดื่ม", tier: 3, entity_type: "company",   link: "https://line.me/shop5",  description: "ชานมไข่มุกไต้หวันแบบดั้งเดิม ไข่มุกทำเอง หวานน้อยได้",                  rating: 4.9, reviews: 523, verified: true,  location: "ทองหล่อ, กรุงเทพฯ",      is_closed: false, is_blacklisted: false, img_emoji: "🧋", tags: ["ชานม","ไข่มุก","เครื่องดื่ม"] },
  { id: 6,  name: "ปาท่องโก๋กรอบน้อย",        category: "ขนม",        tier: 1, entity_type: "individual", link: "https://line.me/shop6",  description: "ปาท่องโก๋ทอดสด กรอบนอกนุ่มใน เสิร์ฟคู่นมถั่วเหลืองร้อนๆ",             rating: 4.2, reviews: 67,  verified: false, location: "อ่อนนุช, กรุงเทพฯ",       is_closed: false, is_blacklisted: false, img_emoji: "🍩", tags: ["ปาท่องโก๋","ของเช้า","ทอด"] },
  { id: 7,  name: "ร้านหมูกระทะแซ่บโอ้โห",    category: "อาหาร",      tier: 2, entity_type: "company",    link: "https://line.me/shop7",  description: "หมูกระทะบุฟเฟ่ต์ไม่อั้น เนื้อสดใหม่ทุกวัน น้ำจิ้มสูตรพิเศษ",          rating: 4.5, reviews: 445, verified: true,  location: "บางนา, กรุงเทพฯ",        is_closed: false, is_blacklisted: false, img_emoji: "🥩", tags: ["หมูกระทะ","บุฟเฟ่ต์","เนื้อ"] },
  { id: 8,  name: "กาแฟดริปคั่วสด",            category: "เครื่องดื่ม", tier: 2, entity_type: "individual", link: "https://line.me/shop8", description: "กาแฟดริปจากเมล็ดคั่วสด ออร์เดอร์ได้ทุกสายพันธุ์ ส่งทั่วไทย",              rating: 4.7, reviews: 198, verified: true,  location: "เชียงใหม่",               is_closed: false, is_blacklisted: false, img_emoji: "☕", tags: ["กาแฟ","ดริป","คั่วสด"] },
  { id: 9,  name: "ขนมไทยโบราณแม่สมศรี",      category: "ขนม",        tier: 1, entity_type: "individual", link: "https://line.me/shop9",  description: "ขนมไทยโบราณ ทองหยิบ ฝอยทอง มัสหมั่น ทำสั่งได้ล่วงหน้า",              rating: 4.4, reviews: 112, verified: false, location: "นนทบุรี",                 is_closed: false, is_blacklisted: false, img_emoji: "🍮", tags: ["ขนมไทย","โบราณ","สั่งทำ"] },
  { id: 10, name: "น้ำผลไม้ปั่นสดคุณวิไล",    category: "เครื่องดื่ม", tier: 1, entity_type: "individual", link: "https://line.me/shop10", description: "น้ำผลไม้ปั่นสด ไม่ผสมน้ำตาล 100% ผลไม้แท้ มีเดลิเวอรี่",              rating: 4.1, reviews: 43,  verified: false, location: "มีนบุรี, กรุงเทพฯ",       is_closed: false, is_blacklisted: false, img_emoji: "🍹", tags: ["น้ำผลไม้","สด","สุขภาพ"] },
  { id: 11, name: "ข้าวหน้าเป็ดพะโล้",         category: "อาหาร",      tier: 3, entity_type: "company",    link: "https://line.me/shop11", description: "ข้าวหน้าเป็ดพะโล้ เนื้อนุ่มหอมเครื่องเทศ สูตรต้นตำรับจีนแท้",         rating: 4.8, reviews: 389, verified: true,  location: "เยาวราช, กรุงเทพฯ",      is_closed: false, is_blacklisted: false, img_emoji: "🦆", tags: ["เป็ด","พะโล้","จีน"] },
  { id: 12, name: "คุกกี้อบสดออเดอร์เมด",      category: "ขนม",        tier: 2, entity_type: "individual", link: "https://line.me/shop12", description: "คุกกี้อบสดสั่งทำได้ ทุกรสชาติ ใส่กล่องของขวัญสวยงาม",               rating: 4.6, reviews: 231, verified: true,  location: "ปทุมธานี",                is_closed: false, is_blacklisted: false, img_emoji: "🍪", tags: ["คุกกี้","อบสด","ของขวัญ"] },
  { id: 13, name: "ลาบหมูดิบสายเหนือ",         category: "อาหาร",      tier: 1, entity_type: "individual", link: "https://line.me/shop13", description: "ลาบคั่วสไตล์เหนือ แซ่บ หอม กินกับข้าวเหนียวร้อนๆ",                   rating: 4.3, reviews: 78,  verified: false, location: "เชียงราย",                is_closed: false, is_blacklisted: false, img_emoji: "🌿", tags: ["ลาบ","เหนือ","แซ่บ"] },
  { id: 14, name: "ชาไทยนมสดสูตรต้นตำรับ",    category: "เครื่องดื่ม", tier: 2, entity_type: "company",   link: "https://line.me/shop14", description: "ชาไทยนมสด สูตรต้นตำรับ ชานมเย็นสีส้มสวย รสชาติเข้มข้น",              rating: 4.5, reviews: 167, verified: true,  location: "สีลม, กรุงเทพฯ",         is_closed: false, is_blacklisted: false, img_emoji: "🧡", tags: ["ชาไทย","นมสด","เย็น"] },
  { id: 15, name: "เค้กวันเกิดสั่งทำพิเศษ",   category: "ขนม",        tier: 3, entity_type: "company",    link: "https://line.me/shop15", description: "เค้กวันเกิด Custom ทุกรูปแบบ รับออเดอร์ล่วงหน้า ส่งทั่วกรุงเทพ",     rating: 4.9, reviews: 602, verified: true,  location: "จตุจักร, กรุงเทพฯ",      is_closed: false, is_blacklisted: false, img_emoji: "🎂", tags: ["เค้ก","วันเกิด","สั่งทำ"] },
  { id: 16, name: "ผัดซีอิ๊วหมูกรอบ",          category: "อาหาร",      tier: 1, entity_type: "individual", link: "https://line.me/shop16", description: "ผัดซีอิ๊วหมูกรอบ เส้นใหญ่ หมูกรอบทอดเอง ไข่ดาวสด",                 rating: 4.0, reviews: 34,  verified: false, location: "ดอนเมือง, กรุงเทพฯ",     is_closed: false, is_blacklisted: false, img_emoji: "🍱", tags: ["ผัดซีอิ๊ว","หมูกรอบ","เส้นใหญ่"] },
  { id: 17, name: "โยเกิร์ตผลไม้สดปั่น",       category: "เครื่องดื่ม", tier: 1, entity_type: "individual", link: "https://line.me/shop17", description: "โยเกิร์ตผลไม้สดปั่น เพื่อสุขภาพ ไม่มีน้ำตาลเพิ่ม มีเดลิเวอรี่",   rating: 4.2, reviews: 55,  verified: false, location: "ลาดกระบัง, กรุงเทพฯ",    is_closed: false, is_blacklisted: false, img_emoji: "🫐", tags: ["โยเกิร์ต","ผลไม้","สุขภาพ"] },
  { id: 18, name: "ข้าวต้มปลาสดเช้าตรู่",      category: "อาหาร",      tier: 2, entity_type: "individual", link: "https://line.me/shop18", description: "ข้าวต้มปลาสด เปิดตี 4 ถึงสาย ปลาสดจากตลาด น้ำซุปใสหอม",             rating: 4.4, reviews: 143, verified: true,  location: "สาทร, กรุงเทพฯ",         is_closed: false, is_blacklisted: false, img_emoji: "🐟", tags: ["ข้าวต้ม","ปลา","เช้า"] },
  { id: 19, name: "มะม่วงน้ำปลาหวานสูตรเด็ด",  category: "ขนม",        tier: 1, entity_type: "individual", link: "https://line.me/shop19", description: "มะม่วงดิบน้ำปลาหวาน กินกับกะปิรสเด็ด ส่งแบบสดวันต่อวัน",            rating: 4.1, reviews: 29,  verified: false, location: "นครปฐม",                 is_closed: false, is_blacklisted: false, img_emoji: "🥭", tags: ["มะม่วง","น้ำปลาหวาน","ผลไม้"] },
  { id: 20, name: "ร้านแกงกะหรี่ญี่ปุ่นแท้",  category: "อาหาร",      tier: 3, entity_type: "company",    link: "https://line.me/shop20", description: "แกงกะหรี่ญี่ปุ่นสไตล์บ้านเรา เนื้อนุ่ม น้ำแกงข้น กินกับข้าวญี่ปุ่น", rating: 4.7, reviews: 278, verified: true,  location: "อารีย์, กรุงเทพฯ",       is_closed: false, is_blacklisted: false, img_emoji: "🍛", tags: ["แกงกะหรี่","ญี่ปุ่น","เนื้อ"] },
  { id: 21, name: "น้ำเต้าหู้ร้อนๆ เช้าเช้า",  category: "เครื่องดื่ม", tier: 1, entity_type: "individual", link: "https://line.me/shop21", description: "น้ำเต้าหู้ร้อนหวานน้อย ปาท่องโก๋กรอบ เปิดเช้า 6 โมง",              rating: 3.9, reviews: 21,  verified: false, location: "สุพรรณบุรี",              is_closed: false, is_blacklisted: false, img_emoji: "🥛", tags: ["น้ำเต้าหู้","เช้า","ร้อน"] },
  { id: 22, name: "พิซซ่าหน้าไทยอินเตอร์",     category: "อาหาร",      tier: 2, entity_type: "company",    link: "https://line.me/shop22", description: "พิซซ่าหน้าไทยสไตล์อินเตอร์ ต้มยำกุ้ง ส้มตำทะเล สั่งเดลิเวอรี่ได้",  rating: 4.3, reviews: 189, verified: true,  location: "รัชดา, กรุงเทพฯ",        is_closed: false, is_blacklisted: false, img_emoji: "🍕", tags: ["พิซซ่า","หน้าไทย","เดลิเวอรี่"] },
  { id: 23, name: "บราวนี่ชอคโกแลตเข้มข้น",    category: "ขนม",        tier: 2, entity_type: "individual", link: "https://line.me/shop23", description: "บราวนี่ชอคเข้มข้น ฟัดจ์กลาง กรอบนอกนุ่มใน อบสดทุกออเดอร์",        rating: 4.5, reviews: 134, verified: true,  location: "ประชาอุทิศ, กรุงเทพฯ",   is_closed: false, is_blacklisted: false, img_emoji: "🍫", tags: ["บราวนี่","ชอคโกแลต","อบสด"] },
  { id: 24, name: "โซดาน้ำผึ้งมะนาวสดชื่น",    category: "เครื่องดื่ม", tier: 1, entity_type: "individual", link: "https://line.me/shop24", description: "โซดาน้ำผึ้งมะนาวสด ไม่มีน้ำตาลทราย หวานธรรมชาติ รีเฟรชมาก",       rating: 4.0, reviews: 18,  verified: false, is_closed: false, is_blacklisted: false, location: "ลำลูกกา, ปทุมธานี",      img_emoji: "🍋", tags: ["โซดา","มะนาว","สดชื่น"] },
  { id: 25, name: "ร้านข้าวผัดหมูกรอบปิดไปแล้ว", category: "อาหาร",  tier: 2, entity_type: "individual", link: "https://line.me/shop25", description: "ข้าวผัดหมูกรอบสูตรโบราณ เปิดมา 15 ปี ปัจจุบันปิดบริการแล้ว",      rating: 4.3, reviews: 201, verified: true,  is_closed: true,  is_blacklisted: false, location: "บางกอกน้อย, กรุงเทพฯ",   img_emoji: "🍚", tags: ["ข้าวผัด","หมูกรอบ","ปิดแล้ว"] },
  { id: 26, name: "ร้านต้มยำโกงเงินลูกค้า",     category: "อาหาร",     tier: 1, entity_type: "individual", link: "https://line.me/shop26", description: "ต้มยำกุ้งน้ำข้น ถูกรายงานและแบนออกจากระบบ",                    rating: 2.1, reviews: 48,  verified: false, is_closed: false, is_blacklisted: true,  location: "มีนบุรี, กรุงเทพฯ",       img_emoji: "🦐", tags: ["ต้มยำ","แบน"] },
  { id: 27, name: "ร้านขนมปลอมแปลงสินค้า",      category: "ขนม",       tier: 1, entity_type: "company",    link: "https://line.me/shop27", description: "ขนมปังแซนด์วิช พบว่าโฆษณาเกินจริงและถูกแบน",                   rating: 1.8, reviews: 22,  verified: false, is_closed: false, is_blacklisted: true,  location: "ลาดพร้าว, กรุงเทพฯ",      img_emoji: "🥪", tags: ["ขนมปัง","แซนด์วิช","แบน"] },
];

// Mock ข้อมูลร้านค้าของ MOCK_USER_WITH_SHOP (role = "shop")
// upgrade_history: เก็บประวัติทุกครั้ง status: "rejected" | "approved" | "pending"
// last_rejected_at: ISO date string ของครั้งล่าสุดที่ถูก rejected (null ถ้ายังไม่เคย)
// failed_count: จำนวนครั้งที่ rejected สะสม (นับเฉพาะ rejected ที่ยังไม่หมดรอบ)
const MOCK_MY_SHOP = {
  id: 10, name: "ร้านผัดไทยนายดี", category: "อาหาร", tier: 1, current_tier: 1,
  entity_type: "individual",
  link: "https://line.me/my-shop",
  description: "ผัดไทยกุ้งสด เส้นเหนียวหนึบ ไข่ห่อ เสิร์ฟพร้อมผักสด",
  rating: 4.5, orders_count: 143,
  is_closed: false, is_blacklisted: false, img_emoji: "🍝",
  // ---- ทดสอบ: เปลี่ยน failed_count และ last_rejected_at เพื่อดูพฤติกรรมต่างๆ ----
  // failed_count: 0 → ยื่นได้ปกติ
  // failed_count: 1-2 → ยื่นได้ปกติ แต่เตือนจำนวนครั้งที่เหลือ
  // failed_count: 3 + last_rejected_at ยังไม่ครบ 1 เดือน → ต้องรอ
  // failed_count: 3 + last_rejected_at ครบ 1 เดือนแล้ว → reset เป็น 0 ยื่นได้ใหม่
  failed_count: 2,
  last_rejected_at: "2568-02-10",   // วันที่ reject ครั้งล่าสุด (YYYY-MM-DD พุทธศักราช หรือจะใช้ ISO ก็ได้)
  upgrade_history: [
    { round: 1, tier_requested: 2, status: "rejected", reason: "เอกสารภาพไม่ชัดเจน",      date: "15/12/2567" },
    { round: 2, tier_requested: 2, status: "rejected", reason: "เอกสารไม่ตรงประเภทที่กำหนด", date: "10/02/2568" },
  ],
  created_at: "01/09/2567",
};

// ============================================================
// PAGINATION
// ============================================================
const USE_MOCK = true;
const ITEMS_PER_PAGE = 8;

function searchShopsMock({ query, category, page, tierFilter = "all", showClosed = false, featuredOnly = false, withPagination = true }) {
  let filtered = MOCK_SHOPS_ALL.filter(s => {
    if (category !== "ทั้งหมด" && s.category !== category) return false;
    if (query !== "" && !s.name.includes(query) && !s.description.includes(query) && !s.tags.some(t => t.includes(query))) return false;
    if (tierFilter === "blacklist") { if (!s.is_blacklisted) return false; }
    else if (tierFilter === "tier1+") { if (s.is_blacklisted || s.tier < 1) return false; }
    else if (tierFilter === "tier2+") { if (s.is_blacklisted || s.tier < 2) return false; }
    else if (tierFilter === "tier3")  { if (s.is_blacklisted || s.tier < 3) return false; }
    if (!showClosed && s.is_closed) return false;
    return true;
  });

  if (featuredOnly) {
    filtered = filtered
      .filter(s => !s.is_blacklisted && !s.is_closed)
      .sort((a, b) => (b.tier * 10 + b.rating) - (a.tier * 10 + a.rating))
      .slice(0, 10);
    return { items: filtered, totalItems: filtered.length, totalPages: 1, currentPage: 1 };
  }

  if (!withPagination) return { items: filtered, totalItems: filtered.length, totalPages: 1, currentPage: 1 };

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const items = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);
  return { items, totalItems, totalPages, currentPage: safePage };
}

async function searchShopsAPI({ query, category, page }) {
  const params = new URLSearchParams({ q: query, category, page, limit: ITEMS_PER_PAGE });
  const res = await fetch(`${API_BASE}/shops?${params}`);
  if (!res.ok) throw new Error("API error " + res.status);
  return res.json();
}

function useShopSearch({ query, category, page, tierFilter = "all", showClosed = false, featuredOnly = false, withPagination = true }) {
  const [state, setState] = useState({ items: [], totalItems: 0, totalPages: 1, currentPage: 1, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    setState(s => ({ ...s, loading: true, error: null }));
    const run = async () => {
      try {
        const result = USE_MOCK
          ? searchShopsMock({ query, category, page, tierFilter, showClosed, featuredOnly, withPagination })
          : await searchShopsAPI({ query, category, page, tierFilter, showClosed });
        if (!cancelled) setState({ ...result, loading: false, error: null });
      } catch (err) {
        if (!cancelled) setState(s => ({ ...s, loading: false, error: err.message }));
      }
    };
    const delay = USE_MOCK ? 0 : 300;
    const timer = setTimeout(run, query && !USE_MOCK ? delay : 0);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [query, category, page, tierFilter, showClosed, featuredOnly, withPagination]);

  return state;
}

// ============================================================
// STYLES
// ============================================================
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700;800&family=Mitr:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #faf8f5; --surface: #ffffff; --surface2: #f5f2ed;
    --border: #e8e2d9; --border2: #d5cdc0;
    --accent: #e85d26; --accent2: #c94d1a;
    --accent-light: #fef3ee; --accent-glow: rgba(232,93,38,0.12);
    --green: #1a9e5e; --green-light: #edfaf3;
    --yellow: #d97706; --yellow-light: #fffbeb;
    --blue: #2563eb; --blue-light: #eff6ff;
    --red: #dc2626; --red-light: #fef2f2;
    --text: #1a1410; --text2: #5c4f42; --text3: #9c8c7c;
    --shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
    --shadow-md: 0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04);
    --shadow-lg: 0 8px 40px rgba(0,0,0,0.12);
    --font: 'Sarabun', sans-serif; --display: 'Mitr', sans-serif;
    --radius: 12px; --radius-sm: 8px;
    --navbar-bg: rgba(250,248,245,0.92);
  }

  [data-theme="dark"] {
    --bg: #0f0e0c; --surface: #1a1815; --surface2: #242220;
    --border: #2e2c28; --border2: #3a3834;
    --accent: #f97316; --accent2: #ea6b10;
    --accent-light: rgba(249,115,22,0.12); --accent-glow: rgba(249,115,22,0.18);
    --green: #22c55e; --green-light: rgba(34,197,94,0.1);
    --yellow: #fbbf24; --yellow-light: rgba(251,191,36,0.1);
    --blue: #60a5fa; --blue-light: rgba(96,165,250,0.1);
    --red: #f87171; --red-light: rgba(248,113,113,0.1);
    --text: #f0ede8; --text2: #b0a898; --text3: #6e6558;
    --shadow: 0 1px 3px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2);
    --shadow-md: 0 4px 20px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.2);
    --shadow-lg: 0 8px 40px rgba(0,0,0,0.6);
    --navbar-bg: rgba(15,14,12,0.92);
  }

  [data-theme="dark"] .badge-tier2 { background: rgba(59,91,219,0.2); color: #93a8f4; border-color: rgba(59,91,219,0.3); }
  [data-theme="dark"] .badge-tier3 { background: rgba(180,83,9,0.2); color: #fbbf24; border-color: rgba(180,83,9,0.3); }
  [data-theme="dark"] .tier-2 { background: rgba(59,91,219,0.1); border-color: rgba(59,91,219,0.25); }
  [data-theme="dark"] .tier-3 { background: rgba(180,83,9,0.1); border-color: rgba(180,83,9,0.25); }
  [data-theme="dark"] .alert-warn { background: rgba(251,191,36,0.1); color: #fde68a; border-color: rgba(251,191,36,0.2); }
  [data-theme="dark"] .alert-success { background: rgba(34,197,94,0.1); color: #86efac; border-color: rgba(34,197,94,0.2); }
  [data-theme="dark"] .alert-error { background: rgba(248,113,113,0.1); color: #fca5a5; border-color: rgba(248,113,113,0.2); }
  [data-theme="dark"] .alert-info { background: rgba(96,165,250,0.1); color: #93c5fd; border-color: rgba(96,165,250,0.2); }
  [data-theme="dark"] .google-btn { background: #2a2826; color: #f0ede8; border-color: #3a3834; }
  [data-theme="dark"] .google-btn:hover { background: #333130; }

  .theme-toggle { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--surface2); border: 1.5px solid var(--border2); cursor: pointer; font-size: 16px; transition: all 0.2s; flex-shrink: 0; }
  .theme-toggle:hover { background: var(--border); transform: rotate(15deg); }

  html, body { height: 100%; background: var(--bg); color: var(--text); font-family: var(--font); font-size: 15px; line-height: 1.6; transition: background 0.2s, color 0.2s; }

  .navbar { position: sticky; top: 0; z-index: 50; background: var(--navbar-bg); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); padding: 0 24px; height: 60px; display: flex; align-items: center; justify-content: space-between; }
  .nav-brand { font-family: var(--display); font-size: 20px; font-weight: 600; color: var(--accent); cursor: pointer; letter-spacing: -0.02em; }
  .nav-brand span { color: var(--text); }
  .nav-right { display: flex; align-items: center; gap: 10px; }

  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: var(--radius-sm); font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.18s; border: 1.5px solid transparent; font-family: var(--font); white-space: nowrap; }
  .btn-primary { background: var(--accent); color: #fff; border-color: var(--accent); }
  .btn-primary:hover { background: var(--accent2); transform: translateY(-1px); box-shadow: 0 4px 12px var(--accent-glow); }
  .btn-outline { background: transparent; color: var(--text); border-color: var(--border2); }
  .btn-outline:hover { background: var(--surface2); border-color: var(--text3); }
  .btn-ghost { background: transparent; color: var(--text2); border-color: transparent; }
  .btn-ghost:hover { background: var(--surface2); }
  .btn-danger { background: var(--red-light); color: var(--red); border-color: rgba(220,38,38,0.2); }
  .btn-danger:hover { background: rgba(220,38,38,0.12); }
  .btn-success { background: var(--green-light); color: var(--green); border-color: rgba(26,158,94,0.2); }
  .btn-sm { padding: 6px 12px; font-size: 13px; }
  .btn-lg { padding: 12px 28px; font-size: 15px; border-radius: var(--radius); }
  .btn-icon { padding: 8px; border-radius: var(--radius-sm); }
  .btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none !important; }

  .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 100px; font-size: 12px; font-weight: 700; }
  .badge-tier1 { background: var(--surface2); color: var(--text3); border: 1px solid var(--border2); }
  .badge-tier2 { background: #e8f0fe; color: #3b5bdb; border: 1px solid #c5d2f6; }
  .badge-tier3 { background: linear-gradient(135deg, #fff7e6, #ffecd2); color: #b45309; border: 1px solid #f6d860; }
  .badge-green { background: var(--green-light); color: var(--green); }
  .badge-red { background: var(--red-light); color: var(--red); }
  .badge-yellow { background: var(--yellow-light); color: var(--yellow); }
  .badge-gray { background: var(--surface2); color: var(--text3); }

  /* Role badges */
  .badge-role-visitor { background: var(--surface2); color: var(--text3); border: 1px solid var(--border2); }
  .badge-role-user    { background: var(--blue-light); color: var(--blue); border: 1px solid rgba(37,99,235,0.2); }
  .badge-role-shop    { background: var(--accent-light); color: var(--accent); border: 1px solid rgba(232,93,38,0.2); }
  .badge-role-admin   { background: var(--red-light); color: var(--red); border: 1px solid rgba(220,38,38,0.2); }

  .input { background: var(--surface); border: 1.5px solid var(--border2); color: var(--text); border-radius: var(--radius-sm); padding: 10px 14px; font-size: 14px; font-family: var(--font); outline: none; transition: border-color 0.18s; width: 100%; }
  .input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }
  .textarea { resize: vertical; min-height: 90px; }
  .form-group { margin-bottom: 16px; }
  .form-label { display: block; font-size: 13px; font-weight: 700; color: var(--text2); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.04em; }
  .form-hint { font-size: 12px; color: var(--text3); margin-top: 5px; }

  .upload-zone { border: 2px dashed var(--border2); border-radius: var(--radius); padding: 28px; text-align: center; cursor: pointer; transition: all 0.18s; background: var(--surface2); }
  .upload-zone:hover, .upload-zone.dragover { border-color: var(--accent); background: var(--accent-light); }
  .upload-zone.filled { border-color: var(--green); background: var(--green-light); border-style: solid; }
  .upload-icon { font-size: 28px; margin-bottom: 8px; }
  .upload-text { font-size: 14px; font-weight: 600; color: var(--text2); }
  .upload-sub { font-size: 12px; color: var(--text3); margin-top: 4px; }

  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(4px); animation: fadeIn 0.15s ease; padding: 20px; }
  .modal { background: var(--surface); border-radius: 20px; width: 100%; max-width: 520px; max-height: 88vh; overflow-y: auto; box-shadow: var(--shadow-lg); animation: slideUp 0.22s ease; }
  .modal-wide { max-width: 640px; }
  .modal-header { padding: 22px 24px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
  .modal-header h3 { font-family: var(--display); font-size: 17px; font-weight: 600; }
  .modal-body { padding: 22px 24px; }
  .modal-footer { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; gap: 8px; justify-content: flex-end; }

  .shop-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 18px; }
  .shop-card { background: var(--surface); border: 1.5px solid var(--border); border-radius: 16px; overflow: hidden; transition: all 0.22s; cursor: pointer; }
  .shop-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); border-color: var(--border2); }
  .shop-card-thumb { height: 120px; display: flex; align-items: center; justify-content: center; font-size: 52px; background: var(--surface2); position: relative; }
  .shop-card-body { padding: 16px; }
  .shop-card-name { font-family: var(--display); font-size: 15px; font-weight: 600; margin-bottom: 4px; }
  .shop-card-desc { font-size: 13px; color: var(--text2); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 12px; }
  .shop-card-meta { display: flex; align-items: center; justify-content: space-between; }
  .shop-card-rating { font-size: 13px; font-weight: 700; color: var(--yellow); }
  .shop-card-loc { font-size: 12px; color: var(--text3); }
  .tier-badge-abs { position: absolute; top: 10px; right: 10px; }

  .hero { padding: 60px 24px 48px; text-align: center; position: relative; overflow: hidden; }
  .hero::before { content: ''; position: absolute; top: -40px; left: 50%; transform: translateX(-50%); width: 600px; height: 300px; background: radial-gradient(ellipse, rgba(232,93,38,0.08) 0%, transparent 70%); pointer-events: none; }
  .hero-title { font-family: var(--display); font-size: 40px; font-weight: 600; line-height: 1.2; margin-bottom: 12px; letter-spacing: -0.03em; }
  .hero-title span { color: var(--accent); }
  .hero-sub { font-size: 16px; color: var(--text2); margin-bottom: 32px; max-width: 440px; margin-left: auto; margin-right: auto; }
  .search-box { max-width: 560px; margin: 0 auto; display: flex; gap: 0; background: var(--surface); border: 2px solid var(--border2); border-radius: 14px; overflow: hidden; box-shadow: var(--shadow-md); transition: border-color 0.18s; }
  .search-box:focus-within { border-color: var(--accent); }
  .search-input { flex: 1; padding: 14px 18px; font-size: 15px; font-family: var(--font); border: none; outline: none; background: transparent; }
  .search-btn { padding: 14px 22px; background: var(--accent); color: #fff; font-size: 15px; font-weight: 700; font-family: var(--font); border: none; cursor: pointer; transition: background 0.15s; }
  .search-btn:hover { background: var(--accent2); }

  .section { padding: 0 24px 48px; max-width: 1100px; margin: 0 auto; }
  .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .section-title { font-family: var(--display); font-size: 20px; font-weight: 600; }
  .section-sub { font-size: 13px; color: var(--text3); margin-top: 2px; }

  .category-pills { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }
  .pill { padding: 7px 16px; border-radius: 100px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1.5px solid var(--border2); background: var(--surface); color: var(--text2); transition: all 0.15s; }
  .pill:hover, .pill.active { background: var(--accent); color: #fff; border-color: var(--accent); }

  .shop-detail-hero { background: var(--surface2); border-radius: 20px; padding: 36px; margin-bottom: 24px; display: flex; gap: 28px; align-items: flex-start; }
  .shop-emoji { font-size: 72px; flex-shrink: 0; }
  .shop-detail-info { flex: 1; }
  .shop-detail-name { font-family: var(--display); font-size: 26px; font-weight: 600; margin-bottom: 8px; letter-spacing: -0.02em; }
  .shop-detail-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; align-items: center; }
  .shop-detail-desc { color: var(--text2); font-size: 15px; line-height: 1.7; margin-bottom: 16px; }

  .profile-header { background: var(--surface); border-radius: 20px; padding: 32px; margin-bottom: 20px; display: flex; gap: 24px; align-items: center; box-shadow: var(--shadow); }
  .avatar { width: 72px; height: 72px; border-radius: 50%; background: var(--accent-light); display: flex; align-items: center; justify-content: center; font-size: 28px; flex-shrink: 0; border: 3px solid var(--border); }
  .profile-name { font-family: var(--display); font-size: 22px; font-weight: 600; }
  .profile-email { font-size: 14px; color: var(--text3); margin-top: 2px; }

  .dash-card { background: var(--surface); border: 1.5px solid var(--border); border-radius: 16px; padding: 24px; box-shadow: var(--shadow); }
  .dash-card-title { font-family: var(--display); font-size: 16px; font-weight: 600; margin-bottom: 4px; }
  .dash-card-sub { font-size: 13px; color: var(--text3); margin-bottom: 20px; }
  .stat-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-bottom: 20px; }
  .stat-mini { background: var(--surface2); border-radius: 12px; padding: 16px; text-align: center; }
  .stat-mini-val { font-size: 24px; font-weight: 800; font-family: var(--display); color: var(--text); }
  .stat-mini-label { font-size: 12px; color: var(--text3); margin-top: 2px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }

  .history-item { display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border); align-items: flex-start; }
  .history-item:last-child { border-bottom: none; }
  .history-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 6px; flex-shrink: 0; }
  .dot-success { background: var(--green); }
  .dot-fail { background: var(--red); }
  .dot-pending { background: var(--yellow); }

  .tier-card { border-radius: 14px; padding: 16px 18px; border: 1.5px solid; margin-bottom: 10px; cursor: pointer; transition: all 0.15s; }
  .tier-card:hover { transform: translateY(-1px); }
  .tier-1 { background: var(--surface2); border-color: var(--border2); }
  .tier-2 { background: #e8f0fe; border-color: #c5d2f6; }
  .tier-3 { background: linear-gradient(135deg, #fff7e6, #fef3c7); border-color: #f6d860; }

  .wizard-steps { display: flex; gap: 0; margin-bottom: 32px; }
  .wizard-step { flex: 1; display: flex; flex-direction: column; align-items: center; position: relative; }
  .wizard-step::after { content: ''; position: absolute; top: 18px; left: 50%; width: 100%; height: 2px; background: var(--border2); z-index: 0; }
  .wizard-step:last-child::after { display: none; }
  .step-circle { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; border: 2px solid var(--border2); background: var(--surface2); color: var(--text3); position: relative; z-index: 1; transition: all 0.2s; }
  .step-circle.active { background: var(--accent); color: #fff; border-color: var(--accent); box-shadow: 0 0 0 4px var(--accent-glow); }
  .step-circle.done { background: var(--green); color: #fff; border-color: var(--green); }
  .step-label { font-size: 12px; font-weight: 700; color: var(--text3); margin-top: 8px; text-align: center; }
  .step-label.active { color: var(--accent); }
  .step-label.done { color: var(--green); }

  .notification { position: fixed; top: 76px; right: 20px; z-index: 200; background: var(--surface); border: 1.5px solid var(--border2); border-radius: 12px; padding: 14px 18px; min-width: 280px; box-shadow: var(--shadow-lg); animation: slideIn 0.25s ease; display: flex; align-items: center; gap: 10px; font-size: 14px; }
  .notification.success { border-left: 3px solid var(--green); }
  .notification.error { border-left: 3px solid var(--red); }

  .page { min-height: calc(100vh - 60px); }

  .detail-row { display: flex; gap: 12px; padding: 11px 0; border-bottom: 1px solid var(--border); }
  .detail-row:last-child { border-bottom: none; }
  .detail-label { font-size: 12px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.05em; min-width: 130px; padding-top: 2px; }
  .detail-value { font-size: 14px; color: var(--text); flex: 1; }

  .tag { display: inline-block; padding: 2px 9px; border-radius: 6px; font-size: 12px; font-weight: 600; background: var(--surface2); color: var(--text3); margin-right: 4px; }
  .divider { border: none; border-top: 1px solid var(--border); margin: 20px 0; }

  .alert { border-radius: var(--radius-sm); padding: 12px 16px; font-size: 14px; display: flex; gap: 10px; align-items: flex-start; }
  .alert-warn { background: var(--yellow-light); color: #92400e; border: 1px solid #fde68a; }
  .alert-success { background: var(--green-light); color: #065f46; border: 1px solid #a7f3d0; }
  .alert-error { background: var(--red-light); color: #991b1b; border: 1px solid #fecaca; }
  .alert-info { background: var(--blue-light); color: #1e40af; border: 1px solid #bfdbfe; }

  .google-btn { width: 100%; padding: 13px; background: #fff; color: #333; border: 1.5px solid #dadce0; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.15s; font-family: var(--font); box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
  .google-btn:hover { background: #f8f9fa; box-shadow: 0 2px 8px rgba(0,0,0,0.12); }

  .pagination-wrap { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 36px; padding-bottom: 8px; }
  .page-btn { min-width: 38px; height: 38px; padding: 0 8px; border-radius: 9px; font-size: 14px; font-weight: 700; cursor: pointer; border: 1.5px solid var(--border2); background: var(--surface); color: var(--text2); transition: all 0.15s; font-family: var(--font); display: flex; align-items: center; justify-content: center; }
  .page-btn:hover:not(:disabled) { background: var(--surface2); color: var(--text); border-color: var(--text3); }
  .page-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); box-shadow: 0 2px 8px var(--accent-glow); }
  .page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .page-dots { color: var(--text3); font-size: 14px; padding: 0 4px; user-select: none; }

  @keyframes shimmer { 0% { background-position: -400px 0 } 100% { background-position: 400px 0 } }
  .skeleton-card { pointer-events: none; }
  .skeleton-thumb { height: 120px; background: linear-gradient(90deg, var(--surface2) 25%, var(--border) 50%, var(--surface2) 75%); background-size: 400px 100%; animation: shimmer 1.4s infinite linear; }
  .skeleton-body { padding: 16px; display: flex; flex-direction: column; gap: 10px; }
  .skeleton-line { height: 13px; border-radius: 6px; background: linear-gradient(90deg, var(--surface2) 25%, var(--border) 50%, var(--surface2) 75%); background-size: 400px 100%; animation: shimmer 1.4s infinite linear; }

  @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
  @keyframes slideUp { from { transform: translateY(14px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
  @keyframes slideIn { from { transform: translateX(16px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }

  .nav-center { display: flex; align-items: center; gap: 4px; }
  .nav-tab { padding: 7px 14px; border-radius: 8px; font-size: 13.5px; font-weight: 600; cursor: pointer; border: 1.5px solid transparent; background: transparent; color: var(--text2); font-family: var(--font); transition: all 0.15s; }
  .nav-tab:hover { background: var(--surface2); color: var(--text); }
  .nav-tab.active { background: var(--accent-light); color: var(--accent); border-color: rgba(232,93,38,0.2); }

  .shop-card-muted { opacity: 0.72; }
  .shop-card-muted:hover { opacity: 1; }

  @media (max-width: 640px) {
    .hero-title { font-size: 28px; }
    .shop-detail-hero { flex-direction: column; gap: 16px; }
    .stat-row { grid-template-columns: repeat(2, 1fr); }
    .navbar { padding: 0 16px; }
    .section { padding: 0 16px 40px; }
    .nav-center { display: none; }
  }
`;

// ============================================================
// HELPERS
// ============================================================
function TierBadge({ tier }) {
  const map = { 1: ["badge-tier1", "⚪ ขั้น 1"], 2: ["badge-tier2", "🔵 ขั้น 2"], 3: ["badge-tier3", "🥇 ขั้น 3"] };
  const [cls, label] = map[tier] || map[1];
  return <span className={`badge ${cls}`}>{label}</span>;
}

// Badge แสดง role ของ user ตาม Use Cases
function RoleBadge({ role }) {
  const map = {
    visitor: ["badge-role-visitor", "👁️ ผู้เยี่ยมชม"],
    user:    ["badge-role-user",    "👤 ผู้ใช้"],
    shop:    ["badge-role-shop",    "🏪 ร้านค้า"],
    admin:   ["badge-role-admin",   "🔑 แอดมิน"],
  };
  const [cls, label] = map[role] || map["visitor"];
  return <span className={`badge ${cls}`}>{label}</span>;
}

function Notification({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return <div className={`notification ${type}`}><span>{type === "success" ? "✓" : "✕"}</span><span>{msg}</span></div>;
}

function Modal({ title, onClose, children, footer, wide }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? "modal-wide" : ""}`}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ============================================================
// NAVBAR
// UC12: ผู้เยี่ยมชม (visitor) → ปุ่มเข้าสู่ระบบ
// UC15: ผู้ใช้/ร้านค้า/แอดมิน → แสดงชื่อ + โปรไฟล์
// UC19: role="shop" → ปุ่ม "ร้านของฉัน"
// ============================================================
function Navbar({ user, onNavigate, darkMode, toggleDark, currentPage }) {
  const [showLogin, setShowLogin] = useState(false);

  const handleGoogleLogin = () => {
    // TODO: Google OAuth จริง — รับ token แล้วส่งให้ api.loginGoogle(token)
    // จากนั้น backend ตรวจสอบ token และ return { user, token }
    // ตัวอย่าง mock: สมมติว่า login แล้วได้ user ที่มีร้าน
    localStorage.setItem("user_token", "mock_token");
    localStorage.setItem("user_data", JSON.stringify(MOCK_USER));
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand" onClick={() => onNavigate("home")}>my<span>Order</span></div>

        <div className="nav-center">
          <button className={`nav-tab ${currentPage === "home" ? "active" : ""}`} onClick={() => onNavigate("home")}>🏠 หน้าหลัก</button>
          <button className={`nav-tab ${currentPage === "shop-list" ? "active" : ""}`} onClick={() => onNavigate("shop-list")}>🏪 ร้านค้าทั้งหมด</button>
        </div>

        <div className="nav-right">
          {/* ถ้า login แล้ว แสดงชื่อและปุ่มโปรไฟล์ */}
          {user && (
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("profile")}>
              {user.role === "admin" ? "🔑" : user.role === "shop" ? "🏪" : "👤"} {user.name.split(" ")[0]}
            </button>
          )}

          {/* ปุ่ม "ร้านของฉัน" — แสดงทุก role รวมถึง visitor
              - visitor  → ไปหน้า login
              - user     → ไปหน้าติดต่อ myOrder (UC16)
              - shop     → ไปหน้ารายละเอียดร้านค้า (UC19)
              - admin    → ซ่อน (admin ไม่มีร้านค้า) */}
          {(!user || user.role !== "admin") && (
            <button className="btn btn-outline btn-sm" onClick={() => onNavigate("myshop")}>
              🏪 ร้านของฉัน
            </button>
          )}

          {/* ปุ่มเข้าสู่ระบบ — เฉพาะ visitor */}
          {!user && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowLogin(true)}>
              เข้าสู่ระบบ
            </button>
          )}

          <button className="theme-toggle" onClick={toggleDark} title={darkMode ? "Light Mode" : "Dark Mode"}>
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </nav>

      {/* UC12: หน้า Login — เฉพาะ ผู้เยี่ยมชม */}
      {showLogin && (
        <Modal title="เข้าสู่ระบบ" onClose={() => setShowLogin(false)}>
          <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👋</div>
            <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 8 }}>
              เข้าสู่ระบบเพื่อรายงานร้านค้า ยื่นเรื่องเคลม หรือจัดการร้านของคุณ
            </p>
            <p style={{ color: "var(--text3)", fontSize: 13, marginBottom: 24 }}>
              หากคุณมีร้านค้าในระบบ จะสามารถจัดการร้านและขอเลื่อนขั้นได้ทันที
            </p>
          </div>
          <button className="google-btn" onClick={handleGoogleLogin}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.6 2.3 30.1 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.8 6.1C12.4 13.2 17.7 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 7.1-10 7.1-17z"/>
              <path fill="#FBBC05" d="M10.4 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.6L2.6 13.3A24 24 0 0 0 0 24c0 3.8.9 7.4 2.6 10.7l7.8-6.1z"/>
              <path fill="#34A853" d="M24 48c6.1 0 11.2-2 14.9-5.4l-7.5-5.8c-2 1.4-4.7 2.2-7.4 2.2-6.3 0-11.6-3.7-13.6-9.4l-7.8 6.1C6.6 42.6 14.6 48 24 48z"/>
            </svg>
            เข้าสู่ระบบด้วย Google
          </button>
        </Modal>
      )}
    </>
  );
}

// ============================================================
// PAGINATION
// ============================================================
function Pagination({ currentPage, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };
  return (
    <div className="pagination-wrap">
      <button className="page-btn" onClick={() => onChange(currentPage - 1)} disabled={currentPage === 1}>‹</button>
      {getPages().map((p, i) =>
        p === "..." ? <span key={`dots-${i}`} className="page-dots">···</span> :
        <button key={p} className={`page-btn ${p === currentPage ? "active" : ""}`} onClick={() => onChange(p)}>{p}</button>
      )}
      <button className="page-btn" onClick={() => onChange(currentPage + 1)} disabled={currentPage === totalPages}>›</button>
    </div>
  );
}

// ============================================================
// SHARED: ShopCard
// UC8, UC13: ทุก actor ค้นหาและดูร้านค้าได้
// ============================================================
function ShopCard({ shop, onNavigate }) {
  const isBad = shop.is_blacklisted || shop.is_closed;
  return (
    <div className={`shop-card ${isBad ? "shop-card-muted" : ""}`} onClick={() => onNavigate("shop-detail", shop)}>
      <div className="shop-card-thumb">
        {shop.img_emoji}
        <div className="tier-badge-abs">
          {shop.is_blacklisted
            ? <span className="badge badge-red">⛔ Blacklist</span>
            : shop.is_closed
              ? <span className="badge badge-gray">🔒 ปิดแล้ว</span>
              : <TierBadge tier={shop.tier} />}
        </div>
      </div>
      <div className="shop-card-body">
        <div className="shop-card-name" style={isBad ? { color: "var(--text3)" } : {}}>{shop.name}</div>
        <div className="shop-card-desc">{shop.description}</div>
        <div className="shop-card-meta">
          <span className="shop-card-rating">⭐ {shop.rating} ({shop.reviews})</span>
          <span className="shop-card-loc">📍 {shop.location.split(",")[0]}</span>
        </div>
      </div>
    </div>
  );
}

function SkeletonGrid({ count = 8 }) {
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

// ============================================================
// PAGE: HOME
// UC8, UC13: ผู้เยี่ยมชม/ผู้ใช้/ร้านค้า/แอดมิน ค้นหาได้ทุกคน
// ============================================================
function HomePage({ onNavigate }) {
  const [inputVal, setInputVal] = useState("");
  const [query, setQuery]       = useState("");
  const [category, setCategory] = useState("ทั้งหมด");
  const [searchPage, setSearchPage] = useState(1);
  const categories = ["ทั้งหมด", "อาหาร", "ขนม", "เครื่องดื่ม"];
  const isSearching = query !== "" || category !== "ทั้งหมด";

  const { items: featured, loading: loadFeatured } = useShopSearch({
    query: "", category: "ทั้งหมด", page: 1, featuredOnly: true, withPagination: false,
  });

  const { items: results, totalItems, totalPages, currentPage, loading: loadSearch } = useShopSearch({
    query, category, page: searchPage, tierFilter: "all", showClosed: true, withPagination: true,
  });

  const handleSearch = () => { setQuery(inputVal); setSearchPage(1); };
  const handleCategory = (c) => { setCategory(c); setSearchPage(1); };
  const handlePageChange = (p) => {
    setSearchPage(p);
    document.querySelector(".home-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const handleClearSearch = () => { setInputVal(""); setQuery(""); setCategory("ทั้งหมด"); setSearchPage(1); };

  return (
    <div className="page">
      <div className="hero">
        <h1 className="hero-title">ค้นหาร้านค้าที่คุณ<span>ไว้วางใจ</span></h1>
        <p className="hero-sub">ค้นหาร้านค้าที่ผ่านการยืนยันตัวตนแล้ว ปลอดภัย มั่นใจ</p>
        <div className="search-box">
          <input
            className="search-input"
            placeholder="พิมพ์ชื่อร้าน ประเภทสินค้า หรือชื่อที่ต้องการตรวจสอบ..."
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
          />
          {isSearching && (
            <button onClick={handleClearSearch} style={{ padding: "0 14px", background: "transparent", border: "none", cursor: "pointer", color: "var(--text3)", fontSize: 18 }}>✕</button>
          )}
          <button className="search-btn" onClick={handleSearch}>🔍</button>
        </div>
      </div>

      <div className="section home-results">
        {isSearching && (
          <div className="category-pills">
            {categories.map(c => (
              <button key={c} className={`pill ${category === c ? "active" : ""}`} onClick={() => handleCategory(c)}>{c}</button>
            ))}
          </div>
        )}
        <div className="section-header">
          <div>
            <div className="section-title">{isSearching ? `ผลการค้นหา "${query || "ทุกร้าน"}"` : "⭐ ร้านค้าแนะนำ"}</div>
            <div className="section-sub">
              {isSearching
                ? loadSearch ? "กำลังโหลด..." : `พบ ${totalItems} ร้านค้า · หน้า ${currentPage} / ${totalPages}`
                : "คัดสรรจากร้านที่มีคะแนนสูงและผ่านการยืนยัน"}
            </div>
          </div>
          {isSearching && <button className="btn btn-ghost btn-sm" onClick={handleClearSearch}>✕ ล้างการค้นหา</button>}
        </div>

        {isSearching ? (
          loadSearch ? <SkeletonGrid count={ITEMS_PER_PAGE} /> :
          results.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text3)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <p>ไม่พบร้านค้าที่ตรงกับการค้นหา</p>
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 16 }} onClick={handleClearSearch}>กลับร้านแนะนำ</button>
            </div>
          ) : (
            <>
              <div className="shop-grid">{results.map(s => <ShopCard key={s.id} shop={s} onNavigate={onNavigate} />)}</div>
              <Pagination currentPage={currentPage} totalPages={totalPages} onChange={handlePageChange} />
            </>
          )
        ) : (
          loadFeatured ? <SkeletonGrid count={10} /> :
          <div className="shop-grid">{featured.map(s => <ShopCard key={s.id} shop={s} onNavigate={onNavigate} />)}</div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// PAGE: SHOP LIST
// UC8: ผู้เยี่ยมชม/ผู้ใช้/ร้านค้า/แอดมิน ค้นหาได้ทุกคน
// ============================================================
function ShopListPage({ onNavigate }) {
  const [inputVal, setInputVal] = useState("");
  const [query, setQuery]       = useState("");
  const [category, setCategory] = useState("ทั้งหมด");
  const [tierFilter, setTierFilter] = useState("all");
  const [showClosed, setShowClosed] = useState(false);
  const [page, setPage] = useState(1);

  const categories = ["ทั้งหมด", "อาหาร", "ขนม", "เครื่องดื่ม"];
  const tierFilters = [
    { val: "all",       label: "ทุกร้าน" },
    { val: "tier1+",    label: "⚪ ขั้น 1 ขึ้นไป" },
    { val: "tier2+",    label: "🔵 ขั้น 2 ขึ้นไป" },
    { val: "tier3",     label: "🥇 ขั้น 3 เท่านั้น" },
    { val: "blacklist", label: "⛔ Blacklist" },
  ];

  const { items, totalItems, totalPages, currentPage, loading, error } = useShopSearch({
    query, category, page, tierFilter, showClosed,
  });

  const handleSearch = () => { setQuery(inputVal); setPage(1); };
  const handleCategory = (c) => { setCategory(c); setPage(1); };
  const handleTierFilter = (v) => { setTierFilter(v); setPage(1); };
  const handlePageChange = (p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <div className="page">
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "16px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="search-box" style={{ marginBottom: 14, maxWidth: "100%" }}>
            <input className="search-input" placeholder="ค้นหาชื่อร้านค้า..." value={inputVal} onChange={e => setInputVal(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()} />
            <button className="search-btn" onClick={handleSearch}>🔍</button>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--text3)", fontWeight: 700, marginRight: 4 }}>หมวดหมู่:</span>
            {categories.map(c => <button key={c} className={`pill ${category === c ? "active" : ""}`} style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => handleCategory(c)}>{c}</button>)}
            <div style={{ width: 1, height: 20, background: "var(--border2)", margin: "0 4px" }} />
            <span style={{ fontSize: 12, color: "var(--text3)", fontWeight: 700, marginRight: 4 }}>ระดับ:</span>
            {tierFilters.map(f => <button key={f.val} className={`pill ${tierFilter === f.val ? "active" : ""}`} style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => handleTierFilter(f.val)}>{f.label}</button>)}
            <div style={{ width: 1, height: 20, background: "var(--border2)", margin: "0 4px" }} />
            <button className={`pill ${showClosed ? "active" : ""}`} style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => { setShowClosed(v => !v); setPage(1); }}>🔒 รวมร้านปิด</button>
          </div>
        </div>
      </div>

      <div className="section" style={{ paddingTop: 24 }}>
        <div className="section-header">
          <div>
            <div className="section-title">รายการร้านค้า</div>
            <div className="section-sub">{loading ? "กำลังโหลด..." : `พบ ${totalItems} ร้านค้า · หน้า ${currentPage} / ${totalPages}`}</div>
          </div>
        </div>
        {error && <div style={{ padding: 20, color: "var(--red)", background: "var(--red-light)", borderRadius: 12, marginBottom: 20 }}>⚠️ {error}</div>}
        {loading ? <SkeletonGrid /> :
         items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text3)" }}><div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div><p>ไม่พบร้านค้า</p></div>
         ) : (
          <>
            <div className="shop-grid">{items.map(s => <ShopCard key={s.id} shop={s} onNavigate={onNavigate} />)}</div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onChange={handlePageChange} />
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
// PAGE: SHOP DETAIL
// UC13: ดูรายละเอียด — ทุก actor (visitor/user/shop/admin)
// UC14: รายงาน — เฉพาะ "ผู้ใช้" (user.role === "user" หรือ "shop")
//         ผู้เยี่ยมชมต้องล็อกอินก่อน
// UC18: เคลม — เฉพาะ "ผู้ใช้" (user.role === "user" หรือ "shop")
//         ผู้เยี่ยมชมต้องล็อกอินก่อน
// ============================================================
function ShopDetailPage({ shop, user, onNavigate, notify }) {
  const [showReport, setShowReport] = useState(false);
  const [showClaim, setShowClaim]   = useState(false);
  const [report, setReport] = useState({ reason: "", detail: "" });
  const [claim, setClaim]   = useState({ contact: "", detail: "" });
  const [attachments, setAttachments]          = useState([{ id: Date.now(), topic: "", file: null }]);
  const [claimAttachments, setClaimAttachments] = useState([{ id: Date.now(), topic: "", file: null }]);

  // ตรวจสอบว่า user มีสิทธิ์รายงาน/เคลมหรือไม่
  // UC14, UC18: เฉพาะ ผู้ใช้ที่ login แล้ว (role: user, shop, admin)
  // ผู้เยี่ยมชม (user = null) ต้องล็อกอินก่อน
  const canReport = user !== null;   // login แล้วทุก role รายงานได้
  const canClaim  = user !== null;   // login แล้วทุก role เคลมได้

  const addAttachment    = () => setAttachments(p => [...p, { id: Date.now(), topic: "", file: null }]);
  const removeAttachment = (id) => setAttachments(p => p.filter(a => a.id !== id));
  const updateAttachment = (id, field, val) => setAttachments(p => p.map(a => a.id === id ? { ...a, [field]: val } : a));

  const addClaimAtt    = () => setClaimAttachments(p => [...p, { id: Date.now(), topic: "", file: null }]);
  const removeClaimAtt = (id) => setClaimAttachments(p => p.filter(a => a.id !== id));
  const updateClaimAtt = (id, field, val) => setClaimAttachments(p => p.map(a => a.id === id ? { ...a, [field]: val } : a));

  const resetReport = () => { setReport({ reason: "", detail: "" }); setAttachments([{ id: Date.now(), topic: "", file: null }]); };
  const resetClaim  = () => { setClaim({ contact: "", detail: "" }); setClaimAttachments([{ id: Date.now(), topic: "", file: null }]); };

  // UC14: กดปุ่มรายงาน — ผู้เยี่ยมชมต้องล็อกอินก่อน
  const handleClickReport = () => {
    if (!canReport) { notify("กรุณาเข้าสู่ระบบก่อนรายงานร้านค้า", "error"); return; }
    setShowReport(true);
  };

  // UC18: กดปุ่มเคลม — ผู้เยี่ยมชมต้องล็อกอินก่อน
  const handleClickClaim = () => {
    if (!canClaim) { notify("กรุณาเข้าสู่ระบบก่อนยื่นเรื่องเคลม", "error"); return; }
    setShowClaim(true);
  };

  const handleReport = () => {
    if (!report.reason || !report.detail) return;
    // TODO: await api.reportShop(shop.id, { ...report, attachments })
    setShowReport(false);
    notify("ส่งรายงานเรียบร้อยแล้ว ขอบคุณครับ", "success");
    resetReport();
  };

  const handleClaim = () => {
    if (!claim.contact || !claim.detail) return;
    // TODO: await api.submitClaim(shop.id, { ...claim, attachments: claimAttachments })
    setShowClaim(false);
    notify("ส่งเรื่องเคลมเรียบร้อยแล้ว ทีมงานจะติดต่อกลับ", "success");
    resetClaim();
  };

  const tierDesc = {
    1: "ร้านค้าทั่วไป ยังไม่ได้ยืนยันตัวตน",
    2: "ยืนยันตัวตนระดับเอกสาร",
    3: "ยืนยันตัวตนสูงสุด มีประวัติการสั่งของจาก myOrder",
  };

  return (
    <div className="page">
      <div className="section" style={{ paddingTop: 24 }}>
        <button className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }} onClick={() => onNavigate("home")}>← กลับ</button>

        <div className="shop-detail-hero">
          <div className="shop-emoji">{shop.img_emoji}</div>
          <div className="shop-detail-info">
            <div className="shop-detail-name">{shop.name}</div>
            <div className="shop-detail-meta">
              <TierBadge tier={shop.tier} />
              <span className="badge badge-gray">{shop.category}</span>
              <span className="badge" style={{ background: shop.entity_type === "company" ? "#ede9fe" : "#fce7f3", color: shop.entity_type === "company" ? "#6d28d9" : "#be185d", border: `1px solid ${shop.entity_type === "company" ? "#c4b5fd" : "#fbcfe8"}` }}>
                {shop.entity_type === "company" ? "🏢 นิติบุคคล" : "👤 บุคคลธรรมดา"}
              </span>
              <span style={{ fontSize: 14, color: "var(--yellow)", fontWeight: 700 }}>⭐ {shop.rating}</span>
              <span style={{ fontSize: 13, color: "var(--text3)" }}>({shop.reviews} รีวิว)</span>
            </div>
            <p className="shop-detail-desc">{shop.description}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
              {shop.tags.map(t => <span className="tag" key={t}>#{t}</span>)}
            </div>

            {/* ปุ่มแอคชัน */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
              {/* ปุ่มติดต่อ — ทุก actor กดได้ ถ้าร้านเปิดและไม่ถูกแบน */}
              {!shop.is_closed && !shop.is_blacklisted && (
                <a href={shop.link} className="btn btn-primary" target="_blank" rel="noreferrer">🔗 ติดต่อร้านค้า</a>
              )}

              {/* UC14: รายงานร้านค้า — ทุก actor กดได้ แต่ visitor จะถูก redirect ไป login */}
              <button className="btn btn-outline" onClick={handleClickReport}>
                🚩 รายงานร้านค้า
                {!canReport && <span style={{ fontSize: 11, marginLeft: 4, opacity: 0.7 }}>(ต้องล็อกอิน)</span>}
              </button>

              {/* UC18: เคลมปัญหา — ทุก actor กดได้ แต่ visitor จะถูก redirect ไป login */}
              <button className="btn btn-outline" onClick={handleClickClaim} style={{ borderColor: "var(--blue)", color: "var(--blue)" }}>
                ⚖️ เคลมปัญหา
                {!canClaim && <span style={{ fontSize: 11, marginLeft: 4, opacity: 0.7 }}>(ต้องล็อกอิน)</span>}
              </button>
            </div>

            {shop.is_closed && <div className="alert alert-warn" style={{ marginTop: 4 }}>🔒 ร้านนี้ปิดบริการแล้ว อาจไม่สามารถติดต่อได้</div>}
            {shop.is_blacklisted && <div className="alert alert-error" style={{ marginTop: 4 }}>⛔ ร้านนี้ถูกระงับจากระบบ เนื่องจากละเมิดข้อกำหนด</div>}
          </div>
        </div>

        {/* ระดับการยืนยัน */}
        <div className="dash-card" style={{ marginBottom: 16 }}>
          <div className="dash-card-title">ระดับการยืนยันตัวตน</div>
          <div className="dash-card-sub">ระดับความน่าเชื่อถือของร้านค้านี้</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[1, 2, 3].map(t => (
              <div key={t} style={{ flex: 1, minWidth: 160, padding: "14px 16px", background: t === shop.tier ? "var(--accent-light)" : "var(--surface2)", border: `1.5px solid ${t === shop.tier ? "var(--accent)" : "var(--border)"}`, borderRadius: 12 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                  <TierBadge tier={t} />
                  {t === shop.tier && <span style={{ fontSize: 11, background: "var(--accent)", color: "#fff", padding: "1px 7px", borderRadius: 100, fontWeight: 700 }}>ปัจจุบัน</span>}
                </div>
                <div style={{ fontSize: 13, color: "var(--text2)" }}>{tierDesc[t]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* รายละเอียด */}
        <div className="dash-card">
          <div className="detail-row"><div className="detail-label">📍 ที่อยู่</div><div className="detail-value">{shop.location}</div></div>
          <div className="detail-row"><div className="detail-label">👤 ประเภท</div><div className="detail-value">{shop.entity_type === "company" ? "นิติบุคคล" : "บุคคลธรรมดา"}</div></div>
          <div className="detail-row">
            <div className="detail-label">🏷️ สถานะร้าน</div>
            <div className="detail-value">
              {shop.is_blacklisted ? <span className="badge badge-red">⛔ ถูกระงับ (Blacklist)</span>
                : shop.is_closed ? <span className="badge badge-gray">🔒 ปิดบริการแล้ว</span>
                : <span className="badge badge-green">✓ เปิดให้บริการ</span>}
            </div>
          </div>
          {!shop.is_closed && !shop.is_blacklisted && (
            <div className="detail-row"><div className="detail-label">🔗 ลิงก์ติดต่อ</div><div className="detail-value"><a href={shop.link} style={{ color: "var(--accent)" }} target="_blank" rel="noreferrer">{shop.link}</a></div></div>
          )}
        </div>
      </div>

      {/* UC14: Modal รายงานร้านค้า */}
      {showReport && (
        <Modal title="🚩 รายงานร้านค้า" onClose={() => { setShowReport(false); resetReport(); }} wide
          footer={<>
            <button className="btn btn-ghost btn-sm" onClick={() => { setShowReport(false); resetReport(); }}>ยกเลิก</button>
            <button className="btn btn-danger btn-sm" onClick={handleReport} disabled={!report.reason || !report.detail}>ส่งรายงาน</button>
          </>}>
          <div className="alert alert-warn" style={{ marginBottom: 16 }}>⚠️ การรายงานเท็จอาจส่งผลต่อบัญชีของคุณ กรุณาใส่ข้อมูลที่เป็นจริงเท่านั้น</div>
          <div className="form-group">
            <label className="form-label">ประเภทการรายงาน *</label>
            <select className="input" value={report.reason} onChange={e => setReport(p => ({ ...p, reason: e.target.value }))}>
              <option value="">-- เลือกประเภท --</option>
              <option>สินค้าไม่ตรงรูป</option>
              <option>โกงเงิน / ไม่ส่งของ</option>
              <option>ร้านค้าปลอม</option>
              <option>ข้อมูลร้านค้าผิด</option>
              <option>อื่นๆ</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">รายละเอียด *</label>
            <textarea className="input textarea" placeholder="อธิบายปัญหาโดยละเอียด..." value={report.detail} onChange={e => setReport(p => ({ ...p, detail: e.target.value }))} />
          </div>
          {/* UC17: ยื่นเอกสาร — แนบหลักฐาน */}
          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <label className="form-label" style={{ margin: 0 }}>แนบหลักฐานประกอบ (UC17)</label>
              <button className="btn btn-ghost btn-sm" onClick={addAttachment} style={{ color: "var(--accent)", fontSize: 13 }}>＋ เพิ่มไฟล์</button>
            </div>
            {attachments.map((att, idx) => (
              <div key={att.id} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center", background: "var(--surface2)", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border)" }}>
                <span style={{ fontSize: 12, color: "var(--text3)", minWidth: 20, textAlign: "center", fontWeight: 700 }}>{idx + 1}</span>
                <input className="input" placeholder="หัวข้อ เช่น สลิปโอนเงิน, แชทสนทนา" value={att.topic} onChange={e => updateAttachment(att.id, "topic", e.target.value)} style={{ flex: 1, padding: "7px 10px", fontSize: 13 }} />
                <label className={`btn btn-sm ${att.file ? "btn-success" : "btn-outline"}`} style={{ margin: 0, cursor: "pointer", whiteSpace: "nowrap", fontSize: 12 }}>
                  {att.file ? "✅ เลือกแล้ว" : "📎 เลือกไฟล์"}
                  <input type="file" style={{ display: "none" }} accept="image/*,.pdf" onChange={e => updateAttachment(att.id, "file", e.target.files[0])} />
                </label>
                {att.file && <span style={{ fontSize: 11, color: "var(--text3)", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{att.file.name}</span>}
                {attachments.length > 1 && <button className="btn btn-ghost btn-sm btn-icon" onClick={() => removeAttachment(att.id)} style={{ color: "var(--red)", padding: "4px 8px" }}>✕</button>}
              </div>
            ))}
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 6 }}>PNG, JPG, PDF ขนาดไม่เกิน 10MB ต่อไฟล์</div>
          </div>
        </Modal>
      )}

      {/* UC18: Modal ยื่นเรื่องเคลม */}
      {showClaim && (
        <Modal title="⚖️ เคลมปัญหากับร้านค้า" onClose={() => { setShowClaim(false); resetClaim(); }} wide
          footer={<>
            <button className="btn btn-ghost btn-sm" onClick={() => { setShowClaim(false); resetClaim(); }}>ยกเลิก</button>
            <button className="btn btn-primary btn-sm" onClick={handleClaim} disabled={!claim.contact || !claim.detail}>ส่งเรื่องเคลม</button>
          </>}>
          <div className="alert alert-info" style={{ marginBottom: 16 }}>
            💬 กรุณาระบุช่องทางติดต่อกลับ ทีมงานจะติดต่อและช่วยประสานงานให้ครับ
          </div>
          <div className="form-group">
            <label className="form-label">ช่องทางติดต่อกลับ * <span style={{ fontSize: 11, color: "var(--text3)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(LINE ID / เบอร์โทร / อีเมล)</span></label>
            <input className="input" placeholder="เช่น LINE: @yourlineid หรือ 081-234-5678" value={claim.contact} onChange={e => setClaim(p => ({ ...p, contact: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">รายละเอียดปัญหา *</label>
            <textarea className="input textarea" placeholder="อธิบายปัญหาที่ต้องการเคลม เช่น สั่งของแล้วไม่ได้รับ โอนเงินแล้วร้านไม่ตอบ..." value={claim.detail} onChange={e => setClaim(p => ({ ...p, detail: e.target.value }))} />
          </div>
          {/* UC17: ยื่นเอกสารประกอบการเคลม */}
          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <label className="form-label" style={{ margin: 0 }}>แนบหลักฐานประกอบ (UC17)</label>
              <button className="btn btn-ghost btn-sm" onClick={addClaimAtt} style={{ color: "var(--accent)", fontSize: 13 }}>＋ เพิ่มไฟล์</button>
            </div>
            {claimAttachments.map((att, idx) => (
              <div key={att.id} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center", background: "var(--surface2)", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border)" }}>
                <span style={{ fontSize: 12, color: "var(--text3)", minWidth: 20, textAlign: "center", fontWeight: 700 }}>{idx + 1}</span>
                <input className="input" placeholder="หัวข้อ เช่น สลิปโอนเงิน, แชทสนทนา" value={att.topic} onChange={e => updateClaimAtt(att.id, "topic", e.target.value)} style={{ flex: 1, padding: "7px 10px", fontSize: 13 }} />
                <label className={`btn btn-sm ${att.file ? "btn-success" : "btn-outline"}`} style={{ margin: 0, cursor: "pointer", whiteSpace: "nowrap", fontSize: 12 }}>
                  {att.file ? "✅ เลือกแล้ว" : "📎 เลือกไฟล์"}
                  <input type="file" style={{ display: "none" }} accept="image/*,.pdf" onChange={e => updateClaimAtt(att.id, "file", e.target.files[0])} />
                </label>
                {att.file && <span style={{ fontSize: 11, color: "var(--text3)", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{att.file.name}</span>}
                {claimAttachments.length > 1 && <button className="btn btn-ghost btn-sm btn-icon" onClick={() => removeClaimAtt(att.id)} style={{ color: "var(--red)", padding: "4px 8px" }}>✕</button>}
              </div>
            ))}
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 6 }}>PNG, JPG, PDF ขนาดไม่เกิน 10MB ต่อไฟล์</div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ============================================================
// PAGE: PROFILE
// UC15: ดูโปรไฟล์ — เฉพาะ ผู้ใช้ที่ login แล้ว (user/shop/admin)
//       ผู้เยี่ยมชมไม่มีสิทธิ์ เข้าหน้านี้ได้ (redirect ไป home)
// UC16: ติดต่อ myOrder — เฉพาะ role="user" (ยังไม่มีร้าน)
// UC19: ดูรายละเอียดร้านในครอบครอง — เฉพาะ role="shop"
// ============================================================
function ProfilePage({ user, onNavigate }) {
  // ตรวจสอบว่า user มีร้านค้าในครอบครองหรือไม่ โดยดูจาก role
  const hasShop = user.role === "shop"; // role="shop" = มีร้าน, role="user" = ไม่มีร้าน

  return (
    <div className="page">
      <div className="section" style={{ paddingTop: 28 }}>
        {/* Header โปรไฟล์ */}
        <div className="profile-header">
          <div className="avatar">
            {user.role === "shop" ? "🏪" : user.role === "admin" ? "🔑" : "👤"}
          </div>
          <div style={{ flex: 1 }}>
            <div className="profile-name">{user.name}</div>
            <div className="profile-email">{user.email}</div>
            <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
              <span className="badge badge-green">✓ เข้าสู่ระบบแล้ว</span>
              {/* แสดง role badge ตาม Use Cases */}
              <RoleBadge role={user.role} />
            </div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => { localStorage.clear(); window.location.reload(); }}>ออกจากระบบ</button>
        </div>

        {/* ส่วนร้านค้า */}
        <div className="dash-card">
          <div className="dash-card-title">ร้านค้าของฉัน</div>
          <div className="dash-card-sub">จัดการร้านค้าและดูสถานะการยืนยันตัวตน</div>
          <hr className="divider" />

          {/* UC19: role="shop" — มีร้านค้าในครอบครอง → แสดงข้อมูลและปุ่มจัดการ */}
          {hasShop ? (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <span style={{ fontSize: 36 }}>{MOCK_MY_SHOP.img_emoji}</span>
                <div>
                  <div style={{ fontFamily: "var(--display)", fontSize: 16, fontWeight: 600 }}>{MOCK_MY_SHOP.name}</div>
                  <div style={{ marginTop: 4, display: "flex", gap: 6 }}>
                    <TierBadge tier={MOCK_MY_SHOP.tier} />
                    <span className="badge badge-green">✓ ร้านค้าของฉัน</span>
                  </div>
                </div>
              </div>
              {/* UC19: ปุ่มไปหน้าดูรายละเอียดร้านค้าในครอบครอง */}
              <button className="btn btn-primary" onClick={() => onNavigate("myshop")}>
                🏪 ดูรายละเอียดร้านค้า →
              </button>
            </div>
          ) : (
            // UC16: role="user" — ยังไม่มีร้านค้า → แสดงปุ่มติดต่อ myOrder ลงทะเบียน
            <div>
              <div className="alert alert-info" style={{ marginBottom: 16 }}>
                💡 คุณยังไม่มีร้านค้าในระบบ หากต้องการลงทะเบียนร้านค้ากับทาง myOrder กรุณาติดต่อทีมงาน
              </div>
              <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 16 }}>
                หลังจากลงทะเบียนแล้ว ร้านค้าของคุณจะปรากฎในระบบและสามารถขอเลื่อนขั้นได้
              </p>
              {/* UC16: ปุ่มติดต่อ myOrder */}
              <a href="https://line.me/myorder-register" className="btn btn-primary" target="_blank" rel="noreferrer">
                📩 ติดต่อ myOrder เพื่อลงทะเบียนร้านค้า
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PAGE: MY SHOP
// UC16: role="user" (ไม่มีร้าน) → แสดงหน้าติดต่อ myOrder
// UC19: role="shop" (มีร้าน)    → แสดงรายละเอียดร้านค้า + แก้ไข + ขอเลื่อนขั้น
// ============================================================
function MyShopPage({ user, onNavigate, notify }) {
  // กรณี role="user" — ไม่มีร้านค้า แสดงหน้าติดต่อ myOrder (UC16)
  if (user && user.role === "user") {
    return (
      <div className="page">
        <div className="section" style={{ paddingTop: 28, maxWidth: 640 }}>
          <button className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }} onClick={() => onNavigate("home")}>← กลับ</button>
          <div className="dash-card" style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🏪</div>
            <h2 style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
              คุณยังไม่มีร้านค้าในระบบ
            </h2>
            <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 8, lineHeight: 1.7 }}>
              หากต้องการลงทะเบียนร้านค้ากับทาง myOrder<br />กรุณาติดต่อทีมงานเพื่อดำเนินการ
            </p>
            <p style={{ color: "var(--text3)", fontSize: 13, marginBottom: 28 }}>
              หลังลงทะเบียนแล้ว ร้านค้าจะปรากฎในระบบ และสามารถขอเลื่อนขั้นได้
            </p>
            {/* UC16: ปุ่มติดต่อ myOrder */}
            <a href="https://line.me/myorder-register" className="btn btn-primary btn-lg" target="_blank" rel="noreferrer">
              📩 ติดต่อ myOrder เพื่อลงทะเบียนร้านค้า
            </a>
          </div>
        </div>
      </div>
    );
  }

  // กรณีอื่นที่ไม่ใช่ shop/admin — ไม่ควรเกิดขึ้น (navigate() กัน visitor ไว้แล้ว)
  if (!user || (user.role !== "shop" && user.role !== "admin")) {
    return null;
  }

  // UC19: role="shop" — แสดงรายละเอียดร้านค้าในครอบครอง
  const [shop, setShop] = useState(MOCK_MY_SHOP);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: shop.name, link: shop.link, description: shop.description });

  // UC1: แก้ไขรายละเอียดร้านค้า
  const handleSave = () => {
    setShop(p => ({ ...p, ...editForm }));
    setEditing(false);
    notify("บันทึกข้อมูลเรียบร้อย", "success");
  };

  const statusBadge = (s) => {
    if (s === "pending")  return <span className="badge badge-yellow">⏳ รอตรวจสอบ</span>;
    if (s === "approved") return <span className="badge badge-green">✓ อนุมัติ</span>;
    return <span className="badge badge-red">✕ ไม่ผ่าน</span>;
  };

  return (
    <div className="page">
      <div className="section" style={{ paddingTop: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontFamily: "var(--display)", fontSize: 22, fontWeight: 600 }}>รายละเอียดร้านค้าของฉัน</h2>
            <p style={{ color: "var(--text3)", fontSize: 13 }}>จัดการข้อมูลและสถานะร้านค้า</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("profile")}>← กลับโปรไฟล์</button>
        </div>

        {/* Stats */}
        <div className="stat-row" style={{ marginBottom: 20 }}>
          <div className="stat-mini"><div className="stat-mini-val">{shop.rating}</div><div className="stat-mini-label">คะแนน</div></div>
          <div className="stat-mini"><div className="stat-mini-val">{shop.orders_count}</div><div className="stat-mini-label">ออเดอร์</div></div>
          <div className="stat-mini"><div className="stat-mini-val">ขั้น {shop.tier}</div><div className="stat-mini-label">ระดับ</div></div>
        </div>

        {/* ข้อมูลร้านค้า */}
        <div className="dash-card" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <span style={{ fontSize: 40 }}>{shop.img_emoji}</span>
              <div>
                <div style={{ fontFamily: "var(--display)", fontSize: 18, fontWeight: 600 }}>{shop.name}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                  <TierBadge tier={shop.tier} />
                  <span className="badge badge-gray">{shop.category}</span>
                </div>
              </div>
            </div>
            {/* UC1: ปุ่มแก้ไขรายละเอียด */}
            <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>✏️ แก้ไขข้อมูล</button>
          </div>
          <div className="detail-row"><div className="detail-label">🔗 ลิงก์</div><div className="detail-value"><a href={shop.link} style={{ color: "var(--accent)" }} target="_blank" rel="noreferrer">{shop.link}</a></div></div>
          <div className="detail-row"><div className="detail-label">📝 รายละเอียด</div><div className="detail-value" style={{ color: "var(--text2)" }}>{shop.description}</div></div>
          <div className="detail-row"><div className="detail-label">📅 สร้างเมื่อ</div><div className="detail-value" style={{ color: "var(--text3)" }}>{shop.created_at}</div></div>
          <div className="detail-row"><div className="detail-label">👤 ประเภท</div><div className="detail-value">{shop.entity_type === "company" ? "🏢 นิติบุคคล" : "👤 บุคคลธรรมดา"}</div></div>
        </div>

        {/* UC20: ส่วนขอเลื่อนขั้น */}
        {shop.tier === 1 && (() => {
          // คำนวณ cooldown เพื่อแสดงสถานะในหน้า MyShop ด้วย
          const { failed_count, last_rejected_at } = shop;
          let inCooldown = false;
          let daysLeft = 0;
          if (failed_count >= 3 && last_rejected_at) {
            const [y, m, d] = last_rejected_at.split("-").map(Number);
            const year = y > 2500 ? y - 543 : y;
            const diff = Math.floor((new Date() - new Date(year, m - 1, d)) / 86400000);
            daysLeft = 30 - diff;
            inCooldown = daysLeft > 0;
          }
          return (
            <div className="dash-card" style={{ marginBottom: 16, background: inCooldown ? "linear-gradient(135deg,#fef9f9,#fef2f2)" : "linear-gradient(135deg,#fff7f5,#fef3ee)", border: `1.5px solid ${inCooldown ? "rgba(220,38,38,0.2)" : "rgba(232,93,38,0.2)"}` }}>
              <div style={{ display: "flex", gap: 16, alignItems: inCooldown ? "flex-start" : "center" }}>
                <div style={{ fontSize: 36 }}>{inCooldown ? "⏳" : "🚀"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--display)", fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
                    ขอเลื่อนขั้น 1 → 2
                  </div>
                  {inCooldown ? (
                    <div className="alert alert-error" style={{ marginTop: 4 }}>
                      <div style={{ fontSize: 13, lineHeight: 1.7 }}>
                        ขอเลื่อนขั้นไม่ผ่านครบ 3 ครั้งแล้ว ต้องรออีก <strong>{daysLeft} วัน</strong> ก่อนยื่นใหม่
                      </div>
                    </div>
                  ) : (
                    <p style={{ fontSize: 13, color: "var(--text2)" }}>
                      ยืนยันตัวตนด้วยเอกสาร เพื่อเพิ่มความน่าเชื่อถือ
                      {failed_count > 0 && (
                        <span style={{ marginLeft: 6, color: "var(--yellow)", fontWeight: 700 }}>
                          (ไม่ผ่าน {failed_count}/3 ครั้ง)
                        </span>
                      )}
                    </p>
                  )}
                </div>
                {!inCooldown && (
                  <button className="btn btn-primary" onClick={() => onNavigate("upgrade")}>ยื่นขอเลื่อนขั้น →</button>
                )}
              </div>
            </div>
          );
        })()}

        {shop.tier === 2 && (
          // ขั้น 2→3: ต้องให้แอดมินจัดการ ร้านค้าทำเองไม่ได้
          <div className="dash-card" style={{ marginBottom: 16, background: "linear-gradient(135deg, #fffbeb, #fef9c3)", border: "1.5px solid rgba(217,119,6,0.25)" }}>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ fontSize: 36 }}>🥇</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--display)", fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
                  การเลื่อนขั้น 2 → 3
                </div>
                <div className="alert alert-warn" style={{ marginBottom: 0 }}>
                  ⚠️ ขั้นที่ 3 เป็นสิทธิ์ที่ต้องจัดการโดยแอดมินเท่านั้น<br />
                  <span style={{ fontSize: 13 }}>ทีมงาน myOrder จะทดลองสั่งของจากร้านคุณก่อน หากผ่านการตรวจสอบแล้ว แอดมินจะเลื่อนขั้นให้อัตโนมัติ</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {shop.tier === 3 && (
          <div className="dash-card" style={{ marginBottom: 16, background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", border: "1.5px solid rgba(26,158,94,0.25)" }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ fontSize: 36 }}>🏆</div>
              <div>
                <div style={{ fontFamily: "var(--display)", fontSize: 16, fontWeight: 600, marginBottom: 4 }}>ร้านค้าของคุณอยู่ระดับสูงสุดแล้ว!</div>
                <p style={{ fontSize: 13, color: "var(--text2)" }}>ขอบคุณที่ไว้วางใจ myOrder ลูกค้าจะเห็น Badge ระดับ 3 ของคุณ</p>
              </div>
            </div>
          </div>
        )}

        {/* ประวัติการขอเลื่อนขั้น */}
        <div className="dash-card">
          <div className="dash-card-title">ประวัติการขอเลื่อนขั้น</div>
          <div className="dash-card-sub">บันทึกคำขอและผลการพิจารณาทั้งหมด</div>
          {shop.upgrade_history.length === 0 ? (
            <p style={{ color: "var(--text3)", fontSize: 14 }}>ยังไม่มีประวัติ</p>
          ) : shop.upgrade_history.map((h, i) => (
            <div className="history-item" key={i}>
              <div className={`history-dot ${h.status === "approved" ? "dot-success" : h.status === "pending" ? "dot-pending" : "dot-fail"}`} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>ขอขึ้นขั้น {h.tier_requested} {statusBadge(h.status)}</div>
                {h.reason && <div style={{ fontSize: 13, color: "var(--red)", marginTop: 4 }}>เหตุผลที่ไม่ผ่าน: {h.reason}</div>}
                <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>{h.date} · ครั้งที่ {h.round}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* UC1: Modal แก้ไขรายละเอียด */}
      {editing && (
        <Modal title="✏️ แก้ไขรายละเอียดร้านค้า" onClose={() => setEditing(false)}
          footer={<>
            <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>ยกเลิก</button>
            <button className="btn btn-primary btn-sm" onClick={handleSave}>บันทึก</button>
          </>}>
          <div className="form-group">
            <label className="form-label">ชื่อร้านค้า</label>
            <input className="input" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">ลิงก์ติดต่อ</label>
            <input className="input" placeholder="https://line.me/..." value={editForm.link} onChange={e => setEditForm(p => ({ ...p, link: e.target.value }))} />
            <div className="form-hint">เช่น Line OA, Facebook Page, หรือ Instagram</div>
          </div>
          <div className="form-group">
            <label className="form-label">รายละเอียดร้าน</label>
            <textarea className="input textarea" value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} />
          </div>
        </Modal>
      )}
    </div>
  );
}

// ============================================================
// PAGE: UPGRADE WIZARD
// UC20: ยื่นขอเลื่อนขั้น 1→2 — เฉพาะ role="shop" และ tier=1
//       ขั้น 2→3: ต้องให้แอดมินจัดการ ร้านค้าทำเองไม่ได้
// UC17: ยื่นเอกสาร — include ใน flow นี้
// ============================================================
const WIZARD_STEPS = ["ตรวจสอบ", "อัปโหลด", "ยืนยัน"];

function UpgradePage({ user, onNavigate, notify }) {
  const currentTier = MOCK_MY_SHOP.current_tier;
  const entityType  = MOCK_MY_SHOP.entity_type;
  const [step, setStep]           = useState(0);
  const [checks, setChecks]       = useState({ eligible: null, failed_count: 0, days_remaining: 0 });
  const [files, setFiles]         = useState({});
  const [submitted, setSubmitted] = useState(false);
  const fileRefs = useRef({});

  // guard: เฉพาะ role="shop"
  if (!user || user.role !== "shop") {
    return (
      <div className="page">
        <div className="section" style={{ paddingTop: 40, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
          <h2 style={{ fontFamily: "var(--display)", fontSize: 20, marginBottom: 12 }}>ไม่มีสิทธิ์เข้าถึงหน้านี้</h2>
          <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 20 }}>หน้านี้สำหรับเจ้าของร้านค้าเท่านั้น</p>
          <button className="btn btn-primary" onClick={() => onNavigate("home")}>กลับหน้าหลัก</button>
        </div>
      </div>
    );
  }

  // ขั้น 2→3: ต้องให้แอดมินจัดการ ร้านค้าทำเองไม่ได้
  if (currentTier === 2) {
    return (
      <div className="page">
        <div className="section" style={{ paddingTop: 28, maxWidth: 640 }}>
          <button className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }} onClick={() => onNavigate("myshop")}>← กลับ</button>
          <div className="dash-card" style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🥇</div>
            <h2 style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
              การเลื่อนขั้น 2 → 3
            </h2>
            <div className="alert alert-warn" style={{ textAlign: "left", marginBottom: 24 }}>
              <div>
                ⚠️ <strong>ขั้นที่ 3 ต้องจัดการโดยแอดมินเท่านั้น</strong>
                <div style={{ fontSize: 13, marginTop: 6, lineHeight: 1.7 }}>
                  ทีมงาน myOrder จะทดลองสั่งของจากร้านคุณก่อน
                  หากผ่านการตรวจสอบแล้ว แอดมินจะดำเนินการเลื่อนขั้นให้
                  โปรดรอการติดต่อจากทีมงาน
                </div>
              </div>
            </div>
            <button className="btn btn-outline" onClick={() => onNavigate("myshop")}>กลับหน้าร้านค้า</button>
          </div>
        </div>
      </div>
    );
  }

  // ขั้น 3 ขึ้นไป: สูงสุดแล้ว
  if (currentTier >= 3) {
    return (
      <div className="page">
        <div className="section" style={{ paddingTop: 28, maxWidth: 640, textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--display)", fontSize: 22, fontWeight: 600, marginBottom: 16 }}>
            ร้านค้าของคุณอยู่ระดับสูงสุดแล้ว 🏆
          </h2>
          <button className="btn btn-primary" onClick={() => onNavigate("myshop")}>กลับหน้าร้านค้า</button>
        </div>
      </div>
    );
  }

  // ตรวจสอบสิทธิ์ขอเลื่อนขั้น (UC20):
  // - failed_count < 3  → ยื่นได้ (เตือนจำนวนครั้งที่ใช้ไปแล้ว)
  // - failed_count >= 3 → ต้องรอ 30 วันนับจาก last_rejected_at
  // - ครบ 30 วันแล้ว   → reset (eligible = true, failed_count = 0)
  const runChecks = () => {
    setTimeout(() => {
      const { failed_count, last_rejected_at } = MOCK_MY_SHOP;

      if (failed_count < 3) {
        setChecks({ eligible: true, failed_count, days_remaining: 0 });
        return;
      }

      // failed_count >= 3 → คำนวณวันที่เหลือต้องรอ
      const parseDate = (str) => {
        // รองรับ YYYY-MM-DD ทั้ง พ.ศ. (>2500) และ ค.ศ.
        const [y, m, d] = str.split("-").map(Number);
        const year = y > 2500 ? y - 543 : y;
        return new Date(year, m - 1, d);
      };

      const lastReject = parseDate(last_rejected_at);
      const diffDays   = Math.floor((new Date() - lastReject) / 86400000);
      const daysLeft   = 30 - diffDays;

      if (daysLeft > 0) {
        // ยังต้องรออยู่
        setChecks({ eligible: false, failed_count, days_remaining: daysLeft });
      } else {
        // ครบ 30 วันแล้ว → reset (TODO: เรียก API reset failed_count)
        setChecks({ eligible: true, failed_count: 0, days_remaining: 0, was_reset: true });
      }
    }, 700);
  };
  useEffect(() => { if (step === 0) runChecks(); }, [step]);

  // UC17: เอกสารที่ต้องยื่น ขึ้นกับประเภทนิติบุคคล
  const getRequiredDocs = () => {
    if (entityType === "individual") return [
      { key: "id_card",   label: "สำเนาบัตรประชาชน",        hint: "ถ่ายภาพให้ชัด ครบ 4 มุม" },
      { key: "selfie_id", label: "รูปถ่ายคู่บัตรประชาชน",   hint: "ถือบัตร ถ่ายให้เห็นหน้าและบัตรชัดเจน" },
    ];
    return [
      { key: "vat",        label: "ภพ.20 (ทะเบียนภาษีมูลค่าเพิ่ม)",   hint: "เอกสารจากกรมสรรพากร" },
      { key: "dir_id",     label: "บัตรประชาชนของกรรมการ",             hint: "สำเนาพร้อมเซ็นรับรอง" },
      { key: "selfie_dir", label: "รูปถ่ายกรรมการคู่บัตรประชาชน",      hint: "กรรมการถือบัตร ถ่ายให้ชัด" },
    ];
  };

  const handleFileChange = (key, file) => setFiles(p => ({ ...p, [key]: file }));
  const allFilesUploaded = getRequiredDocs().every(d => files[d.key]);

  const handleSubmit = () => {
    setSubmitted(true);
    notify("ส่งคำขอเรียบร้อยแล้ว รอแอดมินตรวจสอบ", "success");
  };

  return (
    <div className="page">
      <div className="section" style={{ paddingTop: 28, maxWidth: 680 }}>
        <button className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }} onClick={() => onNavigate("myshop")}>← กลับ</button>

        {submitted ? (
          <div className="dash-card" style={{ textAlign: "center", padding: 48 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontFamily: "var(--display)", fontSize: 22, fontWeight: 600, marginBottom: 8 }}>ส่งคำขอเรียบร้อยแล้ว!</h2>
            <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 24 }}>ทีมแอดมินจะตรวจสอบและแจ้งผลภายใน 1–3 วันทำการ</p>
            <button className="btn btn-primary" onClick={() => onNavigate("myshop")}>กลับหน้าร้านค้า</button>
          </div>
        ) : (
          <>
            <h2 style={{ fontFamily: "var(--display)", fontSize: 22, fontWeight: 600, marginBottom: 6 }}>
              ยื่นขอเลื่อนขั้น 1 → 2
            </h2>
            <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 28 }}>
              ประเภท: {entityType === "individual" ? "👤 บุคคลธรรมดา" : "🏢 นิติบุคคล"} · ระดับปัจจุบัน: <TierBadge tier={currentTier} />
            </p>

            <div className="wizard-steps">
              {WIZARD_STEPS.map((s, i) => (
                <div className="wizard-step" key={s}>
                  <div className={`step-circle ${i < step ? "done" : i === step ? "active" : ""}`}>{i < step ? "✓" : i + 1}</div>
                  <div className={`step-label ${i < step ? "done" : i === step ? "active" : ""}`}>{s}</div>
                </div>
              ))}
            </div>

            {/* Step 0: ตรวจสอบคุณสมบัติ */}
            {step === 0 && (
              <div className="dash-card">
                <div className="dash-card-title">ตรวจสอบคุณสมบัติ</div>
                <div className="dash-card-sub">ระบบกำลังตรวจสอบสิทธิ์ก่อนดำเนินการ</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>

                  {/* กำลังโหลด */}
                  {checks.eligible === null && (
                    <div className="alert alert-info">⏳ กำลังตรวจสอบจำนวนครั้งที่ขอเลื่อนขั้น...</div>
                  )}

                  {/* ครบ 3 ครั้ง ยังรออยู่ */}
                  {checks.eligible === false && (
                    <div className="alert alert-error">
                      <div>
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>
                          ✕ ขอเลื่อนขั้นไม่ผ่านครบ 3 ครั้งแล้ว
                        </div>
                        <div style={{ fontSize: 13, lineHeight: 1.7 }}>
                          คุณได้ขอเลื่อนขั้นไม่ผ่านมาแล้ว <strong>{checks.failed_count} ครั้ง</strong> ในรอบนี้<br />
                          ต้องรออีก <strong>{checks.days_remaining} วัน</strong> นับจากครั้งล่าสุดที่ไม่ผ่าน<br />
                          <span style={{ opacity: 0.8 }}>จะสามารถยื่นขอใหม่ได้อีกครั้งหลังจากนั้น</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ผ่าน — แต่เคย reject มาบ้างแล้ว แจ้งเตือน */}
                  {checks.eligible === true && checks.failed_count > 0 && !checks.was_reset && (
                    <>
                      <div className="alert alert-success">
                        ✓ สามารถยื่นขอเลื่อนขั้นได้
                      </div>
                      <div className="alert alert-warn">
                        <div style={{ fontSize: 13, lineHeight: 1.7 }}>
                          ⚠️ คุณขอเลื่อนขั้นไม่ผ่านมาแล้ว <strong>{checks.failed_count} / 3 ครั้ง</strong><br />
                          หากไม่ผ่านอีก <strong>{3 - checks.failed_count} ครั้ง</strong> จะต้องรอ 30 วันก่อนยื่นใหม่
                        </div>
                      </div>
                    </>
                  )}

                  {/* ผ่าน — ไม่เคย reject เลย */}
                  {checks.eligible === true && checks.failed_count === 0 && !checks.was_reset && (
                    <div className="alert alert-success">
                      ✓ สามารถยื่นขอเลื่อนขั้นได้
                    </div>
                  )}

                  {/* ผ่าน — เพิ่งครบ cooldown 30 วัน (was_reset) */}
                  {checks.eligible === true && checks.was_reset && (
                    <>
                      <div className="alert alert-success">
                        ✓ ครบ 30 วันแล้ว สามารถยื่นขอเลื่อนขั้นได้อีกครั้ง
                      </div>
                      <div className="alert alert-info" style={{ fontSize: 13 }}>
                        💡 จำนวนครั้งที่ไม่ผ่านได้ถูก reset เป็น 0 แล้ว
                      </div>
                    </>
                  )}
                </div>

                {checks.eligible !== null && (
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("myshop")}>ยกเลิก</button>
                    <button className="btn btn-primary" disabled={!checks.eligible} onClick={() => setStep(1)}>ถัดไป →</button>
                  </div>
                )}
              </div>
            )}

            {/* Step 1: UC17 ยื่นเอกสาร */}
            {step === 1 && (
              <div className="dash-card">
                <div className="dash-card-title">ยื่นเอกสาร</div>
                <div className="dash-card-sub">
                  กรณี {entityType === "individual" ? "บุคคลธรรมดา" : "นิติบุคคล"} — กรุณาอัปโหลดเอกสารให้ครบถ้วน
                </div>
                <div className="alert alert-info" style={{ marginBottom: 20 }}>
                  💡 เอกสารควรถ่ายให้ชัดเจน ตัวอักษรอ่านออก ไม่มีส่วนที่ถูกบัง
                </div>
                {getRequiredDocs().map(doc => (
                  <div key={doc.key} className="form-group">
                    <label className="form-label">{doc.label} *</label>
                    <div className={`upload-zone ${files[doc.key] ? "filled" : ""}`} onClick={() => {
                      if (!fileRefs.current[doc.key]) fileRefs.current[doc.key] = document.createElement("input");
                      fileRefs.current[doc.key].type = "file";
                      fileRefs.current[doc.key].accept = "image/*,.pdf";
                      fileRefs.current[doc.key].onchange = e => handleFileChange(doc.key, e.target.files[0]);
                      fileRefs.current[doc.key].click();
                    }}>
                      <div className="upload-icon">{files[doc.key] ? "✅" : "📄"}</div>
                      <div className="upload-text">{files[doc.key] ? files[doc.key].name : "คลิกเพื่ออัปโหลด"}</div>
                      <div className="upload-sub">{doc.hint}</div>
                    </div>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setStep(0)}>← ย้อนกลับ</button>
                  <button className="btn btn-primary" disabled={!allFilesUploaded} onClick={() => setStep(2)}>ถัดไป →</button>
                </div>
              </div>
            )}

            {/* Step 2: ยืนยัน */}
            {step === 2 && (
              <div className="dash-card">
                <div className="dash-card-title">ยืนยันการส่งคำขอ</div>
                <div className="dash-card-sub">ตรวจสอบข้อมูลก่อนส่ง</div>
                <div style={{ marginBottom: 20 }}>
                  <div className="detail-row"><div className="detail-label">ขั้นที่ขอ</div><div className="detail-value"><TierBadge tier={2} /></div></div>
                  <div className="detail-row"><div className="detail-label">ประเภท</div><div className="detail-value">{entityType === "individual" ? "👤 บุคคลธรรมดา" : "🏢 นิติบุคคล"}</div></div>
                  <div className="detail-row">
                    <div className="detail-label">เอกสาร</div>
                    <div className="detail-value">
                      {Object.values(files).map(f => <div key={f.name} style={{ fontSize: 13, color: "var(--green)" }}>✓ {f.name}</div>)}
                    </div>
                  </div>
                </div>
                <div className="alert alert-warn" style={{ marginBottom: 20 }}>
                  ⚠️ เมื่อส่งแล้วจะไม่สามารถแก้ไขเอกสารได้ กรุณาตรวจสอบให้เรียบร้อย
                </div>
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>← ย้อนกลับ</button>
                  <button className="btn btn-primary" onClick={handleSubmit}>📩 ส่งคำขอ</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
// APP SHELL
// ============================================================
export default function App() {
  const [page, setPage]         = useState("home");
  const [pageData, setPageData] = useState(null);
  const [notification, setNotification] = useState(null);
  const [homeKey, setHomeKey]   = useState(0);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  const [showLoginModal, setShowLoginModal] = useState(false);

  // โหลด user จาก localStorage — รวม role field
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user_data")); }
    catch { return null; }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const notify = (msg, type = "success") => setNotification({ msg, type });

  const navigate = (p, data = null) => {
    // UC15: ดูโปรไฟล์ — ต้อง login แล้ว
    if (p === "profile" && !user) {
      notify("กรุณาเข้าสู่ระบบก่อน", "error");
      return;
    }
    // UC20: ขอเลื่อนขั้น — ต้องเป็น role="shop"
    if (p === "upgrade" && (!user || user.role !== "shop")) {
      notify("ต้องเป็นเจ้าของร้านค้าเท่านั้น", "error");
      return;
    }
    // "myshop": visitor → เปิด login modal แทน navigate
    if (p === "myshop" && !user) {
      setShowLoginModal(true);
      return;
    }
    if (p === "home") setHomeKey(k => k + 1);
    setPage(p);
    setPageData(data);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <style>{styles}</style>
      <Navbar user={user} onNavigate={navigate} darkMode={darkMode} toggleDark={() => setDarkMode(d => !d)} currentPage={page} />

      {/* UC8, UC13: ทุก actor เข้าถึงได้ */}
      {page === "home"        && <HomePage key={homeKey} onNavigate={navigate} />}
      {page === "shop-list"   && <ShopListPage onNavigate={navigate} />}

      {/* UC13: ดูรายละเอียดร้านค้า — ทุก actor */}
      {page === "shop-detail" && pageData && <ShopDetailPage shop={pageData} user={user} onNavigate={navigate} notify={notify} />}

      {/* UC15: ดูโปรไฟล์ — เฉพาะ login แล้ว */}
      {page === "profile"     && user && <ProfilePage user={user} onNavigate={navigate} />}

      {/* UC19: ดูร้านในครอบครอง — เฉพาะ role="shop" */}
      {page === "myshop"      && <MyShopPage user={user} onNavigate={navigate} notify={notify} />}

      {/* UC20: ขอเลื่อนขั้น — เฉพาะ role="shop" */}
      {page === "upgrade"     && <UpgradePage user={user} onNavigate={navigate} notify={notify} />}

      {notification && <Notification msg={notification.msg} type={notification.type} onClose={() => setNotification(null)} />}

      {/* Login modal — เปิดเมื่อ visitor กด "ร้านของฉัน" */}
      {showLoginModal && (
        <Modal title="เข้าสู่ระบบ" onClose={() => setShowLoginModal(false)}>
          <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
            <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 8 }}>
              กรุณาเข้าสู่ระบบเพื่อดูร้านค้าของคุณ
            </p>
            <p style={{ color: "var(--text3)", fontSize: 13, marginBottom: 24 }}>
              หากคุณมีร้านค้าในระบบ จะสามารถจัดการร้านได้ทันที
            </p>
          </div>
          <button className="google-btn" onClick={() => {
            localStorage.setItem("user_token", "mock_token");
            localStorage.setItem("user_data", JSON.stringify(MOCK_USER));
            window.location.reload();
          }}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.6 2.3 30.1 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.8 6.1C12.4 13.2 17.7 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 7.1-10 7.1-17z"/>
              <path fill="#FBBC05" d="M10.4 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.6L2.6 13.3A24 24 0 0 0 0 24c0 3.8.9 7.4 2.6 10.7l7.8-6.1z"/>
              <path fill="#34A853" d="M24 48c6.1 0 11.2-2 14.9-5.4l-7.5-5.8c-2 1.4-4.7 2.2-7.4 2.2-6.3 0-11.6-3.7-13.6-9.4l-7.8 6.1C6.6 42.6 14.6 48 24 48z"/>
            </svg>
            เข้าสู่ระบบด้วย Google
          </button>
        </Modal>
      )}
    </>
  );
}