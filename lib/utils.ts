export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date))
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

export const ETAPA_COLORS: Record<string, { color: string; bg: string }> = {
  'Prospecção':   { color: '#6a9ec4', bg: 'rgba(106,158,196,0.12)' },
  'Qualificação': { color: '#a88fc4', bg: 'rgba(168,143,196,0.12)' },
  'Proposta':     { color: '#d9a82c', bg: 'rgba(217,168,44,0.12)' },
  'Negociação':   { color: '#c4a06a', bg: 'rgba(196,160,106,0.12)' },
  'Ganho':        { color: '#7fb38a', bg: 'rgba(127,179,138,0.12)' },
  'Perdido':      { color: '#c4756a', bg: 'rgba(196,117,106,0.12)' },
}

export const PROPOSAL_STATUS: Record<string, { color: string; bg: string }> = {
  'rascunho': { color: '#8a857c', bg: 'rgba(138,133,124,0.12)' },
  'enviada':  { color: '#d9a82c', bg: 'rgba(217,168,44,0.12)' },
  'aceita':   { color: '#7fb38a', bg: 'rgba(127,179,138,0.12)' },
  'recusada': { color: '#c4756a', bg: 'rgba(196,117,106,0.12)' },
}
