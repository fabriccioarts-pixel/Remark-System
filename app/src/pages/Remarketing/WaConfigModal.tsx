import { useRef } from 'react'
import { useCRM } from '../../store'

export function WaConfigModal() {
  const { waConfig, saveWaConfig, closeModal, showToast } = useCRM()
  const pidRef = useRef<HTMLInputElement>(null)
  const tokRef = useRef<HTMLTextAreaElement>(null)
  const tmplRef = useRef<HTMLInputElement>(null)

  const handleSave = () => {
    const pid = pidRef.current?.value.trim() || ''
    const tok = tokRef.current?.value.trim() || ''
    const tmpl = tmplRef.current?.value.trim() || 'hello_world'
    saveWaConfig({ token: tok, phoneNumberId: pid, templateName: tmpl, enabled: !!(tok && pid) })
    closeModal()
    showToast((tok && pid) ? '✅ API WhatsApp configurada!' : '⚠️ Preencha token e Phone Number ID')
  }

  const inp: React.CSSProperties = { width: '100%', background: 'var(--surf3)', border: '1px solid var(--bord2)', borderRadius: 7, padding: '8px 11px', color: 'var(--txt)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }
  const lbl: React.CSSProperties = { fontSize: 10, color: 'var(--txt3)', fontWeight: 600, letterSpacing: '.6px', marginBottom: 5, display: 'block' }

  return (
    <div>
      <div className="modal-title" style={{ marginBottom: 18 }}>Configurar WhatsApp API</div>
      <div style={{ marginBottom: 13 }}>
        <label style={lbl}>PHONE NUMBER ID</label>
        <input ref={pidRef} type="text" defaultValue={waConfig.phoneNumberId} placeholder="ex: 1040377785833990" style={inp} />
      </div>
      <div style={{ marginBottom: 13 }}>
        <label style={lbl}>TOKEN DE ACESSO</label>
        <textarea ref={tokRef} rows={3} defaultValue={waConfig.token} placeholder="EAASes..."
          style={{ ...inp, resize: 'vertical', fontSize: 11.5, fontFamily: 'monospace' }} />
        <div style={{ fontSize: 10.5, color: 'var(--txt3)', marginTop: 4 }}>Token temporário — regenere no Meta for Developers quando expirar.</div>
      </div>
      <div style={{ marginBottom: 18 }}>
        <label style={lbl}>NOME DO TEMPLATE</label>
        <input ref={tmplRef} type="text" defaultValue={waConfig.templateName} placeholder="hello_world" style={inp} />
        <div style={{ fontSize: 10.5, color: 'var(--txt3)', marginTop: 4 }}>Para testes use <b style={{ color: 'var(--txt2)' }}>hello_world</b>.</div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={handleSave} className="btn btn-wa" style={{ flex: 1, justifyContent: 'center' }}>Salvar</button>
        <button onClick={closeModal} className="btn btn-s" style={{ flex: 1, justifyContent: 'center' }}>Cancelar</button>
      </div>
    </div>
  )
}
