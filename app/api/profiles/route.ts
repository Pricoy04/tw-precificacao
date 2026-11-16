import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('profiles').select('id, name, role').order('name')
  if (error) { console.error(error); return NextResponse.json({ error: 'Erro ao buscar responsáveis.' }, { status: 500 }) }
  return NextResponse.json(data ?? [])
}
