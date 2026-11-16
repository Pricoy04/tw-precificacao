import { Header } from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import {
  UsersIcon, FileTextIcon, CurrencyCircleDollarIcon, TrendUpIcon,
  ArrowUpIcon, ArrowDownIcon, TrophyIcon,
} from '@phosphor-icons/react/dist/ssr'

const TASK_COLORS: Record<string, { color: string; bg: string }> = {
  'Reunião':  { color: '#d9a82c', bg: 'rgba(217,168,44,0.12)' },
  'Ligação':  { color: '#6a9ec4', bg: 'rgba(106,158,196,0.12)' },
  'E-mail':   { color: '#a88fc4', bg: 'rgba(168,143,196,0.12)' },
  'Proposta': { color: '#7fb38a', bg: 'rgba(127,179,138,0.12)' },
}

const ACTIVITY_ICONS: Record<string, { icon: string; color: string; bg: string }> = {
  'proposta': { icon: '📄', color: '#d9a82c', bg: 'rgba(217,168,44,0.1)' },
  'reuniao':  { icon: '📅', color: '#6a9ec4', bg: 'rgba(106,158,196,0.1)' },
  'ganho':    { icon: '🏆', color: '#7fb38a', bg: 'rgba(127,179,138,0.1)' },
  'ligacao':  { icon: '📞', color: '#a88fc4', bg: 'rgba(168,143,196,0.1)' },
  'perdido':  { icon: '❌', color: '#c4756a', bg: 'rgba(196,117,106,0.1)' },
  'cliente':  { icon: '👤', color: '#6a9ec4', bg: 'rgba(106,158,196,0.1)' },
  'etapa':    { icon: '🔄', color: '#c4a06a', bg: 'rgba(196,160,106,0.1)' },
}

// Variação percentual entre o mês atual e o anterior, com o sinal já formatado
function pctDelta(curr: number, prev: number): { delta: string; up: boolean } {
  if (prev === 0) return curr === 0 ? { delta: '0%', up: true } : { delta: '+100%', up: true }
  const pct = Math.round(((curr - prev) / prev) * 100)
  return { delta: `${pct >= 0 ? '+' : ''}${pct}%`, up: pct >= 0 }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const now = new Date()
  const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const [clientsRes, proposalsRes, tasksRes, activitiesRes] = await Promise.all([
    supabase.from('clients').select('id, etapa, valor, created_at'),
    supabase.from('proposals').select('id, total, status, created_at, sent_at, accepted_at'),
    supabase.from('tasks').select('*, clients(empresa)').gte('date', new Date().toISOString().split('T')[0]).order('time').limit(4),
    supabase.from('client_activities').select('*, clients(empresa)').order('created_at', { ascending: false }).limit(5),
  ])

  const clients = clientsRes.data ?? []
  const proposals = proposalsRes.data ?? []
  const tasks = tasksRes.data ?? []
  const activities = activitiesRes.data ?? []

  const propEnviadas = proposals.filter(p => p.status !== 'rascunho').length
  const propAceitas  = proposals.filter(p => p.status === 'aceita').length
  const receitaAcum  = proposals.filter(p => p.status === 'aceita').reduce((s, p) => s + (p.total ?? 0), 0)
  const taxaConv     = propEnviadas > 0 ? `${((propAceitas / propEnviadas) * 100).toFixed(1)}%` : '0%'

  // Variação real mês atual x mês anterior — alimenta o selo de cada KPI.
  // Usa a data do evento (sent_at/accepted_at); cai pra created_at só em
  // propostas antigas, gravadas antes dessas colunas existirem.
  const inMonth = (dateStr: string | null, start: Date, end: Date) =>
    !!dateStr && new Date(dateStr) >= start && new Date(dateStr) < end

  const sentDate = (p: { sent_at?: string | null; created_at: string }) => p.sent_at ?? p.created_at
  const acceptedDate = (p: { accepted_at?: string | null; created_at: string }) => p.accepted_at ?? p.created_at

  const clientsThisMonth = clients.filter(c => inMonth(c.created_at, startThisMonth, now)).length
  const clientsLastMonth = clients.filter(c => inMonth(c.created_at, startLastMonth, startThisMonth)).length

  const enviadasThisMonth = proposals.filter(p => p.status !== 'rascunho' && inMonth(sentDate(p), startThisMonth, now)).length
  const enviadasLastMonth = proposals.filter(p => p.status !== 'rascunho' && inMonth(sentDate(p), startLastMonth, startThisMonth)).length

  const receitaThisMonth = proposals.filter(p => p.status === 'aceita' && inMonth(acceptedDate(p), startThisMonth, now)).reduce((s, p) => s + (p.total ?? 0), 0)
  const receitaLastMonth = proposals.filter(p => p.status === 'aceita' && inMonth(acceptedDate(p), startLastMonth, startThisMonth)).reduce((s, p) => s + (p.total ?? 0), 0)

  const aceitasThisMonth = proposals.filter(p => p.status === 'aceita' && inMonth(acceptedDate(p), startThisMonth, now)).length
  const aceitasLastMonth = proposals.filter(p => p.status === 'aceita' && inMonth(acceptedDate(p), startLastMonth, startThisMonth)).length
  const convThisMonth = enviadasThisMonth > 0 ? (aceitasThisMonth / enviadasThisMonth) * 100 : 0
  const convLastMonth = enviadasLastMonth > 0 ? (aceitasLastMonth / enviadasLastMonth) * 100 : 0

  const kpis = [
    { icon: UsersIcon,                label: 'Clientes ativos',    value: String(clients.length),      ...pctDelta(clientsThisMonth, clientsLastMonth) },
    { icon: FileTextIcon,             label: 'Propostas enviadas', value: String(propEnviadas),         ...pctDelta(enviadasThisMonth, enviadasLastMonth) },
    { icon: CurrencyCircleDollarIcon, label: 'Receita acumulada',  value: formatCurrency(receitaAcum),  ...pctDelta(receitaThisMonth, receitaLastMonth) },
    { icon: TrendUpIcon,              label: 'Taxa de conversão',  value: taxaConv,                     ...pctDelta(convThisMonth, convLastMonth) },
  ]

  const etapas = ['Prospecção', 'Qualificação', 'Proposta', 'Negociação', 'Ganho']
  const widths = [100, 75, 58, 38, 24]
  const bgs = ['rgba(106,158,196,0.35)','rgba(168,143,196,0.35)','rgba(217,168,44,0.45)','rgba(196,160,106,0.45)','rgba(127,179,138,0.6)']
  const funnelMini = etapas.map((label, i) => ({
    label, value: clients.filter(c => c.etapa === label).length,
    width: `${widths[i]}%`, bg: bgs[i],
  }))

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    return { label: d.toLocaleDateString('pt-BR', { month: 'short' }), key: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}` }
  })
  const maxRev = Math.max(...months.map(m => proposals.filter(p => p.status === 'aceita' && acceptedDate(p)?.startsWith(m.key)).reduce((s,p) => s+(p.total??0), 0)), 1)
  const revenue = months.map(m => {
    const total = proposals.filter(p => p.status === 'aceita' && acceptedDate(p)?.startsWith(m.key)).reduce((s,p) => s+(p.total??0), 0)
    const h = Math.max(6, Math.round((total/maxRev)*160))
    return { label: m.label, value: total > 0 ? `R$${(total/1000).toFixed(0)}k` : '—', h: `${h}px`, active: total > 0 }
  })

  const today = new Date().toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long' })

  return (
    <>
      <Header title="Dashboard" subtitle={`Resumo da TW · ${today}`} />
      <div style={{ flex: 1, overflowY: 'auto', padding: 28 }} className="animate-fade">

        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 16 }}>
          {kpis.map(({ icon: Icon, label, value, delta, up }) => (
            <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 14, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={19} color="var(--gold)" />
                </div>
                <div title="Comparado ao mês anterior" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-mono)', color: up ? 'var(--green)' : 'var(--red)' }}>
                  {up ? <ArrowUpIcon size={13} /> : <ArrowDownIcon size={13} />}
                  {delta}
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 25, color: 'var(--text-primary)', marginTop: 16, letterSpacing: '-0.01em' }}>
                {value}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 3 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Revenue + Funil mini */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* Revenue chart */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 14, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15 }}>Faturamento por mês</div>
                <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>Receita fechada · 2026</div>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--gold)' }}>
                {formatCurrency(receitaAcum)} acum.
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 180 }}>
              {revenue.map(m => (
                <div key={m.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--text-muted)' }}>{m.value}</div>
                  <div style={{ width: '100%', height: m.h, background: m.active ? 'var(--gold)' : 'var(--border-card)', borderRadius: '7px 7px 3px 3px', minHeight: 6 }} />
                  <div style={{ fontSize: 11.5, color: 'var(--text-dim)', fontWeight: 500 }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Funil mini */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 14, padding: 20 }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Funil resumido</div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 18 }}>Oportunidades por etapa</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              {funnelMini.map(f => (
                <div key={f.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 6 }}>
                    <span style={{ color: '#c8c3b9' }}>{f.label}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{f.value}</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--border-card)', borderRadius: 5, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: f.width, background: f.bg, borderRadius: 5 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tasks + Activity */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 14, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15 }}>Próximas tarefas</div>
              <a href="/agenda" style={{ fontSize: 12.5, color: 'var(--gold)', textDecoration: 'none' }}>Ver agenda</a>
            </div>
            {tasks.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text-dim)', textAlign: 'center', padding: '20px 0' }}>Nenhuma tarefa hoje</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {tasks.map((t: any) => {
                  const tc = TASK_COLORS[t.type] ?? { color: 'var(--text-muted)', bg: 'rgba(138,133,124,0.12)' }
                  return (
                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '10px 8px', borderRadius: 9 }}>
                      <div style={{ width: 38, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--gold)', fontWeight: 500 }}>{t.time}</div>
                      <div style={{ width: 1, height: 28, background: 'var(--border-input)' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, color: 'var(--text-primary)', fontWeight: 500 }}>{t.title}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--text-dim)' }}>{t.clients?.empresa ?? ''}</div>
                      </div>
                      <span style={{ fontSize: 10.5, fontWeight: 600, color: tc.color, background: tc.bg, padding: '3px 9px', borderRadius: 20 }}>{t.type}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 14, padding: 20 }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Atividade recente</div>
            {activities.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text-dim)', textAlign: 'center', padding: '20px 0' }}>Nenhuma atividade recente</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {activities.map((a: any) => {
                  const ai = ACTIVITY_ICONS[a.type] ?? { icon: '📌', color: 'var(--text-muted)', bg: 'rgba(138,133,124,0.1)' }
                  return (
                    <div key={a.id} style={{ display: 'flex', gap: 13, padding: '9px 4px' }}>
                      <div style={{ width: 32, height: 32, flexShrink: 0, borderRadius: 8, background: ai.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>
                        {ai.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: '#d4cfc5', lineHeight: 1.4 }}>{a.text}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>
                          {new Date(a.created_at).toLocaleString('pt-BR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  )
}
