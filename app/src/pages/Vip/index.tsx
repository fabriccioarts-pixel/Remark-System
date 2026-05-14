import { useCRM } from '../../store'
import { VIP_TIERS, vipTier, fmtBRL } from '../../store'
import { waUrl, getInitials } from '../../lib/utils'
import { WA_SVG, TMPLS } from '../../lib/constants'
import { patientRmkCat } from '../../store'
import { PatientModal } from '../../components/PatientModal'

function ImportVipBtn() {
  const { importVip } = useCRM()
  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) await importVip(f)
    e.target.value = ''
  }
  return (
    <label className="btn btn-p" style={{ cursor: 'pointer', display: 'inline-flex', fontSize: 12, padding: '7px 14px' }}>
      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
      </svg>
      Importar Planilha VIP
      <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handle} />
    </label>
  )
}

export function Vip() {
  const { patients, vipData, markSent, openModal } = useCRM()

  const vipPts = patients
    .filter(p => vipData[p.id])
    .map(p => ({ ...p, vip: vipData[p.id], tier: vipTier(vipData[p.id].total)! }))
    .filter(p => p.tier)
    .sort((a, b) => b.vip.total - a.vip.total)

  if (!Object.keys(vipData).length) {
    return (
      <div className="content">
        <div className="empty">
          <div className="empty-ico">💎</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--txt)', marginBottom: 8 }}>Nenhum dado VIP</div>
          <p style={{ color: 'var(--txt2)', marginBottom: 22, maxWidth: 320, marginLeft: 'auto', marginRight: 'auto' }}>
            Importe a planilha de orçamentos fechados para ver seus pacientes mais valiosos.
          </p>
          <ImportVipBtn />
        </div>
      </div>
    )
  }

  const tierCounts = { diamante: 0, ouro: 0, prata: 0 }
  const tierTotals = { diamante: 0, ouro: 0, prata: 0 }
  vipPts.forEach(p => {
    tierCounts[p.tier]++
    tierTotals[p.tier] += p.vip.total
  })
  const grandTotal = vipPts.reduce((s, p) => s + p.vip.total, 0)

  return (
    <div className="content">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--txt)' }}>💎 Pacientes VIP</div>
          <div style={{ fontSize: 12, color: 'var(--txt3)', marginTop: 2 }}>{vipPts.length} pacientes · {fmtBRL(grandTotal)} em receita total</div>
        </div>
        <ImportVipBtn />
      </div>

      {/* KPIs por tier */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 12, marginBottom: 22 }}>
        {(Object.keys(VIP_TIERS) as (keyof typeof VIP_TIERS)[]).map(t => {
          const tier = VIP_TIERS[t]
          return (
            <div key={t} className="kpi" style={{ borderLeft: `3px solid ${tier.cor}` }}>
              <div className="kpi-lbl" style={{ color: tier.cor }}>{tier.emoji} {tier.label}</div>
              <div className="kpi-val" style={{ color: tier.cor }}>{tierCounts[t]}</div>
              <div className="kpi-sub">{fmtBRL(tierTotals[t])} em orçamentos</div>
              <div style={{ fontSize: 10, color: 'var(--txt3)', marginTop: 2 }}>a partir de {fmtBRL(tier.min)}</div>
            </div>
          )
        })}
      </div>

      {/* Lista */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {vipPts.map((p, idx) => {
          const tier = VIP_TIERS[p.tier]
          const cat = patientRmkCat(p)
          const tmpl = TMPLS[cat]
          const msg = tmpl ? tmpl.msg(p.nome) : ''
          const wu = p.tel ? waUrl(p.tel, msg) : '#'
          return (
            <div key={p.id}
              className="rm-card"
              style={{ borderLeft: `3px solid ${tier.cor}`, cursor: 'pointer' }}
              onClick={() => openModal(<PatientModal patient={p} />)}>
              {/* Rank */}
              <div style={{ width: 28, flexShrink: 0, fontSize: 13, fontWeight: 800, color: idx < 3 ? tier.cor : 'var(--txt3)', textAlign: 'center' }}>
                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
              </div>

              {/* Avatar */}
              <div style={{ width: 40, height: 40, background: tier.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: tier.cor, flexShrink: 0, border: `1px solid ${tier.bord}` }}>
                {getInitials(p.nome)}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 2 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--txt)' }}>{p.nome}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: tier.cor, background: tier.bg, border: `1px solid ${tier.bord}`, borderRadius: 20, padding: '1px 8px' }}>
                    {tier.emoji} {tier.label}
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--txt2)' }}>
                  {p.vip.orcamentos} orçamento{p.vip.orcamentos !== 1 ? 's' : ''} · {p.last?.tipo || '–'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--txt3)' }}>{p.tel || 'Sem telefone'}</div>
              </div>

              {/* Total */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: tier.cor }}>{fmtBRL(p.vip.total)}</div>
                <div style={{ fontSize: 10.5, color: 'var(--txt3)', marginTop: 2 }}>em compras</div>
              </div>

              {/* WA */}
              {p.tel && (
                <div onClick={e => e.stopPropagation()}>
                  <a href={wu} target="natuclinic_wa" className="btn btn-wa" style={{ padding: '5px 9px', fontSize: 11.5 }}
                    onClick={() => markSent(p.id)}
                    dangerouslySetInnerHTML={{ __html: WA_SVG + ' WA' }} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
