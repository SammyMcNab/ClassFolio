import { useState, useEffect, useCallback } from 'react'
import * as studentsApi from '../api/students'

const TEMP_PASSWORDS_KEY = 'cf_temp_passwords'

function readTempPasswords() {
  try {
    const raw = localStorage.getItem(TEMP_PASSWORDS_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeTempPasswords(next) {
  try {
    localStorage.setItem(TEMP_PASSWORDS_KEY, JSON.stringify(next))
  } catch {
    // Ignore storage failures and keep in-memory state working.
  }
}

function normalize(student) {
  if (!student) return student
  return {
    ...student,
    id: student.studentId,
    name: student.displayName ?? student.studentId ?? '',
    joined: student.createdAt,
    projects: student.projects ?? 0,
    status: student.mustResetPassword ? 'pending reset' : 'active',
  }
}

export function useStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [tempPasswords, setTempPasswords] = useState(readTempPasswords)

  const rememberTempPassword = useCallback((studentId, password) => {
    if (!studentId || !password) return
    setTempPasswords(prev => {
      const next = {
        ...prev,
        [studentId]: {
          password,
          issuedAt: new Date().toISOString(),
        },
      }
      writeTempPasswords(next)
      return next
    })
  }, [])

  const clearTempPassword = useCallback((studentId) => {
    if (!studentId) return
    setTempPasswords(prev => {
      const next = { ...prev }
      delete next[studentId]
      writeTempPasswords(next)
      return next
    })
  }, [])

  const fetchStudents = useCallback(async (signal) => {
    if (!localStorage.getItem('cf_token')) return
    setLoading(true)
    setError(null)
    try {
      const data = await studentsApi.listStudents({ signal })
      setStudents((data.students ?? []).map(normalize))
    } catch (err) {
      if (err?.name !== 'AbortError') setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchStudents(controller.signal)
    return () => controller.abort()
  }, [fetchStudents])

  const refresh = useCallback(() => fetchStudents(), [fetchStudents])

  const removeStudent = useCallback(async (studentId) => {
    await studentsApi.deleteStudent(studentId)
    setStudents(prev => prev.filter(student => student.studentId !== studentId && student.id !== studentId))
    clearTempPassword(studentId)
  }, [clearTempPassword])

  const resetStudentPassword = useCallback(async (studentId) => {
    const data = await studentsApi.resetStudentPassword(studentId)
    const tempPassword = data?.tempPassword ?? data?.password
    if (tempPassword) rememberTempPassword(studentId, tempPassword)
    setStudents(prev =>
      prev.map(student =>
        student.studentId === studentId || student.id === studentId
          ? { ...student, mustResetPassword: true, status: 'pending reset' }
          : student
      )
    )
    return data
  }, [rememberTempPassword])

  return {
    students,
    loading,
    error,
    refresh,
    removeStudent,
    resetStudentPassword,
    tempPasswords,
    rememberTempPassword,
    clearTempPassword,
    setStudents,
  }
}
