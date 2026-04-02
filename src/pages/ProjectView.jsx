import { useEffect } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { useGallery } from '../hooks/useGallery'
import { useAnalytics } from '../hooks/useAnalytics'
import { useToast } from '../components/Toast'
import BlobCanvas from '../components/BlobCanvas'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function ProjectView() {
  const { id } = useParams()
  const { state } = useLocation()
  const showToast = useToast()
  const { projects, loading: galleryLoading, error: galleryError } = useGallery()
  const { trackView } = useAnalytics()

  // Resolve project: prefer router state (fast path from Gallery), fall back to gallery list
  const project =
    state?.project ??
    projects.find(p => p && (p.id === id || p.projectId === id))

  useEffect(() => {
    if (id) trackView(id, 'project-view')
  }, [id, trackView])

  if (!project && galleryError) {
    return (
      <>
        <BlobCanvas />
        <div className="relative z-10 min-h-screen flex flex-col">
          <Header />
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="text-center max-w-md">
              <p className="font-serif italic text-2xl text-on-surface-muted mb-2">Could not load gallery.</p>
              <p className="font-mono text-xs text-red-400/90 mb-6">{galleryError.message ?? 'Network or server error.'}</p>
              <Link to="/" className="font-mono text-xs uppercase tracking-widest text-accent hover:underline">
                Back to Gallery
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (!project && !galleryLoading && !state?.project) {
    return (
      <>
        <BlobCanvas />
        <div className="relative z-10 min-h-screen flex flex-col">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="font-serif italic text-5xl text-on-surface-muted/30 mb-4">Project not found.</p>
              <Link to="/" className="font-mono text-xs uppercase tracking-widest text-accent hover:underline">
                Back to Gallery
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (!project) {
    return (
      <>
        <BlobCanvas />
        <div className="relative z-10 min-h-screen flex flex-col">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <p className="font-mono text-xs text-on-surface-muted uppercase tracking-widest animate-pulse">
              Loading project...
            </p>
          </div>
        </div>
      </>
    )
  }

  const related = projects.filter(p => p.subject === project.subject && p.id !== project.id).slice(0, 3)

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      showToast('Link copied to clipboard!', 'success')
    })
  }

  function handleFullscreen() {
    const frame = document.getElementById('project-frame')
    if (frame?.requestFullscreen) frame.requestFullscreen()
  }

  return (
    <>
      <BlobCanvas />
      <div className="relative z-10 min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
          {/* Breadcrumb */}
          <Link
            to="/"
            className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-widest text-on-surface-muted hover:text-accent transition-colors mb-8"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_back</span>
            Gallery
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: embed (2/3) */}
            <div className="lg:col-span-2 space-y-4">
              {/* Subject + Title */}
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-muted border border-outline px-2 py-0.5">
                  {project.subject}
                </span>
                <h1 className="font-serif italic text-4xl md:text-5xl mt-3 leading-tight text-on-surface">
                  {project.title}
                </h1>
              </div>

              {/* iframe */}
              <div className="relative bg-surface-variant border border-outline overflow-hidden">
                <div className="aspect-video">
                  {project.url ? (
                    <iframe
                      id="project-frame"
                      src={project.url}
                      className="w-full h-full"
                      sandbox="allow-scripts allow-same-origin allow-forms"
                      allowFullScreen
                      loading="lazy"
                      title={project.title}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                      <span className="font-serif italic text-7xl text-on-surface-muted/20">
                        {project.title.charAt(0)}
                      </span>
                      <p className="font-mono text-xs text-on-surface-muted uppercase tracking-widest">
                        Preview not available
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action row */}
              <div className="flex gap-3">
                <button
                  onClick={handleFullscreen}
                  className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-on-surface-muted border border-outline px-3 py-2 hover:border-silver hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>fullscreen</span>
                  Fullscreen
                </button>
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-on-surface-muted border border-outline px-3 py-2 hover:border-silver hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>open_in_new</span>
                    Open
                  </a>
                )}
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-on-surface-muted border border-outline px-3 py-2 hover:border-accent hover:text-accent transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>share</span>
                  Share
                </button>
              </div>
            </div>

            {/* Right: metadata sidebar (1/3) */}
            <aside className="space-y-6">
              {/* Student card */}
              <div className="card p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-surface-variant border border-outline flex items-center justify-center flex-shrink-0">
                    <span className="font-serif italic text-lg text-accent">
                      {(project.student ?? '?').charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-mono text-sm text-on-surface">{project.student}</p>
                    <p className="font-mono text-xs text-on-surface-muted">{project.grade}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm border-t border-outline pt-3">
                  <div className="flex justify-between">
                    <span className="font-mono text-xs text-on-surface-muted uppercase tracking-wider">Subject</span>
                    <span className="font-mono text-xs text-on-surface">{project.subject}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-xs text-on-surface-muted uppercase tracking-wider">Published</span>
                    <span className="font-mono text-xs text-on-surface">
                      {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-xs text-on-surface-muted uppercase tracking-wider">Views</span>
                    <span className="font-mono text-xs text-accent">{Math.max(0, project.views ?? 0)}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {project.description && (
                <div className="card p-5">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-muted mb-2">About</p>
                  <p className="text-sm text-on-surface-muted leading-relaxed font-sans">{project.description}</p>
                </div>
              )}

              {/* Related */}
              {related.length > 0 && (
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-muted mb-3">
                    More {project.subject}
                  </p>
                  <div className="space-y-3">
                    {related.map(p => (
                      <Link
                        key={p.id}
                        to={`/project/${p.id}`}
                        state={{ project: p }}
                        className="flex items-center gap-3 p-3 border border-outline hover:border-accent/40 transition-colors group"
                      >
                        <div className="w-10 h-10 bg-surface-variant flex items-center justify-center flex-shrink-0">
                          <span className="font-serif italic text-on-surface-muted/40 group-hover:text-accent transition-colors">
                            {p.title.charAt(0)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-mono text-xs text-on-surface group-hover:text-accent transition-colors truncate">
                            {p.title}
                          </p>
                          <p className="font-mono text-[10px] text-on-surface-muted">{p.student}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}
