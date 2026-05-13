import { useCRM } from '../store'

export function Toast() {
  const toast = useCRM(s => s.toast)
  return (
    <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>
  )
}
