import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const [clientRes, activitiesRes] = await Promise.all([
    supabase.from('clients').select('*').eq('id', id).single(),
    supabase.from('client_activities').select('*').eq('client_id', id).order('created_at', { ascending: false }),
  ])
  if (clientRes.error) return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 })
  return NextResponse.json({ client: clientRes.data, activities: activitiesRes.data ?? [] })
}

const ALLOWED_FIELDS = [
  'empresa', 'segmento', 'contato', 'email', 'telefone', 'cidade',
  'cargo', 'origem', 'etapa', 'valor', 'responsavel', 'score',
]

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const body = await request.json()

  const patch: Record<string, unknown> = {}
  for (const key of ALLOWED_FIELDS) {
    if (key in body) patch[key] = body[key]
  }

  const { data: before } = await supabase.from('clients').select('etapa').eq('id', id).single()

  const { data, error } = await supabase.from('clients').update(patch).eq('id', id).select().single()
  if (error) { console.error(error); return NextResponse.json({ error: 'Erro ao salvar cliente.' }, { status: 500 }) }

  if (typeof patch.etapa === 'string' && before && patch.etapa !== before.etapa) {
    await supabase.from('client_activities').insert({
      client_id: id,
      type: 'etapa',
      icon: '🔄',
      color: '#c4a06a',
      text: `Movido de "${before.etapa}" para "${patch.etapa}"`,
    })
  }

  return NextResponse.json(data)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { error } = await supabase.from('clients').delete().eq('id', id)
  if (error) { console.error(error); return NextResponse.json({ error: 'Erro ao excluir cliente.' }, { status: 500 }) }
  return new NextResponse(null, { status: 204 })
}
