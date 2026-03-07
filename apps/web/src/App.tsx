import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="conversations" element={<div className="p-8"><h1 className="text-2xl font-bold">Conversations - Coming Soon</h1></div>} />
          <Route path="analytics" element={<div className="p-8"><h1 className="text-2xl font-bold">Analytics - Coming Soon</h1></div>} />
          <Route path="users" element={<div className="p-8"><h1 className="text-2xl font-bold">Users - Coming Soon</h1></div>} />
          <Route path="activity" element={<div className="p-8"><h1 className="text-2xl font-bold">Activity - Coming Soon</h1></div>} />
          <Route path="settings" element={<div className="p-8"><h1 className="text-2xl font-bold">Settings - Coming Soon</h1></div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
