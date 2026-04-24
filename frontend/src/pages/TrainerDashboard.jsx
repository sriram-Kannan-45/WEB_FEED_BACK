function TrainerDashboard({ user, onLogout }) {
  return (
    <div>
      <div className="navbar">
        <h1>Trainer Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>Welcome, {user.email}</span>
          <button onClick={onLogout}>Logout</button>
        </div>
      </div>

      <div className="container dashboard">
        <div className="card">
          <h2>Trainer Panel</h2>
          <p style={{ marginTop: '16px', color: '#666' }}>
            You are logged in as a TRAINER. Manage your training sessions here.
          </p>
          <div style={{ marginTop: '20px', padding: '16px', background: '#f5f5f5', borderRadius: '4px' }}>
            <strong>Your Access:</strong>
            <ul style={{ marginTop: '12px', marginLeft: '20px' }}>
              <li>View training materials</li>
              <li>Track participant progress</li>
              <li>Update session schedules</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrainerDashboard