import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, Tooltip, Legend, Filler
} from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2'
import BlobCanvas from '../components/BlobCanvas'
import Header from '../components/Header'
import ProjectCard from '../components/ProjectCard'
import { useToast } from '../components/Toast'
import { useAuth } from '../contexts/AuthContext'
import { useProjects } from '../hooks/useProjects'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler)

const STUDENT_NAV = [
  { key: 'overview',  label: 'Overview',    icon: 'dashboard' },
  { key: 'projects',  label: 'My Projects', icon: 'folder_open' },
  { key: 'upload',    label: 'Upload New',  icon: 'cloud_upload' },
  { key: 'analytics', label: 'Analytics',   icon: 'bar_chart' },
  { key: 'settings',  label: 'Settings',    icon: 'settings' },
]

const INSTRUCTOR_NAV = [
  { key: 'overview',  label: 'Overview',    icon: 'dashboard' },
  { key: 'students',  label: 'Students',    icon: 'group' },
  { key: 'projects',  label: 'All Projects',icon: 'folder_special' },
  { key: 'analytics', label: 'Analytics',   icon: 'bar_chart' },
  { key: 'settings',  label: 'Settings',    icon: 'settings' },
]

const SUBJECTS = ['Web Dev', 'Science', 'Art', 'Math', 'History', 'English', 'Other']

function StatCard({ label, value, icon, sub, accent }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-muted">{label}</span>
        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: accent || '#e8b84b' }}>{icon}</span>
      </div>
      <p className="font-mono text-3xl text-on-surface">{value}</p>
      {sub && <p className="font-mono text-[10px] text-on-surface-muted mt-1">{sub}</p>}
    </div>
  )
}

// ─── Shared chart config ───────────────────────────────────────────────────
const lineOptions = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: '#1a1a22' }, ticks: { color: '#8b8b99', font: { family: 'JetBrains Mono', size: 10 } } },
    y: { min: 0, grid: { color: '#1a1a22' }, ticks: { color: '#8b8b99', font: { family: 'JetBrains Mono', size: 10 }, precision: 0 } },
  },
}
const doughnutOptions = {
  responsive: true,
  cutout: '72%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: { color: '#8b8b99', font: { family: 'JetBrains Mono', size: 10 }, padding: 12 },
    },
  },
}

// ─── STUDENT VIEW ──────────────────────────────────────────────────────────
function StudentDashboard({ userName, navigate, showToast, onLogout }) {
  const { projects, uploading, uploadProgress, uploadAndDeploy, deleteProject } = useProjects()
  const [activeSection, setActiveSection] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const fileInputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [droppedFile, setDroppedFile] = useState(null)
  const [form, setForm] = useState({ title: '', subject: 'Web Dev', grade: '', description: '', visibility: 'public' })

  const initial = userName.charAt(0)

  function handleFile(files) {
    const file = files[0]
    if (!file) return
    if (!file.name.endsWith('.zip')) { showToast('Only .zip files are supported', 'error'); return }
    setDroppedFile(file)
    setActiveSection('upload')
    showToast(`${file.name} ready to upload`, 'success')
  }

  async function handleFormSubmit(e) {
    e.preventDefault()
    try {
      const { publicUrl } = await uploadAndDeploy({
        file: droppedFile,
        title: form.title,
        description: form.description,
      })
      showToast(`Deployed! ${publicUrl}`, 'success')
      setDroppedFile(null)
      setForm({ title: '', subject: 'Web Dev', grade: '', description: '', visibility: 'public' })
    } catch (err) {
      showToast(err?.message || 'Upload failed', 'error')
    }
  }

  // Derive chart data from real projects
  const subjectCounts = projects.reduce((acc, p) => {
    acc[p.subject || 'Other'] = (acc[p.subject || 'Other'] || 0) + 1
    return acc
  }, {})
  const lineData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{ data: [0, 0, 0, 0, 0, 0, 0], borderColor: '#e8b84b', backgroundColor: 'rgba(232,184,75,0.08)', tension: 0.4, fill: true, pointBackgroundColor: '#e8b84b', pointRadius: 3, pointHoverRadius: 5 }],
  }
  const doughnutData = {
    labels: Object.keys(subjectCounts),
    datasets: [{ data: Object.values(subjectCounts), backgroundColor: ['#60a5fa', '#4ade80', '#c084fc', '#f87171', '#fbbf24', '#f472b6'], borderWidth: 0 }],
  }

  const navLabel = STUDENT_NAV.find(n => n.key === activeSection)?.label

  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar
        navItems={STUDENT_NAV}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        userName={userName}
        initial={initial}
        role="Student"
        navigate={navigate}
        onLogout={onLogout}
      />

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-surface/60 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 overflow-y-auto px-6 py-8 min-w-0">
        <Topbar label={navLabel} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onUpload={() => setActiveSection('upload')} />

        {activeSection === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="My Projects"  value={projects.length} icon="folder_open" sub="Total uploaded" />
              <StatCard label="Total Views"  value={projects.reduce((s, p) => s + (p.viewCount ?? p.views ?? 0), 0).toLocaleString()} icon="visibility" sub="All time" />
              <StatCard label="Top Subject"  value={Object.entries(subjectCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] ?? '—'} icon="palette" sub="Most projects" />
              <StatCard label="Published"    value={projects.filter(p => p.status === 'published').length} icon="public" sub="Live on gallery" />
            </div>
            <SectionHeader label="Recent Projects" action="View all →" onAction={() => setActiveSection('projects')} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.slice(0, 3).map(p => (
                <ProjectCard key={p.projectId ?? p.id} project={p} showActions
                  onDelete={async () => { await deleteProject(p.projectId ?? p.id); showToast(`"${p.title}" deleted`, 'warning') }}
                />
              ))}
            </div>
          </div>
        )}

        {activeSection === 'projects' && (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
            {projects.map(p => (
              <ProjectCard key={p.projectId ?? p.id} project={p} showActions
                onEdit={() => showToast(`Editing '${p.title}' (coming soon)`, 'info')}
                onDelete={async () => { await deleteProject(p.projectId ?? p.id); showToast(`"${p.title}" deleted`, 'warning') }}
              />
            ))}
          </div>
        )}

        {activeSection === 'upload' && (
          <UploadSection
            droppedFile={droppedFile} setDroppedFile={setDroppedFile}
            dragOver={dragOver} setDragOver={setDragOver}
            fileInputRef={fileInputRef} handleFile={handleFile}
            form={form} setForm={setForm} onSubmit={handleFormSubmit}
            uploading={uploading} uploadProgress={uploadProgress}
          />
        )}

        {activeSection === 'analytics' && (
          <AnalyticsSection lineData={lineData} doughnutData={doughnutData} projects={projects} />
        )}

        {activeSection === 'settings' && (
          <SettingsSection userName={userName} showToast={showToast} isInstructor={false} />
        )}
      </main>
    </div>
  )
}

// ─── INSTRUCTOR VIEW ───────────────────────────────────────────────────────
function InstructorDashboard({ userName, navigate, showToast, onLogout }) {
  const { projects: rawProjects } = useProjects()
  const auth = useAuth()
  const [activeSection, setActiveSection] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [students, setStudents] = useState([])
  const [projectStatuses, setProjectStatuses] = useState({})
  const [showNewStudent, setShowNewStudent] = useState(false)
  const [newStudent, setNewStudent] = useState({ name: '', email: '', grade: '' })

  const projects = rawProjects.map(p => ({ ...p, status: projectStatuses[p.projectId ?? p.id] ?? 'approved' }))

  const initial = userName.charAt(0)
  const navLabel = INSTRUCTOR_NAV.find(n => n.key === activeSection)?.label

  const pendingCount = projects.filter(p => p.status === 'pending').length

  const subjectCounts = projects.reduce((acc, p) => {
    acc[p.subject || 'Other'] = (acc[p.subject || 'Other'] || 0) + 1
    return acc
  }, {})
  const lineData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{ data: [0, 0, 0, 0, 0, 0, 0], borderColor: '#60a5fa', backgroundColor: 'rgba(96,165,250,0.08)', tension: 0.4, fill: true, pointBackgroundColor: '#60a5fa', pointRadius: 3, pointHoverRadius: 5 }],
  }
  const doughnutData = {
    labels: Object.keys(subjectCounts),
    datasets: [{ data: Object.values(subjectCounts), backgroundColor: ['#60a5fa', '#4ade80', '#c084fc', '#f87171', '#fbbf24', '#f472b6'], borderWidth: 0 }],
  }

  function approveProject(id) {
    setProjectStatuses(prev => ({ ...prev, [id]: 'approved' }))
    showToast('Project approved and published', 'success')
  }
  function rejectProject(id) {
    setProjectStatuses(prev => ({ ...prev, [id]: 'rejected' }))
    showToast('Project rejected', 'warning')
  }
  function unpublishProject(id) {
    setProjectStatuses(prev => ({ ...prev, [id]: 'unpublished' }))
    showToast('Project unpublished', 'info')
  }

  async function createStudent(e) {
    e.preventDefault()
    try {
      await auth.createStudent({
        studentId: newStudent.email,
        displayName: newStudent.name,
        email: newStudent.email,
        tempPassword: Math.random().toString(36).slice(-8),
      })
      setStudents(prev => [...prev, { id: `stu-${Date.now()}`, ...newStudent, projects: 0, status: 'pending', joined: new Date().toISOString().slice(0, 10) }])
      setNewStudent({ name: '', email: '', grade: '' })
      setShowNewStudent(false)
      showToast(`Account created for ${newStudent.name}`, 'success')
    } catch (err) {
      showToast(err?.message || 'Failed to create student', 'error')
    }
  }

  const STATUS_PILL = {
    approved:   'text-emerald-400 border-emerald-800/40 bg-emerald-900/20',
    pending:    'text-amber-400  border-amber-800/40  bg-amber-900/20',
    rejected:   'text-red-400    border-red-800/40    bg-red-900/20',
    unpublished:'text-zinc-400   border-zinc-700/40   bg-zinc-800/20',
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar
        navItems={INSTRUCTOR_NAV}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        userName={userName}
        initial={initial}
        role="Instructor"
        navigate={navigate}
        badge={pendingCount > 0 ? { key: 'projects', count: pendingCount } : null}
        onLogout={onLogout}
      />

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-surface/60 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 overflow-y-auto px-6 py-8 min-w-0">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-on-surface-muted hover:text-on-surface" onClick={() => setSidebarOpen(true)}>
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h1 className="font-serif italic text-2xl text-on-surface">{navLabel}</h1>
          </div>
          {activeSection === 'students' && (
            <button
              onClick={() => setShowNewStudent(true)}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-surface font-mono text-xs uppercase tracking-widest hover:bg-accent-dim transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>person_add</span>
              New Student
            </button>
          )}
        </div>

        {/* ── INSTRUCTOR OVERVIEW ── */}
        {activeSection === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Students"       value={students.length}  icon="group"         sub="Enrolled" accent="#60a5fa" />
              <StatCard label="Total Projects" value={projects.length}  icon="folder_special" sub="Across all classes" />
              <StatCard label="Total Views"    value={projects.reduce((s, p) => s + Math.max(0, p.viewCount ?? p.views ?? 0), 0).toLocaleString()} icon="visibility"    sub="All time" />
              <StatCard label="Pending Review" value={pendingCount}     icon="pending_actions" sub="Need approval" accent={pendingCount > 0 ? '#f87171' : '#4ade80'} />
            </div>

            {/* Pending projects alert */}
            {pendingCount > 0 && (
              <div className="border border-amber-800/40 bg-amber-900/10 px-4 py-3 flex items-center gap-3">
                <span className="material-symbols-outlined text-amber-400" style={{ fontSize: '18px' }}>pending_actions</span>
                <p className="font-mono text-xs text-amber-400">
                  {pendingCount} project{pendingCount > 1 ? 's' : ''} waiting for your review
                </p>
                <button
                  onClick={() => setActiveSection('projects')}
                  className="ml-auto font-mono text-[10px] uppercase tracking-widest text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Review →
                </button>
              </div>
            )}

            <SectionHeader label="Recent Students" action="Manage →" onAction={() => setActiveSection('students')} />
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-xs">
                <thead>
                  <tr className="border-b border-outline text-on-surface-muted uppercase tracking-widest text-[10px]">
                    <th className="text-left py-2 pr-4">Student</th>
                    <th className="text-left py-2 pr-4">Grade</th>
                    <th className="text-left py-2 pr-4">Projects</th>
                    <th className="text-left py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.slice(0, 5).map(s => (
                    <tr key={s.id} className="border-b border-outline/50 hover:bg-surface-raised/50 transition-colors">
                      <td className="py-3 pr-4">
                        <div>
                          <p className="text-on-surface">{s.name}</p>
                          <p className="text-on-surface-muted text-[10px]">{s.email}</p>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-on-surface-muted">{s.grade}</td>
                      <td className="py-3 pr-4 text-on-surface">{s.projects}</td>
                      <td className="py-3">
                        <span className={`border px-2 py-0.5 text-[10px] uppercase tracking-widest ${s.status === 'active' ? 'text-emerald-400 border-emerald-800/40 bg-emerald-900/20' : 'text-amber-400 border-amber-800/40 bg-amber-900/20'}`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── STUDENTS ── */}
        {activeSection === 'students' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-xs">
                <thead>
                  <tr className="border-b border-outline text-on-surface-muted uppercase tracking-widest text-[10px]">
                    <th className="text-left py-2 pr-4">Student</th>
                    <th className="text-left py-2 pr-4">Grade</th>
                    <th className="text-left py-2 pr-4">Projects</th>
                    <th className="text-left py-2 pr-4">Joined</th>
                    <th className="text-left py-2 pr-4">Status</th>
                    <th className="text-left py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id} className="border-b border-outline/50 hover:bg-surface-raised/50 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-surface-variant border border-outline flex items-center justify-center flex-shrink-0">
                            <span className="font-serif italic text-xs text-accent">{s.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-on-surface">{s.name}</p>
                            <p className="text-on-surface-muted text-[10px]">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-on-surface-muted">{s.grade}</td>
                      <td className="py-3 pr-4 text-on-surface">{s.projects}</td>
                      <td className="py-3 pr-4 text-on-surface-muted">
                        {new Date(s.joined).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`border px-2 py-0.5 text-[10px] uppercase tracking-widest ${s.status === 'active' ? 'text-emerald-400 border-emerald-800/40 bg-emerald-900/20' : 'text-amber-400 border-amber-800/40 bg-amber-900/20'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => showToast(`Password reset sent to ${s.email}`, 'info')}
                            className="text-[10px] font-mono uppercase tracking-widest text-on-surface-muted hover:text-accent border border-outline hover:border-accent px-2 py-1 transition-colors"
                          >
                            Reset PW
                          </button>
                          <button
                            onClick={() => { setStudents(prev => prev.filter(x => x.id !== s.id)); showToast(`${s.name} removed`, 'warning') }}
                            className="text-[10px] font-mono uppercase tracking-widest text-on-surface-muted hover:text-red-400 border border-outline hover:border-red-800 px-2 py-1 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ALL PROJECTS (instructor) ── */}
        {activeSection === 'projects' && (
          <div className="space-y-3">
            {/* Filter tabs */}
            <div className="flex gap-2 mb-6">
              {['all', 'approved', 'pending', 'rejected', 'unpublished'].map(f => (
                <button
                  key={f}
                  className="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border border-outline text-on-surface-muted hover:border-silver hover:text-on-surface transition-colors"
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {projects.map(p => (
                <div key={p.id} className="card p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-surface-variant flex items-center justify-center flex-shrink-0">
                    <span className="font-serif italic text-xl text-on-surface-muted/30">{p.title.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm text-on-surface truncate">{p.title}</p>
                    <p className="font-mono text-[10px] text-on-surface-muted">{p.student} · {p.grade} · {p.subject}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="font-mono text-[10px] text-on-surface-muted hidden sm:block">
                      {p.views} views
                    </span>
                    <span className={`border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest hidden sm:block ${STATUS_PILL[p.status] || STATUS_PILL.approved}`}>
                      {p.status}
                    </span>
                    <div className="flex gap-1">
                      {p.status !== 'approved' && (
                        <button
                          onClick={() => approveProject(p.id)}
                          className="font-mono text-[10px] uppercase px-2 py-1.5 border border-emerald-800/50 text-emerald-400 hover:bg-emerald-900/20 transition-colors"
                          title="Approve"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>check</span>
                        </button>
                      )}
                      {p.status !== 'rejected' && (
                        <button
                          onClick={() => rejectProject(p.id)}
                          className="font-mono text-[10px] uppercase px-2 py-1.5 border border-red-800/50 text-red-400 hover:bg-red-900/20 transition-colors"
                          title="Reject"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>close</span>
                        </button>
                      )}
                      {p.status === 'approved' && (
                        <button
                          onClick={() => unpublishProject(p.id)}
                          className="font-mono text-[10px] uppercase px-2 py-1.5 border border-outline text-on-surface-muted hover:border-silver transition-colors"
                          title="Unpublish"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>visibility_off</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── INSTRUCTOR ANALYTICS ── */}
        {activeSection === 'analytics' && (
          <AnalyticsSection lineData={lineData} doughnutData={doughnutData} projects={projects} classWide />
        )}

        {activeSection === 'settings' && (
          <SettingsSection userName={userName} showToast={showToast} isInstructor />
        )}
      </main>

      {/* New Student Modal */}
      {showNewStudent && (
        <div className="fixed inset-0 z-50 bg-surface/80 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-surface-raised border border-outline p-8 w-full max-w-md space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-serif italic text-xl text-on-surface">Create Student Account</h2>
              <button onClick={() => setShowNewStudent(false)} className="text-on-surface-muted hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={createStudent} className="space-y-4">
              {[
                { label: 'Full Name', key: 'name', placeholder: 'e.g. Alex Thompson' },
                { label: 'School Email', key: 'email', placeholder: 'alex.t@school.edu', type: 'email' },
                { label: 'Grade Level', key: 'grade', placeholder: 'e.g. 9th Grade' },
              ].map(field => (
                <div key={field.key}>
                  <label className="font-mono text-[10px] uppercase tracking-widest text-on-surface-muted block mb-1.5">
                    {field.label}
                  </label>
                  <input
                    type={field.type || 'text'}
                    required
                    value={newStudent[field.key]}
                    onChange={e => setNewStudent(n => ({ ...n, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full bg-surface border border-outline px-3 py-2.5 font-mono text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              ))}
              <p className="font-mono text-[10px] text-on-surface-muted">
                A temporary password will be emailed to the student. They'll reset it on first login.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-accent text-surface font-mono text-xs uppercase tracking-widest hover:bg-accent-dim transition-colors"
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewStudent(false)}
                  className="px-6 py-2.5 border border-outline font-mono text-xs uppercase tracking-widest text-on-surface-muted hover:border-silver transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── SHARED SUB-COMPONENTS ─────────────────────────────────────────────────
function Sidebar({ navItems, activeSection, setActiveSection, sidebarOpen, setSidebarOpen, userName, initial, role, badge, onLogout }) {
  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-40 w-60 bg-surface-variant border-r border-outline flex flex-col pt-6 pb-4 transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      style={{ top: '64px' }}
    >
      <div className="px-5 pb-5 border-b border-outline">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-surface border border-accent/40 flex items-center justify-center flex-shrink-0">
            <span className="font-serif italic text-lg text-accent">{initial}</span>
          </div>
          <div>
            <p className="font-mono text-sm text-on-surface">{userName}</p>
            <p className="font-mono text-[10px] text-on-surface-muted uppercase tracking-wider">{role}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 pt-4 space-y-0.5">
        {navItems.map(item => (
          <button
            key={item.key}
            onClick={() => { setActiveSection(item.key); setSidebarOpen(false) }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 font-mono text-xs uppercase tracking-widest transition-all ${
              activeSection === item.key
                ? 'text-accent border-l-2 border-accent bg-accent/5 pl-[10px]'
                : 'text-on-surface-muted hover:text-on-surface hover:bg-surface/50 border-l-2 border-transparent'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{item.icon}</span>
            <span className="flex-1 text-left">{item.label}</span>
            {badge?.key === item.key && (
              <span className="bg-red-500 text-white font-mono text-[9px] px-1.5 py-0.5 rounded-full">
                {badge.count}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="px-3 pt-4 border-t border-outline">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 font-mono text-xs uppercase tracking-widest text-on-surface-muted hover:text-red-400 transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
          Sign Out
        </button>
      </div>
    </aside>
  )
}

function Topbar({ label, sidebarOpen, setSidebarOpen, onUpload }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <button className="lg:hidden text-on-surface-muted hover:text-on-surface" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h1 className="font-serif italic text-2xl text-on-surface">{label}</h1>
      </div>
      <button
        onClick={onUpload}
        className="flex items-center gap-2 px-4 py-2 bg-accent text-surface font-mono text-xs uppercase tracking-widest hover:bg-accent-dim transition-colors"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
        Upload
      </button>
    </div>
  )
}

function SectionHeader({ label, action, onAction }) {
  return (
    <div className="flex items-center justify-between">
      <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-muted">{label}</p>
      {action && (
        <button onClick={onAction} className="font-mono text-[10px] uppercase tracking-widest text-accent hover:text-accent-dim transition-colors">
          {action}
        </button>
      )}
    </div>
  )
}

function UploadSection({ droppedFile, setDroppedFile, dragOver, setDragOver, fileInputRef, handleFile, form, setForm, onSubmit, uploading, uploadProgress }) {
  return (
    <div className="max-w-xl space-y-6">
      {!droppedFile ? (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files) }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed p-16 text-center cursor-pointer transition-all ${dragOver ? 'border-accent bg-accent/5' : 'border-outline hover:border-silver/50'}`}
        >
          <span className="material-symbols-outlined text-on-surface-muted mb-3 block" style={{ fontSize: '40px' }}>cloud_upload</span>
          <p className="font-mono text-xs uppercase tracking-widest text-on-surface-muted mb-1">Drop your ZIP file here</p>
          <p className="font-mono text-[10px] text-on-surface-muted/50">or click to browse (.zip only)</p>
          <input ref={fileInputRef} type="file" accept=".zip" className="hidden" onChange={e => handleFile(e.target.files)} />
        </div>
      ) : (
        <div className="card p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-accent" style={{ fontSize: '20px' }}>folder_zip</span>
          <div className="flex-1 min-w-0">
            <p className="font-mono text-sm text-on-surface truncate">{droppedFile.name}</p>
            <p className="font-mono text-[10px] text-on-surface-muted">{(droppedFile.size / 1024).toFixed(1)} KB</p>
          </div>
          <button onClick={() => setDroppedFile(null)} className="text-on-surface-muted hover:text-red-400 transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
          </button>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-muted border-b border-outline pb-2">Project Details</p>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-on-surface-muted block mb-1.5">Title *</label>
          <input type="text" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="My Awesome Project"
            className="w-full bg-surface-raised border border-outline px-3 py-2.5 font-mono text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:outline-none focus:border-accent transition-colors" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-on-surface-muted block mb-1.5">Subject</label>
            <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              className="w-full bg-surface-raised border border-outline px-3 py-2.5 font-mono text-sm text-on-surface focus:outline-none focus:border-accent transition-colors">
              {SUBJECTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-on-surface-muted block mb-1.5">Grade Level</label>
            <input type="text" value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))} placeholder="e.g. 9th Grade"
              className="w-full bg-surface-raised border border-outline px-3 py-2.5 font-mono text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:outline-none focus:border-accent transition-colors" />
          </div>
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-on-surface-muted block mb-1.5">Description</label>
          <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What is this project about?"
            className="w-full bg-surface-raised border border-outline px-3 py-2.5 font-mono text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:outline-none focus:border-accent transition-colors resize-none" />
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-on-surface-muted block mb-2">Visibility</label>
          <div className="flex gap-3">
            {[{ value: 'public', label: 'Public', icon: 'public' }, { value: 'class', label: 'Class Only', icon: 'group' }, { value: 'private', label: 'Private', icon: 'lock' }].map(opt => (
              <button key={opt.value} type="button" onClick={() => setForm(f => ({ ...f, visibility: opt.value }))}
                className={`flex items-center gap-1.5 px-3 py-2 border font-mono text-[10px] uppercase tracking-widest transition-colors ${form.visibility === opt.value ? 'border-accent text-accent bg-accent/5' : 'border-outline text-on-surface-muted hover:border-silver'}`}>
                <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <button type="submit" disabled={uploading || !droppedFile}
          className="w-full py-3 bg-accent text-surface font-mono text-xs uppercase tracking-widest hover:bg-accent-dim transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>rocket_launch</span>
          {uploading ? `Uploading... ${uploadProgress}%` : 'Deploy Project'}
        </button>
      </form>
    </div>
  )
}

function AnalyticsSection({ lineData, doughnutData, projects = [], classWide }) {
  const sorted = [...projects].sort((a, b) => (b.viewCount ?? b.views ?? 0) - (a.viewCount ?? a.views ?? 0)).slice(0, 4)
  const maxViews = sorted[0]?.viewCount ?? sorted[0]?.views ?? 1
  return (
    <div className="space-y-8 max-w-3xl">
      <div className="card p-6">
        <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-muted mb-4">
          {classWide ? 'Class-wide Weekly Views' : 'Your Weekly Views'}
        </p>
        <Line data={lineData} options={lineOptions} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="card p-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-muted mb-4">Projects by Subject</p>
          {doughnutData.labels.length > 0
            ? <Doughnut data={doughnutData} options={doughnutOptions} />
            : <p className="font-mono text-xs text-on-surface-muted">No data yet</p>
          }
        </div>
        <div className="card p-6 space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-muted mb-4">Top Projects</p>
          {sorted.length === 0 && <p className="font-mono text-xs text-on-surface-muted">No projects yet</p>}
          {sorted.map((p, i) => {
            const views = p.viewCount ?? p.views ?? 0
            return (
              <div key={p.projectId ?? p.id} className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-on-surface-muted w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs text-on-surface truncate">{p.title}</p>
                  <div className="h-0.5 bg-accent/30 mt-1" style={{ width: `${(views / maxViews) * 100}%` }} />
                </div>
                <span className="font-mono text-xs text-accent">{views}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function SettingsSection({ userName, showToast, isInstructor }) {
  const auth = useAuth()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  async function handlePasswordReset(e) {
    e.preventDefault()
    if (newPassword !== confirmPassword) { showToast('Passwords do not match', 'error'); return }
    try {
      await auth.resetPassword({ newPassword })
      showToast('Password updated', 'success')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      showToast(err?.message || 'Failed to update password', 'error')
    }
  }

  return (
    <div className="max-w-md space-y-6">
      <div className="card p-6 space-y-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-muted border-b border-outline pb-2">Profile</p>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-on-surface-muted block mb-1.5">Display Name</label>
          <input defaultValue={userName} className="w-full bg-surface border border-outline px-3 py-2.5 font-mono text-sm text-on-surface focus:outline-none focus:border-accent transition-colors" />
        </div>
        {isInstructor && (
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-on-surface-muted block mb-1.5">Default Subject</label>
            <select className="w-full bg-surface border border-outline px-3 py-2.5 font-mono text-sm text-on-surface focus:outline-none focus:border-accent transition-colors">
              {SUBJECTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        )}
        <button onClick={() => showToast('Settings saved', 'success')} className="px-6 py-2 bg-accent text-surface font-mono text-xs uppercase tracking-widest hover:bg-accent-dim transition-colors">
          Save Changes
        </button>
      </div>
      <div className="card p-6 space-y-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-muted border-b border-outline pb-2">Change Password</p>
        <form onSubmit={handlePasswordReset} className="space-y-3">
          <input type="password" required placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
            className="w-full bg-surface border border-outline px-3 py-2.5 font-mono text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:outline-none focus:border-accent transition-colors" />
          <input type="password" required placeholder="Confirm new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
            className="w-full bg-surface border border-outline px-3 py-2.5 font-mono text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:outline-none focus:border-accent transition-colors" />
          <button type="submit" disabled={auth.loading}
            className="px-6 py-2 bg-accent text-surface font-mono text-xs uppercase tracking-widest hover:bg-accent-dim transition-colors disabled:opacity-60">
            {auth.loading ? 'Saving...' : 'Update Password'}
          </button>
        </form>
      </div>
      {!isInstructor && (
        <div className="card p-6 space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-muted border-b border-outline pb-2">Danger Zone</p>
          <button onClick={() => showToast('Account deletion request sent to instructor', 'warning')} className="w-full py-2.5 border border-red-900/50 font-mono text-xs uppercase tracking-widest text-red-400 hover:bg-red-900/10 transition-colors">
            Request Account Deletion
          </button>
        </div>
      )}
    </div>
  )
}

// ─── ROOT ──────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()
  const showToast = useToast()
  const auth = useAuth()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (!auth.loading && !auth.user) navigate('/login?redirect=/dashboard')
  }, [auth.loading, auth.user, navigate])

  const userName = auth.user?.displayName || localStorage.getItem('cf_user') || 'Student'
  const isInstructor = auth.user?.role === 'instructor'

  function handleLogout() {
    auth.logout()
    navigate('/login')
  }

  if (auth.loading) {
    return (
      <>
        <BlobCanvas />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <p className="font-mono text-xs text-on-surface-muted uppercase tracking-widest animate-pulse">Loading...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <BlobCanvas />
      <div className="relative z-10 min-h-screen flex flex-col">
        <Header />
        {auth.mustResetPassword || searchParams.get('forceReset') === 'true' ? (
          <ForceResetModal auth={auth} onDone={() => navigate('/dashboard')} showToast={showToast} />
        ) : isInstructor
          ? <InstructorDashboard userName={userName} navigate={navigate} showToast={showToast} onLogout={handleLogout} />
          : <StudentDashboard    userName={userName} navigate={navigate} showToast={showToast} onLogout={handleLogout} />
        }
      </div>
    </>
  )
}

function ForceResetModal({ auth, onDone, showToast }) {
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  async function handleSubmit(e) {
    e.preventDefault()
    if (newPassword !== confirm) { showToast('Passwords do not match', 'error'); return }
    try {
      await auth.resetPassword({ newPassword })
      showToast('Password updated!', 'success')
      onDone()
    } catch (err) {
      showToast(err?.message || 'Failed to reset password', 'error')
    }
  }
  return (
    <div className="fixed inset-0 z-50 bg-surface/80 flex items-center justify-center px-4">
      <div className="bg-surface-raised border border-outline p-8 w-full max-w-sm space-y-6">
        <div>
          <p className="font-serif italic text-2xl text-on-surface mb-1">Set a new password</p>
          <p className="font-mono text-xs text-on-surface-muted">You must change your temporary password before continuing.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="password" required placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
            className="w-full bg-surface border border-outline px-3 py-2.5 font-mono text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:outline-none focus:border-accent" />
          <input type="password" required placeholder="Confirm password" value={confirm} onChange={e => setConfirm(e.target.value)}
            className="w-full bg-surface border border-outline px-3 py-2.5 font-mono text-sm text-on-surface placeholder:text-on-surface-muted/50 focus:outline-none focus:border-accent" />
          <button type="submit" disabled={auth.loading}
            className="w-full py-3 bg-accent text-surface font-mono text-xs uppercase tracking-widest hover:bg-accent-dim transition-colors disabled:opacity-60">
            {auth.loading ? 'Saving...' : 'Set Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
