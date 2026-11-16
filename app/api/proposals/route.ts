import { createClient } from '@/lib/supabase/server'
import { STATUS_TO_ETAPA } from '@/lib/utils'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('proposals')
    .select('*, clients(empresa), proposal_services(*)')
    .order('created_at', { ascending: false })
  if (error) { console.error(error); return NextResponse.json({ error: 'Erro ao buscar propostas.' }, { status: 500 }) }
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  const { services, ...rawData } = body

  const count = await supabase.from('proposals').select('id', { count: 'exact', head: true })
  const numero = `TW-${String((count.count ?? 0) + 1).padStart(3, '0')}`

  // Explicit fields only — avoids schema errors if client sends extra keys
  const allowed = ['client_id','empresa','cnpj','contato','cargo','prazo','validade','condicoes','desconto','total','status']
  const proposalData: Record<string, unknown> = { numero }
  for (const key of allowed) {
    if (key in rawData) proposalData[key] = rawData[key]
  }
  if (proposalData.status === 'enviada') proposalData.sent_at = new Date().toISOString()
  if (proposalData.status === 'aceita') proposalData.accepted_at = new Date().toISOString()

  const { data: proposal, error } = await supabase
    .from('proposals').insert([proposalData]).select().single()

  if (error) { console.error(error); return NextResponse.json({ error: 'Erro ao criar proposta.' }, { status: 500 }) }

  if (services?.length) {
    const { error: svcErr } = await supabase.from('proposal_services').insert(
      services.map((s: any) => ({
        proposal_id: proposal.id,
        nome: s.nome,
        descricao: s.desc ?? s.descricao ?? '',
        valor: s.valor ?? 0,
      }))
    )
    if (svcErr) { console.error(svcErr); return NextResponse.json({ error: 'Erro ao salvar os serviços da proposta.' }, { status: 500 }) }
  }

  if (proposal.client_id) {
    await supabase.from('client_activities').insert({
      client_id: proposal.client_id,
      type: 'proposta',
      icon: '📄',
      color: '#d9a82c',
      text: `Proposta ${numero} criada`,
    })
  }

  // Se a proposta já nasce enviada/aceita/recusada, move a etapa do cliente
  const novaEtapa = typeof proposalData.status === 'string' ? STATUS_TO_ETAPA[proposalData.status as string] : undefined
  if (novaEtapa && proposal.client_id) {
    await supabase.from('clients').update({ etapa: novaEtapa }).eq('id', proposal.client_id)
  }

  return NextResponse.json(proposal, { status: 201 })
}
