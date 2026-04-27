import { useState, useEffect } from 'react'

const API = 'http://localhost:3001/api'

function TrainerDashboard({ user, onLogout }) {
  const [tab, setTab] = useState('trainings')
  const [trainings, setTrainings] = useState([])
  const [feedbacks, setFeedbacks] = useState([])
  const [stats, setStats] = useState({ totalTrainings: 0, avgTrainerRating: 0, avgSubjectRating: 0, totalFeedbacks: 0 })

  const auth = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` })

  useEffect(() => {
    fetchTrainings()
    fetchFeedbacks()
  }, [])

  const fetchTrainings = async () => {
    try {
      const r = await fetch(`${API}/trainer/trainings`, { headers: auth() })
      const d = await r.json()
      const list = d.trainings || []
      setTrainings(list)
      setStats(p => ({ ...p, totalTrainings: list.length }))
    } catch {}
  }

  const fetchFeedbacks = async () => {
    try {
      const r = await fetch(`${API}/trainer/feedbacks`, { headers: auth() })
      const d = await r.json()
      const list = d.feedbacks || []
      setFeedbacks(list)
      setStats(p => ({
        ...p,
        avgTrainerRating: d.averageTrainerRating || 0,
        avgSubjectRating: d.averageSubjectRating || 0,
        totalFeedbacks: list.length
      }))
    } catch {}
  }

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'
  const Stars = ({ v }) => <span className="stars">{[1,2,3,4,5].map(s => <span key={s} className={`star ${s<=v?'filled':''}`}>&#9733;</span>)}</span>
  const initials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : 'TR'

  const TABS = [
    { key: 'trainings', label: 'My Trainings' },
    { key: 'feedback', label: 'Feedback Received' },
  ]

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="navbar-logo">W</div>
          <h1>WAVE INIT LMS</h1>
          <span className="navbar-badge">Trainer</span>
        </div>
        <div className="navbar-right">
          <div className="user-chip">
            <div className="user-avatar">{initials(user.name)}</div>
            <div className="user-chip-info">
              <span>{user.name || 'Trainer'}</span>
              <small>{user.email}</small>
            </div>
          </div>
          <button className="btn btn-sm btn-logout" onClick={onLogout}>Sign Out</button>
        </div>
      </nav>

      <div className="container">
        <div className="dashboard">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Assigned Trainings</div>
              <div className="stat-value">{stats.totalTrainings}</div>
            </div>
            <div className="stat-card green">
              <div className="stat-label">Feedback Responses</div>
              <div className="stat-value">{stats.totalFeedbacks}</div>
            </div>
            <div className="stat-card purple">
              <div className="stat-label">Avg Trainer Rating</div>
              <div className="stat-value">{stats.avgTrainerRating}</div>
            </div>
            <div className="stat-card orange">
              <div className="stat-label">Avg Subject Rating</div>
              <div className="stat-value">{stats.avgSubjectRating}</div>
            </div>
          </div>

          <div className="tabs">
            {TABS.map(t => (
              <button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'trainings' && (
            <div>
              <div className="section-header">
                <h3>Assigned Training Programs</h3>
              </div>
              {trainings.length === 0 ? (
                <div className="card"><div className="empty-state"><p>No trainings assigned to you yet.</p></div></div>
              ) : (
                <div className="training-grid">
                  {trainings.map(t => {
                    const pct = t.capacity ? Math.round((t.enrolledCount / t.capacity) * 100) : null
                    return (
                      <div key={t.id} className="training-card">
                        <div className="training-card-title">{t.title}</div>
                        <div className="training-card-desc">{t.description || 'No description provided.'}</div>
                        <div className="training-meta">
                          <div className="meta-item"><span className="meta-key">Dates:</span><span>{fmtDate(t.startDate)} - {fmtDate(t.endDate)}</span></div>
                          <div className="meta-item"><span className="meta-key">Enrolled:</span><span>{t.enrolledCount} {t.capacity ? `/ ${t.capacity}` : ''}</span></div>
                        </div>
                        {pct !== null && (
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)' }}>
                              <span>Capacity Fill</span><span>{pct}%</span>
                            </div>
                            <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {tab === 'feedback' && (
            <div className="card">
              <div className="card-header">
                <h3>Feedback Received ({feedbacks.length})</h3>
              </div>
              {feedbacks.length === 0 ? (
                <div className="empty-state"><p>No feedback received yet.</p></div>
              ) : (
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr><th>Training</th><th>Participant</th><th>Trainer Rating</th><th>Subject Rating</th><th>Comments</th><th>Date</th></tr>
                    </thead>
                    <tbody>
                      {feedbacks.map(f => (
                        <tr key={f.id}>
                          <td><strong>{f.trainingTitle}</strong></td>
                          <td>{f.anonymous ? <span className="badge badge-gray">Anonymous</span> : f.participantName}</td>
                          <td><Stars v={f.trainerRating} /></td>
                          <td><Stars v={f.subjectRating} /></td>
                          <td style={{ maxWidth: 200, fontSize: 12, color: 'var(--text-secondary)' }}>{f.comments || '-'}</td>
                          <td>{fmtDate(f.submittedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TrainerDashboard