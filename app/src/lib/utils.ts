export function fn(nome: string): string {
  if (!nome) return 'paciente'
  const p = nome.trim().split(' ')[0]
  return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()
}

export function fmtPhone(p: string): string {
  if (!p) return ''
  const d = p.replace(/\D/g, '')
  return d.length >= 10 ? (d.startsWith('55') ? d : '55' + d) : ''
}

export function getInitials(n: string): string {
  if (!n) return '?'
  const p = n.trim().split(' ').filter(x => x.length > 1)
  if (p.length === 0) return n.trim()[0]?.toUpperCase() || '?'
  if (p.length === 1) return p[0].substring(0, 2).toUpperCase()
  return (p[0][0] + p[p.length - 1][0]).toUpperCase()
}

export function waUrl(phone: string, msg: string): string {
  const n = fmtPhone(phone)
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(msg)}` : '#'
}

export function parseDate(s: string): Date | null {
  if (!s) return null
  const [d, m, y] = s.split('/')
  if (!d || !m || !y) return null
  return new Date(`${y}-${m}-${d}`)
}

export function daysSince(s: string): number {
  const d = parseDate(s)
  if (!d) return 9999
  return Math.floor((Date.now() - d.getTime()) / 86400000)
}

export function fmtDate(s: string | undefined): string {
  if (!s) return '–'
  const d = parseDate(s)
  if (!d) return s
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function fmtDateTime(s: string | undefined, hora: string | undefined): string {
  if (!s) return '–'
  const d = parseDate(s)
  if (!d) return s
  const dt = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
  return hora ? `${dt} às ${hora}` : dt
}

export function timeAgo(s: string | undefined): string {
  if (!s) return '?'
  const d = parseDate(s)
  if (!d) return '?'
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  const hrs = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  const months = Math.floor(days / 30.44)
  const years = Math.floor(days / 365.25)
  if (mins < 60) return `${mins}min`
  if (hrs < 24) return `${hrs}h`
  if (days < 30) return `${days} dias`
  if (months < 12) {
    const rem = days - Math.floor(months * 30.44)
    return rem > 0
      ? `${months} ${months === 1 ? 'mês' : 'meses'} e ${rem}d`
      : `${months} ${months === 1 ? 'mês' : 'meses'}`
  }
  const remM = months - years * 12
  return remM > 0
    ? `${years} ${years === 1 ? 'ano' : 'anos'} e ${remM} ${remM === 1 ? 'mês' : 'meses'}`
    : `${years} ${years === 1 ? 'ano' : 'anos'}`
}

export function badgeClass(status: string): string {
  const k = (status || '').toLowerCase()
  if (k === 'confirmado') return 'bc'
  if (k === 'cancelou') return 'bx'
  if (k === 'faltou') return 'bf'
  return 'bn'
}

export function copyTxt(txt: string, toastFn: (msg: string) => void): void {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(txt).then(() => toastFn('✅ Mensagem copiada!')).catch(() => fallbackCopy(txt, toastFn))
  } else {
    fallbackCopy(txt, toastFn)
  }
}

function fallbackCopy(txt: string, toastFn: (msg: string) => void): void {
  const ta = document.createElement('textarea')
  ta.value = txt
  ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none'
  document.body.appendChild(ta)
  ta.select()
  try { document.execCommand('copy'); toastFn('✅ Mensagem copiada!') }
  catch { toastFn('⚠️ Erro ao copiar') }
  finally { document.body.removeChild(ta) }
}
