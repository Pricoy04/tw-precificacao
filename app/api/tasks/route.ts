import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from')
  const to   = searchParams.get('to')

  let query = supabase.from('tasks').select('*, clients(empresa)').order('date').order('time')
  if (from) query = query.gte('date', from)
  if (to)   query = query.lte('date', to)

  const { data, error } = await query
  if (error) { console.error(error); return NextResponse.json({ error: 'Erro ao buscar tarefas.' }, { status: 500 }) }
  return NextResponse.json(data)
}

const ALLOWED_FIELDS = ['title', 'client_id', 'time', 'type', 'date']

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  const patch: Record<string, unknown> = {}
  for (const key of ALLOWED_FIELDS) {
    if (key in body) patch[key] = body[key]
  }

  const { data, error } = await supabase.from('tasks').insert([patch]).select().single()
  if (error) { console.error(error); return NextResponse.json({ error: 'Erro ao criar o compromisso.' }, { status: 500 }) }
  return NextResponse.json(data, { status: 201 })
}
