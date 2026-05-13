import { useState, useRef } from 'react'
import { useCRM } from '../../store'

const PRESETS = ['5%', '10%', '15%', '20%', '25%', '30%']

export function VoucherConfigModal() {
  const { voucherConfig, saveVoucherConfig, closeModal, showToast } = useCRM()
  const [selected, setSelected] = useState(PRESETS.includes(voucherConfig.discount) ? voucherConfig.discount : '')
  const customRef = useRef<HTMLInputElement>(null)

  const handleSave = () => {
    const custom = customRef.current?.value.trim()
    const final = custom || selected || voucherConfig.discount
    saveVoucherConfig({ discount: final })
    closeModal()
    showToast('Desconto salvo!')
  }

  return (
    <div>
      <div className="modal-title" style={{ marginBottom: 18 }}>Configurar Voucher de Aniversário</div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11.5, color: 'var(--txt2)', fontWeight: 600, marginBottom: 6 }}>PERCENTUAL DE DESCONTO</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PRESETS.map(d => (
            <button key={d} onClick={() => { setSelected(d); if (customRef.current) customRef.current.value = '' }}
              style={{ padding: '7px 14px', background: 'var(--surf3)', border: `1px solid ${selected === d ? 'var(--gold)' : 'var(--bord)'}`, borderRadius: 7, cursor: 'pointer', color: selected === d ? 'var(--gold)' : 'var(--txt2)', fontSize: 13, fontWeight: 600 }}>
              {d}
            </button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11.5, color: 'var(--txt2)', fontWeight: 600, marginBottom: 6 }}>OU VALOR PERSONALIZADO</div>
        <input ref={customRef}
          defaultValue={!PRESETS.includes(voucherConfig.discount) ? voucherConfig.discount : ''}
          placeholder="Ex: 50 reais, Consulta grátis..."
          onChange={() => setSelected('')}
          style={{ width: '100%', background: 'var(--surf3)', border: '1px solid var(--bord2)', borderRadius: 7, padding: '8px 11px', color: 'var(--txt)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={handleSave} className="btn btn-wa" style={{ flex: 1, justifyContent: 'center' }}>Salvar</button>
        <button onClick={closeModal} style={{ padding: '8px 14px', background: 'var(--surf2)', border: '1px solid var(--bord)', borderRadius: 7, cursor: 'pointer', color: 'var(--txt2)' }}>Cancelar</button>
      </div>
    </div>
  )
}
