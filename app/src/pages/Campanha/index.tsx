import { useState, useEffect } from 'react'
import { useCRM, patientRmkCat } from '../../store'
import { CAMPANHAS, WA_SVG } from '../../lib/constants'
import { waUrl, getInitials } from '../../lib/utils'
import type { CampanhaDef } from '../../lib/constants'
import type { Patient } from '../../lib/types'

const VARS = [
  { tag: '{nome}',  desc: 'Primeiro nome' },
  { tag: '{ddd}',   desc: 'DDD do telefone' },
  { tag: '{tipo}',  desc: 'Último procedimento' },
]

function ddd(tel: string): string {
  const d = tel.replace(/\D/g, '')
  const digits = d.startsWith('55') ? d.slice(2) : d
  return digits.slice(0, 2) || ''
}

function applyVars(template: string, p: Patient): string {
  const nome = p.nome.trim().split(' ')[0]
  const n = nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase()
  return template
    .replace(/\{nome\}/g, n)
    .replace(/\{ddd\}/g, ddd(p.tel))
    .replace(/\{tipo\}/g, p.last?.tipo || '')
}

export function Campanha() {
  const { patients, rmkSent, markSent, kanban } = useCRM()
  const [selected, setSelected] = useState<CampanhaDef>(CAMPANHAS[0])
  const [customMsg, setCustomMsg] = useState(CAMPANHAS[0].msg(''))
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    setCustomMsg(selected.msg(''))
    setEditing(false)
  }, [selected.id])

  const eligible = patients
    .filter(p => p.tel && (kanban[p.id] || 'base') !== 'nao')
    .filter(p => selected.publico.includes(patientRmkCat(p)))

  const sentInCamp = eligible.filter(p => rmkSent[p.id]).length
  const pct = eligible.length > 0 ? Math.round((sentInCamp / eligible.length) * 100) : 0

  const previewMsg = applyVars(customMsg, {
    id: '0', nome: 'Maria Silva', tel: '(61) 99999-9999',
    cpf: '', email: '', atend: [], total: 0, stage: 'base',
    last: { data: '', hora: '', tipo: selected.publico[0] || '', status: '', medico: '' },
  })

  return (
    <div className="content">
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 17 }}>Campanha da Semana</div>
        <div style={{ fontSize: 12.5, color: 'var(--txt2)', marginTop: 2 }}>
          Meta: 20 Botox · 10 Harmone Bee · 4 Harmonizações · Agenda cheia nos complementares
        </div>
      </div>

      <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
        {/* Campaign list */}
        <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {CAMPANHAS.map(c => {
            const cnt = patients
              .filter(p => p.tel && (kanban[p.id] || 'base') !== 'nao')
              .filter(p => c.publico.includes(patientRmkCat(p))).length
            const isActive = selected.id === c.id
            return (
              <div key={c.id} onClick={() => setSelected(c)} style={{
                padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                background: isActive ? 'var(--gold4)' : 'var(--surf)',
                border: `1px solid ${isActive ? 'var(--gold)' : 'var(--bord)'}`,
                transition: 'all .15s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontSize: 16 }}>{c.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--gold)' : 'var(--txt)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--txt3)' }}>{c.preco}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: isActive ? 'var(--gold)' : 'var(--txt3)', background: isActive ? 'var(--gold3)' : 'var(--surf2)', padding: '2px 6px', borderRadius: 20 }}>{cnt}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Main area */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Message editor */}
          <div className="card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 22 }}>{selected.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{selected.label}</div>
                <div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 600 }}>{selected.preco} · Meta: {selected.meta}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--gold)' }}>{sentInCamp}/{eligible.length}</div>
                <div style={{ background: 'var(--surf3)', height: 3, borderRadius: 2, width: 70, marginTop: 3, marginLeft: 'auto' }}>
                  <div style={{ background: '#25D366', height: 3, borderRadius: 2, width: `${pct}%`, transition: 'width .8s' }} />
                </div>
              </div>
            </div>

            {/* Variables chips */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--txt3)', alignSelf: 'center' }}>Variáveis:</span>
              {VARS.map(v => (
                <button key={v.tag} title={v.desc} onClick={() => setCustomMsg(m => m + v.tag)}
                  style={{ padding: '3px 9px', borderRadius: 20, fontSize: 11.5, fontWeight: 600, background: 'var(--surf3)', border: '1px solid var(--bord2)', color: 'var(--gold)', cursor: 'pointer', fontFamily: 'monospace' }}>
                  {v.tag}
                </button>
              ))}
              <button onClick={() => setCustomMsg(selected.msg(''))}
                style={{ padding: '3px 9px', borderRadius: 20, fontSize: 11, background: 'none', border: '1px solid var(--bord)', color: 'var(--txt3)', cursor: 'pointer', marginLeft: 'auto' }}>
                Restaurar padrão
              </button>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              {/* Editor */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10.5, color: 'var(--txt3)', fontWeight: 600, marginBottom: 5 }}>MENSAGEM</div>
                <textarea
                  value={customMsg}
                  onChange={e => setCustomMsg(e.target.value)}
                  rows={10}
                  style={{
                    width: '100%', background: 'var(--surf3)', border: '1px solid var(--bord2)',
                    borderRadius: 8, padding: '10px 12px', color: 'var(--txt)', fontSize: 12.5,
                    lineHeight: 1.7, resize: 'vertical', outline: 'none', fontFamily: 'system-ui',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Preview */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10.5, color: 'var(--txt3)', fontWeight: 600, marginBottom: 5 }}>PRÉVIA — Maria Silva (61)</div>
                <div style={{
                  background: 'var(--bg2)', borderRadius: 8, padding: '10px 12px', fontSize: 12.5,
                  color: 'var(--txt)', whiteSpace: 'pre-wrap', lineHeight: 1.7,
                  border: '1px solid var(--bord)', minHeight: 180, fontFamily: 'system-ui',
                }}>
                  {previewMsg}
                </div>
              </div>
            </div>
          </div>

          {/* Patient list */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '11px 16px', borderBottom: '1px solid var(--bord)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ fontSize: 13, color: 'var(--txt2)', flex: 1 }}>
                {eligible.length} pacientes · {eligible.length - sentInCamp} pendentes
              </div>
            </div>

            {eligible.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--txt3)', fontSize: 13 }}>
                Nenhum paciente encontrado para esta campanha.
              </div>
            ) : (
              <div style={{ maxHeight: 480, overflowY: 'auto' }}>
                {eligible
                  .sort((a, b) => {
                    const sa = rmkSent[a.id] ? 1 : 0, sb = rmkSent[b.id] ? 1 : 0
                    return sa - sb || b.total - a.total
                  })
                  .map(p => {
                    const sent = rmkSent[p.id]
                    const msg = applyVars(customMsg, p)
                    const wu = waUrl(p.tel, msg)
                    return (
                      <div key={p.id} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 16px', borderBottom: '1px solid var(--bord)',
                        opacity: sent ? 0.5 : 1, transition: 'opacity .2s',
                      }}>
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
                            {p.tel} · DDD {ddd(p.tel)} · {p.total} atend.
                          </div>
                        </div>
                        <a href={wu} target="natuclinic_wa" className="btn btn-wa"
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
