import { useState } from 'react'

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8083'

function AdminDashboard({ user, onLogout }) {
  const [trainerEmail, setTrainerEmail] = useState('')
  const [trainerPassword, setTrainerPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleCreateTrainer = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/createTrainer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Email': user.email,
        },
        body: JSON.stringify({ email: trainerEmail, password: trainerPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create trainer')
      }

      setMessage(`Trainer created: ${trainerEmail}`)
      setTrainerEmail('')
      setTrainerPassword('')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <div className="navbar">
        <h1>Admin Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>Welcome, {user.email}</span>
          <button onClick={onLogout}>Logout</button>
        </div>
      </div>

      <div className="container dashboard">
        <h2>Create New Trainer</h2>

        <div className="card trainer-form">
          {error && <div className="error">{error}</div>}
          {message && <div className="success">{message}</div>}

          <form onSubmit={handleCreateTrainer}>
            <div className="form-group">
              <label>Trainer Email</label>
              <input
                type="email"
                value={trainerEmail}
                onChange={(e) => setTrainerEmail(e.target.value)}
                required
                placeholder="Enter trainer email"
              />
            </div>

            <div className="form-group">
              <label>Trainer Password</label>
              <input
                type="password"
                value={trainerPassword}
                onChange={(e) => setTrainerPassword(e.target.value)}
                required
                placeholder="Enter trainer password"
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Create Trainer
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard