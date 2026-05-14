import { SB } from './supabase'
import { buildPatients } from './csv'
import { DEFAULT_STAGES } from './constants'
import type { Stage, WaConfig, VoucherConfig, NoteEntry, VoucherEntry, FollowupEntry, VipEntry } from './types'

export interface AppState {
  patients: ReturnType<typeof buildPatients>
  kanban: Record<string, string>
  rmkSent: Record<string, boolean>
  birthdates: Record<string, string>
  vouchers: Record<string, VoucherEntry>
  notes: Record<string, NoteEntry[]>
  followups: Record<string, FollowupEntry>
  vipData: Record<string, VipEntry>
  voucherConfig: VoucherConfig
  waConfig: WaConfig
  stages: Stage[]
}

let sbSaveTimer: ReturnType<typeof setTimeout> | null = null

function ls(key: string, val?: string): string | null {
  if (val !== undefined) { try { localStorage.setItem(key, val) } catch { } return val }
  try { return localStorage.getItem(key) } catch { return null }
}

function parse<T>(s: string | null | T, fallback: T): T {
  if (s === null || s === undefined) return fallback
  if (typeof s !== 'string') return s as T
  try { return JSON.parse(s) } catch { return fallback }
}

export function persist(state: AppState): void {
  ls('nc_kanban', JSON.stringify(state.kanban))
  ls('nc_rmk', JSON.stringify(state.rmkSent))
  ls('nc_bday', JSON.stringify(state.birthdates))
  ls('nc_vouchers', JSON.stringify(state.vouchers))
  ls('nc_vconfig', JSON.stringify(state.voucherConfig))
  ls('nc_waconfig', JSON.stringify(state.waConfig))
  ls('nc_stages', JSON.stringify(state.stages))
  ls('nc_notes', JSON.stringify(state.notes))
  ls('nc_followups', JSON.stringify(state.followups))
  ls('nc_vip', JSON.stringify(state.vipData))
  ls('nc_updated', new Date().toISOString())

  if (sbSaveTimer) clearTimeout(sbSaveTimer)
  sbSaveTimer = setTimeout(() => sbSave(state), 1500)
}

async function sbSave(state: AppState): Promise<void> {
  const now = ls('nc_updated') || new Date().toISOString()
  try {
    const rows = ls('nc_rows') || '[]'
    const vConf = {
      ...state.voucherConfig,
      _sys: { notes: state.notes, stages: state.stages, waConfig: state.waConfig, followups: state.followups, vipData: state.vipData },
    }
    const payload = {
      id: 'natuclinic',
      kanban: JSON.stringify(state.kanban),
      rmk_sent: JSON.stringify(state.rmkSent),
      birthdates: JSON.stringify(state.birthdates),
      vouchers: JSON.stringify(state.vouchers),
      voucher_config: JSON.stringify(vConf),
      patients_raw: rows,
      updated_at: now,
    }
    const { error } = await SB.from('crm_state').upsert(payload, { onConflict: 'id' })
    if (!error) { ls('nc_sb_ts', now); return }

    // fallback: try without updated_at (table may not have that column)
    const { updated_at: _ua, ...payloadNoTs } = payload
    const { error: err2 } = await SB.from('crm_state').upsert(payloadNoTs, { onConflict: 'id' })
    if (!err2) { ls('nc_sb_ts', now) }
    else console.warn('sbSave failed:', err2.message)
  } catch (e: unknown) {
    console.warn('Supabase offline:', (e as Error).message)
  }
}

export async function loadPersist(): Promise<Partial<AppState>> {
  let sbData: Record<string, unknown> | null = null
  try {
    const { data, error } = await SB.from('crm_state').select('*').eq('id', 'natuclinic').single()
    if (!error && data) sbData = data as Record<string, unknown>
    else if (error) console.warn('Supabase load error:', error.message)
  } catch (e: unknown) {
    console.warn('Supabase offline:', (e as Error).message)
  }

  const localTs = ls('nc_updated')
  const sbTs = ls('nc_sb_ts')
  const sbUpdated = sbData?.updated_at as string | undefined

  let preferLocal = !!(localTs && (!sbTs || new Date(localTs) > new Date(sbTs)))
  if (sbUpdated && localTs && new Date(sbUpdated) > new Date(localTs)) preferLocal = false

  const getS = (key: string, sbKey?: string) =>
    preferLocal
      ? (ls('nc_' + key) ?? sbData?.[sbKey || key])
      : (sbData?.[sbKey || key] ?? ls('nc_' + key))

  const result: Partial<AppState> = {}

  try {
    const k = getS('kanban'); if (k) result.kanban = parse(k as string, {})
    const r = getS('rmk', 'rmk_sent'); if (r) result.rmkSent = parse(r as string, {})
    const b = getS('bday', 'birthdates'); if (b) result.birthdates = parse(b as string, {})
    const v = getS('vouchers'); if (v) result.vouchers = parse(v as string, {})

    const vc = getS('vconfig', 'voucher_config')
    let sysData: Record<string, unknown> | null = null
    if (vc) {
      const parsed = parse(vc as string, {} as Record<string, unknown>)
      if (parsed && parsed._sys) {
        sysData = parsed._sys as Record<string, unknown>
        const { _sys: _, ...clean } = parsed
        result.voucherConfig = clean as unknown as VoucherConfig
      } else {
        result.voucherConfig = parsed as unknown as VoucherConfig
      }
    }

    const wc = (sysData?.waConfig ?? getS('waconfig', 'wa_config'))
    if (wc) result.waConfig = parse(wc as string, { token: '', phoneNumberId: '', templateName: 'hello_world', enabled: false })

    const nts = (sysData?.notes ?? getS('notes'))
    if (nts) result.notes = parse(nts as string, {})

    // followups stored in _sys (no separate Supabase column needed)
    const fu = sysData?.followups ?? getS('followups')
    result.followups = fu ? parse(fu as string, {}) : {}

    const vip = sysData?.vipData ?? getS('vip')
    result.vipData = vip ? parse(vip as string, {}) : {}

    const st = (sysData?.stages ?? getS('stages'))
    const stParsed = parse(st as string, [] as Stage[])
    result.stages = Array.isArray(stParsed) && stParsed.length ? stParsed : JSON.parse(JSON.stringify(DEFAULT_STAGES))

    // patients_raw: dedicated Supabase column has priority over _sys.rows legacy
    const sbRaw = sbData?.patients_raw as string | null
    const p = preferLocal
      ? (ls('nc_rows') ?? sbRaw)
      : (sbRaw ?? ls('nc_rows'))

    if (p) {
      if (p !== ls('nc_rows')) ls('nc_rows', p)
      const rows = parse(p, [])
      result.patients = buildPatients(rows, result.kanban || {})
    }
  } catch (e) {
    console.error('Load error:', e)
  }

  return result
}
