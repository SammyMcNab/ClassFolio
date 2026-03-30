import { post, get } from './client'

export const trackView = ({ projectId, page }) =>
  post('/analytics/track', { body: { projectId, page }, auth: false })

export const getStats = (projectId, { signal } = {}) =>
  get(`/analytics/stats/${projectId}`, { auth: false, signal })
