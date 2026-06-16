import { useCRM, filt, filtAtend } from '../../store'
import { parseDate } from '../../lib/utils'

function buildFunnelShapes(fStages: { lbl: string; sub: string; val: number; grad: [string, string] }[], total: number) {
  const maxVal = fStages[0]?.val || 1
  const widths = fStages.map(s => s.val === 0 ? 3 : Math.max(8, s.val / maxVal * 100))
  return fStages.map((s, i) => {
    const wTop = widths[i], wBot = i === fStages.length - 1 ? 3 : widths[i + 1]
    const tl = (100 - wTop) / 2, tr = (100 + wTop) / 2, bl = (100 - wBot) / 2, br = (100 + wBot) / 2
    const prev = fStages[i - 1]
    const dropPct = prev && prev.val > 0 ? (s.val / prev.val * 100) : 100
    const ofBase = total > 0 ? (s.val / total * 100) : 0
    return (
      <div key={s.lbl} style={{ display: 'flex', alignItems: 'center', marginBottom: i === fStages.length - 1 ? 0 : 4, height: 78 }}>
        <div style={{
          flex: '0 0 58%', height: '100%',
          clipPath: `polygon(${tl.toFixed(2)}% 0%,${tr.toFixed(2)}% 0%,${br.toFixed(2)}% 100%,${bl.toFixed(2)}% 100%)`,
          background: `linear-gradient(160deg,${s.grad[0]} 0%,${s.grad[1]} 100%)`,
          filter: 'drop-shadow(0 3px 8px rgba(0,0,0,.5))',
        }} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 14 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.grad[0], flexShrink: 0, boxShadow: `0 0 0 3px ${s.grad[0]}33` }} />
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--txt2)', letterSpacing: 1 }}>{s.lbl}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.grad[0], lineHeight: 1.1 }}>{s.val.toLocaleString('pt-BR')}</div>
            <div style={{ fontSize: 10, marginTop: 1 }}>
              {i === 0
                ? <span style={{ color: 'var(--txt3)' }}>100% da base</span>
                : dropPct < 100
                  ? <span style={{ color: '#F87171' }}>▼ {(100 - dropPct).toFixed(0)}% drop · {ofBase.toFixed(1)}% da base</span>
                  : <span style={{ color: '#34D399' }}>= sem perda</span>
              }
            </div>
          </div>
        </div>
      </div>
    )
  })
}

export function Funnel() {
  const { patients, kanban, stages, q, period } = useCRM()
  const pts = filt(patients, q, period)
  const all = filtAtend(patients, period)
  const now = new Date()

  const stageIdx = (id: string) => {
    const i = stages.findIndex(s => s.id === (kanban[id] || stages[0]?.id))
    return i < 0 ? 0 : i
  }

  const activeStages = stages.filter(s => s.id !== 'nao')
  const grads: [string, string][] = [
    ['#4F46E5', '#231C77'], ['#8B5CF6', '#411A8B'], ['#EC4899', '#88114A'],
    ['#F43F5E', '#8B0A29'], ['#F59E0B', '#854106'], ['#10B981', '#075E43'], ['#14B8A6', '#0C5752'],
  ]

  const fStages = activeStages.map((st, i) => ({
    lbl: st.label.toUpperCase(), sub: '',
    val: pts.filter(p => stageIdx(p.id) >= i && kanban[p.id] !== 'nao').length,
    grad: grads[i] || grads[grads.length - 1],
  }))

  const avancaram = pts.filter(p => stageIdx(p.id) >= 1 && kanban[p.id] !== 'nao').length
  const convertidos = pts.filter(p => stageIdx(p.id) >= activeStages.length - 1 && kanban[p.id] !== 'nao').length

  const comTel = pts.filter(p => p.tel?.trim()).length
  const semTel = pts.length - comTel
  const urgente = pts.filter(p => {
    if (!p.last?.data) return false
    const d = parseDate(p.last.data)
    return d && (now.getTime() - d.getTime()) / 86400000 > 180
  }).length
  const atencao = pts.filter(p => {
    if (!p.last?.data) return false
    const d = parseDate(p.last.data)
    if (!d) return false
    const days = (now.getTime() - d.getTime()) / 86400000
    return days > 90 && days <= 180
  }).length

  const tbreak: Record<string, { t: number; c: number; x: number; f: number }> = {}
  all.forEach(a => {
    if (!a.tipo) return
    if (!tbreak[a.tipo]) tbreak[a.tipo] = { t: 0, c: 0, x: 0, f: 0 }
    tbreak[a.tipo].t++
    const s = (a.status || '').toLowerCase()
    if (s === 'confirmado') tbreak[a.tipo].c++
    else if (s === 'cancelou') tbreak[a.tipo].x++
    else if (s === 'faltou') tbreak[a.tipo].f++
  })
  const topT = Object.entries(tbreak).sort((a, b) => b[1].t - a[1].t).slice(0, 10)

  const stats = [
    { lbl: 'Urgente', val: urgente, sub: '>180d sem retorno', bg: 'rgba(239,68,68,.12)', tc: '#F87171' },
    { lbl: 'Atenção', val: atencao, sub: '90–180d · janela ideal', bg: 'rgba(245,158,11,.12)', tc: '#FBBF24' },
    { lbl: 'Pendente', val: comTel, sub: 'Com tel · alcançável', bg: 'rgba(201,168,76,.1)', tc: 'var(--gold)' },
    { lbl: 'Sem telefone', val: semTel, sub: 'Fora do alcance WA', bg: 'rgba(255,255,255,.04)', tc: 'var(--txt3)' },
  ]

  return (
    <div className="content">
      <div style={{ display: 'grid', gridTemplateColumns: '500px 1fr', gap: 20, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ border: '1px solid rgba(201,168,76,.3)' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gold)', marginBottom: 4 }}>Funil de Vendas</div>
            <div style={{ fontSize: 11.5, color: 'var(--txt3)', marginBottom: 20 }}>Jornada de todos os pacientes no Kanban</div>
            {buildFunnelShapes(fStages, pts.length)}
            <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--bord)', display: 'flex', gap: 20 }}>
              <div>
                <div style={{ fontSize: 10.5, color: 'var(--txt3)' }}>Conversão Total da Base</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--gold)' }}>{pts.length > 0 ? (convertidos / pts.length * 100).toFixed(1) : 0}%</div>
              </div>
              <div>
                <div style={{ fontSize: 10.5, color: 'var(--txt3)' }}>Taxa de Avanço (Pipeline Ativo)</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#34D399' }}>{pts.length > 0 ? (avancaram / pts.length * 100).toFixed(1) : 0}%</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gold)', marginBottom: 12 }}>Oportunidades na Base</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {stats.map(s => (
                <div key={s.lbl} style={{ background: s.bg, borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: 21, fontWeight: 800, color: s.tc, lineHeight: 1 }}>{s.val.toLocaleString('pt-BR')}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: s.tc, marginTop: 3 }}>{s.lbl}</div>
                  <div style={{ fontSize: 10, color: 'var(--txt3)', marginTop: 2 }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gold)', marginBottom: 4 }}>Conversão por Procedimento</div>
          <div style={{ fontSize: 11.5, color: 'var(--txt3)', marginBottom: 16 }}>Taxa de confirmação histórica por tipo de atendimento</div>
          <div style={{ overflowY: 'auto', maxHeight: 620, paddingRight: 4 }}>
            {topT.map(([tipo, d]) => {
              const taxa = d.t > 0 ? (d.c / d.t * 100) : 0
              const cor = taxa >= 70 ? '#34D399' : taxa >= 50 ? '#FBBF24' : '#F87171'
              return (
                <div key={tipo} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5, flexWrap: 'wrap', gap: 4 }}>
                    <span style={{ fontSize: 12.5, color: 'var(--txt)', fontWeight: 600, flex: 1 }}>{tipo}</span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 10.5, color: 'var(--txt3)' }}>{d.t} total</span>
                      <span style={{ fontSize: 10.5, color: '#34D399' }}>✓{d.c}</span>
                      <span style={{ fontSize: 10.5, color: '#F87171' }}>✗{d.x}</span>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: cor, background: cor + '22', padding: '2px 8px', borderRadius: 5 }}>{taxa.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div style={{ background: 'var(--surf3)', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ background: cor, height: 8, borderRadius: 4, width: `${taxa}%`, transition: 'width 1s' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
