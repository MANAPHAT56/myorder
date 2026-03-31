// 1. เปลี่ยน BrowserRouter เป็น HashRouter
import { HashRouter, Routes, Route } from 'react-router-dom' 
import User from './components/User'
import AdminPanel from './components/AdminPanel'
import About from './components/About'
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = "687095367345-mfbmo1n0skvcfq7amilnk0a1dm746ii7.apps.googleusercontent.com";

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<User />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </HashRouter>
    </GoogleOAuthProvider>
  )
}

export default App