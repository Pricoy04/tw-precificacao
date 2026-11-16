import { createClient } from '@/lib/supabase/server'
import { STATUS_TO_ETAPA } from '@/lib/utils'
import { NextResponse } from 'next/server'

const STATUS_ACTIVITY: Record<string, { type: string; icon: string; color: string; label: string }> = {
  enviada:  { type: 'proposta', icon: '📤', color: '#5fa8a3', label: 'enviada ao cliente' },
  aceita:   { type: 'ganho',    icon: '🏆', color: '#7fb38a', label: 'aceita' },
  recusada: { type: 'perdido',  icon: '❌', color: '#c4756a', label: 'recusada' },
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('proposals').select('*, clients(*), proposal_services(*)').eq('id', id).single()
  if (error) return NextResponse.json({ error: 'Proposta não encontrada.' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const body = await request.json()

  // Explicit fields only — avoids errors if body has keys not in the schema
  const patch: Record<string, unknown> = {}
  const allowed = ['empresa','cnpj','contato','cargo','prazo','validade','condicoes','desconto','total','status']
  for (const key of allowed) {
    if (key in body) patch[key] = body[key]
  }

  // Carimba a data real do evento, usada pelos KPIs de "mês atual x anterior"
  if (patch.status === 'enviada') patch.sent_at = new Date().toISOString()
  if (patch.status === 'aceita') patch.accepted_at = new Date().toISOString()

  const { data, error } = await supabase.from('proposals').update(patch).eq('id', id).select().single()
  if (error) { console.error(error); return NextResponse.json({ error: 'Erro ao salvar proposta.' }, { status: 500 }) }

  // Muda o status da proposta move automaticamente a etapa do cliente no CRM
  const novaEtapa = typeof patch.status === 'string' ? STATUS_TO_ETAPA[patch.status] : undefined
  if (novaEtapa && data.client_id) {
    await supabase.from('clients').update({ etapa: novaEtapa }).eq('id', data.client_id)

    const act = STATUS_ACTIVITY[patch.status as string]
    if (act) {
      await supabase.from('client_activities').insert({
        client_id: data.client_id,
        type: act.type,
        icon: act.icon,
        color: act.color,
        text: `Proposta ${data.numero} ${act.label}`,
      })
    }
  }

  return NextResponse.json(data)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  await supabase.from('proposal_services').delete().eq('proposal_id', id)
  const { error } = await supabase.from('proposals').delete().eq('id', id)
  if (error) { console.error(error); return NextResponse.json({ error: 'Erro ao excluir proposta.' }, { status: 500 }) }
  return NextResponse.json({ ok: true })
}
