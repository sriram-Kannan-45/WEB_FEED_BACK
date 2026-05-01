import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import TrainerDashboard from './pages/TrainerDashboard'
import ParticipantDashboard from './pages/ParticipantDashboard'

function App() {
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (e) {
        localStorage.removeItem('user')
      }
    }
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const DashboardWrapper = ({ component: Component, user, onLogout, defaultTab }) => (
    <Layout user={user} activeTab={activeTab} onTabChange={setActiveTab} onLogout={onLogout}>
      <Component user={user} onLogout={onLogout} activeTab={activeTab} onTabChange={setActiveTab} />
    </Layout>
  )

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onLogin={handleLogin} />} />

        <Route
          path="/admin"
          element={
            user?.role === 'ADMIN' ? (
              <DashboardWrapper component={AdminDashboard} user={user} onLogout={handleLogout} defaultTab="overview" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/trainer"
          element={
            user?.role === 'TRAINER' ? (
              <DashboardWrapper component={TrainerDashboard} user={user} onLogout={handleLogout} defaultTab="trainings" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/participant"
          element={
            user?.role === 'PARTICIPANT' ? (
              <DashboardWrapper component={ParticipantDashboard} user={user} onLogout={handleLogout} defaultTab="available" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App