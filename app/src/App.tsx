import { useEffect } from 'react'
import { useCRM } from './store'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { Modal } from './components/Modal'
import { Toast } from './components/Toast'
import { Dashboard } from './pages/Dashboard'
import { Patients } from './pages/Patients'
import { Remarketing } from './pages/Remarketing'
import { Kanban } from './pages/Kanban'
import { Funnel } from './pages/Funnel'
import { Birthdays } from './pages/Birthdays'

function EmptyState() {
  const { importCSV } = useCRM()
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) await importCSV(file)
    e.target.value = ''
  }
  return (
    <div className="empty">
      <div className="empty-ico" style={{ color: 'var(--txt3)' }}>
        <svg width="44" height="44" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--txt)', marginBottom: 8, fontFamily: "'Helvetica','Arial',sans-serif" }}>Nenhum dado carregado</div>
      <p style={{ color: 'var(--txt2)', marginBottom: 22, maxWidth: 300, marginLeft: 'auto', marginRight: 'auto' }}>Importe a planilha de agendamentos CSV para começar</p>
      <label className="btn btn-p" style={{ cursor: 'pointer', display: 'inline-flex' }}>
        <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16h6v-6h4l-7-7-7 7h4z" /></svg>
        Importar Planilha CSV
        <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFile} />
      </label>
    </div>
  )
}

function PageContent() {
  const { page, patients } = useCRM()
  if (!patients.length) return <div className="content"><EmptyState /></div>
  switch (page) {
    case 'dashboard':   return <Dashboard />
    case 'patients':    return <Patients />
    case 'remarketing': return <Remarketing />
    case 'kanban':      return <Kanban />
    case 'funnel':      return <Funnel />
    case 'bdays':       return <Birthdays />
    default:            return <div className="content"><EmptyState /></div>
  }
}

export default function App() {
  const init = useCRM(s => s.init)
  const modalContent = useCRM(s => s.modalContent)

  useEffect(() => {
    init()
  }, [init])

  // lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = modalContent ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [modalContent])

  return (
    <>
      <Sidebar />
      <div className="main">
        <Topbar />
        <PageContent />
      </div>
      <Modal />
      <Toast />
    </>
  )
}
