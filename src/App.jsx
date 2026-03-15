import { BrowserRouter, Routes, Route } from 'react-router-dom'
import User from './components/User'
import AdminPanel from './components/AdminPanel'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<User />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App