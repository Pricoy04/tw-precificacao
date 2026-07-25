import { Header } from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/server'
import { CalendarView } from '@/components/agenda/CalendarView'

export default async function AgendaPage() {
  const supabase = await createClient()
  const { data: clients } = await supabase.from('clients').select('id, empresa').order('empresa')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Header title="Agenda" subtitle="Próximos compromissos" />
      <CalendarView clients={clients ?? []} />
    </div>
  )
}
