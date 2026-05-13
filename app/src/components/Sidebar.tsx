import { useCRM, thisMonthBdays, dueFollowups } from '../store'
import { daysSince } from '../lib/utils'
import type { PageId } from '../lib/types'

const NAV_ITEMS: { id: PageId; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h8v8H3zm0 10h8v8H3zm10-10h8v8h-8zm0 10h8v8h-8z"/></svg>' },
  { id: 'patients', label: 'Pacientes', icon: '<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>' },
]
const COMMERCIAL_ITEMS: { id: PageId; label: string; icon: string }[] = [
  { id: 'remarketing', label: 'Remarketing WA', icon: '<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>' },
  { id: 'reativar',    label: 'Reativar',        icon: '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>' },
  { id: 'kanban',      label: 'Kanban',          icon: '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="12" rx="1"/><rect x="17" y="3" width="5" height="15" rx="1"/></svg>' },
  { id: 'funnel',      label: 'Funil de Vendas', icon: '<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/></svg>' },
  { id: 'bdays',       label: 'Aniversários',    icon: '<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M8 6v2H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-8a3 3 0 0 0-3-3h-2V6a4 4 0 0 0-8 0zm6 0v2h-4V6a2 2 0 0 1 4 0zM5 11h14v8H5v-8z"/><circle cx="8" cy="3" r="1.2"/><circle cx="12" cy="2" r="1.2"/><circle cx="16" cy="3" r="1.2"/></svg>' },
]

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { page, setPage, patients, birthdates, followups, importCSV } = useCRM()
  const bdayCnt = thisMonthBdays(patients, birthdates).length
  const followupCnt = dueFollowups(patients, followups).length
  const reativarCnt = patients.filter(p => { const d = daysSince(p.last?.data || ''); return d >= 90 && d <= 180 }).length

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) await importCSV(file)
    e.target.value = ''
  }

  const nav = (id: Parameters<typeof setPage>[0]) => { setPage(id); onClose() }

  return (
    <nav className={`sidebar${isOpen ? ' open' : ''}`}>
      <div className="logo">
        Re<span>mark</span><sup>®</sup>
        <small>CRM · Gestão de Pacientes</small>
      </div>

      <div className="nav-sec">Principal</div>
      {NAV_ITEMS.map(item => (
        <div key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => nav(item.id)}>
          <span dangerouslySetInnerHTML={{ __html: item.icon }} />
          {item.label}
          {item.id === 'patients' && patients.length > 0 && (
            <span className="nav-badge">{patients.length}</span>
          )}
        </div>
      ))}

      <div className="nav-sec">Comercial</div>
      {COMMERCIAL_ITEMS.map(item => (
        <div key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => nav(item.id)}>
          <span dangerouslySetInnerHTML={{ __html: item.icon }} />
          {item.label}
          {item.id === 'bdays' && bdayCnt > 0 && (
            <span className="nav-badge">{bdayCnt}</span>
          )}
          {item.id === 'remarketing' && followupCnt > 0 && (
            <span className="nav-badge" style={{ background: '#F87171', color: '#fff' }}>{followupCnt}</span>
          )}
          {item.id === 'reativar' && reativarCnt > 0 && (
            <span className="nav-badge" style={{ background: '#A78BFA', color: '#fff' }}>{reativarCnt}</span>
          )}
        </div>
      ))}

      <div style={{ marginTop: 'auto', padding: '12px', borderTop: '1px solid var(--bord)' }}>
        <label className="btn btn-p" style={{ width: '100%', justifyContent: 'center', cursor: 'pointer', fontSize: 12, padding: '9px 14px' }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
          </svg>
          Importar Planilha
          <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFileChange} />
        </label>
      </div>
    </nav>
  )
}
