import { get, post, put, del } from './client'

export const listProjects = ({ signal } = {}) =>
  get('/projects', { signal })

export const createProject = ({ title, description }) =>
  post('/projects', { body: { title, description } })

export const getProject = (projectId, { signal } = {}) =>
  get(`/projects/${projectId}`, { signal })

export const updateProject = (projectId, fields) =>
  put(`/projects/${projectId}`, { body: fields })

export const deleteProject = (projectId) =>
  del(`/projects/${projectId}`)

export const getUploadUrl = (projectId) =>
  post(`/projects/${projectId}/upload-url`)

export const deployProject = ({ projectId, apiEndpoint }) =>
  post('/projects/deploy', { body: { projectId, apiEndpoint } })
