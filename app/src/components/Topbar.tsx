import { useState } from 'react'
import { useCRM } from '../store'
import { META } from '../lib/constants'
import type { Period } from '../lib/types'

const PERIODS: { val: Period; lbl: string }[] = [
  { val: 'all', lbl: 'Todo o período' },
  { val: '30', lbl: 'Últimos 30 dias' },
  { val: '90', lbl: 'Últimos 90 dias' },
  { val: '180', lbl: 'Últimos 180 dias' },
  { val: 'year', lbl: 'Este ano' },
]

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { page, q, period, setQ, setPeriod } = useCRM()
  const [open, setOpen] = useState(false)
  const meta = META[page] || {}
  const curLbl = PERIODS.find(p => p.val === period)?.lbl || 'Todo o período'

  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="menu-btn" onClick={onMenuClick} aria-label="Menu">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div>
          <div className="pg-title">{meta.title || page}</div>
          <div className="pg-sub">{meta.sub || ''}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="c-sel" style={{ position: 'relative', userSelect: 'none', fontSize: 13.2, width: 155 }}>
          <div className={`c-sel-trig ${open ? 'open' : ''}`} onClick={() => setOpen(o => !o)}>
            <span>{curLbl}</span>
          </div>
          {open && (
            <div className="c-sel-opts" style={{ display: 'block' }}>
              {PERIODS.map(p => (
                <div key={p.val} className={`c-sel-opt ${period === p.val ? 'active' : ''}`}
                  onClick={() => { setPeriod(p.val); setOpen(false) }}>
                  {p.lbl}
                </div>
              ))}
            </div>
          )}
        </div>
        <input
          className="search"
          style={{ width: 210 }}
          placeholder="Buscar paciente..."
          value={q}
          onChange={e => setQ(e.target.value)}
        />
      </div>
    </div>
  )
}
