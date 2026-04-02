import { useState, useEffect } from 'react'
import { fetchGallery } from '../api/gallery'

function normalize(p) {
  if (!p || typeof p !== 'object') return null
  return {
    ...p,
    id: p.projectId,
    views: p.viewCount,
    url: p.publicUrl,
    student: p.studentName ?? p.studentId ?? '',
    createdAt: p.createdAt ?? p.publishedAt,
  }
}

export function useGallery() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    fetchGallery({ signal: controller.signal })
      .then(data => setProjects((data.projects ?? []).map(normalize).filter(Boolean)))
      .catch(err => { if (err?.name !== 'AbortError') setError(err) })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  return { projects, loading, error }
}
