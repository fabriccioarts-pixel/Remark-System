import type { Patient } from './types'
import { parseDate } from './utils'

function fixEnc(s: string): string {
  return s
    .replace(/Ã§/g,'ç').replace(/Ã£/g,'ã').replace(/Ã¡/g,'á').replace(/Ã©/g,'é')
    .replace(/Ã³/g,'ó').replace(/Ãº/g,'ú').replace(/Ã­/g,'í').replace(/Ã‡/g,'Ç')
    .replace(/Ã•/g,'Õ').replace(/Ã‚/g,'Â').replace(/Ã‰/g,'É').replace(/Ã"/g,'Ó')
    .replace(/Ã/g,'Á').replace(/Ã¢/g,'â').replace(/Ãµ/g,'õ').replace(/Ã"/g,'Ô')
    .replace(/Ã´/g,'ô').replace(/Ãª/g,'ê').replace(/Ã€/g,'À').replace(/Ã¨/g,'è')
    .replace(/Ã¼/g,'ü').replace(/Ã¶/g,'ö').replace(/Ã¤/g,'ä').replace(/Ã®/g,'î')
    .replace(/Ã»/g,'û').replace(/Ã«/g,'ë').replace(/Ã¯/g,'ï')
}

function csvSplitLine(line: string, sep: string): string[] {
  const cols: string[] = []
  let cur = '', inQ = false
  for (const ch of line) {
    if (ch === '"') { inQ = !inQ }
    else if (ch === sep && !inQ) { cols.push(cur); cur = '' }
    else { cur += ch }
  }
  cols.push(cur)
  return cols
}

export type RawRow = Record<string, string>

export function parseCSV(txt: string): RawRow[] {
  txt = txt.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines = txt.split('\n').filter(l => l.trim())
  if (lines.length < 2) return []
  const firstLine = lines[0]
  const sep = firstLine.split(',').length >= firstLine.split(';').length ? ',' : ';'
  const needsFix = firstLine.includes('Ã') || firstLine.includes('â€')
  const fix = (s: string) => needsFix ? fixEnc(s) : s
  const hdr = csvSplitLine(firstLine, sep).map(h => fix(h.trim()))
  return lines.slice(1).map(l => {
    const cols = csvSplitLine(l, sep).map(c => fix(c.trim()))
    const row: RawRow = {}
    hdr.forEach((h, i) => { row[h] = cols[i] || '' })
    return row
  }).filter(r => r['Paciente']?.trim())
}

export function rowKey(r: RawRow): string {
  const raw = r['Paciente'] || ''
  const m = raw.match(/^(\d+)/)
  const pid = m ? m[1] : raw.trim().toLowerCase()
  return `${pid}|${(r['Data do agendamento'] || '').trim()}|${(r['Hora'] || '').trim()}`
}

export function mergeRows(existing: RawRow[], incoming: RawRow[]): { merged: RawRow[]; added: number } {
  const seen = new Set(existing.map(rowKey))
  let added = 0
  incoming.forEach(r => {
    const k = rowKey(r)
    if (k && !seen.has(k)) { existing.push(r); seen.add(k); added++ }
  })
  return { merged: existing, added }
}

export function buildPatients(rows: RawRow[], kanban: Record<string, string>): Patient[] {
  const map = new Map<string, Patient>()
  rows.forEach(r => {
    const raw = r['Paciente'] || ''
    const m = raw.match(/^(\d+)\s*-\s*(.+)$/)
    if (!m) return
    const id = m[1], nome = m[2].trim()
    if (!map.has(id)) {
      map.set(id, { id, nome, cpf: r['CPF'] || '', tel: r['Telefone'] || '', email: r['Email'] || '', atend: [], last: null, total: 0, stage: 'base' })
    }
    const p = map.get(id)!
    if (!p.tel && r['Telefone']) p.tel = r['Telefone']
    if (!p.email && r['Email']) p.email = r['Email']
    p.atend.push({
      data: r['Data do agendamento'] || '',
      hora: r['Hora'] || '',
      tipo: r['Tipo de Atendimento'] || '',
      status: r['Status'] || '',
      medico: r['Médico'] || '',
    })
  })
  const pts = Array.from(map.values())
  pts.forEach(p => {
    p.atend.sort((a, b) => {
      const da = parseDate(a.data), db = parseDate(b.data)
      return ((db?.getTime() || 0) - (da?.getTime() || 0))
    })
    p.last = p.atend[0] || null
    p.total = p.atend.length
    p.stage = kanban[p.id] || 'base'
  })
  return pts.sort((a, b) => {
    const da = a.last ? parseDate(a.last.data) : null
    const db = b.last ? parseDate(b.last.data) : null
    return ((db?.getTime() || 0) - (da?.getTime() || 0))
  })
}

export function rmkCat(tipo: string, status: string): string {
  const norm = (s: string) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 -]/g, '')
  const t = norm(tipo), s = norm(status)
  if (s === 'cancelou' || s === 'cancelado') return 'cancelou'
  if (s === 'faltou') return 'faltou'
  if (s === 'nao confirmado' || s === 'nao-confirmado') return 'ortomol'
  if (t.includes('botox')) return 'botox'
  if (t.includes('harmoniz')) return 'harmoniz'
  if (t.includes('intra-articular') || t.includes('intraarticular')) return 'intrart'
  if (t.includes('ortomolecular') || t.includes('consulta')) return 'ortomol'
  if (t.includes('retorno')) return 'retorno'
  if (t.includes('ozonio') || t.includes('ozonioterapia')) return 'ozonio'
  if (t.includes('reabilit')) return 'reab'
  if (t.includes('injetavel') || t.includes('vitamina') || t.includes('adek') ||
      t.includes('trio') || t.includes('pool') || t.includes('chronic') ||
      t.includes('pisk') || t.includes('beg') || t.includes('enzima')) return 'injet'
  if (t.includes('estetica') || t.includes('limpeza') || t.includes('avalia') ||
      t.includes('spa') || t.includes('lipocrio') || t.includes('protocolo')) return 'estetica'
  return 'ortomol'
}

export function readFileWithEncoding(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r1 = new FileReader()
    r1.onload = ev => {
      const txt = ev.target!.result as string
      if (txt.includes('�')) {
        const r2 = new FileReader()
        r2.onload = ev2 => resolve(ev2.target!.result as string)
        r2.onerror = reject
        r2.readAsText(file, 'windows-1252')
      } else {
        resolve(txt)
      }
    }
    r1.onerror = reject
    r1.readAsText(file, 'utf-8')
  })
}
