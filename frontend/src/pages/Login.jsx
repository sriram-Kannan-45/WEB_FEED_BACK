import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API = 'http://localhost:3001/api'

function Login({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '', role: 'PARTICIPANT' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      localStorage.setItem('user', JSON.stringify(data))
      onLogin(data)
      if (data.role === 'ADMIN') navigate('/admin')
      else if (data.role === 'TRAINER') navigate('/trainer')
      else navigate('/participant')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-mark">W</div>
          <h1>WAVE INIT LMS</h1>
          <p>Training Feedback System</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email or Username</label>
            <input id="login-email" className="form-control" type="text" value={form.email}
              onChange={e => set('email', e.target.value)} required placeholder="Enter email or username" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input id="login-password" className="form-control" type="password" value={form.password}
              onChange={e => set('password', e.target.value)} required placeholder="Enter password" />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select id="login-role" className="form-control" value={form.role} onChange={e => set('role', e.target.value)}>
              <option value="PARTICIPANT">Participant</option>
              <option value="TRAINER">Trainer</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>
          <button id="login-submit" type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {form.role === 'PARTICIPANT' && (
          <p className="register-link" style={{ marginTop: 16 }}>
            No account? <span onClick={() => navigate('/register')}>Register as Participant</span>
          </p>
        )}

        <div className="login-hint">Default admin: admin@test.com / admin123</div>
      </div>
    </div>
  )
}

export default Login