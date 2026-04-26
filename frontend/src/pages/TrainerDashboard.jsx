import { useState, useEffect } from 'react'

const API = 'http://localhost:3001/api'

function TrainerDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('myTrainings')
  
  const [myTrainings, setMyTrainings] = useState([])
  const [feedbacks, setFeedbacks] = useState([])
  const [stats, setStats] = useState({ total: 0, avgRating: 0 })

  useEffect(() => {
    fetchData()
  }, [])

  const getAuthHeader = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user.token}`,
  })

  const fetchData = async () => {
    await Promise.all([fetchMyTrainings(), fetchFeedbacks()])
  }

  const fetchMyTrainings = async () => {
    try {
      const response = await fetch(`${API}/trainer/trainings`, { headers: getAuthHeader() })
      const data = await response.json()
      if (data.trainings) {
        setMyTrainings(data.trainings)
        setStats(prev => ({ ...prev, total: data.trainings.length }))
      }
    } catch (err) { console.error(err) }
  }

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch(`${API}/trainer/feedbacks`, { headers: getAuthHeader() })
      const data = await response.json()
      if (data.feedbacks) {
        setFeedbacks(data.feedbacks)
        setStats(prev => ({ ...prev, avgRating: data.averageRating || 0 }))
      }
    } catch (err) { console.error(err) }
  }

  const formatDate = (d) => d ? new Date(d).toLocaleString() : '-'

  const tabs = [
    { key: 'myTrainings', label: 'My Trainings' },
    { key: 'feedback', label: 'Feedback' },
  ]

  return (
    <div>
      <div className="navbar">
        <h1>WAVE INIT LMS</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>{user.email}</span>
          <button onClick={onLogout}>Logout</button>
        </div>
      </div>

      <div className="container dashboard">
        <div className="tabs">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'myTrainings' && (
          <div>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
              <div className="card" style={{ flex: 1, textAlign: 'center' }}>
                <h2>{stats.total}</h2>
                <p>My Trainings</p>
              </div>
              <div className="card" style={{ flex: 1, textAlign: 'center' }}>
                <h2>{stats.avgRating}</h2>
                <p>Avg Rating</p>
              </div>
            </div>

            <div className="card">
              <h3>My Training Sessions</h3>
              {myTrainings.length === 0 ? (
                <p>No trainings assigned</p>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Schedule</th>
                      <th>Capacity</th>
                      <th>Enrolled</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myTrainings.map(t => (
                      <tr key={t.id}>
                        <td>{t.title}</td>
                        <td>{formatDate(t.schedule)}</td>
                        <td>{t.capacity || 'Unlimited'}</td>
                        <td>{t.enrolledCount || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="card">
            <h3>Feedback Received</h3>
            {feedbacks.length === 0 ? (
              <p>No feedback received</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Training</th>
                    <th>Trainer Rating</th>
                    <th>Subject Rating</th>
                    <th>Comments</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbacks.map(f => (
                    <tr key={f.id}>
                      <td>{f.trainingTitle}</td>
                      <td>{[1,2,3,4,5].map(s => (
                        <span key={s} style={{ color: s <= f.trainerRating ? '#ffc107' : '#ddd' }}>★</span>
                      ))}</td>
                      <td>{[1,2,3,4,5].map(s => (
                        <span key={s} style={{ color: s <= f.subjectRating ? '#ffc107' : '#ddd' }}>★</span>
                      ))}</td>
                      <td>{f.comments || '-'}</td>
                      <td>{f.submittedAt ? new Date(f.submittedAt).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default TrainerDashboard