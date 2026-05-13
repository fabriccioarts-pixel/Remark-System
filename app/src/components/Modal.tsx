import { useCRM } from '../store'

export function Modal() {
  const modalContent = useCRM(s => s.modalContent)
  const closeModal = useCRM(s => s.closeModal)

  if (!modalContent) return null

  return (
    <div
      className="modal-bg"
      onClick={e => { if (e.target === e.currentTarget) closeModal() }}
    >
      <div className="modal">
        {modalContent}
      </div>
    </div>
  )
}
