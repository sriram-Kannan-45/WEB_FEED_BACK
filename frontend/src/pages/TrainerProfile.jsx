import { useState, useEffect } from 'react'

const API = 'http://localhost:3001/api'

function TrainerProfile({ user, onLogout }) {
  const [profile, setProfile] = useState({
    dob: '',
    phone: '',
    address: '',
    qualification: '',
    experience: '',
    name: ''
  })
  const [profileImage, setProfileImage] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const getAuthHeader = () => ({
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
          experience: data.profile.experience || '',
          name: data.profile.user?.name || user.name || ''
        })
        if (data.profile.imagePath) {
          if (data.profile.imagePath.startsWith('data:')) {
            setPreviewImage(data.profile.imagePath)
          } else {
            setPreviewImage(`${API}/uploads/${data.profile.imagePath}`)
          }
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfileImage(file)
      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreviewImage(event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setSaving(true)

    try {
      // Use FormData for multipart upload
      const formData = new FormData()
      formData.append('name', profile.name)
      formData.append('dob', profile.dob)
      formData.append('phone', profile.phone)
      formData.append('address', profile.address)
      formData.append('qualification', profile.qualification)
      formData.append('experience', profile.experience)
      
      if (profileImage) {
        formData.append('profileImage', profileImage)
      }

      const response = await fetch(`${API}/trainer/profile`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to save profile')
      }

      setMessage(data.message || 'Profile updated successfully')
      setProfileImage(null)
      // Fetch updated profile
      setTimeout(() => fetchProfile(), 500)
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
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                />
              </div>

              <div className="form-group">
                <label>Profile Picture</label>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <div>
                    {previewImage && (
                      <img 
                        src={previewImage} 
                        alt="Profile preview" 
                        style={{ width: '120px', height: '120px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

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