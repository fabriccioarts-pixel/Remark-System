import { useState } from 'react'
import { useCRM, filt, patientRmkCat, dueFollowups } from '../../store'
import { ICO, TMPLS, WA_SVG } from '../../lib/constants'
import { waUrl, fmtDateTime, timeAgo, getInitials, daysSince, badgeClass } from '../../lib/utils'
import { WaConfigModal } from './WaConfigModal'

function addDays(n: number) {
  const d = new Date(); d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

function fmtFollowDate(iso: string): string {
  const today = new Date().toISOString().slice(0, 10)
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
  const tmrStr = tomorrow.toISOString().slice(0, 10)
  if (iso === today) return 'Hoje'
  if (iso === tmrStr) return 'Amanhã'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export function Remarketing() {
  const { patients, q, period, rmkFilter, rmkSent, kanban, waConfig, followups, setRmkFilter, markSent, setFollowup, clearFollowup, markAllSent, resetRmk, openModal } = useCRM()
  const duePts = dueFollowups(patients, followups)
  const [followupOpen, setFollowupOpen] = useState<string | null>(null)

  const cats = Object.keys(TMPLS)
  let pts = filt(patients, q, period)
    .filter(p => (kanban[p.id] || 'entrar') !== 'nao')
    .map(p => ({ ...p, cat: patientRmkCat(p), dias: daysSince(p.last?.data || '') }))

  const catCounts: Record<string, number> = {}
  pts.forEach(p => { catCounts[p.cat] = (catCounts[p.cat] || 0) + 1 })

  const filtered = rmkFilter === 'all' ? pts : pts.filter(p => p.cat === rmkFilter)
  filtered.sort((a, b) => {
    const sa = rmkSent[a.id] ? 1 : 0, sb = rmkSent[b.id] ? 1 : 0
    if (sa !== sb) return sa - sb
    return (b.dias || 0) - (a.dias || 0)
  })

  const sentCount = Object.values(rmkSent).filter(Boolean).length
  const total = pts.length
  const pct = total > 0 ? ((sentCount / total) * 100).toFixed(1) : 0

  return (
    <div className="content">
      <div className="rmk-layout" style={{ display: 'flex', gap: 18 }}>
        {/* Sidebar */}
        <div style={{ width: 210, flexShrink: 0 }}>
          <div className="card" style={{ padding: 14, marginBottom: 12 }}>
            <div style={{ fontWeight: 600, color: 'var(--gold)', fontSize: 12.5, marginBottom: 10 }}>Filtrar por Categoria</div>
            <div className={`nav-item`} style={{ padding: '7px 9px', borderRadius: 7, color: rmkFilter === 'all' ? 'var(--gold)' : 'var(--txt2)', fontWeight: rmkFilter === 'all' ? 600 : 400, background: rmkFilter === 'all' ? 'var(--gold3)' : 'none' }}
              onClick={() => setRmkFilter('all')}>
              <span dangerouslySetInnerHTML={{ __html: ICO.search }} /> Todos
              <span style={{ marginLeft: 'auto', fontSize: 11 }}>{total}</span>
            </div>
            {cats.map(cat => {
              const tmpl = TMPLS[cat], cnt = catCounts[cat] || 0
              if (!cnt) return null
              return (
                <div key={cat} className="nav-item" style={{ padding: '7px 9px', borderRadius: 7, color: rmkFilter === cat ? 'var(--gold)' : 'var(--txt2)', fontWeight: rmkFilter === cat ? 600 : 400, background: rmkFilter === cat ? 'var(--gold3)' : 'none' }}
                  onClick={() => setRmkFilter(cat)}>
                  {(cat === 'cancelou' || cat === 'faltou') && <span dangerouslySetInnerHTML={{ __html: ICO[tmpl.icon] || '' }} />}
                  {tmpl.label}
                  <span style={{ marginLeft: 'auto', fontSize: 11 }}>{cnt}</span>
                </div>
              )
            })}
          </div>

          <div className="card" style={{ padding: 14, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--gold)' }}>API WhatsApp</div>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 600, background: waConfig.enabled ? 'rgba(37,211,102,.12)' : 'var(--surf3)', color: waConfig.enabled ? '#25D366' : 'var(--txt3)' }}>
                {waConfig.enabled ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            {waConfig.enabled
              ? <div style={{ fontSize: 11, color: 'var(--txt3)', marginBottom: 9 }}>Número: ...{waConfig.phoneNumberId.slice(-6)}<br />Template: {waConfig.templateName}</div>
              : <div style={{ fontSize: 11, color: 'var(--txt3)', marginBottom: 9, lineHeight: 1.5 }}>Configure para enviar mensagens diretamente pelo CRM.</div>
            }
            <button onClick={() => openModal(<WaConfigModal />)} className="btn btn-s" style={{ width: '100%', justifyContent: 'center', fontSize: 11.5, padding: 6 }}>
              {waConfig.enabled ? 'Reconfigurar' : 'Configurar API'}
            </button>
          </div>

          <div className="card" style={{ padding: 14 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--gold)', marginBottom: 7 }}>📊 Progresso</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--gold)' }}>{sentCount}</div>
            <div style={{ fontSize: 11.5, color: 'var(--txt2)', marginBottom: 7 }}>de {total} pacientes</div>
            <div style={{ background: 'var(--surf3)', height: 5, borderRadius: 3, marginBottom: 4 }}>
              <div style={{ background: '#25D366', height: 5, borderRadius: 3, width: `${pct}%`, transition: 'width 1s' }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--txt3)' }}>{pct}% enviado</div>
            <button className="btn btn-s" style={{ width: '100%', marginTop: 10, padding: 6, fontSize: 11.5, justifyContent: 'center' }} onClick={resetRmk}>Resetar</button>
          </div>
        </div>

        {/* Main list */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Follow-up queue */}
          {duePts.length > 0 && (
            <div style={{ background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#F87171', letterSpacing: '.6px', marginBottom: 10 }}>🔔 FOLLOW-UPS PENDENTES — {duePts.length}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {duePts.map(p => {
                  const isOverdue = p.followup.date < new Date().toISOString().slice(0, 10)
                  const wu = p.tel ? waUrl(p.tel, `Olá ${p.nome.split(' ')[0]}! `) : '#'
                  return (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surf)', border: '1px solid var(--bord2)', borderRadius: 8, padding: '9px 12px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--txt)' }}>{p.nome}</div>
                        <div style={{ fontSize: 11, color: isOverdue ? '#F87171' : '#FBBF24', fontWeight: 600 }}>
                          {isOverdue ? '⚠️ Vencido · ' : '📅 '}{fmtFollowDate(p.followup.date)}
                          {p.followup.note && <span style={{ color: 'var(--txt3)', fontWeight: 400 }}> · {p.followup.note}</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        {p.tel && (
                          <a href={wu} target="natuclinic_wa" className="btn btn-wa" style={{ padding: '4px 9px', fontSize: 11 }}
                            onClick={() => { markSent(p.id); clearFollowup(p.id) }}
                            dangerouslySetInnerHTML={{ __html: WA_SVG + ' Enviar' }} />
                        )}
                        <button onClick={() => clearFollowup(p.id)}
                          style={{ padding: '4px 9px', background: 'var(--surf2)', border: '1px solid var(--bord)', borderRadius: 6, cursor: 'pointer', color: 'var(--txt3)', fontSize: 11 }}>
                          Fechar
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontSize: 13, color: 'var(--txt2)' }}>{filtered.length} pacientes · {filtered.filter(p => !rmkSent[p.id]).length} pendentes</div>
            <button className="btn btn-s" style={{ padding: '6px 12px', fontSize: 12 }} onClick={markAllSent}>✅ Marcar todos enviados</button>
          </div>

          {filtered.length === 0
            ? <div className="empty"><div className="empty-ico">🎉</div><div style={{ fontWeight: 700, color: 'var(--gold)', fontSize: 16 }}>Nenhum paciente aqui!</div></div>
            : filtered.map(p => {
                const tmpl = TMPLS[p.cat!]
                const msg = tmpl ? tmpl.msg(p.nome) : ''
                const sent = rmkSent[p.id] || false
                const wu = p.tel ? waUrl(p.tel, msg) : '#'
                const dias = p.dias || 0
                const dBadge = dias > 365 ? '<span class="badge bx">+1 ano</span>' : dias > 180 ? '<span class="badge bf">+6 m</span>' : dias > 90 ? '<span class="badge" style="background:var(--gold3);color:var(--gold)">+3 m</span>' : ''
                const hasFu = !!followups[p.id]
                const fuOpen = followupOpen === p.id
                return (
                  <div key={p.id} className={`rm-card ${sent ? 'sent' : ''}`} style={{ position: 'relative' }}>
                    <div style={{ width: 42, height: 42, background: tmpl?.cor || 'var(--gold4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: (tmpl?.cor || '').startsWith('#') ? '#000' : 'var(--txt)', flexShrink: 0, border: '1px solid rgba(255,255,255,.1)' }}>
                      {getInitials(p.nome)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 2 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--txt)' }}>{p.nome}</span>
                        <span className={`badge ${badgeClass(p.last?.status || '')}`}>{p.last?.status || '–'}</span>
                        <span dangerouslySetInnerHTML={{ __html: dBadge }} />
                        {sent && <span style={{ fontSize: 10, color: '#34D399', fontWeight: 600 }}>✓ Enviado</span>}
                        {hasFu && <span style={{ fontSize: 10, color: '#FBBF24', fontWeight: 600 }}>📅 Follow-up</span>}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--txt2)' }}>{p.last?.tipo || '–'}</div>
                      <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 2 }}>
                        <b style={{ color: 'var(--txt2)' }}>{fmtDateTime(p.last?.data, p.last?.hora)}</b>
                        {' · '}<span style={{ color: dias > 180 ? '#F87171' : dias > 90 ? '#FBBF24' : 'var(--txt2)' }}>há {timeAgo(p.last?.data)}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--txt3)' }}>{p.tel || 'Sem telefone'}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end', flexShrink: 0 }}>
                      {p.tel
                        ? <a href={wu} target="natuclinic_wa" className="btn btn-wa" style={{ padding: '5px 9px', fontSize: 11.5 }}
                            onClick={() => markSent(p.id)}
                            dangerouslySetInnerHTML={{ __html: WA_SVG + ' Enviar WA' }} />
                        : <span style={{ fontSize: 11, color: 'var(--txt3)' }}>Sem tel.</span>
                      }
                      <button onClick={() => setFollowupOpen(fuOpen ? null : p.id)}
                        style={{ padding: '3px 8px', background: hasFu ? 'rgba(251,191,36,.12)' : 'var(--surf2)', border: `1px solid ${hasFu ? 'rgba(251,191,36,.3)' : 'var(--bord)'}`, borderRadius: 6, cursor: 'pointer', color: hasFu ? '#FBBF24' : 'var(--txt3)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span dangerouslySetInnerHTML={{ __html: ICO.clock }} />⏰
                      </button>
                    </div>
                    {fuOpen && (
                      <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 4, background: 'var(--surf)', border: '1px solid var(--bord2)', borderRadius: 10, padding: 12, zIndex: 50, boxShadow: '0 8px 32px rgba(0,0,0,.5)', minWidth: 200 }}>
                        <div style={{ fontSize: 10.5, color: 'var(--txt3)', fontWeight: 600, marginBottom: 8 }}>LEMBRAR EM</div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                          {[3, 7, 15, 30].map(n => (
                            <button key={n} onClick={() => { setFollowup(p.id, addDays(n), ''); setFollowupOpen(null) }}
                              style={{ padding: '5px 11px', background: 'var(--surf3)', border: '1px solid var(--bord2)', borderRadius: 20, cursor: 'pointer', color: 'var(--gold)', fontSize: 12, fontWeight: 700 }}>
                              +{n}d
                            </button>
                          ))}
                        </div>
                        <button onClick={() => setFollowupOpen(null)} style={{ fontSize: 11, color: 'var(--txt3)', background: 'none', border: 'none', cursor: 'pointer' }}>cancelar</button>
                      </div>
                    )}
                  </div>
                )
              })
          }
        </div>
      </div>
    </div>
  )
}
