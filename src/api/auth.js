import { post } from './client'

export const login = ({ studentId, password }) =>
  post('/auth/login', { body: { studentId, password }, auth: false })

export const verifyToken = () =>
  post('/auth/verify', { auth: true })

export const resetPassword = ({ newPassword }) =>
  post('/auth/reset-password', { body: { newPassword }, auth: true })

export const createStudent = ({ studentId, displayName, email, tempPassword }) =>
  post('/auth/create-student', { body: { studentId, displayName, email, tempPassword }, auth: false })
