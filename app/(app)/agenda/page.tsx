import { Header } from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/server'

const TYPE_COLORS: Record<string, { color: string; bg: string }> = {
  'Reunião':  { color: '#d9a82c', bg: 'rgba(217,168,44,0.12)' },
  'Ligação':  { color: '#6a9ec4', bg: 'rgba(106,158,196,0.12)' },
  'E-mail':   { color: '#a88fc4', bg: 'rgba(168,143,196,0.12)' },
  'Proposta': { color: '#7fb38a', bg: 'rgba(127,179,138,0.12)' },
}

function groupByDate(tasks: any[]) {
  const map: Record<string, any[]> = {}
  for (const t of tasks) {
    if (!map[t.date]) map[t.date] = []
    map[t.date].push(t)
  }
  return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
}

function formatGroupDate(date: string) {
  const d = new Date(date + 'T12:00:00')
  const today = new Date()
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  if (d.toDateString() === today.toDateString()) return 'Hoje'
  if (d.toDateString() === tomorrow.toDateString()) return 'Amanhã'
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default async function AgendaPage() {
  const supabase = await createClient()
  const { data: tasks = [] } = await supabase
    .from('tasks')
    .select('*, clients(empresa)')
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date').order('time')

  const groups = groupByDate(tasks ?? [])

  return (
    <>
      <Header title="Agenda" subtitle="Próximos compromissos" />
      <div style={{ flex: 1, overflowY: 'auto', padding: 28 }} className="animate-fade">
        <div style={{ maxWidth: 820 }}>
          {groups.length === 0 ? (
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-card)',
              borderRadius: 14, padding: '40px 20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: 14,
            }}>
              Nenhum compromisso agendado
            </div>
          ) : groups.map(([date, items]) => (
            <div key={date} style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, textTransform: 'capitalize' }}>
                  {formatGroupDate(date)}
                </div>
                <div style={{ flex: 1, height: 1, background: 'var(--border-card)' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {items.map((t: any) => {
                  const tc = TYPE_COLORS[t.type] ?? { color: 'var(--text-muted)', bg: 'rgba(138,133,124,0.12)' }
                  return (
                    <div key={t.id} style={{
                      background: 'var(--bg-card)', border: '1px solid var(--border-card)',
                      borderRadius: 12, padding: '16px 20px',
                      display: 'flex', alignItems: 'center', gap: 16,
                    }}>
                      <div style={{
                        fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--gold)',
                        fontWeight: 500, width: 44, flexShrink: 0, textAlign: 'center',
                      }}>{t.time}</div>
                      <div style={{ width: 1, height: 36, background: 'var(--border-input)' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{t.title}</div>
                        {t.clients?.empresa && (
                          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>{t.clients.empresa}</div>
                        )}
                      </div>
                      <span style={{
                        fontSize: 11, fontWeight: 600, color: tc.color,
                        background: tc.bg, padding: '4px 12px', borderRadius: 20, flexShrink: 0,
                      }}>{t.type}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
