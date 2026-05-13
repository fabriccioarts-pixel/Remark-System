import { useState } from 'react'
import { useCRM, filt } from '../../store'
import { TMPLS, WA_SVG, ICO } from '../../lib/constants'
import { waUrl, daysSince, getInitials } from '../../lib/utils'

const GRUPOS = [
  { label: 'Urgente',       min: 150, max: 180, cor: '#F87171', bg: 'rgba(239,68,68,.08)',   bord: 'rgba(239,68,68,.25)'   },
  { label: 'Alta prioridade', min: 120, max: 150, cor: '#FBBF24', bg: 'rgba(245,158,11,.08)', bord: 'rgba(245,158,11,.25)'  },
  { label: 'Em risco',      min: 90,  max: 120, cor: '#A78BFA', bg: 'rgba(139,92,246,.08)',  bord: 'rgba(139,92,246,.25)'  },
]

function addDays(n: number) {
  const d = new Date(); d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export function Reativar() {
  const { patients, q, period, rmkSent, kanban, followups, markSent, setFollowup } = useCRM()
  const [activeGrupo, setActiveGrupo] = useState<string | null>(null)
  const [followupOpen, setFollowupOpen] = useState<string | null>(null)

  const tmpl = TMPLS['reativar']

  const pts = filt(patients, q, period)
    .filter(p => (kanban[p.id] || 'entrar') !== 'nao')
    .map(p => ({ ...p, dias: daysSince(p.last?.data || '') }))
    .filter(p => (p.dias || 0) >= 90 && (p.dias || 0) <= 180)

  const totalAtRisk = pts.length
  const totalSent = pts.filter(p => rmkSent[p.id]).length

  const grupoAtivo = activeGrupo
    ? GRUPOS.find(g => g.label === activeGrupo)
    : null

  const filtered = grupoAtivo
    ? pts.filter(p => (p.dias || 0) >= grupoAtivo.min && (p.dias || 0) < grupoAtivo.max)
    : pts

  filtered.sort((a, b) => (b.dias || 0) - (a.dias || 0))

  return (
    <div className="content">
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: 22 }}>
        <div className="kpi">
          <div className="kpi-ico" dangerouslySetInnerHTML={{ __html: ICO.warn }} />
          <div className="kpi-lbl">Em Risco de Inatividade</div>
          <div className="kpi-val">{totalAtRisk}</div>
          <div className="kpi-sub">sem atend. há 3–6 meses</div>
        </div>
        {GRUPOS.map(g => {
          const cnt = pts.filter(p => (p.dias || 0) >= g.min && (p.dias || 0) < g.max).length
          return (
            <div key={g.label} className="kpi" style={{ cursor: 'pointer', outline: activeGrupo === g.label ? `2px solid ${g.cor}` : 'none' }}
              onClick={() => setActiveGrupo(activeGrupo === g.label ? null : g.label)}>
              <div className="kpi-lbl" style={{ color: g.cor }}>{g.label.toUpperCase()}</div>
              <div className="kpi-val" style={{ color: g.cor }}>{cnt}</div>
              <div className="kpi-sub">{g.min}–{g.max} dias sem atend.</div>
            </div>
          )
        })}
        <div className="kpi">
          <div className="kpi-ico" dangerouslySetInnerHTML={{ __html: ICO.check }} />
          <div className="kpi-lbl">Contactados</div>
          <div className="kpi-val">{totalSent}</div>
          <div className="kpi-sub">de {totalAtRisk} pacientes</div>
        </div>
      </div>

      {/* Filtro de grupo */}
      {activeGrupo && (
        <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12.5, color: 'var(--txt2)' }}>Filtrando:</span>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: grupoAtivo?.cor }}>{activeGrupo}</span>
          <button onClick={() => setActiveGrupo(null)}
            style={{ fontSize: 11, color: 'var(--txt3)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}>
            ✕ limpar
          </button>
        </div>
      )}

      {/* Lista */}
      {filtered.length === 0
        ? <div className="empty"><div className="empty-ico">🎉</div><div style={{ fontWeight: 700, color: 'var(--gold)', fontSize: 16 }}>Nenhum paciente em risco!</div></div>
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(p => {
              const dias = p.dias || 0
              const grupo = GRUPOS.find(g => dias >= g.min && dias < g.max)
              const msg = tmpl.msg(p.nome)
              const wu = p.tel ? waUrl(p.tel, msg) : '#'
              const sent = rmkSent[p.id] || false
              const hasFu = !!followups[p.id]
              const fuOpen = followupOpen === p.id

              return (
                <div key={p.id} className={`rm-card ${sent ? 'sent' : ''}`}
                  style={{ borderLeft: `3px solid ${grupo?.cor || 'var(--bord)'}`, position: 'relative' }}>
                  {/* Avatar */}
                  <div style={{ width: 42, height: 42, background: grupo?.bg || 'var(--gold4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: grupo?.cor || 'var(--gold)', flexShrink: 0, border: `1px solid ${grupo?.bord || 'var(--bord)'}` }}>
                    {getInitials(p.nome)}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 2 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--txt)' }}>{p.nome}</span>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: grupo?.cor, background: grupo?.bg, border: `1px solid ${grupo?.bord}`, borderRadius: 20, padding: '1px 8px' }}>{grupo?.label}</span>
                      {sent && <span style={{ fontSize: 10, color: '#34D399', fontWeight: 600 }}>✓ Contactado</span>}
                      {hasFu && <span style={{ fontSize: 10, color: '#FBBF24', fontWeight: 600 }}>📅 Follow-up</span>}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--txt2)' }}>{p.last?.tipo || '–'} · {p.last?.data || '–'}</div>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: grupo?.cor }}>Há {dias} dias sem atendimento</div>
                    <div style={{ fontSize: 11, color: 'var(--txt3)' }}>{p.tel || 'Sem telefone'}</div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end', flexShrink: 0 }}>
                    {p.tel && (
                      <a href={wu} target="natuclinic_wa" className="btn btn-wa" style={{ padding: '5px 9px', fontSize: 11.5 }}
                        onClick={() => markSent(p.id)}
                        dangerouslySetInnerHTML={{ __html: WA_SVG + ' Reativar' }} />
                    )}
                    <button
                      onClick={() => setFollowupOpen(fuOpen ? null : p.id)}
                      style={{ padding: '4px 9px', background: hasFu ? 'rgba(251,191,36,.12)' : 'var(--surf2)', border: `1px solid ${hasFu ? 'rgba(251,191,36,.3)' : 'var(--bord)'}`, borderRadius: 6, cursor: 'pointer', color: hasFu ? '#FBBF24' : 'var(--txt3)', fontSize: 11.5, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span dangerouslySetInnerHTML={{ __html: ICO.clock }} />
                      {hasFu ? 'Follow-up' : 'Lembrar'}
                    </button>
                  </div>

                  {/* Follow-up quick picker */}
                  {fuOpen && (
                    <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 4, background: 'var(--surf)', border: '1px solid var(--bord2)', borderRadius: 10, padding: 12, zIndex: 50, boxShadow: '0 8px 32px rgba(0,0,0,.5)', minWidth: 220 }}>
                      <div style={{ fontSize: 10.5, color: 'var(--txt3)', fontWeight: 600, marginBottom: 8 }}>LEMBRAR EM</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                        {[3, 7, 15, 30].map(n => (
                          <button key={n} onClick={() => { setFollowup(p.id, addDays(n), ''); setFollowupOpen(null) }}
                            style={{ padding: '5px 11px', background: 'var(--surf3)', border: '1px solid var(--bord2)', borderRadius: 20, cursor: 'pointer', color: 'var(--gold)', fontSize: 12, fontWeight: 700 }}>
                            +{n}d
                          </button>
                        ))}
                      </div>
                      <button onClick={() => setFollowupOpen(null)}
                        style={{ fontSize: 11, color: 'var(--txt3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        cancelar
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      }
    </div>
  )
}
