import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const etapa = searchParams.get('etapa')
  const q = searchParams.get('q')

  let query = supabase.from('clients').select('*').order('created_at', { ascending: false })
  if (etapa && etapa !== 'Todos') query = query.eq('etapa', etapa)
  if (q) query = query.ilike('empresa', `%${q}%`)

  const { data, error } = await query
  if (error) { console.error(error); return NextResponse.json({ error: 'Erro ao buscar clientes.' }, { status: 500 }) }
  return NextResponse.json(data)
}

const ALLOWED_FIELDS = [
  'empresa', 'segmento', 'contato', 'email', 'telefone', 'cidade',
  'cargo', 'origem', 'etapa', 'valor', 'responsavel', 'score',
]

function pickAllowed(body: Record<string, unknown>) {
  const clean: Record<string, unknown> = {}
  for (const key of ALLOWED_FIELDS) {
    if (key in body) clean[key] = body[key]
  }
  return clean
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  const { data, error } = await supabase.from('clients').insert([pickAllowed(body)]).select().single()
  if (error) { console.error(error); return NextResponse.json({ error: 'Erro ao cadastrar cliente.' }, { status: 500 }) }

  await supabase.from('client_activities').insert({
    client_id: data.id,
    type: 'cliente',
    icon: '👤',
    color: '#6a9ec4',
    text: 'Cliente cadastrado no CRM',
  })

  return NextResponse.json(data, { status: 201 })
}
