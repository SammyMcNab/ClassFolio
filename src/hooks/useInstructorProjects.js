import { useState, useEffect, useCallback } from 'react'
import * as projectsApi from '../api/projects'

function apiStatus(status) {
  if (status == null || status === '') return status
  return String(status).toLowerCase()
}

function normalize(project) {
  if (!project) return project
  return {
    ...project,
    id: project.projectId,
    views: Math.max(0, project.viewCount ?? project.views ?? 0),
    student: project.studentName ?? project.studentId ?? project.student,
    status: project.status != null && project.status !== '' ? apiStatus(project.status) : project.status,
  }
}

export function useInstructorProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchProjects = useCallback(async (signal) => {
    if (!localStorage.getItem('cf_token')) return
    setLoading(true)
    setError(null)
    try {
      const data = await projectsApi.listInstructorProjects({ signal })
      setProjects((data.projects ?? []).map(normalize))
    } catch (err) {
      if (err?.name !== 'AbortError') setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchProjects(controller.signal)
    return () => controller.abort()
  }, [fetchProjects])

  const refresh = useCallback(() => fetchProjects(), [fetchProjects])

  const updateStatus = useCallback(async (projectId, status) => {
    const data = await projectsApi.updateProjectStatus(projectId, status)
    const updated = normalize(data?.project)
    setProjects(prev =>
      prev.map(project =>
        project.projectId === projectId || project.id === projectId
          ? { ...project, ...updated }
          : project
      )
    )
    return updated
  }, [])

  return {
    projects,
    loading,
    error,
    refresh,
    updateStatus,
  }
}
