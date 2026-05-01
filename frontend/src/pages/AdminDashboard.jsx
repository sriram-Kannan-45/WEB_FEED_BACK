import { useState, useEffect } from 'react'
import TrainerList from '../components/TrainerList'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

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
  const [pendingParticipants, setPendingParticipants] = useState([])
  const [questions, setQuestions] = useState([])
  const [stats, setStats] = useState({})
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [credentials, setCredentials] = useState(null)
  const [editModal, setEditModal] = useState(null)
  const [editForm, setEditForm] = useState({})

  const [trainerForm, setTrainerForm] = useState({ name: '', email: '', password: '' })
  const [trainingForm, setTrainingForm] = useState({ title: '', description: '', trainerId: '', startDate: '', endDate: '', capacity: '' })
  const [questionForm, setQuestionForm] = useState({ trainingId: '', questionText: '', questionType: 'TEXT', options: '' })

  const auth = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` })

  const notify = (m, isErr = false) => {
    if (isErr) setErr(m); else setMsg(m)
    setTimeout(() => { setErr(''); setMsg('') }, 4500)
  }

  useEffect(() => { fetchAll() }, [])

  const fetchAll = () => {
    fetchStats(); fetchTrainers(); fetchTrainings(); fetchFeedbacks(); fetchParticipants(); fetchQuestions(); fetchPendingParticipants()
  }

  const fetchStats = async () => {
    try {
      const r = await fetch(`${API}/admin/stats`, { headers: auth() })
      if (r.ok) setStats(await r.json())
    } catch {}
  }

  const fetchPendingParticipants = async () => {
    try {
      const r = await fetch(`${API}/admin/pending-participants`, { headers: auth() })
      const d = await r.json()
      setPendingParticipants(d.participants || [])
    } catch {}
  }

  const handleApproveParticipant = async (id) => {
    if (!confirm('Approve this participant?')) return
    setLoading(true)
    try {
      const r = await fetch(`${API}/admin/approve-participant/${id}`, { method: 'POST', headers: auth() })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      notify('Participant approved successfully')
      fetchPendingParticipants(); fetchParticipants()
    } catch (e) { notify(e.message, true) }
    finally { setLoading(false) }
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

  const fetchQuestions = async () => {
    try {
      const r = await fetch(`${API}/survey`, { headers: auth() })
      const d = await r.json()
      setQuestions(d.questions || [])
    } catch {}
  }

  const handleCreateTrainer = async (e) => {
    e.preventDefault(); setLoading(true); setCredentials(null)
    try {
      const r = await fetch(`${API}/admin/create-trainer`, { method: 'POST', headers: auth(), body: JSON.stringify(trainerForm) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      setTrainerForm({ name: '', email: '', password: '' })
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

  const handleCreateQuestion = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const opts = questionForm.options.split(',').map(s => s.trim()).filter(Boolean)
      const body = { ...questionForm, options: questionForm.questionType === 'MULTIPLE_CHOICE' ? opts : null }
      const r = await fetch(`${API}/survey`, { method: 'POST', headers: auth(), body: JSON.stringify(body) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      setQuestionForm({ trainingId: '', questionText: '', questionType: 'TEXT', options: '' })
      fetchQuestions()
      notify('Survey question created.')
    } catch (e) { notify(e.message, true) }
    finally { setLoading(false) }
  }

  const handleDeleteQuestion = async (id) => {
    if (!confirm('Delete this question?')) return
    try {
      await fetch(`${API}/survey/${id}`, { method: 'DELETE', headers: auth() })
      fetchQuestions()
      notify('Question deleted.')
    } catch (e) { notify('Failed to delete question', true) }
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

  const handleDeleteParticipant = async (id, name) => {
    if (!confirm(`Delete participant "${name}"? All their enrollments and feedback will also be removed.`)) return
    try {
      const r = await fetch(`${API}/admin/participants/${id}`, { method: 'DELETE', headers: auth() })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      fetchParticipants(); fetchStats()
      notify('Participant deleted.')
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

  const handleSendReminders = async (trainingId) => {
    setLoading(true)
    try {
      const r = await fetch(`${API}/admin/send-reminders/${trainingId}`, { method: 'POST', headers: auth() })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      notify(d.message)
    } catch (e) { notify(e.message, true) }
    finally { setLoading(false) }
  }

  const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'pending', label: 'Pending Approval' },
    { key: 'trainings', label: 'Trainings' },
    { key: 'participants', label: 'Participants' },
    { key: 'feedback', label: 'Feedback Reports' },
    { key: 'surveys', label: 'Survey Config' },
  ]

  const TABS_WITH_BUTTONS = [
    { key: 'overview', label: 'Overview' },
    { key: 'pending', label: 'Pending Approval' },
    { key: 'trainings', label: 'Trainings' },
    { key: 'participants', label: 'Participants' },
    { key: 'feedback', label: 'Feedback Reports' },
    { key: 'surveys', label: 'Survey Config' },
  ]

  // Chart Data preparation
  const getChartData = () => {
    const trainingGroups = {}
    feedbacks.forEach(f => {
      if (!trainingGroups[f.trainingTitle]) {
        trainingGroups[f.trainingTitle] = { tr: 0, sr: 0, count: 0 }
      }
      trainingGroups[f.trainingTitle].tr += f.trainerRating
      trainingGroups[f.trainingTitle].sr += f.subjectRating
      trainingGroups[f.trainingTitle].count++
    })
    
    const labels = Object.keys(trainingGroups)
    const trData = labels.map(l => (trainingGroups[l].tr / trainingGroups[l].count).toFixed(1))
    const srData = labels.map(l => (trainingGroups[l].sr / trainingGroups[l].count).toFixed(1))

    return {
      labels,
      datasets: [
        { label: 'Avg Trainer Rating', data: trData, backgroundColor: 'rgba(99, 102, 241, 0.7)' },
        { label: 'Avg Subject Rating', data: srData, backgroundColor: 'rgba(168, 85, 247, 0.7)' }
      ]
    }
  }

  const getTopTrainer = () => {
    const trStats = {}
    feedbacks.forEach(f => {
      if (!f.trainerName) return
      if (!trStats[f.trainerName]) trStats[f.trainerName] = { score: 0, count: 0 }
      trStats[f.trainerName].score += f.trainerRating
      trStats[f.trainerName].count++
    })
    let top = { name: '-', avg: 0 }
    Object.entries(trStats).forEach(([name, data]) => {
      const avg = data.score / data.count
      if (avg > top.avg) { top = { name, avg } }
    })
    return top
  }

  const topTrainer = getTopTrainer()

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
          <div className="tabs-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div className="tabs">
              {TABS.map(t => (
                <button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="header-actions" style={{ display: 'flex', gap: 12 }}>
              <button className="btn" onClick={() => setTab('createTrainer')}>+ Add Trainer</button>
              <button className="btn btn-primary" onClick={() => setTab('createTraining')}>+ Add Training</button>
            </div>
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
                  <div className="stat-label">Top Trainer</div>
                  <div className="stat-value" style={{ fontSize: 18 }}>{topTrainer.name} <span style={{ fontSize: 14 }}>({topTrainer.avg > 0 ? topTrainer.avg.toFixed(1) : '-'})</span></div>
                </div>
                <div className="stat-card green">
                  <div className="stat-label">Overall Satisfaction</div>
                  <div className="stat-value">{stats.satisfactionScore ?? '0.0'} <span style={{ fontSize: 14 }}>/ 5.0</span></div>
                </div>
              </div>
              <div className="card" style={{ marginTop: 20 }}>
                <h3 style={{ marginBottom: 16 }}>Feedback Trends Overview</h3>
                {feedbacks.length > 0 ? (
                  <div style={{ height: 300 }}>
                    <Bar data={getChartData()} options={{ maintainAspectRatio: false }} />
                  </div>
                ) : (
                  <div className="empty-state"><p>Not enough feedback data to display chart.</p></div>
                )}
              </div>
            </div>
          )}

          {/* PENDING APPROVAL */}
          {tab === 'pending' && (
            <div className="card">
              <div className="card-header">
                <h3>Pending Participants ({pendingParticipants.length})</h3>
              </div>
              {pendingParticipants.length === 0 ? (
                <div className="empty-state"><p>No pending approvals.</p></div>
              ) : (
                <div className="table-wrapper">
                  <table className="table">
                    <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Registered</th><th>Actions</th></tr></thead>
                    <tbody>
                      {pendingParticipants.map((p, i) => (
                        <tr key={p.id}>
                          <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                          <td><strong>{p.name}</strong></td>
                          <td>{p.email}</td>
                          <td>{p.phone || '-'}</td>
                          <td>{fmtDate(p.created_at)}</td>
                          <td>
                            <button className="btn btn-sm btn-success" onClick={() => handleApproveParticipant(p.id)} disabled={loading}>Approve</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
                              <button className="btn btn-sm btn-success" onClick={() => handleSendReminders(t.id)} disabled={loading}>Remind</button>
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

          {/* SURVEYS */}
          {tab === 'surveys' && (
            <div className="card">
              <div className="card-header">
                <h3>Dynamic Feedback Survey Questions</h3>
              </div>
              <form onSubmit={handleCreateQuestion} style={{ marginBottom: 20 }}>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Training (Optional)</label>
                    <select className="form-control" value={questionForm.trainingId} onChange={e => setQuestionForm(p => ({ ...p, trainingId: e.target.value }))}>
                      <option value="">Apply to ALL Trainings</option>
                      {trainings.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Question Type</label>
                    <select className="form-control" value={questionForm.questionType} onChange={e => setQuestionForm(p => ({ ...p, questionType: e.target.value }))}>
                      <option value="TEXT">Text Answer</option>
                      <option value="RATING">Rating (1-5)</option>
                      <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Question Text</label>
                  <input className="form-control" type="text" value={questionForm.questionText} required onChange={e => setQuestionForm(p => ({ ...p, questionText: e.target.value }))} />
                </div>
                {questionForm.questionType === 'MULTIPLE_CHOICE' && (
                  <div className="form-group">
                    <label className="form-label">Options (Comma separated)</label>
                    <input className="form-control" type="text" value={questionForm.options} placeholder="Option A, Option B, Option C" required onChange={e => setQuestionForm(p => ({ ...p, options: e.target.value }))} />
                  </div>
                )}
                <button type="submit" className="btn btn-primary" disabled={loading}>Add Question</button>
              </form>

              {questions.length === 0 ? (
                <div className="empty-state"><p>No custom questions added.</p></div>
              ) : (
                <div className="table-wrapper">
                  <table className="table">
                    <thead><tr><th>Target</th><th>Question</th><th>Type</th><th>Options</th><th>Actions</th></tr></thead>
                    <tbody>
                      {questions.map(q => {
                        const trg = q.trainingId ? trainings.find(t => t.id === q.trainingId)?.title || 'Specific' : 'Global'
                        return (
                          <tr key={q.id}>
                            <td><span className={q.trainingId ? "badge badge-purple" : "badge badge-blue"}>{trg}</span></td>
                            <td>{q.questionText}</td>
                            <td>{q.questionType}</td>
                            <td>{q.options ? q.options.join(', ') : '-'}</td>
                            <td><button className="btn btn-sm btn-danger" onClick={() => handleDeleteQuestion(q.id)}>Delete</button></td>
                          </tr>
                        )
                      })}
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
                        <tr><th>#</th><th>Training</th><th>Trainer</th><th>Participant</th><th>Trainer Rating</th><th>Subject Rating</th><th>Comments</th><th>Trainer Reply</th><th>Date</th></tr>
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
                            <td style={{ maxWidth: 150, fontSize: 12, color: 'var(--text-secondary)' }}>{f.comments || '-'}</td>
                            <td style={{ maxWidth: 150, fontSize: 12, color: 'var(--text-secondary)' }}>{f.trainerResponse || '-'}</td>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24 }}>
              <div className="card">
                <div className="card-header"><h3>Create Trainer Account</h3></div>
                <form onSubmit={handleCreateTrainer}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-control" type="text" value={trainerForm.name}
                      onChange={e => setTrainerForm(p => ({ ...p, name: e.target.value }))} required placeholder="Trainer full name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address (Username)</label>
                    <input className="form-control" type="email" value={trainerForm.email}
                      onChange={e => setTrainerForm(p => ({ ...p, email: e.target.value }))} required placeholder="trainer@company.com" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input className="form-control" type="password" value={trainerForm.password}
                      onChange={e => setTrainerForm(p => ({ ...p, password: e.target.value }))} required placeholder="Set password for trainer" />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Trainer'}
                  </button>
                </form>
              </div>
              <div className="card">
                <div className="card-header">
                  <h3>Trainers / Instructors ({trainers.length})</h3>
                </div>
                <TrainerList
                  trainers={trainers}
                  token={user.token}
                  onDelete={handleDeleteTrainer}
                  onAddTrainer={() => setTab('createTrainer')}
                />
              </div>
            </div>
          )}

          {/* ADD TRAINING */}
          {tab === 'createTraining' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24 }}>
              <div className="card">
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
              <div className="card">
                <div className="card-header">
                  <h3>All Training Sessions ({trainings.length})</h3>
                </div>
                {trainings.length === 0 ? (
                  <div className="empty-state"><p>No training sessions created yet.</p></div>
                ) : (
                  <div className="table-wrapper">
                    <table className="table">
                      <thead>
                        <tr><th>#</th><th>Title</th><th>Trainer</th><th>Start</th><th>End</th><th>Capacity</th><th>Enrolled</th><th>Actions</th></tr>
                      </thead>
                      <tbody>
                        {trainings.map((t, i) => (
                          <tr key={t.id}>
                            <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                            <td><strong>{t.title}</strong></td>
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