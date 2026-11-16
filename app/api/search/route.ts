import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') ?? '').trim()
  if (q.length < 2) return NextResponse.json({ clients: [], proposals: [] })

  const supabase = await createClient()
  const pattern = `%${q}%`

  const [byEmpresa, byContato, byNumero, byPropEmpresa] = await Promise.all([
    supabase.from('clients').select('id, empresa, etapa').ilike('empresa', pattern).limit(5),
    supabase.from('clients').select('id, empresa, etapa').ilike('contato', pattern).limit(5),
    supabase.from('proposals').select('id, numero, empresa, status').ilike('numero', pattern).limit(5),
    supabase.from('proposals').select('id, numero, empresa, status').ilike('empresa', pattern).limit(5),
  ])

  const clientsMap = new Map<string, { id: string; empresa: string; etapa: string }>()
  for (const c of [...(byEmpresa.data ?? []), ...(byContato.data ?? [])]) clientsMap.set(c.id, c)

  const proposalsMap = new Map<string, { id: string; numero: string; empresa: string; status: string }>()
  for (const p of [...(byNumero.data ?? []), ...(byPropEmpresa.data ?? [])]) proposalsMap.set(p.id, p)

  return NextResponse.json({
    clients: Array.from(clientsMap.values()).slice(0, 5),
    proposals: Array.from(proposalsMap.values()).slice(0, 5),
  })
}
