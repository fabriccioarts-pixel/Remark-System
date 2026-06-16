import { useCRM, filt } from '../../store'

function buildFunnelShapes(fStages: { lbl: string; val: number; grad: [string, string] }[], _comTel: number, rowH = 62, rowGap = 3) {
  const maxVal = fStages[0]?.val || 1
  const widths = fStages.map(s => s.val === 0 ? 3 : Math.max(8, s.val / maxVal * 100))
  return fStages.map((s, i) => {
    const wTop = widths[i], wBot = i === fStages.length - 1 ? 3 : widths[i + 1]
    const tl = (100 - wTop) / 2, tr = (100 + wTop) / 2, bl = (100 - wBot) / 2, br = (100 + wBot) / 2
    return (
      <div key={s.lbl} style={{ display: 'flex', alignItems: 'center', marginBottom: i === fStages.length - 1 ? 0 : rowGap, height: rowH }}>
        <div style={{
          flex: '0 0 58%', height: '100%',
          clipPath: `polygon(${tl.toFixed(2)}% 0%,${tr.toFixed(2)}% 0%,${br.toFixed(2)}% 100%,${bl.toFixed(2)}% 100%)`,
          background: `linear-gradient(160deg,${s.grad[0]} 0%,${s.grad[1]} 100%)`,
          filter: 'drop-shadow(0 3px 8px rgba(0,0,0,.5))',
        }} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 14 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.grad[0], flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 9.5, fontWeight: 800, color: 'var(--txt2)', letterSpacing: 1 }}>{s.lbl}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.grad[0], lineHeight: 1.1 }}>{s.val.toLocaleString('pt-BR')}</div>
          </div>
        </div>
      </div>
    )
  })
}

export function FunnelPreview() {
  const { patients, kanban, stages, q, period, setPage } = useCRM()
  const pts = filt(patients, q, period)

  const stageIdx = (id: string) => {
    const i = stages.findIndex(s => s.id === (kanban[id] || stages[0]?.id))
    return i < 0 ? 0 : i
  }

  const activeStages = stages.filter(s => s.id !== 'nao')
  const grads: [string, string][] = [
    ['#4F46E5', '#231C77'], ['#8B5CF6', '#411A8B'], ['#EC4899', '#88114A'],
    ['#F43F5E', '#8B0A29'], ['#F59E0B', '#854106'], ['#10B981', '#075E43'],
  ]

  const fStages = activeStages.map((st, i) => ({
    lbl: st.label.toUpperCase(),
    val: pts.filter(p => stageIdx(p.id) >= i && kanban[p.id] !== 'nao').length,
    grad: grads[i] || grads[grads.length - 1],
  }))

  const convertidos = pts.filter(p => stageIdx(p.id) >= activeStages.length - 1 && kanban[p.id] !== 'nao').length
  const avancaram = pts.filter(p => stageIdx(p.id) >= 1 && kanban[p.id] !== 'nao').length

  return (
    <div className="card" style={{ border: '1px solid rgba(201,168,76,.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gold)' }}>Funil de Remarketing</div>
          <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 2 }}>Jornada dos pacientes da base até a conversão</div>
        </div>
        <button className="btn btn-s" style={{ padding: '5px 10px', fontSize: 11.5 }} onClick={() => setPage('funnel')}>Ver detalhes</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'center' }}>
        <div>{buildFunnelShapes(fStages, pts.length)}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {fStages.map(s => (
            <div key={s.lbl} style={{ background: s.grad[1] + '22', border: `1px solid ${s.grad[0]}44`, borderRadius: 8, padding: 10 }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: s.grad[0], letterSpacing: .8, marginBottom: 3 }}>{s.lbl}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.grad[0] }}>{s.val.toLocaleString('pt-BR')}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--bord)', display: 'flex', gap: 24 }}>
        <div>
          <div style={{ fontSize: 10.5, color: 'var(--txt3)' }}>Conversão Total da Base</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--gold)' }}>
            {pts.length > 0 ? (convertidos / pts.length * 100).toFixed(1) : 0}%
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10.5, color: 'var(--txt3)' }}>Taxa de Avanço</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#34D399' }}>
            {pts.length > 0 ? (avancaram / pts.length * 100).toFixed(1) : 0}%
          </div>
        </div>
      </div>
    </div>
  )
}
