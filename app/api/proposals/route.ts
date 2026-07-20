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
  const { services, ...proposalData } = body

  const count = await supabase.from('proposals').select('id', { count: 'exact', head: true })
  const numero = `TW-${String((count.count ?? 0) + 1).padStart(3, '0')}`

  const { data: proposal, error } = await supabase
    .from('proposals').insert([{ ...proposalData, numero }]).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (services?.length) {
    await supabase.from('proposal_services').insert(
      services.map((s: any) => ({ ...s, proposal_id: proposal.id }))
    )
  }

  return NextResponse.json(proposal, { status: 201 })
}
