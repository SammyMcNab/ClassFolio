import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

const STYLES = {
  info:    'border-silver/40 text-on-surface',
  success: 'border-emerald-500/40 text-emerald-300',
  error:   'border-red-500/40 text-red-300',
  warning: 'border-amber-500/40 text-amber-300',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }, [])

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`bg-surface-raised border font-mono text-xs px-4 py-3 max-w-xs animate-in ${STYLES[toast.type]}`}
            style={{ animation: 'slideIn 0.2s ease-out' }}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
