import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ALLOWED_FIELDS = ['title', 'client_id', 'time', 'type', 'date']

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const body = await request.json()

  const patch: Record<string, unknown> = {}
  for (const key of ALLOWED_FIELDS) {
    if (key in body) patch[key] = body[key]
  }

  const { data, error } = await supabase.from('tasks').update(patch).eq('id', id).select().single()
  if (error) { console.error(error); return NextResponse.json({ error: 'Erro ao salvar o compromisso.' }, { status: 500 }) }
  return NextResponse.json(data)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) { console.error(error); return NextResponse.json({ error: 'Erro ao excluir o compromisso.' }, { status: 500 }) }
  return NextResponse.json({ ok: true })
}
