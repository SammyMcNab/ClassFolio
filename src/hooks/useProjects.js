import { useState, useEffect, useCallback, useRef } from 'react'
import * as projectsApi from '../api/projects'

function apiStatus(s) {
  if (s == null || s === '') return s
  return String(s).toLowerCase()
}

function normalize(p) {
  if (!p) return p
  return {
    ...p,
    id: p.projectId,
    views: Math.max(0, p.viewCount ?? p.views ?? 0),
    student: p.studentName ?? p.studentId ?? p.student,
    status: p.status != null && p.status !== '' ? apiStatus(p.status) : p.status,
  }
}

export function useProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const deployPollRef = useRef(null)

  useEffect(() => {
    return () => {
      if (deployPollRef.current) {
        clearInterval(deployPollRef.current)
        deployPollRef.current = null
      }
    }
  }, [])

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
    if (!data?.project) throw new Error('Create project response missing project')
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

  const uploadAndDeploy = useCallback(async ({ file, title, description, apiEndpoint = import.meta.env.VITE_API_URL }) => {
    setUploading(true)
    setUploadProgress(0)
    try {
      const created = await projectsApi.createProject({ title, description })
      const project = created?.project
      if (!project?.projectId) throw new Error('Create project response missing projectId')
      const { projectId } = project
      setUploadProgress(15)

      const uploadPayload = await projectsApi.getUploadUrl(projectId)
      const uploadUrl = uploadPayload?.uploadUrl
      if (!uploadUrl) throw new Error('No upload URL from server')
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

      const deployRes = await projectsApi.deployProject({ projectId, apiEndpoint })
      const { publicUrl, fileCount, status: deployStatus } = deployRes
      setUploadProgress(100)

      const fromApi = deployStatus != null && deployStatus !== '' ? apiStatus(deployStatus) : null
      // Many APIs publish synchronously and return publicUrl immediately; avoid a fake "processing" state.
      const initialStatus = fromApi ?? (publicUrl ? 'published' : 'processing')
      const deployed = normalize({
        ...project,
        publicUrl,
        fileCount,
        status: initialStatus,
      })
      setProjects(prev => [...prev, deployed])

      if (initialStatus === 'processing') {
        if (deployPollRef.current) clearInterval(deployPollRef.current)
        const deadline = Date.now() + 60_000

        const finishPolling = async () => {
          let merged = null
          try {
            const data = await projectsApi.getProject(projectId)
            const updated = data.project ?? data
            if (updated && typeof updated === 'object') merged = normalize(updated)
          } catch {
            /* last-chance sync optional */
          }
          setProjects(prev =>
            prev.map(p => {
              if (p.projectId !== projectId && p.id !== projectId) return p
              let next = merged ? { ...p, ...merged } : { ...p }
              if (apiStatus(next.status) === 'processing' && next.publicUrl) {
                next = { ...next, status: 'published' }
              }
              return next
            })
          )
        }

        deployPollRef.current = setInterval(async () => {
          if (Date.now() > deadline) {
            clearInterval(deployPollRef.current)
            deployPollRef.current = null
            await finishPolling()
            return
          }
          try {
            const data = await projectsApi.getProject(projectId)
            const updated = data.project ?? data
            if (!updated || typeof updated !== 'object') return
            const st = apiStatus(updated.status)
            const n = normalize(updated)
            setProjects(prev =>
              prev.map(p =>
                p.projectId === projectId || p.id === projectId ? { ...p, ...n } : p
              )
            )
            if (st === 'published' || st === 'failed') {
              clearInterval(deployPollRef.current)
              deployPollRef.current = null
            }
          } catch {
            // ignore transient poll errors
          }
        }, 3000)
      }

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
