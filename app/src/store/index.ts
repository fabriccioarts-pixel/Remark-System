import { create } from 'zustand'
import { DEFAULT_STAGES } from '../lib/constants'
import { persist as persistStorage, loadPersist } from '../lib/storage'
import { buildPatients, parseCSV, mergeRows, rmkCat, readFileWithEncoding } from '../lib/csv'
import { SB } from '../lib/supabase'
import type { Patient, Stage, WaConfig, VoucherConfig, NoteEntry, VoucherEntry, FollowupEntry, PageId, Period } from '../lib/types'
import type { RawRow } from '../lib/csv'

interface CRMStore {
  // data
  patients: Patient[]
  kanban: Record<string, string>
  rmkSent: Record<string, boolean>
  birthdates: Record<string, string>
  vouchers: Record<string, VoucherEntry>
  notes: Record<string, NoteEntry[]>
  followups: Record<string, FollowupEntry>
  voucherConfig: VoucherConfig
  waConfig: WaConfig
  stages: Stage[]
  // ui
  page: PageId
  q: string
  rmkFilter: string
  period: Period
  kbBdayOnly: boolean
  toast: string
  modalContent: React.ReactNode | null
  loaded: boolean

  // actions
  init: () => Promise<void>
  setPage: (p: PageId) => void
  setQ: (q: string) => void
  setRmkFilter: (f: string) => void
  setPeriod: (p: Period) => void
  setKbBdayOnly: (v: boolean) => void
  showToast: (msg: string, ms?: number) => void
  openModal: (content: React.ReactNode) => void
  closeModal: () => void

  // data mutations
  importCSV: (file: File) => Promise<void>
  setKanban: (id: string, stageId: string) => void
  markSent: (id: string) => void
  toggleSent: (id: string, v: boolean) => void
  markAllSent: () => void
  resetRmk: () => void
  saveBday: (id: string, val: string) => void
  addNote: (patientId: string, text: string) => void
  deleteNote: (patientId: string, idx: number) => void
  setFollowup: (patientId: string, date: string, note: string) => void
  clearFollowup: (patientId: string) => void
  genVoucher: (patientId: string) => VoucherEntry
  markVoucherSent: (patientId: string) => void
  saveVoucherConfig: (cfg: VoucherConfig) => void
  saveWaConfig: (cfg: WaConfig) => void
  saveStages: (stages: Stage[]) => void
  saveNewLead: (data: { nome: string; tel: string; email: string; cpf: string; bday: string; proc: string; obs: string }) => void
  deletePat: (id: string) => void
  importBdays: (file: File) => Promise<void>
  sendViaAPI: (patientId: string) => Promise<void>
}

function getState(store: CRMStore) {
  return {
    patients: store.patients,
    kanban: store.kanban,
    rmkSent: store.rmkSent,
    birthdates: store.birthdates,
    vouchers: store.vouchers,
    notes: store.notes,
    followups: store.followups,
    voucherConfig: store.voucherConfig,
    waConfig: store.waConfig,
    stages: store.stages,
  }
}

let toastTimer: ReturnType<typeof setTimeout> | null = null

export const useCRM = create<CRMStore>((set, get) => ({
  patients: [],
  kanban: {},
  rmkSent: {},
  birthdates: {},
  vouchers: {},
  notes: {},
  followups: {},
  voucherConfig: { discount: '10%' },
  waConfig: { token: '', phoneNumberId: '', templateName: 'hello_world', enabled: false },
  stages: JSON.parse(JSON.stringify(DEFAULT_STAGES)),
  page: 'dashboard',
  q: '',
  rmkFilter: 'all',
  period: 'all',
  kbBdayOnly: false,
  toast: '',
  modalContent: null,
  loaded: false,

  init: async () => {
    const loaded = await loadPersist()
    const migrate: Record<string, string> = { lead: 'entrar', conf: 'retornou' }
    const kanban = { ...(loaded.kanban || {}) }
    Object.keys(kanban).forEach(id => { if (migrate[kanban[id]]) kanban[id] = migrate[kanban[id]] })

    // rebuild patients with merged kanban after migration
    let patients = loaded.patients || []
    if (patients.length && Object.keys(kanban).length) {
      patients = patients.map(p => ({ ...p, stage: kanban[p.id] || p.stage }))
    }

    set({
      patients,
      kanban,
      rmkSent: loaded.rmkSent || {},
      birthdates: loaded.birthdates || {},
      vouchers: loaded.vouchers || {},
      notes: loaded.notes || {},
      followups: loaded.followups || {},
      voucherConfig: loaded.voucherConfig || { discount: '10%' },
      waConfig: loaded.waConfig || { token: '', phoneNumberId: '', templateName: 'hello_world', enabled: false },
      stages: loaded.stages || JSON.parse(JSON.stringify(DEFAULT_STAGES)),
      loaded: true,
    })
  },

  setPage: (p) => set({ page: p }),
  setQ: (q) => set({ q }),
  setRmkFilter: (f) => set({ rmkFilter: f }),
  setPeriod: (p) => set({ period: p }),
  setKbBdayOnly: (v) => set({ kbBdayOnly: v }),

  showToast: (msg, ms = 3000) => {
    set({ toast: msg })
    if (toastTimer) clearTimeout(toastTimer)
    toastTimer = setTimeout(() => set({ toast: '' }), ms)
  },

  openModal: (content) => { set({ modalContent: content }) },
  closeModal: () => set({ modalContent: null }),

  importCSV: async (file) => {
    const s = get()
    try {
      const txt = await readFileWithEncoding(file)
      const newRows = parseCSV(txt)
      if (!newRows.length) { s.showToast('❌ Arquivo inválido'); return }

      let existingRows: RawRow[] = []
      try { const raw = localStorage.getItem('nc_rows'); if (raw) existingRows = JSON.parse(raw) } catch { }

      const isFirst = existingRows.length === 0
      const { merged, added } = mergeRows(existingRows, newRows)
      localStorage.setItem('nc_rows', JSON.stringify(merged))

      const patients = buildPatients(merged, get().kanban)
      set({ patients })
      persistStorage({ ...getState(get()), patients })

      s.showToast(isFirst ? `✅ ${patients.length} pacientes carregados` : `✅ ${added} novos · ${patients.length} total`)
      if (isFirst) set({ page: 'remarketing' })
    } catch (e: unknown) {
      s.showToast('❌ Erro: ' + (e as Error).message)
    }
  },

  setKanban: (id, stageId) => {
    const kanban = { ...get().kanban, [id]: stageId }
    set({ kanban })
    persistStorage({ ...getState(get()), kanban })
  },

  markSent: (id) => {
    const { stages, kanban, rmkSent, showToast } = get()
    const newRmk = { ...rmkSent, [id]: true }
    const newKanban = { ...kanban }
    if (stages.length >= 2) {
      const cur = kanban[id] || stages[0].id
      const curIdx = stages.findIndex(s => s.id === cur)
      if (curIdx <= 0) newKanban[id] = stages[1].id
    }
    set({ rmkSent: newRmk, kanban: newKanban })
    persistStorage({ ...getState(get()), rmkSent: newRmk, kanban: newKanban })
    showToast('✅ Mensagem registrada · Kanban avançado')
  },

  toggleSent: (id, v) => {
    const rmkSent = { ...get().rmkSent, [id]: v }
    set({ rmkSent })
    persistStorage({ ...getState(get()), rmkSent })
  },

  markAllSent: () => {
    const { patients, rmkSent } = get()
    const newRmk = { ...rmkSent }
    patients.forEach(p => { newRmk[p.id] = true })
    set({ rmkSent: newRmk })
    persistStorage({ ...getState(get()), rmkSent: newRmk })
    get().showToast('✅ Todos marcados como enviados')
  },

  resetRmk: () => {
    set({ rmkSent: {} })
    persistStorage({ ...getState(get()), rmkSent: {} })
    get().showToast('✅ Remarketing resetado')
  },

  saveBday: (id, val) => {
    const birthdates = { ...get().birthdates }
    if (val) birthdates[id] = val
    else delete birthdates[id]
    set({ birthdates })
    persistStorage({ ...getState(get()), birthdates })
  },

  addNote: (patientId, text) => {
    if (!text.trim()) return
    const notes = { ...get().notes }
    const existing = notes[patientId] || []
    notes[patientId] = [...existing, { date: new Date().toISOString(), text: text.trim() }]
    set({ notes })
    persistStorage({ ...getState(get()), notes })
  },

  deleteNote: (patientId, idx) => {
    const notes = { ...get().notes }
    notes[patientId] = (notes[patientId] || []).filter((_, i) => i !== idx)
    set({ notes })
    persistStorage({ ...getState(get()), notes })
  },

  setFollowup: (patientId, date, note) => {
    const followups = { ...get().followups, [patientId]: { date, note } }
    set({ followups })
    persistStorage({ ...getState(get()), followups })
  },

  clearFollowup: (patientId) => {
    const followups = { ...get().followups }
    delete followups[patientId]
    set({ followups })
    persistStorage({ ...getState(get()), followups })
  },

  genVoucher: (patientId) => {
    const now = new Date()
    const key = `${patientId}-${now.getFullYear()}-${now.getMonth() + 1}`
    const existing = get().vouchers[key]
    if (existing) return existing
    const code = 'NATU' + patientId.slice(-4).toUpperCase() + String(now.getMonth() + 1).padStart(2, '0') + String(now.getFullYear()).slice(-2)
    const voucher: VoucherEntry = { code, sent: false, sentAt: null, usedAt: null, createdAt: now.toISOString() }
    const vouchers = { ...get().vouchers, [key]: voucher }
    set({ vouchers })
    persistStorage({ ...getState(get()), vouchers })
    return voucher
  },

  markVoucherSent: (patientId) => {
    const now = new Date()
    const key = `${patientId}-${now.getFullYear()}-${now.getMonth() + 1}`
    if (!get().vouchers[key]) get().genVoucher(patientId)
    const vouchers = { ...get().vouchers }
    vouchers[key] = { ...vouchers[key], sent: true, sentAt: now.toISOString() }
    set({ vouchers })
    persistStorage({ ...getState(get()), vouchers })
  },

  saveVoucherConfig: (cfg) => {
    set({ voucherConfig: cfg })
    persistStorage({ ...getState(get()), voucherConfig: cfg })
  },

  saveWaConfig: (cfg) => {
    set({ waConfig: cfg })
    persistStorage({ ...getState(get()), waConfig: cfg })
  },

  saveStages: (stages) => {
    set({ stages })
    persistStorage({ ...getState(get()), stages })
  },

  saveNewLead: ({ nome, tel, email, cpf, bday, proc, obs }) => {
    if (!nome.trim()) return
    const leadId = String(Date.now())
    const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const newRow: RawRow = {
      'Paciente': `${leadId} - ${nome}`,
      'CPF': cpf, 'Telefone': tel, 'Email': email,
      'Data do agendamento': today, 'Hora': '',
      'Tipo de Atendimento': proc || 'Lead',
      'Status': obs || 'Lead',
      'Médico': '',
    }
    let rows: RawRow[] = []
    try { rows = JSON.parse(localStorage.getItem('nc_rows') || '[]') } catch { }
    rows.unshift(newRow)
    localStorage.setItem('nc_rows', JSON.stringify(rows))

    const kanban = { ...get().kanban, [leadId]: 'entrar' }
    const birthdates = { ...get().birthdates }
    if (bday?.match(/^\d{2}\/\d{2}$/)) birthdates[leadId] = bday

    const patients = buildPatients(rows, kanban)
    set({ patients, kanban, birthdates })
    persistStorage({ ...getState(get()), patients, kanban, birthdates })
    get().showToast('✅ Lead adicionado!')
  },

  deletePat: (id) => {
    let rows: RawRow[] = []
    try { rows = JSON.parse(localStorage.getItem('nc_rows') || '[]') } catch { }
    const filtered = rows.filter(r => {
      const raw = r['Paciente'] || ''
      const m = raw.match(/^(\d+)/)
      return (m ? m[1] : null) !== id
    })
    localStorage.setItem('nc_rows', JSON.stringify(filtered))

    const kanban = { ...get().kanban }; delete kanban[id]
    const rmkSent = { ...get().rmkSent }; delete rmkSent[id]
    const birthdates = { ...get().birthdates }; delete birthdates[id]
    const patients = buildPatients(filtered, kanban)

    set({ patients, kanban, rmkSent, birthdates })
    persistStorage({ ...getState(get()), patients, kanban, rmkSent, birthdates })
    get().closeModal()
    get().showToast('🗑️ Paciente removido.')
  },

  importBdays: async (file) => {
    const s = get()
    try {
      const txt = await readFileWithEncoding(file)
      const normalized = txt.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
      const lines = normalized.split('\n').filter(l => l.trim())
      if (lines.length < 2) { s.showToast('❌ Arquivo inválido'); return }
      const sep = lines[0].includes(';') ? ';' : ','
      const hdr = lines[0].split(sep).map(h => h.trim())
      const idCol = hdr.findIndex(h => h === 'ID Amigo' || h === 'ID')
      const bdCol = hdr.findIndex(h => h.includes('Nasc'))
      if (idCol < 0 || bdCol < 0) { s.showToast('❌ Colunas "ID Amigo" e "Data Nasc." não encontradas'); return }

      let ok = 0, skip = 0
      const birthdates = { ...get().birthdates }
      lines.slice(1).forEach(l => {
        const cols = l.split(sep).map(c => c.trim())
        const id = cols[idCol], raw = cols[bdCol]
        if (!id || !raw) return
        const parts = raw.split('/')
        if (parts.length < 2) return
        const ddmm = parts[0].padStart(2, '0') + '/' + parts[1].padStart(2, '0')
        if (!/^\d{2}\/\d{2}$/.test(ddmm)) return
        const patient = get().patients.find(p => p.id === id)
        if (!patient) { skip++; return }
        birthdates[id] = ddmm; ok++
      })

      set({ birthdates })
      persistStorage({ ...getState(get()), birthdates })
      s.showToast(`✅ ${ok} aniversários importados · ${skip} IDs não encontrados`)
    } catch (e: unknown) {
      s.showToast('❌ ' + (e as Error).message)
    }
  },

  sendViaAPI: async (patientId) => {
    const { patients, waConfig, showToast, markSent } = get()
    const p = patients.find(x => x.id === patientId)
    if (!p || !p.tel) { showToast('Paciente sem telefone'); return }
    const phone = p.tel.replace(/\D/g, '')
    const fullPhone = phone.startsWith('55') ? phone : '55' + phone
    try {
      const { data, error } = await SB.functions.invoke('dynamic-responder', {
        body: { to: fullPhone, token: waConfig.token, phoneNumberId: waConfig.phoneNumberId, templateName: waConfig.templateName || 'hello_world', patientName: p.nome }
      })
      if (error) throw new Error(error.message || JSON.stringify(error))
      if (!(data as { ok?: boolean })?.ok) throw new Error((data as Record<string, unknown>)?.error as string || 'Erro API')
      markSent(patientId)
      showToast('✅ Mensagem enviada via API WhatsApp!')
    } catch (e: unknown) {
      showToast('❌ ' + (e as Error).message)
    }
  },
}))

// helpers used across pages
export function filt(patients: Patient[], q: string, period: Period): Patient[] {
  let res = patients
  if (q) {
    const lq = q.toLowerCase()
    res = res.filter(p =>
      p.nome.toLowerCase().includes(lq) ||
      p.tel.includes(lq) ||
      p.cpf.includes(lq) ||
      (p.last?.tipo || '').toLowerCase().includes(lq)
    )
  }
  if (period !== 'all') {
    const now = new Date()
    res = res.filter(p => {
      if (!p.last?.data) return false
      const parts = p.last.data.split('/')
      const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
      if (isNaN(d.getTime())) return false
      const diff = (now.getTime() - d.getTime()) / 86400000
      if (period === '30') return diff <= 30
      if (period === '90') return diff <= 90
      if (period === '180') return diff <= 180
      if (period === 'year') return d.getFullYear() === now.getFullYear()
      return true
    })
  }
  return res
}

export function filtAtend(patients: Patient[], period: Period) {
  const all = patients.flatMap(p => p.atend)
  if (period === 'all') return all
  const now = new Date()
  return all.filter(a => {
    if (!a.data) return false
    const parts = a.data.split('/')
    const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
    if (isNaN(d.getTime())) return false
    const diff = (now.getTime() - d.getTime()) / 86400000
    if (period === '30') return diff <= 30
    if (period === '90') return diff <= 90
    if (period === '180') return diff <= 180
    if (period === 'year') return d.getFullYear() === now.getFullYear()
    return true
  })
}

export function patientRmkCat(p: Patient): string {
  return rmkCat(p.last?.tipo || '', p.last?.status || '')
}

export function dueFollowups(patients: Patient[], followups: Record<string, FollowupEntry>): (Patient & { followup: FollowupEntry })[] {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(23, 59, 59, 999)
  return patients
    .filter(p => followups[p.id] && new Date(followups[p.id].date + 'T23:59:59') <= tomorrow)
    .map(p => ({ ...p, followup: followups[p.id] }))
    .sort((a, b) => a.followup.date.localeCompare(b.followup.date))
}

export function thisMonthBdays(patients: Patient[], birthdates: Record<string, string>): Patient[] {
  const mm = String(new Date().getMonth() + 1).padStart(2, '0')
  return patients
    .filter(p => { const b = birthdates[p.id]; return b && b.slice(3, 5) === mm })
    .sort((a, b) => parseInt(birthdates[a.id] || '99') - parseInt(birthdates[b.id] || '99'))
}
