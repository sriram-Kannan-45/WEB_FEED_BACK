import { useState } from 'react'

const navItems = {
  ADMIN: [
    { key: 'overview', label: 'Dashboard', icon: '◉' },
    { key: 'trainings', label: 'Trainings', icon: '◎' },
    { key: 'trainers', label: 'Trainers', icon: '◉' },
    { key: 'participants', label: 'Participants', icon: '◎' },
    { key: 'feedback', label: 'Feedback', icon: '◉' },
    { key: 'surveys', label: 'Surveys', icon: '◎' },
    { key: 'createTrainer', label: 'Add Trainer', icon: '＋' },
    { key: 'createTraining', label: 'Add Training', icon: '＋' },
  ],
  TRAINER: [
    { key: 'trainings', label: 'My Trainings', icon: '◎' },
    { key: 'feedback', label: 'Feedback', icon: '◉' },
    { key: 'profile', label: 'My Profile', icon: '◉' },
  ],
  PARTICIPANT: [
    { key: 'available', label: 'Available', icon: '◉' },
    { key: 'myEnrollments', label: 'Enrollments', icon: '◎' },
    { key: 'feedback', label: 'Give Feedback', icon: '◉' },
    { key: 'myFeedbacks', label: 'My Feedbacks', icon: '◎' },
  ],
}

function Layout({ user, children, activeTab, onTabChange, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const items = navItems[user.role] || []

  const initials = (name) => 
    name ? name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="app-layout">
      {/* Sidebar Overlay (mobile) */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={closeSidebar}
      />

      {/* Left Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">W</div>
          <div className="sidebar-brand">
            <span className="sidebar-brand-name">WAVE INIT</span>
            <span className="sidebar-brand-tagline">Learning Management</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">Navigation</div>
          {items.map(item => (
            <button
              key={item.key}
              className={`sidebar-nav-item ${activeTab === item.key ? 'active' : ''}`}
              onClick={() => { onTabChange(item.key); closeSidebar() }}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{initials(user.name)}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.name}</div>
              <div className="sidebar-user-role">{user.role}</div>
            </div>
            <button className="sidebar-logout-btn" onClick={onLogout} title="Sign Out">
              ↪
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          <div className="top-header-left">
            <button 
              className="sidebar-toggle" 
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>
            <h2 className="top-header-title">
              {items.find(i => i.key === activeTab)?.label || 'Dashboard'}
            </h2>
          </div>
          <div className="top-header-right">
            <button className="header-btn">🔔</button>
            <button className="header-btn" onClick={onLogout}>↪</button>
          </div>
        </header>

        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout