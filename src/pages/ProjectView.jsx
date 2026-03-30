import { useState, useEffect } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { useGallery } from '../hooks/useGallery'
import { useAnalytics } from '../hooks/useAnalytics'
import BlobCanvas from '../components/BlobCanvas'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ProjectCard from '../components/ProjectCard'
import { useToast } from '../components/Toast'

const REACTIONS = [
  { emoji: '👍', label: 'Nice work', key: 'thumbs' },
  { emoji: '🎉', label: 'Amazing', key: 'celebrate' },
  { emoji: '⭐', label: 'Favourite', key: 'star' },
  { emoji: '🔥', label: 'On fire', key: 'fire' },
]

const MOCK_COMMENTS = [
  { id: 1, name: 'Ms. Johnson', role: 'Instructor', text: 'Excellent work! The interactivity really elevates this project.', date: '2026-03-12' },
  { id: 2, name: 'Parent', role: 'Viewer', text: 'My daughter showed me this and I was blown away. Really impressive!', date: '2026-03-14' },
]

export default function ProjectView() {
  const { id } = useParams()
  const { state } = useLocation()
  const showToast = useToast()
  const { projects } = useGallery()
  const { trackView } = useAnalytics()
  const [reactions, setReactions] = useState({ thumbs: 12, celebrate: 7, star: 24, fire: 5 })
  const [reacted, setReacted] = useState({})

  // Resolve project: prefer router state (fast path from Gallery), fall back to gallery list
  const project = state?.project ?? projects.find(p => p.id === id)

  useEffect(() => {
    if (id) trackView(id, 'project-view')
  }, [id])

  if (!project && projects.length > 0) {
    return (
      <>
        <BlobCanvas />
        <div className="relative z-10 min-h-screen flex flex-col">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="font-serif italic text-5xl text-on-surface-muted/30 mb-4">Project not found.</p>
              <Link to="/" className="font-mono text-xs uppercase tracking-widest text-accent hover:underline">
                ← Back to Gallery
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

  function handleReaction(key) {
    if (reacted[key]) return
    setReactions(prev => ({ ...prev, [key]: prev[key] + 1 }))
    setReacted(prev => ({ ...prev, [key]: true }))
  }

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
                  className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-on-surface-muted border border-outline px-3 py-2 hover:border-accent hover:text-accent hover:border-accent transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>share</span>
                  Share
                </button>
              </div>

              {/* Reactions */}
              <div className="flex flex-wrap gap-2 pt-2">
                {REACTIONS.map(r => (
                  <button
                    key={r.key}
                    onClick={() => handleReaction(r.key)}
                    title={r.label}
                    className={`flex items-center gap-2 px-3 py-1.5 border font-mono text-xs transition-all ${
                      reacted[r.key]
                        ? 'border-accent/50 bg-accent/10 text-accent'
                        : 'border-outline text-on-surface-muted hover:border-silver'
                    }`}
                  >
                    <span>{r.emoji}</span>
                    <span>{reactions[r.key]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: metadata sidebar (1/3) */}
            <aside className="space-y-6">
              {/* Student card */}
              <div className="card p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-surface-variant border border-outline flex items-center justify-center flex-shrink-0">
                    <span className="font-serif italic text-lg text-accent">
                      {project.student.charAt(0)}
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
                    <span className="font-mono text-xs text-accent">{project.views}</span>
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

          {/* Comments */}
          <section className="mt-14 pt-8 border-t border-outline">
            <h2 className="font-serif italic text-2xl text-on-surface mb-6">
              Feedback <span className="text-on-surface-muted font-sans font-normal text-base not-italic">({MOCK_COMMENTS.length})</span>
            </h2>
            <div className="space-y-4 mb-8 max-w-2xl">
              {MOCK_COMMENTS.map(c => (
                <div key={c.id} className="card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-xs text-on-surface">{c.name}</span>
                    <span className="font-mono text-[10px] text-on-surface-muted border border-outline px-1.5 py-0.5">
                      {c.role}
                    </span>
                    <span className="font-mono text-[10px] text-on-surface-muted ml-auto">
                      {new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-muted font-sans leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>

            {/* Comment form */}
            <form
              className="max-w-2xl space-y-3"
              onSubmit={e => {
                e.preventDefault()
                showToast('Comment submitted for review', 'success')
                e.target.reset()
              }}
            >
              <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-muted">Leave feedback</p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Your name"
                  required
                  className="bg-surface-raised border border-outline px-3 py-2 font-mono text-sm text-on-surface placeholder:text-on-surface-muted focus:outline-none focus:border-accent transition-colors"
                />
                <input
                  type="text"
                  placeholder="Role (Parent, Peer...)"
                  className="bg-surface-raised border border-outline px-3 py-2 font-mono text-sm text-on-surface placeholder:text-on-surface-muted focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <textarea
                rows={3}
                placeholder="Share your thoughts on this project..."
                required
                className="w-full bg-surface-raised border border-outline px-3 py-2 font-mono text-sm text-on-surface placeholder:text-on-surface-muted focus:outline-none focus:border-accent transition-colors resize-none"
              />
              <button
                type="submit"
                className="font-mono text-xs uppercase tracking-widest px-6 py-2.5 bg-accent text-surface hover:bg-accent-dim transition-colors"
              >
                Submit Feedback
              </button>
            </form>
          </section>
        </main>

        <Footer />
      </div>
    </>
  )
}
