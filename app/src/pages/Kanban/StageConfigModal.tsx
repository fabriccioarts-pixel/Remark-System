import { useState, useRef } from 'react'
import { useCRM } from '../../store'
import { STAGE_COLORS, DEFAULT_STAGES } from '../../lib/constants'
import type { Stage } from '../../lib/types'

export function StageConfigModal() {
  const { stages, saveStages, closeModal, showToast } = useCRM()
  const [localStages, setLocalStages] = useState<Stage[]>(stages.map(s => ({ ...s })))
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({})

  const syncLabels = (arr: Stage[]) => {
    return arr.map((s, i) => ({ ...s, label: inputRefs.current[i]?.value.trim() || s.label }))
  }

  const move = (i: number, dir: number) => {
    const arr = syncLabels([...localStages])
    const j = i + dir
    if (j < 0 || j >= arr.length) return
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
    setLocalStages(arr)
  }

  const remove = (i: number) => {
    if (localStages.length <= 1) return
    const arr = syncLabels([...localStages])
    arr.splice(i, 1)
    setLocalStages(arr)
  }

  const addStage = () => {
    const arr = syncLabels([...localStages])
    arr.push({ id: 's_' + Date.now(), label: 'Nova Etapa', ico: 'msg', dot: '#5A6080' })
    setLocalStages(arr)
  }

  const pickColor = (i: number, color: string) => {
    const arr = syncLabels([...localStages])
    arr[i] = { ...arr[i], dot: color }
    setLocalStages(arr)
  }

  const handleSave = () => {
    const final = localStages.map((s, i) => ({ ...s, label: inputRefs.current[i]?.value.trim() || s.label })).filter(s => s.label)
    saveStages(final)
    closeModal()
    showToast('✅ Etapas salvas!')
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div className="modal-title">Configurar Etapas</div>
        <button onClick={() => setLocalStages(JSON.parse(JSON.stringify(DEFAULT_STAGES)))}
          style={{ fontSize: 11, color: 'var(--txt3)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
          Restaurar padrão
        </button>
      </div>

      {localStages.map((s, i) => (
        <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--bord)' }}>
          <div style={{ position: 'relative' }}>
            <ColorPicker dot={s.dot} onChange={c => pickColor(i, c)} />
          </div>
          <input ref={el => { inputRefs.current[i] = el }} defaultValue={s.label}
            style={{ flex: 1, background: 'var(--surf3)', border: '1px solid var(--bord2)', borderRadius: 6, padding: '6px 9px', color: 'var(--txt)', fontSize: 13, outline: 'none' }} />
          <button onClick={() => move(i, -1)} disabled={i === 0}
            style={{ width: 26, height: 26, background: 'var(--surf3)', border: '1px solid var(--bord)', borderRadius: 5, cursor: 'pointer', color: 'var(--txt2)', fontSize: 13, opacity: i === 0 ? .3 : 1 }}>↑</button>
          <button onClick={() => move(i, 1)} disabled={i === localStages.length - 1}
            style={{ width: 26, height: 26, background: 'var(--surf3)', border: '1px solid var(--bord)', borderRadius: 5, cursor: 'pointer', color: 'var(--txt2)', fontSize: 13, opacity: i === localStages.length - 1 ? .3 : 1 }}>↓</button>
          <button onClick={() => remove(i)} disabled={localStages.length <= 1}
            style={{ width: 26, height: 26, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 5, cursor: 'pointer', color: '#F87171', fontSize: 13, opacity: localStages.length <= 1 ? .3 : 1 }}>✕</button>
        </div>
      ))}

      <button onClick={addStage} className="btn btn-s" style={{ width: '100%', justifyContent: 'center', marginTop: 12, padding: 8 }}>+ Adicionar Etapa</button>
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button onClick={handleSave} className="btn btn-wa" style={{ flex: 1, justifyContent: 'center' }}>Salvar</button>
        <button onClick={closeModal} className="btn btn-s" style={{ flex: 1, justifyContent: 'center' }}>Cancelar</button>
      </div>
    </div>
  )
}

function ColorPicker({ dot, onChange }: { dot: string; onChange: (c: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div onClick={() => setOpen(o => !o)}
        style={{ width: 18, height: 18, borderRadius: '50%', background: dot, cursor: 'pointer', border: '2px solid rgba(255,255,255,.15)' }} />
      {open && (
        <div style={{ position: 'absolute', top: 24, left: 0, background: 'var(--surf2)', border: '1px solid var(--bord2)', borderRadius: 8, padding: 7, zIndex: 100, display: 'flex', flexWrap: 'wrap', gap: 5, width: 152 }}>
          {STAGE_COLORS.map(c => (
            <div key={c} onClick={() => { onChange(c); setOpen(false) }}
              style={{ width: 20, height: 20, borderRadius: '50%', background: c, cursor: 'pointer', border: `2px solid ${dot === c ? '#fff' : 'transparent'}` }} />
          ))}
        </div>
      )}
    </>
  )
}
