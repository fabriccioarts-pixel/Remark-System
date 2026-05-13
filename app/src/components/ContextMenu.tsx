import { useEffect, useRef } from 'react'
import { useCRM, patientRmkCat } from '../store'
import { ICO, TMPLS, WA_SVG } from '../lib/constants'
import { waUrl } from '../lib/utils'

interface Props {
  patientId: string | null
  x: number
  y: number
  onClose: () => void
}

export function ContextMenu({ patientId, x, y, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const { patients, kanban, rmkSent, waConfig, stages, markSent, toggleSent, setKanban, showToast, openModal, sendViaAPI } = useCRM()

  useEffect(() => {
    const handler = () => onClose()
    const kh = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('click', handler)
    document.addEventListener('keydown', kh)
    return () => { document.removeEventListener('click', handler); document.removeEventListener('keydown', kh) }
  }, [onClose])

  if (!patientId) return null
  const p = patients.find(x => x.id === patientId)
  if (!p) return null

  const cat = patientRmkCat(p)
  const tmpl = TMPLS[cat]
  const msg = tmpl ? tmpl.msg(p.nome) : ''
  const wu = p.tel ? waUrl(p.tel, msg) : ''
  const sent = rmkSent[patientId] || false
  const curStage = kanban[patientId] || stages[0]?.id || 'entrar'

  // clamp position
  const menuW = 220, menuH = 320
  const cx = Math.max(10, Math.min(x, window.innerWidth - menuW - 10))
  const cy = Math.max(10, Math.min(y, window.innerHeight - menuH - 10))

  const handleMoveStage = (stageId: string) => {
    setKanban(patientId, stageId)
    const lbl = stages.find(s => s.id === stageId)?.label || stageId
    showToast('✅ Movido para ' + lbl)
    onClose()
  }

  return (
    <div
      ref={ref}
      className="ctx-menu"
      style={{ display: 'block', left: cx, top: cy }}
      onClick={e => e.stopPropagation()}
    >
      <div style={{ padding: '6px 12px 5px', fontSize: 11, color: 'var(--txt3)', fontWeight: 600, letterSpacing: '.5px' }}>
        {p.nome.split(' ')[0].toUpperCase()}
      </div>
      <div className="ctx-sep" />
      <div className="ctx-item" onClick={() => { import('./PatientModal').then(m => { openModal(<m.PatientModal patient={p} />); onClose() }) }}>
        <span dangerouslySetInnerHTML={{ __html: ICO.users }} /> Ver detalhes
      </div>
      {wu && (
        <a href={wu} target="natuclinic_wa" className="ctx-item" style={{ textDecoration: 'none' }}
          onClick={() => { markSent(patientId); onClose() }}>
          <span dangerouslySetInnerHTML={{ __html: WA_SVG }} /> Enviar WhatsApp
        </a>
      )}
      {p.tel && waConfig.enabled && (
        <div className="ctx-item" onClick={() => { sendViaAPI(patientId); onClose() }}>
          <span style={{ color: '#25D366', display: 'flex' }} dangerouslySetInnerHTML={{ __html: WA_SVG }} /> Enviar via API
        </div>
      )}
      {msg && (
        <div className="ctx-item" onClick={() => {
          navigator.clipboard?.writeText(msg).then(() => showToast('✅ Mensagem copiada!')).catch(() => {})
          onClose()
        }}>
          <span dangerouslySetInnerHTML={{ __html: ICO.clip }} /> Copiar mensagem
        </div>
      )}
      <div className="ctx-sep" />
      <div style={{ padding: '4px 12px', fontSize: 10, color: 'var(--txt3)', fontWeight: 600, letterSpacing: '.5px' }}>MOVER PARA</div>
      {stages.filter(s => s.id !== curStage).map(s => (
        <div key={s.id} className="ctx-item" onClick={() => handleMoveStage(s.id)}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.dot, flexShrink: 0, display: 'inline-block' }} />
          {s.label}
        </div>
      ))}
      <div className="ctx-sep" />
      <div className="ctx-item" onClick={() => { toggleSent(patientId, !sent); onClose() }}>
        <span dangerouslySetInnerHTML={{ __html: ICO.check }} /> {sent ? 'Desmarcar enviado' : 'Marcar como enviado'}
      </div>
      <div className="ctx-item danger" onClick={() => {
        import('./ConfirmDeleteModal').then(m => { openModal(<m.ConfirmDeleteModal id={patientId} nome={p.nome} />); onClose() })
      }}>
        <span dangerouslySetInnerHTML={{ __html: ICO.x }} /> Excluir lead
      </div>
    </div>
  )
}
