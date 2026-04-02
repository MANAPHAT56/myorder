const API_BASE = "http://localhost:8080/api/v1";

export const authHeaders = () => {
  const t = localStorage.getItem("user_token");
  return {
    Accept: "application/json",
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
  };
};

export const jsonHeaders = () => ({
  "Content-Type": "application/json",
  Accept: "application/json",
  ...authHeaders(),
});

export const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
  }
  return data;
};

const adminApi = {
  getDashboard: () =>
    fetch(`${API_BASE}/admin/dashboard`, { headers: authHeaders() }).then((r) => r.json()),

  getShops: (params) =>
    fetch(`${API_BASE}/admin/shops?${new URLSearchParams(params)}`, { headers: authHeaders() }).then((r) => r.json()),

  createShop: (data) =>
    fetch(`${API_BASE}/admin/shops`, {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  updateShop: (refId, data) =>
    fetch(`${API_BASE}/admin/shops/${refId}`, {
      method: "PATCH",
      headers: jsonHeaders(),
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  deleteShop: (refId, reason) =>
    fetch(`${API_BASE}/admin/shops/${refId}`, {
      method: "DELETE",
      headers: jsonHeaders(),
      body: JSON.stringify({ reason }),
    }).then((r) => r.json()),

  blacklistShop: (refId, reason, claimRequestId = null) =>
    fetch(`${API_BASE}/admin/shops/${refId}/blacklist`, {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify({ reason, claim_request_id: claimRequestId }),
    }).then((r) => r.json()),

  promoteTier3: (refId) =>
    fetch(`${API_BASE}/admin/shops/${refId}/tier3`, {
      method: "PATCH",
      headers: authHeaders(),
    }).then((r) => r.json()),

  getUpgradeRequests: (params) =>
    fetch(`${API_BASE}/admin/upgrade-requests?${new URLSearchParams(params)}`, { headers: authHeaders() }).then((r) => r.json()),

  approveUpgrade: (id, adminRemark = "") =>
    fetch(`${API_BASE}/admin/upgrade-requests/${id}/approve`, {
      method: "PATCH",
      headers: jsonHeaders(),
      body: JSON.stringify({ admin_remark: adminRemark }),
    }).then((r) => r.json()),

  rejectUpgrade: (id, reason) =>
    fetch(`${API_BASE}/admin/upgrade-requests/${id}/reject`, {
      method: "PATCH",
      headers: jsonHeaders(),
      body: JSON.stringify({ reason }),
    }).then((r) => r.json()),

  getClaims: (params) =>
    fetch(`${API_BASE}/admin/claims?${new URLSearchParams(params)}`, { headers: authHeaders() }).then((r) => r.json()),

  resolveClaim: (id, resolution, refundAmount = null, adminNote = "") =>
    fetch(`${API_BASE}/admin/claims/${id}/resolve`, {
      method: "PATCH",
      headers: jsonHeaders(),
      body: JSON.stringify({
        resolution,
        refund_amount: refundAmount,
        admin_note: adminNote,
      }),
    }).then((r) => r.json()),
};

export default adminApi;
