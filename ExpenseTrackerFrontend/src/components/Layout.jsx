import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function Layout({ title, children }) {
  const { userName, logout } = useAuth()

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>{title}</h1>
          <p className="muted">Track expenses and income in one place</p>
        </div>
        <div className="topbar-actions">
          <span className="chip">{userName}</span>
          <Link to="/dashboard" className="link-btn">
            Dashboard
          </Link>
          <button type="button" onClick={logout}>
            Logout
          </button>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}

export default Layout
