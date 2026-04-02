import { useState, useEffect, useCallback } from 'react'
import { getSummary } from '../api/analytics'

export function useAnalyticsSummary(scope) {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchSummary = useCallback(async (signal) => {
    if (!localStorage.getItem('cf_token')) return
    setLoading(true)
    setError(null)
    try {
      const data = await getSummary(scope, { signal })
      setSummary(data)
    } catch (err) {
      if (err?.name !== 'AbortError') setError(err)
    } finally {
      setLoading(false)
    }
  }, [scope])

  useEffect(() => {
    const controller = new AbortController()
    fetchSummary(controller.signal)
    return () => controller.abort()
  }, [fetchSummary])

  const refresh = useCallback(() => fetchSummary(), [fetchSummary])

  return {
    summary,
    loading,
    error,
    refresh,
  }
}
