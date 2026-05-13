import { useState, useRef } from 'react'
import { useCRM } from '../store'
import { ICO, TMPLS, WA_SVG } from '../lib/constants'
import { waUrl, getInitials, badgeClass } from '../lib/utils'
import { rmkCat } from '../lib/csv'
import type { Patient } from '../lib/types'
import { ConfirmDeleteModal } from './ConfirmDeleteModal'

function fmtMsg(t: string) {
  return t.replace(/\*(.*?)\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>').replace(/\n/g, '<br>')
}

const QUICK_DAYS = [3, 7, 15, 30]

function addDays(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

function fmtFollowupDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export function PatientModal({ patient: p }: { patient: Patient }) {
  const { kanban, stages, birthdates, notes, followups, saveBday, addNote, deleteNote, setKanban, setFollowup, clearFollowup, showToast, openModal, closeModal } = useCRM()
  const [noteText, setNoteText] = useState('')
  const followupNoteRef = useRef<HTMLInputElement>(null)

  const curFollowup = followups[p.id] || null
  const today = new Date().toISOString().slice(0, 10)
  const isOverdue = curFollowup && curFollowup.date < today
  const isDueToday = curFollowup && curFollowup.date === today

  const cat = rmkCat(p.last?.tipo || '', p.last?.status || '')
  const tmpl = TMPLS[cat]
  const msg = tmpl ? tmpl.msg(p.nome) : ''
  const wu = p.tel ? waUrl(p.tel, msg) : '#'
  const curStage = kanban[p.id] || 'entrar'
  const curStageLbl = stages.find(s => s.id === curStage)?.label || curStage

  const patNotes = (notes[p.id] || [])

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20, position: 'relative' }}>
        <div style={{ width: 54, height: 54, background: 'var(--gold3)', border: '1.5px solid var(--gold)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: 'var(--gold)', flexShrink: 0 }}>
          {getInitials(p.nome)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="modal-title" style={{ marginBottom: 3 }}>{p.nome}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11.5, color: 'var(--txt3)' }}>ID {p.id}</span>
            <span style={{ fontSize: 11.5, color: 'var(--txt2)' }}>{p.total} atendimento{p.total !== 1 ? 's' : ''}</span>
            <span style={{ fontSize: 11, background: 'var(--surf3)', border: '1px solid var(--bord2)', borderRadius: 20, padding: '2px 9px', color: 'var(--txt2)' }}>{curStageLbl}</span>
          </div>
        </div>
        <button onClick={closeModal} style={{ position: 'absolute', top: 0, right: 0, width: 28, height: 28, background: 'var(--surf3)', border: '1px solid var(--bord)', borderRadius: 7, cursor: 'pointer', color: 'var(--txt3)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
      </div>

      {/* Info grid */}
      <div className="lic-grid" style={{ marginBottom: 18 }}>
        <div className="lic-card">
          <div className="lic-ico" dangerouslySetInnerHTML={{ __html: ICO.phone }} />
          <div className="lic-det"><div className="lic-lbl">Telefone</div><div className="lic-val">{p.tel || '—'}</div></div>
        </div>
        <div className="lic-card">
          <div className="lic-ico">✉️</div>
          <div className="lic-det"><div className="lic-lbl">E-mail</div><div className="lic-val" title={p.email}>{p.email || '—'}</div></div>
        </div>
        <div className="lic-card">
          <div className="lic-ico">🎂</div>
          <div className="lic-det">
            <div className="lic-lbl">Nascimento</div>
            <div className="lic-val">
              <input
                type="text" placeholder="DD/MM" maxLength={5}
                defaultValue={birthdates[p.id] || ''}
                onChange={e => {
                  let v = e.target.value.replace(/[^0-9/]/g, '')
                  if (v.length === 2 && !v.includes('/')) v += '/'
                  e.target.value = v
                }}
                onBlur={e => saveBday(p.id, e.target.value.match(/^\d{2}\/\d{2}$/) ? e.target.value : '')}
                style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--bord2)', color: 'var(--txt)', fontSize: 13, fontWeight: 600, width: '100%', outline: 'none', padding: 0 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 10, color: 'var(--txt3)', fontWeight: 600, letterSpacing: '.6px', marginBottom: 8 }}>PIPELINE</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {stages.map(s => {
            const active = curStage === s.id
            return (
              <button key={s.id}
                onClick={() => setKanban(p.id, s.id)}
                style={{ padding: '5px 11px', borderRadius: 20, border: `1px solid ${active ? 'var(--gold)' : 'var(--bord)'}`, background: active ? 'var(--gold3)' : 'var(--surf3)', color: active ? 'var(--gold)' : 'var(--txt2)', fontSize: 11.5, cursor: 'pointer', transition: 'all .15s' }}
              >{s.label}</button>
            )
          })}
        </div>
      </div>

      {/* Follow-up */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 10, color: 'var(--txt3)', fontWeight: 600, letterSpacing: '.6px', marginBottom: 8 }}>FOLLOW-UP</div>
        {curFollowup ? (
          <div style={{ background: isOverdue ? 'rgba(239,68,68,.08)' : isDueToday ? 'rgba(251,191,36,.08)' : 'var(--surf3)', border: `1px solid ${isOverdue ? 'rgba(239,68,68,.3)' : isDueToday ? 'rgba(251,191,36,.3)' : 'var(--bord2)'}`, borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: isOverdue ? '#F87171' : isDueToday ? '#FBBF24' : 'var(--txt)' }}>
                {isOverdue ? '⚠️ Vencido · ' : isDueToday ? '🔔 Hoje · ' : '📅 '}{fmtFollowupDate(curFollowup.date)}
              </div>
              {curFollowup.note && <div style={{ fontSize: 11.5, color: 'var(--txt2)', marginTop: 3 }}>{curFollowup.note}</div>}
            </div>
            <button onClick={() => { clearFollowup(p.id); showToast('Follow-up removido') }}
              style={{ background: 'none', border: 'none', color: 'var(--txt3)', cursor: 'pointer', fontSize: 13, padding: 4 }}>✕</button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
              {QUICK_DAYS.map(n => (
                <button key={n} onClick={() => { setFollowup(p.id, addDays(n), followupNoteRef.current?.value || ''); showToast(`📅 Follow-up em ${n} dias`) }}
                  style={{ padding: '5px 12px', background: 'var(--surf3)', border: '1px solid var(--bord2)', borderRadius: 20, cursor: 'pointer', color: 'var(--txt2)', fontSize: 12, fontWeight: 600, transition: 'all .15s' }}
                  onMouseOver={e => { (e.target as HTMLElement).style.borderColor = 'var(--gold)'; (e.target as HTMLElement).style.color = 'var(--gold)' }}
                  onMouseOut={e => { (e.target as HTMLElement).style.borderColor = 'var(--bord2)'; (e.target as HTMLElement).style.color = 'var(--txt2)' }}>
                  +{n}d
                </button>
              ))}
            </div>
            <input ref={followupNoteRef} placeholder="Observação (opcional)..."
              style={{ width: '100%', background: 'var(--surf3)', border: '1px solid var(--bord2)', borderRadius: 7, padding: '7px 11px', color: 'var(--txt)', fontSize: 12.5, outline: 'none', boxSizing: 'border-box' }} />
          </div>
        )}
      </div>

      {/* Notes */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 10, color: 'var(--txt3)', fontWeight: 600, letterSpacing: '.6px', marginBottom: 8 }}>ANOTAÇÕES</div>
        <div style={{ background: 'var(--surf2)', border: '1px solid var(--bord2)', borderRadius: 8, overflow: 'hidden' }}>
          <textarea
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            placeholder={`Escreva uma nova anotação sobre ${p.nome}...`}
            style={{ width: '100%', minHeight: 54, background: 'transparent', border: 'none', padding: '10px 12px', fontSize: 12.5, color: 'var(--txt)', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '6px 10px', borderTop: '1px solid var(--bord2)' }}>
            <button className="btn btn-p" style={{ padding: '6px 14px', fontSize: 11.5 }}
              onClick={() => { addNote(p.id, noteText); setNoteText(''); showToast('📝 Anotação adicionada!') }}>
              ➕ Salvar Anotação
            </button>
          </div>
        </div>
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {patNotes.length === 0
            ? <div style={{ fontSize: 11.5, color: 'var(--txt3)', textAlign: 'center', padding: '10px 0' }}>Nenhuma anotação registrada.</div>
            : [...patNotes].reverse().map((n, i) => {
                const d = new Date(n.date)
                const dtStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                const realIdx = patNotes.length - 1 - i
                return (
                  <div key={i} style={{ background: 'var(--surf3)', border: '1px solid var(--bord)', borderRadius: 6, padding: '10px 12px', position: 'relative' }}>
                    <div style={{ fontSize: 10, color: 'var(--txt3)', marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600 }}>{dtStr}</span>
                      <button onClick={() => { if (confirm('Apagar?')) deleteNote(p.id, realIdx) }}
                        style={{ background: 'none', border: 'none', color: '#F87171', cursor: 'pointer', padding: 2, fontSize: 12 }}
                        dangerouslySetInnerHTML={{ __html: ICO.x }} />
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--txt2)', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{n.text}</div>
                  </div>
                )
              })
          }
        </div>
      </div>

      {/* History */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 10, color: 'var(--txt3)', fontWeight: 600, letterSpacing: '.6px', marginBottom: 8 }}>HISTÓRICO</div>
        <div style={{ border: '1px solid var(--bord)', borderRadius: 9, overflow: 'hidden', maxHeight: 200, overflowY: 'auto' }}>
          {p.atend.length === 0
            ? <div style={{ padding: 18, textAlign: 'center', color: 'var(--txt3)', fontSize: 12 }}>Nenhum atendimento</div>
            : p.atend.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 13px', borderTop: i > 0 ? '1px solid var(--bord)' : undefined }}>
                  <div style={{ fontSize: 11, color: 'var(--txt3)', width: 72, flexShrink: 0 }}>{a.data}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--txt)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.tipo}</div>
                    <div style={{ fontSize: 10.5, color: 'var(--txt3)' }}>{(a.medico || '–').split(' ').pop()}</div>
                  </div>
                  <span className={`badge ${badgeClass(a.status)}`}>{a.status || '–'}</span>
                </div>
              ))
          }
        </div>
      </div>

      {/* Message preview */}
      {msg && (
        <div style={{ background: 'var(--surf3)', border: '1px solid var(--bord)', borderRadius: 9, padding: 13, marginBottom: 18 }}>
          <div style={{ fontSize: 10, color: 'var(--txt3)', fontWeight: 600, letterSpacing: '.6px', marginBottom: 8 }}>MENSAGEM SUGERIDA</div>
          <div style={{ fontSize: 12.5, color: 'var(--txt2)', lineHeight: 1.65 }} dangerouslySetInnerHTML={{ __html: fmtMsg(msg) }} />
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        {p.tel && (
          <a href={wu} target="natuclinic_wa" className="btn btn-wa" style={{ flex: 1, justifyContent: 'center' }}
            dangerouslySetInnerHTML={{ __html: WA_SVG + ' WhatsApp' }} />
        )}
        {msg && (
          <button className="btn btn-s" style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => { navigator.clipboard?.writeText(msg).then(() => showToast('✅ Copiado!')).catch(() => {}) }}>
            <span dangerouslySetInnerHTML={{ __html: ICO.clip }} /> Copiar Mensagem
          </button>
        )}
        <button
          onClick={() => openModal(<ConfirmDeleteModal id={p.id} nome={p.nome} />)}
          style={{ padding: '8px 12px', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 7, cursor: 'pointer', color: '#F87171', fontSize: 12, whiteSpace: 'nowrap' }}>
          <span dangerouslySetInnerHTML={{ __html: ICO.x }} /> Excluir
        </button>
      </div>
    </div>
  )
}
