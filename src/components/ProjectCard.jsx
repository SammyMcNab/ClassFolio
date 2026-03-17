import { Link } from 'react-router-dom'

const SUBJECT_COLORS = {
  'Web Dev':    'bg-blue-900/40 text-blue-300 border-blue-700/30',
  'Science':    'bg-emerald-900/40 text-emerald-300 border-emerald-700/30',
  'Art':        'bg-purple-900/40 text-purple-300 border-purple-700/30',
  'Math':       'bg-red-900/40 text-red-300 border-red-700/30',
  'History':    'bg-amber-900/40 text-amber-300 border-amber-700/30',
  'English':    'bg-pink-900/40 text-pink-300 border-pink-700/30',
  'Other':      'bg-zinc-800/60 text-zinc-400 border-zinc-600/30',
}

export default function ProjectCard({ project, showActions, onEdit, onDelete }) {
  const subjectStyle = SUBJECT_COLORS[project.subject] || SUBJECT_COLORS['Other']

  return (
    <article className="card group flex flex-col overflow-hidden">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-surface-variant overflow-hidden">
        {project.thumbnail ? (
          <img
            src={project.thumbnail}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-serif italic text-4xl text-on-surface-muted/30">
              {project.title.charAt(0)}
            </span>
          </div>
        )}
        {/* Subject badge overlay */}
        <span className={`absolute top-2 left-2 font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 border ${subjectStyle}`}>
          {project.subject}
        </span>
        {/* View count */}
        <span className="absolute top-2 right-2 font-mono text-[10px] text-on-surface-muted flex items-center gap-1 bg-surface/70 px-2 py-0.5">
          <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>visibility</span>
          {project.views}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-serif italic text-lg leading-tight text-on-surface group-hover:text-accent transition-colors line-clamp-2">
            {project.title}
          </h3>
          <p className="font-mono text-xs text-on-surface-muted mt-1">
            {project.student} · {project.grade}
          </p>
        </div>

        {project.description && (
          <p className="text-sm text-on-surface-muted leading-relaxed line-clamp-2 font-sans">
            {project.description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2 border-t border-outline">
          <span className="font-mono text-[10px] text-on-surface-muted">
            {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>

          {showActions ? (
            <div className="flex gap-2">
              <button
                onClick={() => onEdit?.(project)}
                className="font-mono text-[10px] uppercase tracking-wider text-on-surface-muted hover:text-accent transition-colors px-2 py-1 border border-outline hover:border-accent"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete?.(project)}
                className="font-mono text-[10px] uppercase tracking-wider text-on-surface-muted hover:text-red-400 transition-colors px-2 py-1 border border-outline hover:border-red-700"
              >
                Delete
              </button>
            </div>
          ) : (
            <Link
              to={`/project/${project.id}`}
              className="font-mono text-[10px] uppercase tracking-widest text-accent flex items-center gap-1 hover:gap-2 transition-all"
            >
              View
              <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>arrow_forward</span>
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
