import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const [clientsRes, proposalsRes, tasksRes, activitiesRes] = await Promise.all([
    supabase.from('clients').select('id, etapa, valor, created_at'),
    supabase.from('proposals').select('id, total, status, created_at'),
    supabase.from('tasks').select('*').gte('date', new Date().toISOString().split('T')[0]).order('time').limit(4),
    supabase.from('client_activities').select('*, clients(empresa)').order('created_at', { ascending: false }).limit(4),
  ])

  const clients = clientsRes.data ?? []
  const proposals = proposalsRes.data ?? []
  const tasks = tasksRes.data ?? []
  const activities = activitiesRes.data ?? []

  const totalClients = clients.length
  const propEnviadas = proposals.filter(p => p.status !== 'rascunho').length
  const propAceitas = proposals.filter(p => p.status === 'aceita').length
  const receitaAcum = proposals.filter(p => p.status === 'aceita').reduce((s, p) => s + (p.total ?? 0), 0)
  const taxaConv = propEnviadas > 0 ? ((propAceitas / propEnviadas) * 100).toFixed(1) : '0.0'

  const etapas = ['Prospecção', 'Qualificação', 'Proposta', 'Negociação', 'Ganho']
  const widths = [100, 75, 58, 38, 24]
  const bgs = [
    'rgba(106,158,196,0.35)', 'rgba(168,143,196,0.35)', 'rgba(217,168,44,0.45)',
    'rgba(196,160,106,0.45)', 'rgba(127,179,138,0.6)',
  ]
  const funnelMini = etapas.map((label, i) => ({
    label,
    value: clients.filter(c => c.etapa === label).length,
    width: `${widths[i]}%`,
    bg: bgs[i],
  }))

  // Revenue: últimos 6 meses
  const now = new Date()
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    return {
      label: d.toLocaleDateString('pt-BR', { month: 'short' }),
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
    }
  })
  const maxRev = 600000
  const revenue = months.map(m => {
    const total = proposals
      .filter(p => p.status === 'aceita' && p.created_at?.startsWith(m.key))
      .reduce((s, p) => s + (p.total ?? 0), 0)
    const h = Math.max(6, Math.round((total / maxRev) * 160))
    return { label: m.label, value: total > 0 ? `R$${(total / 1000).toFixed(0)}k` : '—', h: `${h}px`, bg: total > 0 ? 'var(--gold)' : '#1f1d22' }
  })

  return NextResponse.json({ totalClients, propEnviadas, receitaAcum, taxaConv, funnelMini, revenue, tasks, activities })
}
