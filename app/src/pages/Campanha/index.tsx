import { useState } from 'react'
import { useCRM, patientRmkCat } from '../../store'
import { CAMPANHAS, WA_SVG } from '../../lib/constants'
import { waUrl, getInitials } from '../../lib/utils'
import type { CampanhaDef } from '../../lib/constants'

export function Campanha() {
  const { patients, rmkSent, markSent, kanban } = useCRM()
  const [selected, setSelected] = useState<CampanhaDef>(CAMPANHAS[0])
  const [msgPreview, setMsgPreview] = useState(false)

  const eligible = patients
    .filter(p => p.tel && (kanban[p.id] || 'base') !== 'nao')
    .filter(p => {
      const cat = patientRmkCat(p)
      return selected.publico.includes(cat)
    })

  const sentInCamp = eligible.filter(p => rmkSent[p.id]).length
  const pct = eligible.length > 0 ? Math.round((sentInCamp / eligible.length) * 100) : 0

  return (
    <div className="content">
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 17 }}>🎯 Campanha da Semana</div>
          <div style={{ fontSize: 12.5, color: 'var(--txt2)', marginTop: 2 }}>
            Meta: ✔ 20 Botox · ✔ 10 Harmone Bee · ✔ 4 Harmonizações · Agenda cheia nos complementares
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
        {/* Campaign list */}
        <div style={{ width: 230, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {CAMPANHAS.map(c => {
            const cnt = patients
              .filter(p => p.tel && (kanban[p.id] || 'base') !== 'nao')
              .filter(p => c.publico.includes(patientRmkCat(p))).length
            const isActive = selected.id === c.id
            return (
              <div
                key={c.id}
                onClick={() => setSelected(c)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  background: isActive ? 'var(--gold4)' : 'var(--surf)',
                  border: `1px solid ${isActive ? 'var(--gold)' : 'var(--bord)'}`,
                  transition: 'all .15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontSize: 16 }}>{c.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--gold)' : 'var(--txt)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.label}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--txt3)' }}>{c.preco}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: isActive ? 'var(--gold)' : 'var(--txt3)', background: isActive ? 'var(--gold3)' : 'var(--surf2)', padding: '2px 6px', borderRadius: 20 }}>
                    {cnt}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Main area */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Campaign header card */}
          <div className="card" style={{ padding: 18, borderLeft: `4px solid var(--gold)` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 32 }}>{selected.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--txt)' }}>{selected.label}</div>
                <div style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 600, marginTop: 3 }}>{selected.preco}</div>
                <div style={{ fontSize: 12, color: 'var(--txt3)', marginTop: 2 }}>Meta: {selected.meta}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--gold)' }}>{sentInCamp}/{eligible.length}</div>
                <div style={{ fontSize: 11, color: 'var(--txt3)' }}>enviados</div>
                <div style={{ background: 'var(--surf3)', height: 4, borderRadius: 2, width: 80, marginTop: 4, marginLeft: 'auto' }}>
                  <div style={{ background: '#25D366', height: 4, borderRadius: 2, width: `${pct}%`, transition: 'width .8s' }} />
                </div>
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <button
                className="btn btn-s"
                style={{ fontSize: 11.5, padding: '5px 12px' }}
                onClick={() => setMsgPreview(v => !v)}
              >
                {msgPreview ? '▲ Ocultar mensagem' : '▼ Ver mensagem WA'}
              </button>
              {msgPreview && (
                <div style={{ marginTop: 12, background: 'var(--bg2)', borderRadius: 8, padding: '12px 14px', fontSize: 12.5, color: 'var(--txt)', whiteSpace: 'pre-wrap', lineHeight: 1.7, border: '1px solid var(--bord)', fontFamily: 'system-ui' }}>
                  {selected.msg('Nome')}
                </div>
              )}
            </div>
          </div>

          {/* Patient list */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '11px 16px', borderBottom: '1px solid var(--bord)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ fontSize: 13, color: 'var(--txt2)', flex: 1 }}>
                {eligible.length} pacientes no público-alvo · {eligible.length - sentInCamp} pendentes
              </div>
            </div>

            {eligible.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--txt3)', fontSize: 13 }}>
                Nenhum paciente encontrado para esta campanha.<br />
                <span style={{ fontSize: 11.5 }}>Público-alvo: {selected.publico.join(', ')}</span>
              </div>
            ) : (
              <div style={{ maxHeight: 520, overflowY: 'auto' }}>
                {eligible
                  .sort((a, b) => {
                    const sa = rmkSent[a.id] ? 1 : 0, sb = rmkSent[b.id] ? 1 : 0
                    return sa - sb || b.total - a.total
                  })
                  .map(p => {
                    const sent = rmkSent[p.id]
                    const msg = selected.msg(p.nome)
                    const wu = waUrl(p.tel, msg)
                    return (
                      <div
                        key={p.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '10px 16px',
                          borderBottom: '1px solid var(--bord)',
                          opacity: sent ? 0.55 : 1,
                          transition: 'opacity .2s',
                        }}
                      >
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                          background: selected.cor, display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#333',
                        }}>
                          {getInitials(p.nome)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--txt)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            {p.nome}
                            {sent && <span style={{ fontSize: 10, color: '#34D399', fontWeight: 600 }}>✓ Enviado</span>}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 1 }}>
                            {p.tel} · {p.total} atend. · {p.last?.tipo || '–'}
                          </div>
                        </div>
                        <a
                          href={wu}
                          target="natuclinic_wa"
                          className="btn btn-wa"
                          style={{ padding: '5px 10px', fontSize: 11.5, flexShrink: 0 }}
                          onClick={() => markSent(p.id)}
                          dangerouslySetInnerHTML={{ __html: WA_SVG + ' Enviar' }}
                        />
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
