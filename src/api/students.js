import { get, post, del } from './client'

export const listStudents = ({ signal } = {}) =>
  get('/students', { signal })

export const resetStudentPassword = (studentId) =>
  post(`/students/${studentId}/reset-password`)

export const deleteStudent = (studentId) =>
  del(`/students/${studentId}`)
