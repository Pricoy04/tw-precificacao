import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('proposals')
    .select('*, clients(empresa), proposal_services(*)')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
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

  const { data: proposal, error } = await supabase
    .from('proposals').insert([proposalData]).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (services?.length) {
    const { error: svcErr } = await supabase.from('proposal_services').insert(
      services.map((s: any) => ({
        proposal_id: proposal.id,
        nome: s.nome,
        descricao: s.desc ?? s.descricao ?? '',
        valor: s.valor ?? 0,
      }))
    )
    if (svcErr) return NextResponse.json({ error: svcErr.message }, { status: 500 })
  }

  return NextResponse.json(proposal, { status: 201 })
}
