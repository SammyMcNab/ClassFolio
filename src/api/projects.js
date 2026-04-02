import { get, post, put, del } from './client'

export const listProjects = ({ signal } = {}) =>
  get('/projects', { signal })

export const listInstructorProjects = ({ signal } = {}) =>
  get('/instructor/projects', { signal })

export const createProject = (fields) =>
  post('/projects', { body: fields })

export const getProject = (projectId, { signal } = {}) =>
  get(`/projects/${projectId}`, { signal })

export const updateProject = (projectId, fields) =>
  put(`/projects/${projectId}`, { body: fields })

export const updateProjectStatus = (projectId, status) =>
  put(`/projects/${projectId}/status`, { body: { status } })

export const deleteProject = (projectId) =>
  del(`/projects/${projectId}`)

export const getUploadUrl = (projectId) =>
  post(`/projects/${projectId}/upload-url`)

export const deployProject = ({ projectId, apiEndpoint }) =>
  post('/projects/deploy', { body: { projectId, apiEndpoint } })
