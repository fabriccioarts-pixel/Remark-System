import { useEffect, useRef, useState } from 'react'
import { Chart, registerables } from 'chart.js'
import { useCRM, filt, filtAtend, patientRmkCat, fmtBRL } from '../../store'
import { ICO, TMPLS, WA_SVG } from '../../lib/constants'
import { waUrl, daysSince, fmtDateTime, timeAgo, getInitials, parseDate } from '../../lib/utils'
import { FunnelPreview } from './FunnelPreview'

Chart.register(...registerables)

function Kpi({ ico, lbl, val, sub, cor }: { ico: string; lbl: string; val: string; sub: string; cor?: string }) {
  return (
    <div className="kpi" style={cor ? { borderLeft: `3px solid ${cor}` } : undefined}>
      <div className="kpi-ico" style={cor ? { color: cor } : undefined} dangerouslySetInnerHTML={{ __html: ICO[ico] || ICO.folder }} />
      <div className="kpi-lbl">{lbl}</div>
      <div className="kpi-val" style={cor ? { color: cor } : undefined}>{val}</div>
      <div className="kpi-sub">{sub}</div>
    </div>
  )
}

export function Dashboard() {
  const [ticket, setTicket] = useState<number>(() => {
    const saved = localStorage.getItem('nc_ticket')
    return saved ? Number(saved) : 350
  })
  const [topMode, setTopMode] = useState<'count' | 'fat'>('count')
  const { patients, period, q, markSent, vouchers, vipData } = useCRM()

  function editTicket() {
    const raw = window.prompt('Ticket médio por sessão (R$):', String(ticket))
    if (raw === null) return
    const val = parseFloat(raw.replace(',', '.'))
    if (!isNaN(val) && val > 0) { setTicket(val); localStorage.setItem('nc_ticket', String(val)) }
  }
  
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

  // Top Procedimentos
  const tcount: Record<string, number> = {}
  all.forEach(a => { if (a.tipo) tcount[a.tipo] = (tcount[a.tipo] || 0) + 1 })
  const topT = Object.entries(tcount).sort((a, b) => b[1] - a[1]).slice(0, 8)

  // Faturamento real por serviço: distribui o total VIP de cada paciente
  // proporcionalmente entre seus atendimentos no período
  const now = new Date()
  const inPeriod = (data: string) => {
    if (period === 'all') return true
    const parts = data.split('/')
    const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
    if (isNaN(d.getTime())) return false
    const diff = (now.getTime() - d.getTime()) / 86400000
    if (period === '30') return diff <= 30
    if (period === '90') return diff <= 90
    if (period === '180') return diff <= 180
    if (period === 'year') return d.getFullYear() === now.getFullYear()
    return true
  }
  const typeRevReal: Record<string, number> = {}
  let vipPacCount = 0
  pts.forEach(p => {
    const vip = vipData[p.id]
    if (!vip?.total) return
    vipPacCount++
    const atendPeriod = p.atend.filter(a => a.data && inPeriod(a.data))
    const base = atendPeriod.length || p.atend.length
    const perSessao = vip.total / base
    const src = atendPeriod.length ? atendPeriod : p.atend
    src.forEach(a => {
      if (a.tipo) typeRevReal[a.tipo] = (typeRevReal[a.tipo] || 0) + perSessao
    })
  })
  const hasVipRev = vipPacCount > 0

  // Chart Mês
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

  // NEW KPIs Calculations
  // Frequência
  const ptsWithAtend = pts.filter(p => p.total > 0)
  const avgSessoes = ptsWithAtend.length ? ptsWithAtend.reduce((s, p) => s + p.total, 0) / ptsWithAtend.length : 0

  // VIP / Ticket / LTV
  const vipVals = Object.values(vipData)
  const vipTotalRev = vipVals.reduce((s, v) => s + v.total, 0)
  const vipTotalOrc = vipVals.reduce((s, v) => s + v.orcamentos, 0)
  // Ticket médio geral: faturamento total ÷ nº de sessões (orcamentos do VIP, ou nº de pacientes como fallback)
  const ticketReal = vipVals.length > 0
    ? (vipTotalOrc > 0 ? vipTotalRev / vipTotalOrc : vipTotalRev / vipVals.length)
    : null
  const ltvMedio = avgSessoes * (ticketReal || ticket)
  const faturamentoAtual = pts.reduce((sum, p) => sum + (vipData[p.id]?.total || 0), 0)

  // Tempo Médio Retorno
  let sumDays = 0, countGaps = 0
  pts.forEach(p => {
    if (p.atend.length > 1) {
      const dates = p.atend.map(a => parseDate(a.data)).filter(Boolean) as Date[]
      dates.sort((a, b) => a.getTime() - b.getTime())
      for (let i = 1; i < dates.length; i++) {
        sumDays += (dates[i].getTime() - dates[i-1].getTime()) / 86400000
        countGaps++
      }
    }
  })
  const avgRetorno = countGaps > 0 ? (sumDays / countGaps).toFixed(0) : null

  // Conversões
  const vList = Object.values(vouchers)
  const vSent = vList.filter(v => v.sent).length
  const vUsed = vList.filter(v => v.usedAt).length
  const vConv = vSent > 0 ? ((vUsed / vSent) * 100).toFixed(1) : '0.0'

  const ptsConv = pts.filter(p => p.atend.some(a => (a.status || '').toLowerCase() === 'confirmado')).length
  const leadConv = pts.length > 0 ? ((ptsConv / pts.length) * 100).toFixed(1) : '0.0'

  // Faltas por Profissional
  const mFaltas: Record<string, { total: number, faltas: number }> = {}
  all.forEach(a => {
    const med = a.medico || 'Não Especificado'
    if (!mFaltas[med]) mFaltas[med] = { total: 0, faltas: 0 }
    mFaltas[med].total++
    if ((a.status || '').toLowerCase() === 'faltou') mFaltas[med].faltas++
  })
  const profs = Object.entries(mFaltas)
    .filter(([_, d]) => d.total > 0)
    .sort((a, b) => (b[1].faltas / b[1].total) - (a[1].faltas / a[1].total))
    .slice(0, 5)

  // Remarketing
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
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--txt3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Visão Geral</div>
      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14, marginBottom: 20 }}>
        <Kpi ico="users" lbl="Total Pacientes" val={pts.length.toLocaleString('pt-BR')} sub="Base selecionada" />
        <Kpi ico="check" lbl="Confirmados" val={conf.toLocaleString('pt-BR')} sub={`Taxa ${taxa}%`} />
        
        {/*
        <div className="kpi" style={{ borderLeft: '3px solid #34D399' }}>
          <div className="kpi-ico" style={{ color: '#34D399' }} dangerouslySetInnerHTML={{ __html: ICO.money }} />
          <div className="kpi-lbl">Faturamento Atual</div>
          <div className="kpi-val" style={{ color: '#34D399' }}>{fmtBRL(faturamentoAtual)}</div>
          <div className="kpi-sub">Total real de vendas (Planilha VIP)</div>
        </div>

        {ticketReal ? (
          <div className="kpi" style={{ borderLeft: '3px solid var(--gold)' }}>
            <div className="kpi-ico" style={{ color: 'var(--gold)' }} dangerouslySetInnerHTML={{ __html: ICO.award }} />
            <div className="kpi-lbl">Ticket Médio Geral</div>
            <div className="kpi-val" style={{ color: 'var(--gold)' }}>{fmtBRL(ticketReal)}</div>
            <div className="kpi-sub">{vipTotalOrc > 0 ? `Fat. total ÷ ${vipTotalOrc} sessões VIP` : 'Faturamento ÷ nº pacientes VIP'}</div>
          </div>
        ) : (
          <div className="kpi" onClick={editTicket} style={{ cursor: 'pointer', borderLeft: '3px solid rgba(201,168,76,0.3)' }} title="Clique para editar">
            <div className="kpi-ico" dangerouslySetInnerHTML={{ __html: ICO.trend }} />
            <div className="kpi-lbl">Ticket Médio Est.</div>
            <div className="kpi-val">{fmtBRL(ticket)}</div>
            <div className="kpi-sub">por sessão · clique p/ editar</div>
          </div>
        )}

        <Kpi ico="award" lbl="LTV Médio" val={pts.length ? fmtBRL(ltvMedio) : '—'} sub={`${avgSessoes.toFixed(1)} sessões médias por pac.`} />
        */}
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--txt3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Engajamento & Retenção</div>
      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14, marginBottom: 24 }}>
        <Kpi ico="refresh" lbl="Freq. Média" val={`${avgSessoes.toFixed(1)}x`} sub="Consultas por paciente ativo" cor="#60A5FA" />
        <Kpi ico="clock" lbl="Tempo de Retorno" val={avgRetorno ? `${avgRetorno} dias` : '—'} sub="Intervalo médio entre consultas" cor="#A78BFA" />
        <Kpi ico="target" lbl="Conversão da Base" val={`${leadConv}%`} sub={`${ptsConv} pacientes viraram pagantes`} cor="#F472B6" />
        <Kpi ico="money" lbl="Uso de Vouchers" val={`${vConv}%`} sub={`${vUsed} usados de ${vSent} enviados`} cor="#FBBF24" />
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16, marginBottom: 18 }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 600, color: 'var(--txt)', marginBottom: 14, fontSize: 14 }}>
            <span dangerouslySetInnerHTML={{ __html: ICO.clip }} /><span>Top Procedimentos</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
              {/* (['count', 'fat'] as const).map(m => (
                <button key={m} onClick={() => setTopMode(m)} disabled={m === 'fat' && !hasVipRev} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, border: '1px solid var(--bord)', background: topMode === m ? 'var(--gold4)' : 'transparent', color: topMode === m ? 'var(--gold)' : m === 'fat' && !hasVipRev ? 'var(--txt3)' : 'var(--txt3)', cursor: m === 'fat' && !hasVipRev ? 'not-allowed' : 'pointer', opacity: m === 'fat' && !hasVipRev ? 0.4 : 1 }}>
                  {m === 'count' ? 'Sessões' : 'Faturamento'}
                </button>
              )) */}
            </div>
          </div>
          {topMode === 'fat' && <div style={{ fontSize: 10.5, color: 'var(--txt3)', marginBottom: 10 }}>Faturamento real · {vipPacCount} pacientes VIP · total distribuído por sessão</div>}
          {!hasVipRev && topMode === 'fat' && <div style={{ fontSize: 12, color: 'var(--txt3)', padding: '12px 0' }}>Importe a planilha VIP para ver o faturamento real por serviço.</div>}
          {topT.map(([t, c], i) => {
            const revVal = typeRevReal[t] || 0
            const val = topMode === 'fat' ? revVal : c
            const maxRev = Math.max(...topT.map(([tipo]) => typeRevReal[tipo] || 0), 1)
            const maxVal = topMode === 'fat' ? maxRev : topT[0][1]
            return (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 9 }}>
                <span style={{ fontSize: 11, color: 'var(--txt3)', width: 18, textAlign: 'right' }}>{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 12.5, color: 'var(--txt)', fontWeight: 500 }}>{t}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--gold)' }}>{topMode === 'fat' ? fmtBRL(val as number) : c}</span>
                  </div>
                  <div style={{ background: 'var(--surf3)', height: 5, borderRadius: 3 }}>
                    <div style={{ background: i === 0 ? 'var(--gold)' : 'rgba(201,168,76,.35)', height: 5, borderRadius: 3, width: `${((val as number) / maxVal * 100).toFixed(0)}%` }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 600, color: 'var(--txt)', marginBottom: 14, fontSize: 14 }}>
            <span dangerouslySetInnerHTML={{ __html: ICO.warn }} /><span>Taxa de No-Show (Faltas por Profissional)</span>
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--txt3)', marginBottom: 12 }}>Profissionais com maior % de faltas</div>
          {profs.map(([prof, d]) => {
            const perc = (d.faltas / d.total) * 100
            const cor = perc >= 20 ? '#F87171' : perc >= 10 ? '#FBBF24' : '#34D399'
            return (
              <div key={prof} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <span style={{ fontSize: 12.5, color: 'var(--txt)', fontWeight: 600 }}>{prof}</span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 10.5, color: 'var(--txt3)' }}>{d.faltas} de {d.total}</span>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: cor, background: cor + '22', padding: '2px 8px', borderRadius: 5 }}>{perc.toFixed(1)}%</span>
                  </div>
                </div>
                <div style={{ background: 'var(--surf3)', height: 6, borderRadius: 3 }}>
                  <div style={{ background: cor, height: 6, borderRadius: 3, width: `${perc}%` }} />
                </div>
              </div>
            )
          })}
          {profs.length === 0 && <div style={{ fontSize: 12, color: 'var(--txt3)' }}>Nenhum dado de faltas encontrado.</div>}
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 600, color: 'var(--txt)', fontSize: 14 }}>
              <span dangerouslySetInnerHTML={{ __html: ICO.send }} /><span>Remarketing Urgente</span>
            </div>
          </div>
          {needRmk.slice(0, 5).map(p => {
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
