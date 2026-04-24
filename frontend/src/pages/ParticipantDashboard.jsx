function ParticipantDashboard({ user, onLogout }) {
  return (
    <div>
      <div className="navbar">
        <h1>Participant Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>Welcome, {user.email}</span>
          <button onClick={onLogout}>Logout</button>
        </div>
      </div>

      <div className="container dashboard">
        <div className="card">
          <h2>Participant Panel</h2>
          <p style={{ marginTop: '16px', color: '#666' }}>
            You are logged in as a PARTICIPANT. Access your training materials here.
          </p>
          <div style={{ marginTop: '20px', padding: '16px', background: '#f5f5f5', borderRadius: '4px' }}>
            <strong>Your Access:</strong>
            <ul style={{ marginTop: '12px', marginLeft: '20px' }}>
              <li>View available training sessions</li>
              <li>Enroll in courses</li>
              <li>Track your progress</li>
              <li>Submit feedback</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ParticipantDashboard