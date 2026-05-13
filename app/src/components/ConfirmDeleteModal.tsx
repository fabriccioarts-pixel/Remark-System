import { useCRM } from '../store'
import { ICO } from '../lib/constants'

export function ConfirmDeleteModal({ id, nome }: { id: string; nome: string }) {
  const { deletePat, closeModal } = useCRM()
  return (
    <div style={{ textAlign: 'center', padding: '10px 0' }}>
      <div style={{ fontSize: 32, marginBottom: 12, color: '#F87171' }} dangerouslySetInnerHTML={{ __html: ICO.x }} />
      <div className="modal-title" style={{ marginBottom: 8 }}>Excluir paciente?</div>
      <div style={{ fontSize: 13, color: 'var(--txt2)', marginBottom: 20 }}>
        <b style={{ color: 'var(--txt)' }}>{nome}</b> será removido permanentemente do CRM.
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => deletePat(id)}
          style={{ flex: 1, padding: 10, background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.4)', borderRadius: 8, cursor: 'pointer', color: '#F87171', fontWeight: 600, fontSize: 13 }}
        >Sim, excluir</button>
        <button onClick={closeModal} className="btn btn-s" style={{ flex: 1, justifyContent: 'center' }}>Cancelar</button>
      </div>
    </div>
  )
}
