import { useState, useEffect } from 'react'

const API = 'http://localhost:3001/api'

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'
const fmtDateTime = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'
const initials = (name) => name ? name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'AD'
const Stars = ({ v }) => (
  <span className="stars">
    {[1,2,3,4,5].map(s => <span key={s} className={`star ${s <= v ? 'filled' : ''}`}>&#9733;</span>)}
  </span>
)

function AdminDashboard({ user, onLogout }) {
  const [tab, setTab] = useState('overview')
  const [trainers, setTrainers] = useState([])
  const [trainings, setTrainings] = useState([])
  const [feedbacks, setFeedbacks] = useState([])
  const [participants, setParticipants] = useState([])
  const [stats, setStats] = useState({})
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [credentials, setCredentials] = useState(null)
  const [editModal, setEditModal] = useState(null)
  const [editForm, setEditForm] = useState({})

  const [trainerForm, setTrainerForm] = useState({ name: '', email: '' })
  const [trainingForm, setTrainingForm] = useState({ title: '', description: '', trainerId: '', startDate: '', endDate: '', capacity: '' })

  const auth = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` })

  const notify = (m, isErr = false) => {
    if (isErr) setErr(m); else setMsg(m)
    setTimeout(() => { setErr(''); setMsg('') }, 4500)
  }

  useEffect(() => { fetchAll() }, [])

  const fetchAll = () => {
    fetchStats(); fetchTrainers(); fetchTrainings(); fetchFeedbacks(); fetchParticipants()
  }

  const fetchStats = async () => {
    try {
      const r = await fetch(`${API}/admin/stats`, { headers: auth() })
      if (r.ok) setStats(await r.json())
    } catch {}
  }

  const fetchTrainers = async () => {
    try {
      const r = await fetch(`${API}/admin/trainers`, { headers: auth() })
      const d = await r.json()
      setTrainers(d.trainers || [])
    } catch {}
  }

  const fetchTrainings = async () => {
    try {
      const r = await fetch(`${API}/trainings`, { headers: auth() })
      const d = await r.json()
      setTrainings(Array.isArray(d) ? d : (d.trainings || []))
    } catch {}
  }

  const fetchFeedbacks = async () => {
    try {
      const r = await fetch(`${API}/feedback/admin-feedbacks`, { headers: auth() })
      const d = await r.json()
      setFeedbacks(d.feedbacks || [])
    } catch {}
  }

  const fetchParticipants = async () => {
    try {
      const r = await fetch(`${API}/admin/participants`, { headers: auth() })
      const d = await r.json()
      setParticipants(d.participants || [])
    } catch {}
  }

  const handleCreateTrainer = async (e) => {
    e.preventDefault(); setLoading(true); setCredentials(null)
    try {
      const r = await fetch(`${API}/admin/create-trainer`, { method: 'POST', headers: auth(), body: JSON.stringify(trainerForm) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      setCredentials(d)
      setTrainerForm({ name: '', email: '' })
      fetchTrainers(); fetchStats()
      notify('Trainer account created successfully.')
    } catch (e) { notify(e.message, true) }
    finally { setLoading(false) }
  }

  const handleCreateTraining = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const r = await fetch(`${API}/admin/trainings`, {
        method: 'POST', headers: auth(),
        body: JSON.stringify({ ...trainingForm, trainerId: parseInt(trainingForm.trainerId), capacity: trainingForm.capacity ? parseInt(trainingForm.capacity) : null })
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      setTrainingForm({ title: '', description: '', trainerId: '', startDate: '', endDate: '', capacity: '' })
      fetchTrainings(); fetchStats()
      notify('Training session created successfully.')
    } catch (e) { notify(e.message, true) }
    finally { setLoading(false) }
  }

  const handleDeleteTraining = async (id, title) => {
    if (!confirm(`Delete training "${title}"? This will remove all associated enrollments and feedback.`)) return
    try {
      const r = await fetch(`${API}/admin/trainings/${id}`, { method: 'DELETE', headers: auth() })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      fetchTrainings(); fetchStats()
      notify('Training deleted.')
    } catch (e) { notify(e.message, true) }
  }

  const handleDeleteTrainer = async (id, name) => {
    if (!confirm(`Delete trainer "${name}"? Their training assignments will be unlinked.`)) return
    try {
      const r = await fetch(`${API}/admin/trainers/${id}`, { method: 'DELETE', headers: auth() })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      fetchTrainers(); fetchStats()
      notify('Trainer deleted.')
    } catch (e) { notify(e.message, true) }
  }

  const openEdit = (t) => {
    setEditModal(t)
    setEditForm({
      title: t.title,
      description: t.description || '',
      trainerId: t.trainerId || '',
      startDate: t.startDate ? t.startDate.slice(0, 16) : '',
      endDate: t.endDate ? t.endDate.slice(0, 16) : '',
      capacity: t.capacity || ''
    })
  }

  const handleUpdateTraining = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const r = await fetch(`${API}/admin/trainings/${editModal.id}`, {
        method: 'PUT', headers: auth(),
        body: JSON.stringify({ ...editForm, trainerId: editForm.trainerId ? parseInt(editForm.trainerId) : undefined })
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      setEditModal(null); fetchTrainings()
      notify('Training updated successfully.')
    } catch (e) { notify(e.message, true) }
    finally { setLoading(false) }
  }

  const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'trainings', label: 'Trainings' },
    { key: 'trainers', label: 'Trainers' },
    { key: 'participants', label: 'Participants' },
    { key: 'feedback', label: 'Feedback Reports' },
    { key: 'createTrainer', label: 'Add Trainer' },
    { key: 'createTraining', label: 'Add Training' },
  ]

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="navbar-logo">W</div>
          <h1>WAVE INIT LMS</h1>
          <span className="navbar-badge">Administrator</span>
        </div>
        <div className="navbar-right">
          <div className="user-chip">
            <div className="user-avatar">{initials(user.name)}</div>
            <div className="user-chip-info">
              <span>{user.name || 'Admin'}</span>
              <small>{user.email}</small>
            </div>
          </div>
          <button className="btn btn-logout" onClick={onLogout}>Sign Out</button>
        </div>
      </nav>

      <div className="container">
        <div className="dashboard">
          <div className="tabs">
            {TABS.map(t => (
              <button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>

          {err && <div className="error">{err}</div>}
          {msg && <div className="success">{msg}</div>}

          {/* OVERVIEW */}
          {tab === 'overview' && (
            <div>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Total Trainings</div>
                  <div className="stat-value">{stats.totalTrainings ?? 0}</div>
                </div>
                <div className="stat-card purple">
                  <div className="stat-label">Trainers</div>
                  <div className="stat-value">{stats.totalTrainers ?? 0}</div>
                </div>
                <div className="stat-card green">
                  <div className="stat-label">Participants</div>
                  <div className="stat-value">{stats.totalParticipants ?? 0}</div>
                </div>
                <div className="stat-card orange">
                  <div className="stat-label">Active Enrollments</div>
                  <div className="stat-value">{stats.totalEnrollments ?? 0}</div>
                </div>
                <div className="stat-card red">
                  <div className="stat-label">Feedback Responses</div>
                  <div className="stat-value">{stats.totalFeedbacks ?? 0}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Avg Trainer Rating</div>
                  <div className="stat-value">{stats.avgTrainerRating ?? '0.0'}</div>
                </div>
                <div className="stat-card purple">
                  <div className="stat-label">Avg Subject Rating</div>
                  <div className="stat-value">{stats.avgSubjectRating ?? '0.0'}</div>
                </div>
              </div>
              <div className="card">
                <h3 style={{ marginBottom: 8 }}>Welcome back, {user.name || 'Administrator'}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                  Manage training sessions, monitor participant enrollment, and review feedback analytics from the tabs above.
                </p>
              </div>
            </div>
          )}

          {/* TRAININGS */}
          {tab === 'trainings' && (
            <div className="card">
              <div className="card-header">
                <h3>All Training Sessions ({trainings.length})</h3>
                <button className="btn btn-primary btn-sm" onClick={() => setTab('createTraining')}>+ Add Training</button>
              </div>
              {trainings.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">&#9632;</div><p>No training sessions created yet.</p></div>
              ) : (
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr><th>#</th><th>Title</th><th>Description</th><th>Trainer</th><th>Start Date</th><th>End Date</th><th>Capacity</th><th>Enrolled</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {trainings.map((t, i) => (
                        <tr key={t.id}>
                          <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                          <td><strong>{t.title}</strong></td>
                          <td style={{ color: 'var(--text-secondary)', maxWidth: 180 }}>{t.description ? t.description.slice(0, 60) + (t.description.length > 60 ? '...' : '') : '-'}</td>
                          <td>{t.trainerName ? <span className="badge badge-purple">{t.trainerName}</span> : <span className="badge badge-gray">Unassigned</span>}</td>
                          <td>{fmtDate(t.startDate)}</td>
                          <td>{fmtDate(t.endDate)}</td>
                          <td>{t.capacity ? t.capacity : <span className="badge badge-blue">Unlimited</span>}</td>
                          <td>{t.enrolledCount ?? 0}</td>
                          <td>
                            <div className="actions">
                              <button className="btn btn-sm" onClick={() => openEdit(t)}>Edit</button>
                              <button className="btn btn-sm btn-danger" onClick={() => handleDeleteTraining(t.id, t.title)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TRAINERS */}
          {tab === 'trainers' && (
            <div className="card">
              <div className="card-header">
                <h3>Trainers / Instructors ({trainers.length})</h3>
                <button className="btn btn-primary btn-sm" onClick={() => setTab('createTrainer')}>+ Add Trainer</button>
              </div>
              {trainers.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">&#9632;</div><p>No trainers added yet.</p></div>
              ) : (
                <div className="table-wrapper">
                  <table className="table">
                    <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Username</th><th>Actions</th></tr></thead>
                    <tbody>
                      {trainers.map((t, i) => (
                        <tr key={t.id}>
                          <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div className="user-avatar" style={{ width: 28, height: 28, fontSize: 11 }}>{initials(t.name)}</div>
                              {t.name}
                            </div>
                          </td>
                          <td>{t.email}</td>
                          <td>{t.username ? <code style={{ fontSize: 12, background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: 4, color: 'var(--text-secondary)' }}>{t.username}</code> : '-'}</td>
                          <td>
                            <button className="btn btn-sm btn-danger" onClick={() => handleDeleteTrainer(t.id, t.name)}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* PARTICIPANTS */}
          {tab === 'participants' && (
            <div className="card">
              <div className="card-header">
                <h3>Registered Participants ({participants.length})</h3>
              </div>
              {participants.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">&#9632;</div><p>No participants registered yet.</p></div>
              ) : (
                <div className="table-wrapper">
                  <table className="table">
                    <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Registered On</th></tr></thead>
                    <tbody>
                      {participants.map((p, i) => (
                        <tr key={p.id}>
                          <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div className="user-avatar" style={{ width: 28, height: 28, fontSize: 11 }}>{initials(p.name)}</div>
                              {p.name || '-'}
                            </div>
                          </td>
                          <td>{p.email}</td>
                          <td>{p.phone || '-'}</td>
                          <td>{fmtDateTime(p.joinedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* FEEDBACK REPORTS */}
          {tab === 'feedback' && (
            <div>
              <div className="stats-grid" style={{ marginBottom: 20 }}>
                <div className="stat-card">
                  <div className="stat-label">Total Responses</div>
                  <div className="stat-value">{feedbacks.length}</div>
                </div>
                <div className="stat-card orange">
                  <div className="stat-label">Avg Trainer Rating</div>
                  <div className="stat-value">{stats.avgTrainerRating ?? '0.0'} / 5</div>
                </div>
                <div className="stat-card purple">
                  <div className="stat-label">Avg Subject Rating</div>
                  <div className="stat-value">{stats.avgSubjectRating ?? '0.0'} / 5</div>
                </div>
              </div>
              <div className="card">
                <div className="card-header">
                  <h3>Feedback Analysis &amp; Reports</h3>
                </div>
                {feedbacks.length === 0 ? (
                  <div className="empty-state"><div className="empty-icon">&#9632;</div><p>No feedback submitted yet.</p></div>
                ) : (
                  <div className="table-wrapper">
                    <table className="table">
                      <thead>
                        <tr><th>#</th><th>Training</th><th>Trainer</th><th>Participant</th><th>Trainer Rating</th><th>Subject Rating</th><th>Comments</th><th>Date</th></tr>
                      </thead>
                      <tbody>
                        {feedbacks.map((f, i) => (
                          <tr key={f.id}>
                            <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                            <td><strong>{f.trainingTitle}</strong></td>
                            <td>{f.trainerName}</td>
                            <td>{f.anonymous ? <span className="badge badge-gray">Anonymous</span> : f.participantName}</td>
                            <td><Stars v={f.trainerRating} /> <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 4 }}>{f.trainerRating}/5</span></td>
                            <td><Stars v={f.subjectRating} /> <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 4 }}>{f.subjectRating}/5</span></td>
                            <td style={{ maxWidth: 200, fontSize: 12, color: 'var(--text-secondary)' }}>{f.comments || '-'}</td>
                            <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(f.submittedAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ADD TRAINER */}
          {tab === 'createTrainer' && (
            <div className="card" style={{ maxWidth: 500 }}>
              <div className="card-header"><h3>Create Trainer Account</h3></div>
              {credentials && (
                <div className="credentials-box">
                  <div className="credentials-title">Account Created — Share Credentials</div>
                  <div className="cred-row"><span className="cred-label">Username</span><span className="cred-value">{credentials.username}</span></div>
                  <div className="cred-row"><span className="cred-label">Password</span><span className="cred-value">{credentials.password}</span></div>
                  <div className="cred-row"><span className="cred-label">Email</span><span className="cred-value">{credentials.email}</span></div>
                </div>
              )}
              <form onSubmit={handleCreateTrainer}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-control" type="text" value={trainerForm.name}
                    onChange={e => setTrainerForm(p => ({ ...p, name: e.target.value }))} required placeholder="Trainer full name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input className="form-control" type="email" value={trainerForm.email}
                    onChange={e => setTrainerForm(p => ({ ...p, email: e.target.value }))} required placeholder="trainer@company.com" />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Trainer'}
                </button>
              </form>
            </div>
          )}

          {/* ADD TRAINING */}
          {tab === 'createTraining' && (
            <div className="card" style={{ maxWidth: 580 }}>
              <div className="card-header"><h3>Create Training Session</h3></div>
              <form onSubmit={handleCreateTraining}>
                <div className="form-group">
                  <label className="form-label">Training Title</label>
                  <input className="form-control" type="text" value={trainingForm.title}
                    onChange={e => setTrainingForm(p => ({ ...p, title: e.target.value }))} required placeholder="e.g. React Fundamentals" />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" value={trainingForm.description}
                    onChange={e => setTrainingForm(p => ({ ...p, description: e.target.value }))} placeholder="Training objectives and content overview..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Assign Trainer</label>
                  <select className="form-control" value={trainingForm.trainerId}
                    onChange={e => setTrainingForm(p => ({ ...p, trainerId: e.target.value }))} required>
                    <option value="">Select a trainer</option>
                    {trainers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.email})</option>)}
                  </select>
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Start Date &amp; Time</label>
                    <input className="form-control" type="datetime-local" value={trainingForm.startDate}
                      onChange={e => setTrainingForm(p => ({ ...p, startDate: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date &amp; Time</label>
                    <input className="form-control" type="datetime-local" value={trainingForm.endDate}
                      onChange={e => setTrainingForm(p => ({ ...p, endDate: e.target.value }))} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Participant Capacity (leave blank for unlimited)</label>
                  <input className="form-control" type="number" value={trainingForm.capacity}
                    onChange={e => setTrainingForm(p => ({ ...p, capacity: e.target.value }))} placeholder="e.g. 30" min="1" />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Training Session'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      {editModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Training Session</h3>
              <button className="modal-close" onClick={() => setEditModal(null)}>&#10005;</button>
            </div>
            <form onSubmit={handleUpdateTraining}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="form-control" type="text" value={editForm.title}
                  onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" value={editForm.description}
                  onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Trainer</label>
                <select className="form-control" value={editForm.trainerId}
                  onChange={e => setEditForm(p => ({ ...p, trainerId: e.target.value }))}>
                  <option value="">No trainer assigned</option>
                  {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input className="form-control" type="datetime-local" value={editForm.startDate}
                    onChange={e => setEditForm(p => ({ ...p, startDate: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input className="form-control" type="datetime-local" value={editForm.endDate}
                    onChange={e => setEditForm(p => ({ ...p, endDate: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Capacity</label>
                <input className="form-control" type="number" value={editForm.capacity}
                  onChange={e => setEditForm(p => ({ ...p, capacity: e.target.value }))} placeholder="Unlimited" min="1" />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setEditModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard