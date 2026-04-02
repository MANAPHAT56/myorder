const API_BASE = "http://localhost:8080/api/v1";

export const authHeaders = () => {
  const t = localStorage.getItem("user_token");
  return {
    "Content-Type": "application/json", // เพิ่มบรรทัดนี้เข้าไป
    Accept: "application/json",
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
  };
};
export const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
  }
  return data;
};

const api = {
  loginGoogle: (token) =>
    fetch(`${API_BASE}/auth/google`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ token }),
    }).then(handleResponse),

  getProfile: () =>
    fetch(`${API_BASE}/user/profile`, {
      headers: authHeaders(),
      credentials: "include",
    }).then(handleResponse),

  searchShops: (params) =>
    fetch(`${API_BASE}/shops?${new URLSearchParams(params)}`, {
      headers: authHeaders(),
      credentials: "include",
    }).then(handleResponse),

  getFeaturedShops: () =>
    fetch(`${API_BASE}/shops/featured`, {
      headers: authHeaders(),
      credentials: "include",
    }).then(handleResponse),

  getShopDetail: (refId) =>
    fetch(`${API_BASE}/shops/${refId}`, {
      headers: authHeaders(),
      credentials: "include",
    }).then(handleResponse),

  getShopUpgradeRequests: (refId) =>
    fetch(`${API_BASE}/shops/${refId}/upgrade-requests`, {
      headers: authHeaders(),
      credentials: "include",
    }).then(handleResponse),

  claimShop: (refId, formData) =>
    fetch(`${API_BASE}/shops/${refId}/claim`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(localStorage.getItem("user_token") && {
          Authorization: `Bearer ${localStorage.getItem("user_token")}`,
        }),
      },
      credentials: "include",
      body: formData,
    }).then(handleResponse),

  getMyShop: () =>
    fetch(`${API_BASE}/my-shop`, {
      headers: authHeaders(),
      credentials: "include",
    }).then(handleResponse),

  updateMyShop: (data) =>
    fetch(`${API_BASE}/my-shop`, {
      method: "POST",
      headers: authHeaders(),
      credentials: "include",
      body: JSON.stringify(data),
    }).then(handleResponse),

  checkUpgradeEligibility: () =>
    fetch(`${API_BASE}/my-shop/upgrade/check`, {
      headers: authHeaders(),
      credentials: "include",
    }).then(handleResponse),

  submitUpgrade: (formData) =>
    fetch(`${API_BASE}/my-shop/upgrade`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(localStorage.getItem("user_token") && {
          Authorization: `Bearer ${localStorage.getItem("user_token")}`,
        }),
      },
      credentials: "include",
      body: formData,
    }).then(handleResponse),

  logout: () =>
    fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: authHeaders(),
      credentials: "include",
    }).then(handleResponse),
};

export default api;
