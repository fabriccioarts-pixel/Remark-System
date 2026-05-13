import { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import { useCRM, filt, filtAtend, patientRmkCat } from '../../store'
import { ICO, TMPLS, WA_SVG } from '../../lib/constants'
import { waUrl, daysSince, fmtDateTime, timeAgo, getInitials } from '../../lib/utils'
import { FunnelPreview } from './FunnelPreview'

Chart.register(...registerables)

function Kpi({ ico, lbl, val, sub }: { ico: string; lbl: string; val: string; sub: string }) {
  return (
    <div className="kpi">
      <div className="kpi-ico" dangerouslySetInnerHTML={{ __html: ICO[ico] || '' }} />
      <div className="kpi-lbl">{lbl}</div>
      <div className="kpi-val">{val}</div>
      <div className="kpi-sub">{sub}</div>
    </div>
  )
}

export function Dashboard() {
  const { patients, period, q, markSent } = useCRM()
  const monthRef = useRef<HTMLCanvasElement>(null)
  const statusRef = useRef<HTMLCanvasElement>(null)
  const monthChart = useRef<Chart | null>(null)
  const statusChart = useRef<Chart | null>(null)

  const pts = filt(patients, q, period)
  const all = filtAtend(patients, period)
  const conf = all.filter(a => a.status === 'Confirmado').length
  const canc = all.filter(a => a.status === 'Cancelou').length
  const falt = all.filter(a => a.status === 'Faltou').length
  const nconf = all.filter(a => (a.status || '').toLowerCase().includes('não confirmado')).length
  const taxa = all.length ? ((conf / all.length) * 100).toFixed(1) : 0

  const tcount: Record<string, number> = {}
  all.forEach(a => { if (a.tipo) tcount[a.tipo] = (tcount[a.tipo] || 0) + 1 })
  const topT = Object.entries(tcount).sort((a, b) => b[1] - a[1]).slice(0, 8)

  const mdata: Record<string, number> = {}
  all.forEach(a => {
    const parts = (a.data || '').split('/')
    if (parts.length < 3) return
    const k = `${parts[2]}-${parts[1]}`
    mdata[k] = (mdata[k] || 0) + 1
  })
  const months = Object.keys(mdata).sort().slice(-8)
  const mlabels = months.map(m => { const [y, mo] = m.split('-'); return new Date(parseInt(y), parseInt(mo) - 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }) })
  const mvals = months.map(m => mdata[m])

  const needRmk = pts.filter(p => {
    if (!p.last) return false
    const s = (p.last.status || '').toLowerCase()
    return s === 'cancelou' || s === 'faltou' || daysSince(p.last.data) > 120
  })

  useEffect(() => {
    if (monthRef.current) {
      if (monthChart.current) monthChart.current.destroy()
      monthChart.current = new Chart(monthRef.current, {
        type: 'line',
        data: {
          labels: mlabels,
          datasets: [{
            label: 'Atendimentos', data: mvals, borderColor: '#E8C96A', borderWidth: 3, tension: .4,
            pointBackgroundColor: '#C9A84C', pointBorderColor: '#E8C96A', pointBorderWidth: 2, pointRadius: 4, pointHoverRadius: 7,
            fill: true,
            backgroundColor: (ctx) => {
              const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 220)
              g.addColorStop(0, 'rgba(232,201,106,.55)')
              g.addColorStop(0.5, 'rgba(201,168,76,.2)')
              g.addColorStop(1, 'rgba(76,38,26,0)')
              return g
            },
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1A1A1A', borderColor: '#C9A84C', borderWidth: 1, titleColor: '#C9A84C', bodyColor: '#ccc' } },
          scales: { x: { grid: { display: false }, ticks: { color: '#666', font: { size: 10 } } }, y: { grid: { color: 'rgba(201,168,76,.06)' }, ticks: { color: '#666', font: { size: 10 } } } },
        },
      })
    }
    if (statusRef.current) {
      if (statusChart.current) statusChart.current.destroy()
      statusChart.current = new Chart(statusRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Confirmado', 'Cancelou', 'Faltou', 'Não conf.'],
          datasets: [{ data: [conf, canc, falt, nconf], backgroundColor: ['#C9A84C', '#E8C96A', 'rgba(201,168,76,.4)', '#232323'], borderWidth: 0 }],
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { color: '#909090', font: { size: 10 }, padding: 10, boxWidth: 10 } } } },
      })
    }
    return () => {
      monthChart.current?.destroy()
      statusChart.current?.destroy()
    }
  })

  return (
    <div className="content">
      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 14, marginBottom: 22 }}>
        <Kpi ico="users" lbl="Total Pacientes" val={pts.length.toLocaleString('pt-BR')} sub="Base de pacientes" />
        <Kpi ico="check" lbl="Confirmados" val={conf.toLocaleString('pt-BR')} sub={`Taxa ${taxa}%`} />
        <Kpi ico="x" lbl="Cancelamentos" val={canc.toLocaleString('pt-BR')} sub={`${((canc / (all.length || 1)) * 100).toFixed(1)}% do total`} />
        <Kpi ico="warn" lbl="Faltaram" val={falt.toLocaleString('pt-BR')} sub={`${nconf} não confirmados`} />
        <Kpi ico="bell" lbl="Precisa Contato" val={needRmk.length.toLocaleString('pt-BR')} sub="Remarketing urgente" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 18 }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 600, color: 'var(--txt)', marginBottom: 14, fontSize: 14 }}>
            <span dangerouslySetInnerHTML={{ __html: ICO.trend }} /><span>Atendimentos por Mês</span>
          </div>
          <div style={{ height: 220, position: 'relative' }}><canvas ref={monthRef} /></div>
        </div>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 600, color: 'var(--txt)', marginBottom: 14, fontSize: 14 }}>
            <span dangerouslySetInnerHTML={{ __html: ICO.chart }} /><span>Status Geral</span>
          </div>
          <div style={{ height: 220, position: 'relative' }}><canvas ref={statusRef} /></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 600, color: 'var(--txt)', marginBottom: 14, fontSize: 14 }}>
            <span dangerouslySetInnerHTML={{ __html: ICO.clip }} /><span>Top Procedimentos</span>
          </div>
          {topT.map(([t, c], i) => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 9 }}>
              <span style={{ fontSize: 11, color: 'var(--txt3)', width: 18, textAlign: 'right' }}>{i + 1}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 12.5, color: 'var(--txt)', fontWeight: 500 }}>{t}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--gold)' }}>{c}</span>
                </div>
                <div style={{ background: 'var(--surf3)', height: 5, borderRadius: 3 }}>
                  <div style={{ background: i === 0 ? 'var(--gold)' : 'rgba(201,168,76,.35)', height: 5, borderRadius: 3, width: `${(c / topT[0][1] * 100).toFixed(0)}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 600, color: 'var(--txt)', fontSize: 14 }}>
              <span dangerouslySetInnerHTML={{ __html: ICO.send }} /><span>Remarketing Urgente</span>
            </div>
          </div>
          {needRmk.slice(0, 6).map(p => {
            const cat = patientRmkCat(p)
            const tmpl = TMPLS[cat]
            const msg = tmpl ? tmpl.msg(p.nome) : ''
            const wu = p.tel ? waUrl(p.tel, msg) : ''
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 0', borderBottom: '1px solid var(--bord)' }}>
                <div style={{ width: 34, height: 34, background: tmpl?.cor || 'var(--gold4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: (tmpl?.cor || '').startsWith('#') ? '#000' : 'var(--txt)', flexShrink: 0, border: '1px solid rgba(255,255,255,.1)' }}>
                  {getInitials(p.nome)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--txt)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nome}</div>
                  <div style={{ fontSize: 11, color: 'var(--txt2)' }}>{p.last?.tipo || ''}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--txt3)' }}>{fmtDateTime(p.last?.data, p.last?.hora)} · há {timeAgo(p.last?.data)}</div>
                </div>
                {wu && (
                  <a href={wu} target="natuclinic_wa" className="btn btn-wa" style={{ padding: '4px 9px', fontSize: 11 }}
                    onClick={() => markSent(p.id)}
                    dangerouslySetInnerHTML={{ __html: WA_SVG + ' WA' }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <FunnelPreview />
    </div>
  )
}
