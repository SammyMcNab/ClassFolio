import { useState, useEffect, useCallback } from 'react'
import * as studentsApi from '../api/students'

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
  }, [])

  const resetStudentPassword = useCallback(async (studentId) => {
    const data = await studentsApi.resetStudentPassword(studentId)
    setStudents(prev =>
      prev.map(student =>
        student.studentId === studentId || student.id === studentId
          ? { ...student, mustResetPassword: true, status: 'pending reset' }
          : student
      )
    )
    return data
  }, [])

  return {
    students,
    loading,
    error,
    refresh,
    removeStudent,
    resetStudentPassword,
    setStudents,
  }
}
