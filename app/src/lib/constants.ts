import type { Stage } from './types'

export const DEFAULT_STAGES: Stage[] = [
  { id: 'base',     label: 'Base de Clientes',   ico: 'users',  dot: '#5A6080' },
  { id: 'contato',  label: 'Em Contato',         ico: 'phone',  dot: '#4A7FA5' },
  { id: 'agend',    label: 'Agendado',           ico: 'cal',    dot: '#B8965A' },
  { id: 'andamento',label: 'Em Andamento',       ico: 'star',   dot: '#4A9E7A' },
  { id: 'nao',      label: 'Não Contatar',       ico: 'x',      dot: '#7A3A3A' },
]

export const STAGE_COLORS = [
  '#5A6080','#4A7FA5','#B8965A','#7C6A3E','#4A9E7A','#7A3A3A',
  '#8B5CF6','#EC4899','#F59E0B','#06B6D4','#10B981','#EF4444',
]

export const WA_SVG = `<svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`

export const ICO: Record<string, string> = {
  users:   `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  check:   `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  x:       `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  warn:    `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  bell:    `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  trend:   `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
  chart:   `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  clip:    `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>`,
  msg:     `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  send:    `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  star:    `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  cal:     `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  target:  `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  award:   `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`,
  folder:  `<svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
  upload:  `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>`,
  phone:   `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.1 6.1l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  syringe: `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><path d="M8.5 2.5l3 3-7 7-3-3z"/><path d="M15.5 9.5l-7 7"/><path d="M21.5 2.5l-3 3"/><path d="M18.5 5.5l-3-3"/><line x1="3" y1="21" x2="7" y2="17"/></svg>`,
  sparkle: `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>`,
  leaf:    `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M17 8C8 10 5.9 16.17 3.82 19.34A1 1 0 0 0 4.93 21C11 21 19 16 21 7c-2.5 2-4.5 2-8 1z"/><path d="M3.82 19.34C3 17 3 15 6 12"/></svg>`,
  refresh: `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`,
  bubble:  `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/></svg>`,
  joint:   `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/></svg>`,
  face:    `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
  pill:    `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M10.5 20.5 3.5 13.5a5 5 0 0 1 7.07-7.07l7 7a5 5 0 0 1-7.07 7.07z"/><line x1="8.5" y1="11.5" x2="15.5" y2="4.5"/></svg>`,
  clock:   `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  sprout:  `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 1 1 4.1C13 10 11.9 9.1 11 7.4c1.3-.2 2.2-.1 3.1.6z"/></svg>`,
  search:  `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  money:   `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
}

export interface TmplDef {
  label: string
  icon: string
  cor: string
  msg: (nome: string) => string
}

function fn(nome: string): string {
  if (!nome) return 'paciente'
  const p = nome.trim().split(' ')[0]
  return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()
}

export const TMPLS: Record<string, TmplDef> = {
  botox: {
    label: 'Botox', icon: 'syringe', cor: '#FFC2C2',
    msg: n => `Olá, ${fn(n)}.\n\nAqui é a equipe da *Natuclinic.*\n\nPassando para te lembrar que o seu *Botox* já está no prazo de manutenção — e cuidar disso na hora certa faz toda a diferença no resultado.\n\nTemos horários disponíveis essa semana.\n\nQuer garantir o seu?\n\n_Natuclinic — Nutrição e Estética Ortomolecular_`,
  },
  harmoniz: {
    label: 'Harmonização Facial', icon: 'sparkle', cor: '#FFC2C2',
    msg: n => `Olá, ${fn(n)}.\n\nAqui é a equipe da *Natuclinic.*\n\nA sua *Harmonização Facial* está no período ideal de manutenção.\n\nCada protocolo tem seu tempo — e respeitar esse ritmo é o que preserva o resultado que você conquistou.\n\nTemos agenda disponível. Vamos marcar?\n\n_Natuclinic — Nutrição e Estética Ortomolecular_`,
  },
  ortomol: {
    label: 'Consulta Ortomolecular', icon: 'leaf', cor: 'rgba(16,185,129,.15)',
    msg: n => `Olá, ${fn(n)}.\n\nAqui é a equipe da *Natuclinic.*\n\nFaz um tempo desde a sua última *Consulta Ortomolecular* — e o acompanhamento contínuo é o que garante que o seu corpo continue respondendo bem.\n\nComo você está se sentindo?\n\nQuer agendar uma reavaliação?\n\n_Natuclinic — Nutrição e Estética Ortomolecular_`,
  },
  retorno: {
    label: 'Retorno Pendente', icon: 'refresh', cor: '#DBEAFE',
    msg: n => `Olá, ${fn(n)}.\n\nAqui é a equipe da *Natuclinic.*\n\nVocê tem um *Retorno* pendente com a gente.\n\nEsse acompanhamento é parte do seu protocolo — e ele existe para garantir que os resultados se mantenham.\n\nTemos horários disponíveis. Quando fica bom pra você?\n\n_Natuclinic — Nutrição e Estética Ortomolecular_`,
  },
  ozonio: {
    label: 'Ozonioterapia', icon: 'bubble', cor: '#E0F2FE',
    msg: n => `Olá, ${fn(n)}.\n\nAqui é a equipe da *Natuclinic.*\n\nSua sessão de *Ozonioterapia* está em aberto.\n\nA frequência das sessões é o que faz o tratamento funcionar de verdade — cada intervalo importa.\n\nVamos remarcar?\n\n_Natuclinic — Nutrição e Estética Ortomolecular_`,
  },
  intrart: {
    label: 'Intra-Articular', icon: 'joint', cor: 'rgba(245,158,11,.15)',
    msg: n => `Olá, ${fn(n)}.\n\nAqui é a equipe da *Natuclinic.*\n\nO seu protocolo de *Intra-Articular* precisa de continuidade para os resultados se consolidarem.\n\nInterromper no meio do processo pode comprometer o que você já investiu.\n\nVamos agendar a próxima sessão?\n\n_Natuclinic — Nutrição e Estética Ortomolecular_`,
  },
  reab: {
    label: 'Reabilitação Intestinal', icon: 'sprout', cor: 'rgba(16,185,129,.15)',
    msg: n => `Olá, ${fn(n)}.\n\nAqui é a equipe da *Natuclinic.*\n\nSeu protocolo de *Reabilitação Intestinal* está em andamento — e a consistência é tudo nesse processo.\n\nSabia que a maioria dos resultados aparece justamente na continuidade do tratamento?\n\nQuer agendar a próxima etapa?\n\n_Natuclinic — Nutrição e Estética Ortomolecular_`,
  },
  estetica: {
    label: 'Estética', icon: 'face', cor: 'rgba(184,150,90,.1)',
    msg: n => `Olá, ${fn(n)}.\n\nAqui é a equipe da *Natuclinic.*\n\nFaz um tempo desde a sua última sessão de *estética* com a gente.\n\nPele bem cuidada não é luxo — é rotina. E sua pele merece essa atenção.\n\nTemos horários disponíveis essa semana. Quer marcar?\n\n_Natuclinic — Nutrição e Estética Ortomolecular_`,
  },
  injet: {
    label: 'Injetáveis', icon: 'pill', cor: '#EDE9FE',
    msg: n => `Olá, ${fn(n)}.\n\nAqui é a equipe da *Natuclinic.*\n\nSua sessão de *Injetáveis* está no prazo de renovação.\n\nManter o protocolo em dia é o que garante os resultados que você já viu — e evita perder o que foi conquistado.\n\nVamos agendar?\n\n_Natuclinic — Nutrição e Estética Ortomolecular_`,
  },
  reativar: {
    label: 'Reativação', icon: 'refresh', cor: 'rgba(139,92,246,.15)',
    msg: n => `Olá, ${fn(n)}! 👋\n\nAqui é a equipe da *Natuclinic.*\n\nFaz um tempinho que não nos vemos, e ficamos com saudades!\n\nSabemos que a rotina é corrida, mas seu bem-estar merece atenção — e a gente está aqui para isso.\n\nQue tal retomarmos seu acompanhamento? Temos condições especiais para pacientes que estão voltando. 💛\n\nQuando você tiver disponibilidade, é só falar!\n\n_Natuclinic — Nutrição e Estética Ortomolecular_`,
  },
  cancelou: {
    label: 'Cancelamento', icon: 'warn', cor: 'rgba(239,68,68,.15)',
    msg: n => `Olá, ${fn(n)}.\n\nAqui é a equipe da *Natuclinic.*\n\nVimos que você precisou cancelar seu agendamento — sem problemas, entendemos que imprevistos acontecem.\n\nMas não queremos que você perca a continuidade do seu cuidado.\n\nQual seria o melhor momento para remarcarmos?\n\n_Natuclinic — Nutrição e Estética Ortomolecular_`,
  },
  faltou: {
    label: 'Faltou', icon: 'clock', cor: 'rgba(245,158,11,.15)',
    msg: n => `Olá, ${fn(n)}.\n\nAqui é a equipe da *Natuclinic.*\n\nNotamos que você não pôde comparecer ao seu agendamento.\n\nSabemos que a vida é corrida — mas seu tratamento foi pensado especialmente para você, e cada sessão conta.\n\nQuer remarcar? Temos horários flexíveis.\n\n_Natuclinic — Nutrição e Estética Ortomolecular_`,
  },
}

export interface CampanhaDef {
  id: string
  label: string
  emoji: string
  cor: string
  preco: string
  meta: string
  publico: string[]
  msg: (nome: string) => string
}

export const CAMPANHAS: CampanhaDef[] = [
  {
    id: 'camp_botox',
    label: 'Botox — Prioridade Máxima',
    emoji: '💉',
    cor: '#FFC2C2',
    preco: '10x de R$ 85,00',
    meta: '20 pacientes',
    publico: ['botox'],
    msg: n => `Olá, ${fn(n)}!\n\nAqui é a equipe da *Natuclinic.*\n\nTemos uma condição especial *esta semana* para o seu Botox:\n\n*10x de R$ 85,00*\n\nE de presente, você ganha um *Peeling Renovador Facial* — sem custo adicional.\n\nÉ a oportunidade ideal para renovar o Botox e já cuidar da pele ao mesmo tempo.\n\nTemos horários disponíveis essa semana. Quer garantir o seu?\n\n_Natuclinic — Nutrição e Estética Ortomolecular_`,
  },
  {
    id: 'camp_harmoniz',
    label: 'Harmonização Facial — Paciente Modelo',
    emoji: '✨',
    cor: '#FEF3C7',
    preco: 'R$ 2.000,00 (10x sem juros)',
    meta: '4 pacientes',
    publico: ['harmoniz', 'estetica'],
    msg: n => `Olá, ${fn(n)}!\n\nAqui é a equipe da *Natuclinic.*\n\nEstamos com uma oportunidade exclusiva esta semana:\n\n*Harmonização Facial — 4ml de ácido hialurônico*\n*R$ 2.000,00 — 10x sem juros*\n\nIsso equivale a R$ 500,00 por ml, em um protocolo supervisionado pela *Dra. Débora.*\n\nAs vagas são limitadas e a seleção é exclusiva. Você foi lembrada porque acreditamos que seria uma candidata perfeita para esse protocolo.\n\nQuer saber mais?\n\n_Natuclinic — Nutrição e Estética Ortomolecular_`,
  },
  {
    id: 'camp_harmone',
    label: 'Harmone Bee — Emagrecimento',
    emoji: '🐝',
    cor: '#D1FAE5',
    preco: 'R$ 3.500,00 (era R$ 6.800)',
    meta: '10 pacientes',
    publico: ['ortomol', 'retorno', 'injet'],
    msg: n => `Olá, ${fn(n)}!\n\nAqui é a equipe da *Natuclinic.*\n\nTemos algo especial para você esta semana — o nosso programa completo de emagrecimento *Harmone Bee:*\n\n- Criolipólise\n- Suplementação completa\n- Cinta modeladora\n- 4 sessões de Detox\n- 6 Retornos de acompanhamento\n- 5 Manejos alimentares\n\n*De R$ 6.800,00 por apenas R$ 3.500,00*\n\nUm programa pensado do início ao fim para você ter resultado real — com acompanhamento em cada etapa.\n\nInteressou? Posso te passar mais detalhes!\n\n_Natuclinic — Nutrição e Estética Ortomolecular_`,
  },
  {
    id: 'camp_renovacao',
    label: 'Renovação Facial',
    emoji: '🌸',
    cor: '#FCE7F3',
    preco: 'R$ 400,00',
    meta: 'Agenda cheia',
    publico: ['estetica', 'harmoniz', 'ortomol'],
    msg: n => `Olá, ${fn(n)}!\n\nAqui é a equipe da *Natuclinic.*\n\nQue tal dar uma renovação à sua pele esta semana?\n\n*Limpeza de Pele + Microagulhamento*\n*R$ 400,00*\n\nUm combo que une renovação celular com estímulo de colágeno — para uma pele com mais textura, viço e luminosidade.\n\nTemos agenda disponível. Quer marcar?\n\n_Natuclinic — Nutrição e Estética Ortomolecular_`,
  },
  {
    id: 'camp_combo_botox',
    label: 'Combo Botox + Revitalização',
    emoji: '💎',
    cor: '#EDE9FE',
    preco: 'R$ 1.399,90',
    meta: 'Agenda cheia',
    publico: ['botox', 'harmoniz'],
    msg: n => `Olá, ${fn(n)}!\n\nAqui é a equipe da *Natuclinic.*\n\nTemos um combo especial para você esta semana:\n\n*Botox + Revitalização Facial*\n*R$ 1.399,90*\n\nUm protocolo completo para suavizar rugas e revitalizar a pele — tudo em um único atendimento.\n\nQuer aproveitar?\n\n_Natuclinic — Nutrição e Estética Ortomolecular_`,
  },
  {
    id: 'camp_massagem',
    label: 'Massagem Relaxante + EZ Body',
    emoji: '💆',
    cor: '#DBEAFE',
    preco: 'R$ 379,90',
    meta: 'Agenda cheia',
    publico: ['reab', 'intrart', 'ozonio'],
    msg: n => `Olá, ${fn(n)}!\n\nAqui é a equipe da *Natuclinic.*\n\nVocê merece um momento só seu.\n\n*Massagem Relaxante + EZ Body*\n*R$ 379,90*\n\nUma experiência para relaxar os músculos, reduzir o estresse e recuperar o equilíbrio — de dentro para fora.\n\nTemos horários disponíveis. Quer agendar?\n\n_Natuclinic — Nutrição e Estética Ortomolecular_`,
  },
  {
    id: 'camp_ouvido',
    label: 'Limpeza de Ouvido',
    emoji: '👂',
    cor: '#F0FDF4',
    preco: 'R$ 89,90',
    meta: 'Agenda cheia',
    publico: ['ortomol', 'retorno'],
    msg: n => `Olá, ${fn(n)}!\n\nAqui é a equipe da *Natuclinic.*\n\nSabia que temos um procedimento rápido e seguro para *limpeza de ouvido*?\n\n*Remoção de cerúmen — R$ 89,90*\n\nÉ rápido, indolor e faz uma diferença enorme no conforto auditivo.\n\nQuer agendar?\n\n_Natuclinic — Nutrição e Estética Ortomolecular_`,
  },
  {
    id: 'camp_drenagem',
    label: 'Drenagem + Hybrius',
    emoji: '💧',
    cor: '#E0F2FE',
    preco: 'R$ 337,00',
    meta: 'Agenda cheia',
    publico: ['estetica', 'reab'],
    msg: n => `Olá, ${fn(n)}!\n\nAqui é a equipe da *Natuclinic.*\n\nPara quem quer leveza e definição corporal, temos uma opção especial:\n\n*Drenagem + Hybrius*\n*R$ 337,00*\n\nReduz retenção de líquidos, proporciona sensação de leveza e auxilia na modelagem corporal.\n\nQuer aproveitar?\n\n_Natuclinic — Nutrição e Estética Ortomolecular_`,
  },
  {
    id: 'camp_labial',
    label: 'Preenchimento Labial + Revitalização',
    emoji: '💋',
    cor: '#FFF1F2',
    preco: 'R$ 950,00',
    meta: 'Agenda cheia',
    publico: ['harmoniz', 'estetica', 'botox'],
    msg: n => `Olá, ${fn(n)}!\n\nAqui é a equipe da *Natuclinic.*\n\nUm combo para quem quer resultados harmoniosos e naturais:\n\n*Preenchimento Labial + Revitalização Facial*\n*R$ 950,00*\n\nLábios mais definidos e hidratados, com pele iluminada e revitalizada — em um único protocolo.\n\nTemos horários disponíveis esta semana. Quer agendar?\n\n_Natuclinic — Nutrição e Estética Ortomolecular_`,
  },
]

export const META: Record<string, { title: string; sub: string }> = {
  dashboard:   { title: 'Dashboard',        sub: 'Visão geral do CRM Natuclinic' },
  campanha:    { title: 'Campanha da Semana', sub: 'Scripts e listas por campanha — envio via WhatsApp' },
  patients:    { title: 'Pacientes',         sub: 'Histórico e gestão de pacientes' },
  remarketing: { title: 'Remarketing',       sub: 'Mensagens personalizadas via WhatsApp' },
  reativar:    { title: 'Reativar',          sub: 'Pacientes sem atendimento há 3–6 meses' },
  kanban:      { title: 'Kanban',            sub: 'Pipeline de atendimento – arraste os cards' },
  funnel:      { title: 'Funil de Vendas',   sub: 'Análise de conversão e distribuição' },
  bdays:       { title: 'Aniversariantes',   sub: 'Remarketing de aniversário com vouchers de desconto' },
}
