import { useState, useCallback } from 'react'
import * as analyticsApi from '../api/analytics'

export function useAnalytics() {
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(false)

  const trackView = useCallback((projectId, page) => {
    analyticsApi.trackView({ projectId, page }).catch(() => {})
  }, [])

  const fetchStats = useCallback(async (projectId) => {
    setStatsLoading(true)
    try {
      const data = await analyticsApi.getStats(projectId)
      setStats(data)
    } catch {
      // silently ignore — stats are non-critical
    } finally {
      setStatsLoading(false)
    }
  }, [])

  return { trackView, stats, statsLoading, fetchStats }
}
