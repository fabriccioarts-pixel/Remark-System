import { useRef } from 'react'
import { useCRM } from '../../store'

export function AddLeadModal() {
  const { saveNewLead, closeModal, showToast } = useCRM()
  const nomeRef = useRef<HTMLInputElement>(null)
  const telRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const cpfRef = useRef<HTMLInputElement>(null)
  const bdayRef = useRef<HTMLInputElement>(null)
  const procRef = useRef<HTMLInputElement>(null)
  const obsRef = useRef<HTMLTextAreaElement>(null)

  const handleSave = () => {
    const nome = nomeRef.current?.value.trim() || ''
    if (!nome) { showToast('❌ Nome é obrigatório'); return }
    saveNewLead({
      nome,
      tel: telRef.current?.value.trim() || '',
      email: emailRef.current?.value.trim() || '',
      cpf: cpfRef.current?.value.trim() || '',
      bday: bdayRef.current?.value.trim() || '',
      proc: procRef.current?.value.trim() || '',
      obs: obsRef.current?.value.trim() || '',
    })
    closeModal()
  }

  const inp = (style?: React.CSSProperties): React.CSSProperties => ({
    width: '100%', background: 'var(--surf3)', border: '1px solid var(--bord2)', borderRadius: 7,
    padding: '8px 11px', color: 'var(--txt)', fontSize: 13, outline: 'none', boxSizing: 'border-box', ...style,
  })
  const lbl = { fontSize: 10, color: 'var(--txt3)', fontWeight: 600, letterSpacing: '.6px', marginBottom: 5, display: 'block' as const }

  return (
    <div>
      <div className="modal-title" style={{ marginBottom: 18 }}>Novo Lead</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={lbl}>NOME COMPLETO *</label>
          <input ref={nomeRef} type="text" placeholder="Ex: Maria Silva" style={inp()} autoFocus />
        </div>
        <div>
          <label style={lbl}>TELEFONE</label>
          <input ref={telRef} type="text" placeholder="(61) 99999-9999" style={inp()} />
        </div>
        <div>
          <label style={lbl}>E-MAIL</label>
          <input ref={emailRef} type="email" placeholder="email@exemplo.com" style={inp()} />
        </div>
        <div>
          <label style={lbl}>CPF</label>
          <input ref={cpfRef} type="text" placeholder="000.000.000-00" style={inp()} />
        </div>
        <div>
          <label style={lbl}>NASCIMENTO (DD/MM)</label>
          <input ref={bdayRef} type="text" placeholder="Ex: 15/03" maxLength={5} style={inp()} />
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={lbl}>PROCEDIMENTO DE INTERESSE</label>
          <input ref={procRef} type="text" placeholder="Ex: Botox, Harmonização..." style={inp()} />
        </div>
      </div>
      <div style={{ marginBottom: 18 }}>
        <label style={lbl}>OBSERVAÇÃO</label>
        <textarea ref={obsRef} rows={2} placeholder="Como chegou até a clínica, interesse específico..."
          style={{ ...inp(), resize: 'vertical' }} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={handleSave} className="btn btn-wa" style={{ flex: 1, justifyContent: 'center' }}>Salvar Lead</button>
        <button onClick={closeModal} className="btn btn-s" style={{ flex: 1, justifyContent: 'center' }}>Cancelar</button>
      </div>
    </div>
  )
}
