import { useState, useEffect } from 'react'

const API = 'http://localhost:3001/api'

function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('createTrainer')
  
  const [trainers, setTrainers] = useState([])
  const [trainings, setTrainings] = useState([])
  const [feedbacks, setFeedbacks] = useState([])
  
  const [trainerForm, setTrainerForm] = useState({ name: '', email: '' })
  const [trainingForm, setTrainingForm] = useState({ 
    title: '', description: '', trainerId: '', startDate: '', endDate: '', capacity: '' 
  })
  
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [credentials, setCredentials] = useState(null)

  const [showModal, setShowModal] = useState(false)
  const [editTraining, setEditTraining] = useState(null)
  const [editForm, setEditForm] = useState({})

  useEffect(() => {
    fetchData()
  }, [])

  const getAuthHeader = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user.token}`,
  })

  const fetchData = async () => {
    await Promise.all([fetchTrainers(), fetchTrainings(), fetchFeedbacks()])
  }

  const fetchTrainers = async () => {
    try {
      const response = await fetch(`${API}/admin/trainers`, { headers: getAuthHeader() })
      const data = await response.json()
      if (data.trainers) setTrainers(data.trainers)
    } catch (err) { console.error(err) }
  }

  const fetchTrainings = async () => {
    try {
      const response = await fetch(`${API}/trainings`, { headers: getAuthHeader() })
      const data = await response.json()
      if (data.trainings) setTrainings(data.trainings)
    } catch (err) { console.error(err) }
  }

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch(`${API}/admin/feedbacks`, { headers: getAuthHeader() })
      const data = await response.json()
      if (data.feedbacks) setFeedbacks(data.feedbacks)
    } catch (err) { console.error(err) }
  }

  const handleCreateTrainer = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setCredentials(null)
    setLoading(true)

    try {
      const response = await fetch(`${API}/admin/create-trainer`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(trainerForm)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create trainer')
      }

      setMessage(data.message || 'Trainer created successfully')
      setCredentials({ username: data.username, password: data.password })
      setTrainerForm({ name: '', email: '' })
      fetchTrainers()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTraining = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const response = await fetch(`${API}/admin/trainings`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({
          title: trainingForm.title,
          description: trainingForm.description,
          trainerId: parseInt(trainingForm.trainerId),
          startDate: trainingForm.startDate,
          endDate: trainingForm.endDate,
          capacity: trainingForm.capacity ? parseInt(trainingForm.capacity) : null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create training')
      }

      setMessage(data.message || 'Training created successfully')
      setTrainingForm({ title: '', description: '', trainerId: '', startDate: '', endDate: '', capacity: '' })
      fetchTrainings()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditTraining = (training) => {
    setEditTraining(training)
    setEditForm({
      title: training.title || '',
      description: training.description || '',
      trainerId: training.trainerId || '',
      schedule: training.schedule ? training.schedule.slice(0, 16) : '',
      capacity: training.capacity || ''
    })
    setShowModal(true)
  }

  const handleUpdateTraining = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`${API}/admin/trainings/${editTraining.id}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(editForm)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update')
      }

      setMessage('Training updated successfully')
      setShowModal(false)
      fetchTrainings()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTraining = async (id, title) => {
    if (!window.confirm(`Delete training "${title}"?`)) return

    try {
      const response = await fetch(`${API}/admin/trainings/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete')
      }

      setMessage('Training deleted successfully')
      fetchTrainings()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteTrainer = async (id, name) => {
    if (!window.confirm(`Delete trainer "${name}"?`)) return

    try {
      const response = await fetch(`${API}/admin/trainers/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete')
      }

      setMessage('Trainer deleted successfully')
      fetchTrainers()
    } catch (err) {
      setError(err.message)
    }
  }

  const formatDate = (d) => d ? new Date(d).toLocaleString() : '-'

  const tabs = [
    { key: 'createTrainer', label: 'Create Trainer' },
    { key: 'createTraining', label: 'Create Training' },
    { key: 'viewTrainings', label: 'View Trainings' },
    { key: 'viewTrainers', label: 'View Trainers' },
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

        {error && <div className="error">{error}</div>}
        {message && <div className="success">{message}</div>}

        {activeTab === 'createTrainer' && (
          <div className="card">
            <h3>Create New Trainer</h3>
            {credentials && (
              <div style={{ 
                background: '#e0e7ff', 
                padding: '16px', 
                borderRadius: '8px', 
                marginBottom: '16px' 
              }}>
                <strong>Trainer Credentials</strong>
                <p>Username: {credentials.username}</p>
                <p>Password: {credentials.password}</p>
              </div>
            )}
            <form onSubmit={handleCreateTrainer}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={trainerForm.name}
                  onChange={(e) => setTrainerForm({ ...trainerForm, name: e.target.value })}
                  required
                  placeholder="Full name"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={trainerForm.email}
                  onChange={(e) => setTrainerForm({ ...trainerForm, email: e.target.value })}
                  required
                  placeholder="Email address"
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Trainer'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'createTraining' && (
          <div className="card">
            <h3>Create New Training</h3>
            <form onSubmit={handleCreateTraining}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={trainingForm.title}
                  onChange={(e) => setTrainingForm({ ...trainingForm, title: e.target.value })}
                  required
                  placeholder="Training title"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={trainingForm.description}
                  onChange={(e) => setTrainingForm({ ...trainingForm, description: e.target.value })}
                  placeholder="Description"
                />
              </div>
              <div className="form-group">
                <label>Trainer</label>
                <select
                  value={trainingForm.trainerId}
                  onChange={(e) => setTrainingForm({ ...trainingForm, trainerId: e.target.value })}
                  required
                >
                  <option value="">Select trainer</option>
                  {trainers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="datetime-local"
                  value={trainingForm.startDate}
                  onChange={(e) => setTrainingForm({ ...trainingForm, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="datetime-local"
                  value={trainingForm.endDate}
                  onChange={(e) => setTrainingForm({ ...trainingForm, endDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Capacity</label>
                <input
                  type="number"
                  value={trainingForm.capacity}
                  onChange={(e) => setTrainingForm({ ...trainingForm, capacity: e.target.value })}
                  placeholder="Max participants"
                  min="1"
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Training'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'viewTrainings' && (
          <div className="card">
            <h3>All Trainings</h3>
            {trainings.length === 0 ? (
              <p>No trainings</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Trainer</th>
                    <th>Duration</th>
                    <th>Capacity</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trainings.map(t => (
                    <tr key={t.id}>
                      <td>
                        <div className="training-title">
                          <strong>{t.title}</strong>
                          {t.description && <p className="desc-text">{t.description}</p>}
                        </div>
                      </td>
                      <td>{t.trainerName || '-'}</td>
                      <td>{formatDate(t.startDate)} → {formatDate(t.endDate)}</td>
                      <td>{t.capacity || 'Unlimited'}</td>
                      <td className="actions">
                        <button 
                          className="btn btn-sm" 
                          onClick={() => handleEditTraining(t)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-danger" 
                          onClick={() => handleDeleteTraining(t.id, t.title)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'viewTrainers' && (
          <div className="card">
            <h3>All Trainers</h3>
            {trainers.length === 0 ? (
              <p>No trainers</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Username</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trainers.map(t => (
                    <tr key={t.id}>
                      <td>{t.name}</td>
                      <td>{t.email}</td>
                      <td>{t.username || '-'}</td>
                      <td>
                        <button 
                          className="btn btn-sm btn-danger" 
                          onClick={() => handleDeleteTrainer(t.id, t.name)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="card">
            <h3>Feedback Analytics</h3>
            {feedbacks.length === 0 ? (
              <p>No feedback</p>
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

        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Edit Training</h3>
              <form onSubmit={handleUpdateTraining}>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Trainer</label>
                  <select
                    value={editForm.trainerId}
                    onChange={(e) => setEditForm({ ...editForm, trainerId: e.target.value })}
                  >
                    <option value="">Select trainer</option>
                    {trainers.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Schedule</label>
                  <input
                    type="datetime-local"
                    value={editForm.schedule}
                    onChange={(e) => setEditForm({ ...editForm, schedule: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>Save</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard