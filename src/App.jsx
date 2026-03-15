// 1. เปลี่ยน BrowserRouter เป็น HashRouter
import { HashRouter, Routes, Route } from 'react-router-dom' 
import User from './components/User'
import AdminPanel from './components/AdminPanel'

function App() {
  return (
    // 2. ใช้ HashRouter (ไม่ต้องใส่ basename ก็ได้สำหรับ HashRouter บน GitHub Pages)
    <HashRouter>
      <Routes>
        <Route path="/" element={<User />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </HashRouter>
  )
}

export default App