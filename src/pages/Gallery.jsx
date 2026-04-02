import { useState, useMemo } from 'react'
import { useGallery } from '../hooks/useGallery'
import ProjectCard from '../components/ProjectCard'
import BlobCanvas from '../components/BlobCanvas'
import Header from '../components/Header'
import Footer from '../components/Footer'

const SUBJECTS = ['All', 'Web Dev', 'Science', 'Art', 'Math', 'History', 'English', 'Other']

export default function Gallery() {
  const { projects, loading, error } = useGallery()
  const [search, setSearch] = useState('')
  const [activeSubject, setActiveSubject] = useState('All')

  const filtered = useMemo(() => {
    const q = (v) => (v == null ? '' : String(v)).toLowerCase()
    const needle = search.toLowerCase()
    return projects.filter(p => {
      if (!p) return false
      const matchSubject = activeSubject === 'All' || p.subject === activeSubject
      const matchSearch =
        !search ||
        q(p.title).includes(needle) ||
        q(p.student).includes(needle) ||
        q(p.subject).includes(needle)
      return matchSubject && matchSearch
    })
  }, [projects, search, activeSubject])

  return (
    <>
      <BlobCanvas />
      <div className="relative z-10 min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 max-w-7xl mx-auto w-full px-6">
          {/* Hero */}
          <section className="pt-20 pb-16">
            <div className="max-w-2xl">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-on-surface-muted mb-4">
                ✦ Student Work Archive
              </p>
              <h1 className="font-serif italic text-6xl md:text-8xl leading-none text-on-surface mb-6">
                Explore<br />
                <span className="text-accent">Student</span><br />
                Projects.
              </h1>
              <p className="text-on-surface-muted text-lg leading-relaxed font-sans max-w-lg">
                Browse published work from our classrooms. No login required. Share freely with parents, friends, and the world.
              </p>
            </div>
          </section>

          {/* Search + Filter */}
          <section className="pb-10 space-y-4">
            <div className="relative max-w-md">
              <span
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-muted pointer-events-none"
                style={{ fontSize: '18px' }}
              >
                search
              </span>
              <input
                type="text"
                placeholder="Search projects, students..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-surface-raised border border-outline pl-10 pr-4 py-2.5 font-mono text-sm text-on-surface placeholder:text-on-surface-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map(subject => (
                <button
                  key={subject}
                  onClick={() => setActiveSubject(subject)}
                  className={`font-mono text-[11px] uppercase tracking-widest px-3 py-1.5 border transition-colors ${
                    activeSubject === subject
                      ? 'bg-accent text-surface border-accent'
                      : 'border-outline text-on-surface-muted hover:border-silver hover:text-on-surface'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </section>

          {/* Results count */}
          <div className="pb-6">
            <p className="font-mono text-xs text-on-surface-muted">
              {filtered.length} project{filtered.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="py-24 text-center">
              <p className="font-mono text-xs text-on-surface-muted uppercase tracking-widest animate-pulse">
                Loading projects...
              </p>
            </div>
          ) : error ? (
            <div className="py-24 text-center">
              <p className="font-mono text-xs text-red-400 uppercase tracking-widest">
                {error.message ?? 'Failed to load projects.'}
              </p>
            </div>
          ) : filtered.length > 0 ? (
            <section
              className="grid gap-5 pb-16"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
            >
              {filtered.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </section>
          ) : (
            <div className="py-24 text-center">
              <p className="font-serif italic text-3xl text-on-surface-muted/40 mb-3">No projects found.</p>
              <p className="font-mono text-xs text-on-surface-muted uppercase tracking-widest">
                Try a different search or filter
              </p>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  )
}
