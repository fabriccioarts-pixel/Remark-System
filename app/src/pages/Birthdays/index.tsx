import { useCRM, thisMonthBdays } from '../../store'
import { waUrl } from '../../lib/utils'
import { WA_SVG } from '../../lib/constants'
import { VoucherConfigModal, DEFAULT_MSG_ANIVERSARIO, DEFAULT_MSG_LIMPEZA } from './VoucherConfigModal'

export function Birthdays() {
  const { patients, birthdates, vouchers, voucherConfig, openModal, markVoucherSent, genVoucher, showToast, importBdays } = useCRM()
  const bdays = thisMonthBdays(patients, birthdates)
  const now = new Date()
  const monthName = now.toLocaleDateString('pt-BR', { month: 'long' })
  const sentCount = bdays.filter(p => {
    const key = `${p.id}-${now.getFullYear()}-${now.getMonth() + 1}`
    return vouchers[key]?.sent
  }).length

  const handleImport = async () => {
    const inp = document.createElement('input')
    inp.type = 'file'; inp.accept = '.csv'
    inp.onchange = async e => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) await importBdays(file)
    }
    inp.click()
  }

  if (bdays.length === 0) {
    return (
      <div className="content">
        <div className="card" style={{ border: '1px solid var(--bord2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ fontWeight: 600, color: 'var(--gold)', fontSize: 14.5 }}>Aniversariantes de {monthName}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={handleImport} style={{ fontSize: 11, padding: '4px 10px', background: 'var(--surf2)', border: '1px solid var(--bord)', borderRadius: 6, cursor: 'pointer', color: 'var(--txt2)' }}>Importar aniversários</button>
              <button onClick={() => openModal(<VoucherConfigModal />)} style={{ fontSize: 11, padding: '4px 10px', background: 'var(--surf2)', border: '1px solid var(--bord)', borderRadius: 6, cursor: 'pointer', color: 'var(--txt2)' }}>Configurar Mensagem</button>
            </div>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--txt3)', padding: '4px 0' }}>Nenhum aniversariante cadastrado este mês. Abra um paciente para adicionar a data de nascimento.</div>
        </div>
      </div>
    )
  }

  const todayList = bdays.filter(p => { const [dd] = (birthdates[p.id] || '').split('/'); return parseInt(dd) === now.getDate() })
  const restList = bdays.filter(p => { const [dd] = (birthdates[p.id] || '').split('/'); return parseInt(dd) !== now.getDate() })

  const BdayRow = ({ p, isToday }: { p: typeof bdays[0]; isToday: boolean }) => {
    const b = birthdates[p.id] || ''
    const [dd, mm] = b.split('/')
    const vkey = `${p.id}-${now.getFullYear()}-${now.getMonth() + 1}`
    const voucher = vouchers[vkey] || genVoucher(p.id)
    const sent = voucher.sent
    const disc = voucherConfig.discount || '10%'
    
    const isLimpeza = voucherConfig.msgType === 'limpeza'
    const template = isLimpeza 
      ? (voucherConfig.msgLimpeza || DEFAULT_MSG_LIMPEZA)
      : (voucherConfig.msgAniversario || DEFAULT_MSG_ANIVERSARIO)
      
    const bdayMsg = template
      .replace(/{nome}/g, p.nome.split(' ')[0])
      .replace(/{desconto}/g, disc)
      .replace(/{codigo}/g, voucher.code)

    const wu = p.tel ? waUrl(p.tel, bdayMsg) : '#'
    const shortName = p.nome.split(' ').slice(0, 3).join(' ')
    const monthAbbr = new Date(2000, parseInt(mm) - 1).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 9, background: isToday ? 'rgba(201,168,76,.08)' : 'transparent', border: `1px solid ${isToday ? 'rgba(201,168,76,.4)' : sent ? 'rgba(16,185,129,.25)' : 'transparent'}` }}>
        <div style={{ width: 36, height: 36, background: isToday ? 'var(--gold)' : 'var(--surf3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: isToday ? '#111' : 'var(--gold)', lineHeight: 1 }}>{dd}</div>
          <div style={{ fontSize: 8, color: isToday ? '#333' : 'var(--txt3)', lineHeight: 1.3, textTransform: 'uppercase' }}>{monthAbbr}</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--txt)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {shortName}
            {isToday && <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--gold)', background: 'rgba(201,168,76,.15)', padding: '1px 6px', borderRadius: 4, marginLeft: 6 }}>hoje</span>}
          </div>
          <div style={{ fontSize: 10.5, color: 'var(--txt3)', marginTop: 1 }}>{p.tel || 'Sem telefone'}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <div style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: 'var(--gold)', letterSpacing: 1, background: 'var(--surf3)', padding: '4px 8px', borderRadius: 6, border: '1px dashed rgba(201,168,76,.3)' }}>{voucher.code}</div>
          <button onClick={() => { navigator.clipboard?.writeText(voucher.code).then(() => showToast('✅ Código copiado!')) }} style={{ fontSize: 10, padding: '3px 7px', background: 'var(--surf2)', border: '1px solid var(--bord)', borderRadius: 5, cursor: 'pointer', color: 'var(--txt2)', whiteSpace: 'nowrap' }}>Copiar</button>
          {p.tel && (
            <a href={wu} target="natuclinic_wa" className="btn btn-wa" style={{ padding: '5px 10px', fontSize: 11, gap: 4 }}
              onClick={() => markVoucherSent(p.id)}
              dangerouslySetInnerHTML={{ __html: WA_SVG + ' Enviar' }} />
          )}
          {sent && <span style={{ fontSize: 10, color: '#34D399', whiteSpace: 'nowrap' }}>Enviado</span>}
        </div>
      </div>
    )
  }

  return (
    <div className="content">
      <div className="card" style={{ border: '1px solid rgba(201,168,76,.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--gold)', fontSize: 14.5 }}>Aniversariantes de {monthName}</div>
            <div style={{ fontSize: 11.5, color: 'var(--txt3)', marginTop: 2 }}>
              {bdays.length} paciente{bdays.length > 1 ? 's' : ''} · {sentCount} voucher{sentCount !== 1 ? 's' : ''} enviado{sentCount !== 1 ? 's' : ''} · Desconto: <b style={{ color: 'var(--gold)' }}>{voucherConfig.discount}</b>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={handleImport} style={{ fontSize: 11.5, padding: '5px 12px', background: 'var(--surf2)', border: '1px solid var(--bord)', borderRadius: 7, cursor: 'pointer', color: 'var(--txt2)' }}>Importar aniversários</button>
            <button onClick={() => openModal(<VoucherConfigModal />)} style={{ fontSize: 11.5, padding: '5px 12px', background: 'var(--surf2)', border: '1px solid var(--bord)', borderRadius: 7, cursor: 'pointer', color: 'var(--txt2)' }}>Configurar Mensagem</button>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {todayList.length > 0 && (
            <>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gold)', letterSpacing: .8, padding: '2px 12px 6px', textTransform: 'uppercase' }}>Hoje</div>
              {todayList.map(p => <BdayRow key={p.id} p={p} isToday />)}
              <div style={{ height: 1, background: 'var(--bord)', margin: '8px 0' }} />
            </>
          )}
          {restList.length > 0 && (
            <>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--txt3)', letterSpacing: .8, padding: '2px 12px 6px', textTransform: 'uppercase' }}>Este mês</div>
              {restList.map(p => <BdayRow key={p.id} p={p} isToday={false} />)}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
