import { createContext, useContext, useMemo, useState } from 'react'
import { apiRequest } from '../api/client.js'

const AuthContext = createContext(null)

const TOKEN_KEY = 'expense_tracker_token'
const USER_KEY = 'expense_tracker_user'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [userName, setUserName] = useState(() => localStorage.getItem(USER_KEY))
  const [loading, setLoading] = useState(false)

  const login = async (username, password) => {
    setLoading(true)
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: { username, password },
      })

      if (!data?.token) {
        throw new Error(data?.message || 'Login failed')
      }

      localStorage.setItem(TOKEN_KEY, data.token)
      localStorage.setItem(USER_KEY, data.user || username)
      setToken(data.token)
      setUserName(data.user || username)
    } finally {
      setLoading(false)
    }
  }

  const register = async ({ fullName, email, password, profileImageUrl }) => {
    setLoading(true)
    try {
      await apiRequest('/auth/register', {
        method: 'POST',
        body: { fullName, email, password, profileImageUrl },
      })
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUserName(null)
  }

  const value = useMemo(
    () => ({
      token,
      userName,
      loading,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }),
    [loading, token, userName],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook colocated with provider
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return ctx
}
