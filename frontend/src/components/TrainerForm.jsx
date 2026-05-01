import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

const API = 'http://localhost:3001/api'

/**
 * TrainerForm — full profile form for the TRAINER to fill/update their details
 * including profile image upload. All data is stored in the DB.
 */
function TrainerForm({ user, onLogout }) {
  const [form, setForm] = useState({
    phone: '',
    dob: '',
    qualification: '',
    experience: ''
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [existingImage, setExistingImage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const fileInputRef = useRef()

  const authHeader = () => ({ Authorization: `Bearer ${user.token}` })

  // Load existing profile on mount
  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const r = await fetch(`${API}/trainer/profile`, { headers: authHeader() })
      const d = await r.json()
      if (d.trainer?.profile) {
        const p = d.trainer.profile
        setForm({
          phone: p.phone || '',
          dob: p.dob || '',
          qualification: p.qualification || '',
          experience: p.experience || ''
        })
        if (p.imagePath) {
          setExistingImage(`${API.replace('/api', '')}${p.imagePath}`)
        }
      }
    } catch (err) {
      console.error('Error loading profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }

    setChangingPassword(true)
    try {
      const r = await fetch(`${API}/trainer/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ oldPassword: passwordForm.oldPassword, newPassword: passwordForm.newPassword })
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Failed to change password')
      setPasswordSuccess('Password changed successfully!')
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setShowPasswordModal(false), 1500)
    } catch (err) {
      setPasswordError(err.message)
    } finally {
      setChangingPassword(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setSaving(true)

    try {
      const formData = new FormData()
      formData.append('phone', form.phone)
      formData.append('dob', form.dob)
      formData.append('qualification', form.qualification)
      formData.append('experience', form.experience)
      
      if (imageFile) {
        formData.append('photo', imageFile)
      }

      console.log(form);
      console.log(imageFile);

      const response = await axios.put(`${API}/trainer/update`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${user.token}`
        }
      });

      setMessage(response.data.message || 'Profile saved successfully!')

      // Refresh to show new image
      fetchProfile()
      setImageFile(null)
      setImagePreview(null)
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message)
    } finally {
      setSaving(false)
    }
  }

  const displayImage = imagePreview || existingImage

  const initials = (name) => name ? name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'TR'

  return (
    <div className="trainer-form-wrap">
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          <div className="spinner" style={{ margin: '0 auto 12px' }} />
          <p>Loading profile…</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="trainer-profile-form">

          {/* Profile Image Section */}
          <div className="profile-image-section">
            <div className="profile-image-wrapper">
              {displayImage ? (
                <img
                  src={displayImage}
                  alt="Profile"
                  className="profile-image-preview"
                  onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                />
              ) : null}
              <div
                className="profile-image-initials"
                style={{ display: displayImage ? 'none' : 'flex' }}
              >
                {initials(user.name)}
              </div>
              <button
                type="button"
                className="profile-image-edit-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Change photo"
              >
                &#9998;
              </button>
            </div>
            <div className="profile-image-meta">
              <div className="profile-name">{user.name}</div>
              <div className="profile-email">{user.email}</div>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => fileInputRef.current?.click()}
                style={{ marginTop: 8 }}
              >
                {displayImage ? 'Change Photo' : 'Upload Photo'}
              </button>
              {imageFile && (
                <span style={{ fontSize: 12, color: 'var(--success)', marginTop: 6, display: 'block' }}>
                  ✓ {imageFile.name} selected
                </span>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageChange}
              id="profile-image-input"
            />
          </div>

          {/* Form Fields */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                className="form-control"
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="e.g. +91 98765 43210"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input
                className="form-control"
                type="date"
                name="dob"
                value={form.dob}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Qualification</label>
            <input
              className="form-control"
              type="text"
              name="qualification"
              value={form.qualification}
              onChange={handleChange}
              placeholder="e.g. M.Tech, Ph.D, MBA"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Experience</label>
            <textarea
              className="form-control"
              name="experience"
              value={form.experience}
              onChange={handleChange}
              placeholder="Describe your teaching experience, specializations, achievements…"
              rows={4}
            />
          </div>

          {error && <div className="error">{error}</div>}
          {message && <div className="success">{message}</div>}

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving Profile…' : 'Save Profile'}
            </button>
            <button type="button" className="btn" onClick={() => { setPasswordError(''); setPasswordSuccess(''); setShowPasswordModal(true) }}>
              Change Password
            </button>
          </div>
        </form>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Change Password</h3>
              <button className="modal-close" onClick={() => setShowPasswordModal(false)}>×</button>
            </div>
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  className="form-control"
                  type="password"
                  value={passwordForm.oldPassword}
                  onChange={e => setPasswordForm(p => ({ ...p, oldPassword: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  className="form-control"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  className="form-control"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  required
                />
              </div>
              {passwordError && <div className="error" style={{ marginBottom: 12 }}>{passwordError}</div>}
              {passwordSuccess && <div className="success" style={{ marginBottom: 12 }}>{passwordSuccess}</div>}
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={changingPassword}>
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default TrainerForm
