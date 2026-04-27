import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('ADMIN')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Store user data including token
      localStorage.setItem('user', JSON.stringify(data))
      onLogin(data)

      // Redirect based on role from backend
      if (data.role === 'ADMIN') {
        navigate('/admin')
      } else if (data.role === 'TRAINER') {
        navigate('/trainer')
      } else {
        navigate('/participant')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>WAVE INIT</h1>
          <p>Learning Management System</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email or Username</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter email or username"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter password"
            />
          </div>

          <div className="form-group">
            <label>Login as</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="ADMIN">Admin</option>
              <option value="TRAINER">Trainer</option>
              <option value="PARTICIPANT">Participant</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Only show register option for PARTICIPANT */}
        {role === 'PARTICIPANT' && (
          <p className="register-link">
            Don't have an account?{' '}
            <span onClick={() => navigate('/register')}>Register</span>
          </p>
        )}
      </div>
    </div>
  )
}

export default Login