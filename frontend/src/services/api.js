// ตัวอย่างใน api.js
export const loginGoogle = async (idToken) => {
  // ตรวจสอบ URL ให้ดี (ถ้าใช้ Docker/Port ต่างกัน)
  const response = await axios.post('http://localhost:8080/api/v1/auth/google', {
    token: idToken  // ✅ ต้องชื่อ 'token' ให้ตรงกับ Laravel
  });
  return response.data;
};