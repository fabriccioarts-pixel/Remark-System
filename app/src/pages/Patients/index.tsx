import { useState } from 'react'
import { useCRM, filt, patientRmkCat } from '../../store'
import { TMPLS, WA_SVG } from '../../lib/constants'
import { waUrl, fmtDate, badgeClass } from '../../lib/utils'
import { PatientModal } from '../../components/PatientModal'
import { ContextMenu } from '../../components/ContextMenu'
import { AddLeadModal } from './AddLeadModal'

const PER_PAGE = 50

export function Patients() {
  const { patients, q, period, openModal, markSent } = useCRM()
  const [filter, setFilter] = useState('all')
  const [page, setLocalPage] = useState(1)
  const [ctx, setCtx] = useState<{ id: string; x: number; y: number } | null>(null)

  let pts = filt(patients, q, period)
  if (filter !== 'all') pts = pts.filter(p => (p.last?.status || '').toLowerCase() === filter)
  const tot = pts.length
  const totPg = Math.ceil(tot / PER_PAGE)
  const slice = pts.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const exportPats = () => {
    let csv = 'Nome;Telefone;Email;CPF;Ultimo Atendimento;Tipo;Status;Total\n'
    pts.forEach(p => {
      csv += `"${p.nome}";"${p.tel}";"${p.email}";"${p.cpf}";"${p.last?.data || ''}";"${p.last?.tipo || ''}";"${p.last?.status || ''}";"${p.total}"\n`
    })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    a.download = 'pacientes_natuclinic.csv'; a.click()
  }

  return (
    <div className="content">
      {ctx && <ContextMenu patientId={ctx.id} x={ctx.x} y={ctx.y} onClose={() => setCtx(null)} />}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '13px 18px', borderBottom: '1px solid var(--bord)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 13, color: 'var(--txt2)' }}>{tot} pacientes</div>
          <div className="seg" style={{ marginLeft: 'auto' }}>
            {(['all', 'confirmado', 'cancelou', 'faltou'] as const).map(s => (
              <button key={s} className={`seg-b ${filter === s ? 'on' : ''}`} onClick={() => { setFilter(s); setLocalPage(1) }}>
                {s === 'all' ? 'Todos' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <button className="btn btn-s" style={{ padding: '7px 14px', fontSize: 12 }} onClick={() => openModal(<AddLeadModal />)}>+ Novo Lead</button>
          <button className="btn btn-p" style={{ padding: '7px 14px', fontSize: 12 }} onClick={exportPats}>⬇ Exportar</button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr><th>Paciente</th><th>Telefone</th><th>Último Atend.</th><th>Tipo</th><th>Médico</th><th>Status</th><th>#</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {slice.map(p => {
                const cat = patientRmkCat(p)
                const tmpl = TMPLS[cat]
                const msg = tmpl ? tmpl.msg(p.nome) : ''
                const med = (p.last?.medico || '–')
                  .replace('Dr. Julimar de Meneses Barbosa', 'Dr. Julimar')
                  .replace('Dra. Débora Neres de Oliveira Meneses', 'Dra. Débora')
                return (
                  <tr key={p.id}
                    onClick={() => openModal(<PatientModal patient={p} />)}
                    onContextMenu={e => { e.preventDefault(); setCtx({ id: p.id, x: e.clientX, y: e.clientY }) }}
                    style={{ cursor: 'pointer' }}>
                    <td><div style={{ fontWeight: 600 }}>{p.nome}</div><div style={{ fontSize: 10.5, color: 'var(--txt3)' }}>{p.cpf || '–'}</div></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{p.tel || '–'}</td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: 12.5 }}>{fmtDate(p.last?.data)}</td>
                    <td style={{ fontSize: 12, maxWidth: 150, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.last?.tipo || '–'}</td>
                    <td style={{ fontSize: 12, color: 'var(--txt2)' }}>{med}</td>
                    <td><span className={`badge ${badgeClass(p.last?.status || '')}`}>{p.last?.status || '–'}</span></td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--gold)' }}>{p.total}</td>
                    <td onClick={e => e.stopPropagation()}>
                      {p.tel && (
                        <a href={waUrl(p.tel, msg)} target="natuclinic_wa" className="btn btn-wa" style={{ padding: '4px 9px', fontSize: 11 }}
                          onClick={() => markSent(p.id)}
                          dangerouslySetInnerHTML={{ __html: WA_SVG + ' WA' }} />
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {totPg > 1 && (
          <div style={{ padding: '10px 18px', borderTop: '1px solid var(--bord)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {page > 1 && <button className="btn btn-s" style={{ padding: '5px 11px', fontSize: 12 }} onClick={() => setLocalPage(p => p - 1)}>← Ant</button>}
            <span style={{ fontSize: 12.5, color: 'var(--txt2)' }}>Página {page} / {totPg}</span>
            {page < totPg && <button className="btn btn-s" style={{ padding: '5px 11px', fontSize: 12 }} onClick={() => setLocalPage(p => p + 1)}>Próx →</button>}
          </div>
        )}
      </div>
    </div>
  )
}
