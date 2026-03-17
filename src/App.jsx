import { Routes, Route } from 'react-router-dom'
import { ToastProvider } from './components/Toast'
import Gallery from './pages/Gallery'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ProjectView from './pages/ProjectView'

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<Gallery />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/project/:id" element={<ProjectView />} />
      </Routes>
    </ToastProvider>
  )
}
