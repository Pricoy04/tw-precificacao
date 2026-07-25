import { Header } from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/server'
import { KanbanBoard } from '@/components/crm/KanbanBoard'

export default async function CrmPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('clients')
    .select('id, empresa, segmento, contato, etapa, valor, responsavel, origem, created_at')
    .order('created_at', { ascending: false })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Header title="CRM" subtitle="Gestão de clientes e oportunidades" />
      <KanbanBoard clients={data ?? []} />
    </div>
  )
}
