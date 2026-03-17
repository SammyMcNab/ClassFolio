export default function Footer() {
  return (
    <footer className="border-t border-outline mt-24 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-serif italic text-lg">
          <span className="text-accent">Class</span>
          <span className="text-on-surface">Folio</span>
        </span>
        <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-muted">
          © 2026 ClassFolio — Student Project Gallery
        </p>
        <div className="flex gap-2 items-center">
          <div className="w-1.5 h-1.5 bg-accent rounded-full" />
          <div className="w-1.5 h-1.5 bg-accent/40 rounded-full" />
          <div className="w-1.5 h-1.5 bg-accent/15 rounded-full" />
        </div>
      </div>
    </footer>
  )
}
