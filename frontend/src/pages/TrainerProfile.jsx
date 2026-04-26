import { useState, useEffect } from 'react'

const API = 'http://localhost:3001/api'

function TrainerProfile({ user, onLogout }) {
  const [profile, setProfile] = useState({
    dob: '',
    phone: '',
    address: '',
    qualification: '',
    experience: ''
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const getAuthHeader = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user.token}`
  })

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API}/trainer/profile`, {
        headers: getAuthHeader()
      })
      const data = await response.json()
      if (data.profile) {
        setProfile({
          dob: data.profile.dob || '',
          phone: data.profile.phone || '',
          address: data.profile.address || '',
          qualification: data.profile.qualification || '',
          experience: data.profile.experience || ''
        })
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setSaving(true)

    try {
      const response = await fetch(`${API}/trainer/profile`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(profile)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save profile')
      }

      setMessage(data.message)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  return (
    <div>
      <div className="navbar">
        <h1>My Profile</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>Welcome, {user.name || user.username}</span>
          <button onClick={onLogout}>Logout</button>
        </div>
      </div>

      <div className="container dashboard">
        <div className="card">
          <h2>Trainer Profile</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Update your profile details.
          </p>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={profile.dob}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea
                  name="address"
                  value={profile.address}
                  onChange={handleChange}
                  placeholder="Enter address"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Qualification</label>
                <input
                  type="text"
                  name="qualification"
                  value={profile.qualification}
                  onChange={handleChange}
                  placeholder="e.g., B.Sc, M.Sc, Ph.D"
                />
              </div>

              <div className="form-group">
                <label>Experience</label>
                <textarea
                  name="experience"
                  value={profile.experience}
                  onChange={handleChange}
                  placeholder="Describe your experience"
                  rows={3}
                />
              </div>

              {error && <div className="error">{error}</div>}
              {message && <div className="success">{message}</div>}

              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default TrainerProfile