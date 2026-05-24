import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function RegisterPage() {
  const navigate = useNavigate()
  const { register, loading } = useAuth()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    profileImageUrl: '',
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    try {
      await register(form)
      setMessage('Registration successful. Activate your account from email, then login.')
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={onSubmit}>
        <h2>Register</h2>
        <p className="muted">Create your expense tracker account</p>
        <input
          name="fullName"
          value={form.fullName}
          onChange={onChange}
          placeholder="Full name"
          required
        />
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          placeholder="Email"
          required
        />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          placeholder="Password"
          required
        />
        <input
          name="profileImageUrl"
          type="url"
          value={form.profileImageUrl}
          onChange={onChange}
          placeholder="Profile image URL (optional)"
        />
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </button>
        <p className="muted">
          Already registered? <Link to="/login">Go to login</Link>
        </p>
      </form>
    </div>
  )
}

export default RegisterPage
