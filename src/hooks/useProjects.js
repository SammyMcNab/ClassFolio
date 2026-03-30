import { useState, useEffect, useCallback } from 'react'
import * as projectsApi from '../api/projects'

function normalize(p) {
  if (!p) return p
  return {
    ...p,
    id: p.projectId,
    views: p.viewCount ?? p.views,
    student: p.studentName ?? p.studentId ?? p.student,
  }
}

export function useProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const fetchProjects = useCallback(async (signal) => {
    if (!localStorage.getItem('cf_token')) return
    setLoading(true)
    setError(null)
    try {
      const data = await projectsApi.listProjects({ signal })
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

  const createProject = useCallback(async ({ title, description }) => {
    const data = await projectsApi.createProject({ title, description })
    const proj = normalize(data.project)
    setProjects(prev => [...prev, proj])
    return proj
  }, [])

  const updateProject = useCallback(async (projectId, fields) => {
    await projectsApi.updateProject(projectId, fields)
    setProjects(prev =>
      prev.map(p =>
        p.projectId === projectId || p.id === projectId
          ? normalize({ ...p, ...fields })
          : p
      )
    )
  }, [])

  const deleteProject = useCallback(async (projectId) => {
    await projectsApi.deleteProject(projectId)
    setProjects(prev => prev.filter(p => p.projectId !== projectId && p.id !== projectId))
  }, [])

  const uploadAndDeploy = useCallback(async ({ file, title, description, apiEndpoint = null }) => {
    setUploading(true)
    setUploadProgress(0)
    try {
      const { project } = await projectsApi.createProject({ title, description })
      const { projectId } = project
      setUploadProgress(15)

      const { uploadUrl } = await projectsApi.getUploadUrl(projectId)
      setUploadProgress(30)

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('PUT', uploadUrl)
        xhr.setRequestHeader('Content-Type', 'application/zip')
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = 30 + Math.round((e.loaded / e.total) * 40)
            setUploadProgress(pct)
          }
        }
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve()
          else reject(new Error(`S3 upload failed: ${xhr.status}`))
        }
        xhr.onerror = () => reject(new Error('S3 upload network error'))
        xhr.send(file)
      })
      setUploadProgress(75)

      const { publicUrl, fileCount } = await projectsApi.deployProject({ projectId, apiEndpoint })
      setUploadProgress(100)

      const deployed = normalize({
        ...project,
        publicUrl,
        fileCount,
        status: 'processing',
      })
      setProjects(prev => [...prev, deployed])

      const deadline = Date.now() + 60_000
      const poll = setInterval(async () => {
        if (Date.now() > deadline) {
          clearInterval(poll)
          return
        }
        try {
          const data = await projectsApi.getProject(projectId)
          const updated = data.project ?? data
          const n = normalize(updated)
          setProjects(prev =>
            prev.map(p =>
              p.projectId === projectId || p.id === projectId ? { ...p, ...n } : p
            )
          )
          if (updated.status === 'published' || updated.status === 'failed') {
            clearInterval(poll)
          }
        } catch {
          // ignore transient poll errors
        }
      }, 3000)

      return { publicUrl, projectId }
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setUploading(false)
    }
  }, [])

  return {
    projects,
    loading,
    error,
    uploading,
    uploadProgress,
    refresh,
    createProject,
    updateProject,
    deleteProject,
    uploadAndDeploy,
  }
}
