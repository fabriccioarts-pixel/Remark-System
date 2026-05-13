import { useCRM, filt, patientRmkCat } from '../../store'
import { ICO, TMPLS, WA_SVG } from '../../lib/constants'
import { waUrl, fmtDateTime, timeAgo, getInitials, daysSince, badgeClass } from '../../lib/utils'
import { WaConfigModal } from './WaConfigModal'

export function Remarketing() {
  const { patients, q, period, rmkFilter, rmkSent, kanban, waConfig, setRmkFilter, markSent, markAllSent, resetRmk, openModal } = useCRM()

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
      <div style={{ display: 'flex', gap: 18 }}>
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
                return (
                  <div key={p.id} className={`rm-card ${sent ? 'sent' : ''}`}>
                    <div style={{ width: 42, height: 42, background: tmpl?.cor || 'var(--gold4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: (tmpl?.cor || '').startsWith('#') ? '#000' : 'var(--txt)', flexShrink: 0, border: '1px solid rgba(255,255,255,.1)' }}>
                      {getInitials(p.nome)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 2 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--txt)' }}>{p.nome}</span>
                        <span className={`badge ${badgeClass(p.last?.status || '')}`}>{p.last?.status || '–'}</span>
                        <span dangerouslySetInnerHTML={{ __html: dBadge }} />
                        {sent && <span style={{ fontSize: 10, color: '#34D399', fontWeight: 600 }}>✓ Enviado</span>}
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
                    </div>
                  </div>
                )
              })
          }
        </div>
      </div>
    </div>
  )
}
