import { useEffect, useRef, useState } from 'react'
import { useCRM, filt } from '../../store'
import { ICO, TMPLS, WA_SVG } from '../../lib/constants'
import { waUrl, fmtDate } from '../../lib/utils'
import { rmkCat } from '../../lib/csv'
import { PatientModal } from '../../components/PatientModal'
import { StageConfigModal } from './StageConfigModal'
import type { Patient } from '../../lib/types'

function isBdayMonth(id: string, birthdates: Record<string, string>) {
  const b = birthdates[id]; if (!b) return false
  return parseInt(b.split('/')[1]) === new Date().getMonth() + 1
}
function isBdayToday(id: string, birthdates: Record<string, string>) {
  const b = birthdates[id]; if (!b) return false
  const now = new Date()
  const [d, m] = b.split('/').map(Number)
  return d === now.getDate() && m === now.getMonth() + 1
}

function playPop() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator(), gain = ctx.createGain()
    const t = ctx.currentTime
    osc.frequency.setValueAtTime(600, t); osc.frequency.exponentialRampToValueAtTime(300, t + .1)
    gain.gain.setValueAtTime(.2, t); gain.gain.exponentialRampToValueAtTime(.01, t + .1)
    osc.connect(gain); gain.connect(ctx.destination)
    osc.start(t); osc.stop(t + .1)
  } catch { }
}

export function Kanban() {
  const { patients, q, period, kanban, stages, birthdates, kbBdayOnly, setKbBdayOnly, setKanban, openModal, showToast, markSent } = useCRM()
  const [dragId, setDragId] = useState<string | null>(null)
  const [overStage, setOverStage] = useState<string | null>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const topBarRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  let pts = filt(patients, q, period)
  if (kbBdayOnly) pts = pts.filter(p => isBdayMonth(p.id, birthdates))

  const grp: Record<string, Patient[]> = {}
  stages.forEach(s => { grp[s.id] = [] })
  const firstId = stages[0]?.id
  pts.forEach(p => {
    const st = kanban[p.id] || firstId
    if (grp[st]) grp[st].push(p)
    else if (firstId && grp[firstId]) grp[firstId].push(p)
  })

  useEffect(() => {
    const bar = topBarRef.current, board = boardRef.current, inner = innerRef.current
    if (!bar || !board || !inner) return
    inner.style.width = board.scrollWidth + 'px'
    let syncing = false
    const onBar = () => { if (!syncing) { syncing = true; board.scrollLeft = bar.scrollLeft; syncing = false } }
    const onBoard = () => { if (!syncing) { syncing = true; bar.scrollLeft = board.scrollLeft; syncing = false } }
    bar.addEventListener('scroll', onBar)
    board.addEventListener('scroll', onBoard)
    return () => { bar.removeEventListener('scroll', onBar); board.removeEventListener('scroll', onBoard) }
  })

  const handleDrop = (stageId: string) => {
    if (!dragId) return
    const prev = kanban[dragId] || firstId
    if (prev !== stageId) playPop()
    setKanban(dragId, stageId)
    setDragId(null); setOverStage(null)
    showToast(`✅ Movido para ${stages.find(s => s.id === stageId)?.label}`)
  }

  const KbCard = ({ p }: { p: Patient }) => {
    const cat = rmkCat(p.last?.tipo || '', p.last?.status || '')
    const tmpl = TMPLS[cat]
    const msg = tmpl ? tmpl.msg(p.nome) : ''
    const wu = p.tel ? waUrl(p.tel, msg) : '#'
    const bdayToday = isBdayToday(p.id, birthdates)
    const bdayMon = isBdayMonth(p.id, birthdates)
    return (
      <div className={`kb-card ${dragId === p.id ? 'drag' : ''}`}
        draggable
        onDragStart={e => { setDragId(p.id); e.dataTransfer.setData('text/plain', p.id) }}
        onDragEnd={() => { setDragId(null); setOverStage(null) }}
        onContextMenu={e => { e.preventDefault() }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--txt)', flex: 1 }}>{p.nome.split(' ').slice(0, 3).join(' ')}</div>
          {bdayToday ? <span title="Aniversário HOJE!">🎂</span> : bdayMon ? <span style={{ fontSize: 11, opacity: .6 }}>🎂</span> : null}
        </div>
        <div style={{ fontSize: 11, color: 'var(--txt2)', marginBottom: 6 }}>{(p.last?.tipo || '–').substring(0, 40)}</div>
        <div style={{ fontSize: 10.5, color: 'var(--txt3)' }}>{fmtDate(p.last?.data)}</div>
        {p.tel && (
          <div style={{ marginTop: 7, paddingTop: 7, borderTop: '1px solid var(--bord)', display: 'flex', gap: 5 }}>
            <a href={wu} target="natuclinic_wa" className="btn btn-wa" style={{ flex: 1, justifyContent: 'center', padding: 4, fontSize: 10.5 }}
              onClick={() => markSent(p.id)}
              dangerouslySetInnerHTML={{ __html: WA_SVG + ' WA' }} />
            <button onClick={() => openModal(<PatientModal patient={p} />)}
              style={{ flex: 1, fontSize: 10.5, padding: 4, background: 'var(--surf2)', border: '1px solid var(--bord)', borderRadius: 5, cursor: 'pointer', color: 'var(--txt2)' }}>Ver</button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="content">
      <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <button className={`btn ${kbBdayOnly ? 'btn-p' : 'btn-s'}`} style={{ padding: '6px 12px', fontSize: 12, height: 32 }}
          onClick={() => setKbBdayOnly(!kbBdayOnly)}>
          🎂 {kbBdayOnly ? 'Mostrando Aniversariantes' : 'Aniversariantes do Mês'}
        </button>
        <button className="btn btn-s" style={{ padding: '6px 12px', fontSize: 12, height: 32, marginLeft: 'auto' }}
          onClick={() => openModal(<StageConfigModal />)}>
          <span dangerouslySetInnerHTML={{ __html: ICO.clip }} /> Configurar Etapas
        </button>
        <div style={{ width: 1, height: 20, background: 'var(--bord)', margin: '0 5px' }} />
        {stages.map(s => (
          <div key={s.id} style={{ background: 'var(--surf2)', borderRadius: 6, padding: '5px 11px', fontSize: 12.5, border: '1px solid var(--bord)', display: 'flex', alignItems: 'center', gap: 6, height: 32, boxSizing: 'border-box' }}>
            <span style={{ color: s.dot, display: 'flex' }} dangerouslySetInnerHTML={{ __html: ICO[s.ico] || '' }} />
            <b style={{ color: 'var(--txt)' }}>{(grp[s.id] || []).length}</b>
            <span style={{ color: 'var(--txt2)' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Top scrollbar */}
      <div className="kb-scroll-top" ref={topBarRef}>
        <div ref={innerRef} style={{ height: 1 }} />
      </div>

      {/* Board */}
      <div className="kb-board" ref={boardRef}>
        {stages.map(st => (
          <div key={st.id} className={`kb-col ${overStage === st.id ? 'dov' : ''}`}
            style={st.id === 'nao' ? { opacity: .7, borderColor: 'rgba(180,60,60,.35)', background: 'rgba(60,15,15,.5)' } : undefined}
            onDragOver={e => { e.preventDefault(); setOverStage(st.id) }}
            onDrop={() => handleDrop(st.id)}
            onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOverStage(null) }}>
            <div className="kb-hd">
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: st.dot }}>
                <span dangerouslySetInnerHTML={{ __html: ICO[st.ico] || '' }} />
                <span style={{ color: 'var(--txt2)' }}>{st.label}</span>
              </span>
              <span className="kb-cnt">{(grp[st.id] || []).length}</span>
            </div>
            {(grp[st.id] || []).slice(0, 25).map(p => <KbCard key={p.id} p={p} />)}
            {(grp[st.id] || []).length > 25 && (
              <div style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--txt2)', padding: 6 }}>+{(grp[st.id] || []).length - 25} mais</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
