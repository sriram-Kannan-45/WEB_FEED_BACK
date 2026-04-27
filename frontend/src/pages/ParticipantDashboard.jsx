import { useState, useEffect } from 'react'

const API = 'http://localhost:3001/api'

function ParticipantDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('available')
  
  const [trainings, setTrainings] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [feedbacks, setFeedbacks] = useState([])
  
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [selectedTraining, setSelectedTraining] = useState(null)
  const [feedbackForm, setFeedbackForm] = useState({ trainerRating: 0, subjectRating: 0, comments: '' })

  useEffect(() => {
    fetchData()
  }, [])

  const getAuthHeader = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user.token}`,
  })

  const fetchData = async () => {
    await Promise.all([fetchTrainings(), fetchEnrollments(), fetchFeedbacks()])
  }

  const fetchTrainings = async () => {
    try {
      const response = await fetch(`${API}/trainings`, { headers: getAuthHeader() })
      const data = await response.json()
      console.log('Participant trainings:', response.status, data)
      if (data.trainings) setTrainings(data.trainings)
      else if (Array.isArray(data)) setTrainings(data)
    } catch (err) { console.error(err) }
  }

  const fetchEnrollments = async () => {
    try {
      const response = await fetch(`${API}/participant/enrollments`, { headers: getAuthHeader() })
      const data = await response.json()
      if (data.enrollments) setEnrollments(data.enrollments)
    } catch (err) { console.error(err) }
  }

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch(`${API}/feedback/my-feedbacks`, { headers: getAuthHeader() })
      const data = await response.json()
      if (data.feedbacks) setFeedbacks(data.feedbacks)
    } catch (err) { console.error(err) }
  }

  const handleEnroll = async (trainingId) => {
    setLoading(true)
    try {
      const response = await fetch(`${API}/participant/enroll`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ trainingId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to enroll')
      }

      setMessage('Enrolled successfully')
      fetchTrainings()
      fetchEnrollments()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const openFeedbackModal = (training) => {
    setSelectedTraining(training)
    setFeedbackForm({ trainerRating: 0, subjectRating: 0, comments: '' })
    setShowFeedbackModal(true)
  }

  const handleSubmitFeedback = async (e) => {
    e.preventDefault()
    if (feedbackForm.trainerRating === 0 || feedbackForm.subjectRating === 0) {
      setError('Please select both ratings')
      return
    }
    setLoading(true)

    try {
      const response = await fetch(`${API}/feedback`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({
          trainingId: selectedTraining.id,
          trainerRating: feedbackForm.trainerRating,
          subjectRating: feedbackForm.subjectRating,
          comments: feedbackForm.comments
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback')
      }

      setMessage('Feedback submitted successfully')
      setShowFeedbackModal(false)
      fetchFeedbacks()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (d) => d ? new Date(d).toLocaleString() : '-'

  const isEnrolled = (trainingId) => {
    return enrollments.some(e => e.trainingId === trainingId)
  }

  const hasFeedback = (trainingId) => {
    return feedbacks.some(f => f.trainingId === trainingId)
  }

  const tabs = [
    { key: 'available', label: 'Available' },
    { key: 'myEnrollments', label: 'My Enrollments' },
    { key: 'feedback', label: 'Give Feedback' },
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

        {error && <div className="error">{error}</div>}
        {message && <div className="success">{message}</div>}

        {activeTab === 'available' && (
          <div className="card">
            <h3>Available Trainings</h3>
            {trainings.length === 0 ? (
              <p>No trainings available</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Trainer</th>
                    <th>Schedule</th>
                    <th>Capacity</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {trainings.map(t => (
                    <tr key={t.id}>
                      <td>{t.title}</td>
                      <td>{t.trainerName || '-'}</td>
                      <td>{formatDate(t.startDate)} → {formatDate(t.endDate)}</td>
                      <td>{t.capacity || 'Unlimited'}</td>
                      <td>
                        {isEnrolled(t.id) ? (
                          <span style={{ color: 'green' }}>Enrolled</span>
                        ) : (
                          <button 
                            className="btn btn-sm btn-primary" 
                            onClick={() => handleEnroll(t.id)}
                            disabled={loading}
                          >
                            Enroll
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'myEnrollments' && (
          <div className="card">
            <h3>My Enrollments</h3>
            {enrollments.length === 0 ? (
              <p>No enrollments</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Training</th>
                    <th>Trainer</th>
                    <th>Schedule</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map(e => (
                    <tr key={e.id}>
                      <td>{e.trainingTitle}</td>
                      <td>{e.trainerName || '-'}</td>
                      <td>{formatDate(e.startDate)} → {formatDate(e.endDate)}</td>
                      <td>Enrolled</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="card">
            <h3>Give Feedback</h3>
            {enrollments.length === 0 ? (
              <p>Enroll in a training first</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Training</th>
                    <th>Trainer</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map(e => (
                    <tr key={e.id}>
                      <td>{e.trainingTitle}</td>
                      <td>{e.trainerName || '-'}</td>
                      <td>
                        {hasFeedback(e.trainingId) ? (
                          <span style={{ color: 'green' }}>Submitted</span>
                        ) : new Date() >= new Date(e.startDate) ? (
                          <button 
                            className="btn btn-sm btn-primary" 
                            onClick={() => openFeedbackModal(e)}
                          >
                            Give Feedback
                          </button>
                        ) : (
                          <span style={{ color: '#999' }}>Not started</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {showFeedbackModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Feedback for {selectedTraining?.title}</h3>
              <form onSubmit={handleSubmitFeedback}>
                <div className="form-group">
                  <label>Trainer Rating</label>
                  <div>
                    {[1, 2, 3, 4, 5].map(star => (
                      <span
                        key={star}
                        style={{ 
                          fontSize: '24px', 
                          cursor: 'pointer',
                          color: star <= feedbackForm.trainerRating ? '#ffc107' : '#ddd'
                        }}
                        onClick={() => setFeedbackForm({ ...feedbackForm, trainerRating: star })}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Subject Rating</label>
                  <div>
                    {[1, 2, 3, 4, 5].map(star => (
                      <span
                        key={star}
                        style={{ 
                          fontSize: '24px', 
                          cursor: 'pointer',
                          color: star <= feedbackForm.subjectRating ? '#ffc107' : '#ddd'
                        }}
                        onClick={() => setFeedbackForm({ ...feedbackForm, subjectRating: star })}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Comments (optional)</label>
                  <textarea
                    value={feedbackForm.comments}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, comments: e.target.value })}
                    placeholder="Your feedback"
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button type="button" className="btn" onClick={() => setShowFeedbackModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>Submit</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ParticipantDashboard