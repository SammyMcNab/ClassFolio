import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import * as authApi from '../api/auth'

const AuthContext = createContext(null)

function readStoredUser() {
  const token = localStorage.getItem('cf_token')
  const displayName = localStorage.getItem('cf_user')
  const role = localStorage.getItem('cf_role')
  if (!token) return null
  return { displayName, role }
}

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(readStoredUser)
  const [loading, setLoading] = useState(!!localStorage.getItem('cf_token'))
  const [error, setError] = useState(null)
  const [mustResetPassword, setMustResetPassword] = useState(false)

  const logout = useCallback(() => {
    localStorage.removeItem('cf_token')
    localStorage.removeItem('cf_user')
    localStorage.removeItem('cf_role')
    setUser(null)
    setMustResetPassword(false)
  }, [])

  // Verify stored token on mount
  useEffect(() => {
    if (!localStorage.getItem('cf_token')) return
    authApi.verifyToken()
      .then(data => setUser(prev => ({ ...prev, ...data })))
      .catch(() => logout())
      .finally(() => setLoading(false))
  }, [logout])

  // Global 401 handler — dispatched by api/client.js
  useEffect(() => {
    function onUnauthorized() {
      logout()
      navigate('/login')
    }
    window.addEventListener('auth:unauthorized', onUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized)
  }, [logout, navigate])

  const login = useCallback(async ({ studentId, password, role = 'student' }) => {
    setLoading(true)
    setError(null)
    try {
      const data = await authApi.login({ studentId, password })
      localStorage.setItem('cf_token', data.token)
      localStorage.setItem('cf_user', data.displayName)
      localStorage.setItem('cf_role', role)
      setUser({ studentId: data.studentId, displayName: data.displayName, role })
      if (data.mustResetPassword) setMustResetPassword(true)
      return { mustResetPassword: !!data.mustResetPassword }
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const resetPassword = useCallback(async ({ newPassword }) => {
    setLoading(true)
    setError(null)
    try {
      await authApi.resetPassword({ newPassword })
      setMustResetPassword(false)
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createStudent = useCallback(async ({ studentId, displayName, email, tempPassword }) => {
    setLoading(true)
    setError(null)
    try {
      await authApi.createStudent({ studentId, displayName, email, tempPassword })
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, error, mustResetPassword, login, logout, resetPassword, createStudent }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
