import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('client_activities')
    .select('*, clients(empresa)')
    .order('created_at', { ascending: false })
    .limit(10)
  if (error) { console.error(error); return NextResponse.json({ error: 'Erro ao buscar atividades.' }, { status: 500 }) }
  return NextResponse.json(data ?? [])
}
