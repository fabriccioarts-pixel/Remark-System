export interface Atendimento {
  data: string
  hora: string
  tipo: string
  status: string
  medico: string
}

export interface Patient {
  id: string
  nome: string
  cpf: string
  tel: string
  email: string
  atend: Atendimento[]
  last: Atendimento | null
  total: number
  stage: string
  cat?: string
  dias?: number
}

export interface Stage {
  id: string
  label: string
  ico: string
  dot: string
}

export interface VoucherEntry {
  code: string
  sent: boolean
  sentAt: string | null
  usedAt: string | null
  createdAt: string
}

export interface NoteEntry {
  date: string
  text: string
}

export interface WaConfig {
  token: string
  phoneNumberId: string
  templateName: string
  enabled: boolean
}

export interface VoucherConfig {
  discount: string
}

export type PageId = 'dashboard' | 'patients' | 'remarketing' | 'kanban' | 'funnel' | 'bdays'

export type Period = 'all' | '30' | '90' | '180' | 'year'
