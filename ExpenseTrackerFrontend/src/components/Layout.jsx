import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { IconUserCircle } from './icons.jsx'

function Layout({ title, children }) {
  const { userName, logout } = useAuth()
  const initial = (userName || '?').trim().charAt(0).toUpperCase()

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-brand">
          <h1>{title}</h1>
          <p className="topbar-sub muted">Track expenses and income in one place</p>
        </div>
        <div className="topbar-actions">
          <div className="user-pill" title={userName || 'User'}>
            <span className="user-avatar" aria-hidden>
              {userName ? (
                <span className="user-avatar-letter">{initial}</span>
              ) : (
                <IconUserCircle width={22} height={22} />
              )}
            </span>
            <span className="user-name">{userName}</span>
          </div>
          <NavLink to="/dashboard" className={({ isActive }) => `nav-pill${isActive ? ' nav-pill--primary' : ''}`}>
            Dashboard
          </NavLink>
          <button type="button" className="btn-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </header>
      <main className="main-content">{children}</main>
    </div>
  )
}

export default Layout
