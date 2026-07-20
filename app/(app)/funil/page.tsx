import { Header } from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { TrophyIcon, ArrowUpIcon, ArrowDownIcon } from '@phosphor-icons/react/dist/ssr'

const ETAPAS = [
  { label: 'Prospecção',   bg: 'rgba(106,158,196,0.5)',  conv: null },
  { label: 'Qualificação', bg: 'rgba(168,143,196,0.5)',  conv: '68%' },
  { label: 'Proposta',     bg: 'rgba(217,168,44,0.55)',  conv: '54%' },
  { label: 'Negociação',   bg: 'rgba(196,160,106,0.55)', conv: '42%' },
  { label: 'Ganho',        bg: 'rgba(127,179,138,0.7)',  conv: '31%' },
]

export default async function FunilPage() {
  const supabase = await createClient()

  const [clientsRes, proposalsRes] = await Promise.all([
    supabase.from('clients').select('id, etapa, valor'),
    supabase.from('proposals').select('id, total, status'),
  ])

  const clients = clientsRes.data ?? []
  const proposals = proposalsRes.data ?? []

  const abertas   = clients.filter(c => !['Ganho','Perdido'].includes(c.etapa)).length
  const negoc     = clients.filter(c => c.etapa === 'Negociação').length
  const recAberto = clients.filter(c => !['Ganho','Perdido'].includes(c.etapa)).reduce((s,c) => s+(c.valor??0), 0)
  const ganhos    = clients.filter(c => c.etapa === 'Ganho')
  const ticket    = ganhos.length > 0 ? ganhos.reduce((s,c) => s+(c.valor??0), 0) / ganhos.length : 0

  const kpis = [
    { label: 'Oportunidades abertas', value: String(abertas),               delta: '+5',  up: true },
    { label: 'Em negociação',          value: String(negoc),                 delta: '+34%',up: true },
    { label: 'Receita em aberto',      value: formatCurrency(recAberto),     delta: '+18%',up: true },
    { label: 'Ticket médio',           value: formatCurrency(ticket),        delta: '-4%', up: false },
  ]

  const maxCount = Math.max(...ETAPAS.map(e => clients.filter(c => c.etapa === e.label).length), 1)

  return (
    <>
      <Header title="Funil de Vendas" subtitle="Conversão entre etapas" />
      <div style={{ flex: 1, overflowY: 'auto', padding: 28 }} className="animate-fade">

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 16 }}>
          {kpis.map(k => (
            <div key={k.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 14, padding: 18 }}>
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{k.label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 24, color: 'var(--text-primary)', marginTop: 10 }}>{k.value}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-mono)', color: k.up ? 'var(--green)' : 'var(--red)', marginTop: 6 }}>
                {k.up ? <ArrowUpIcon size={13} /> : <ArrowDownIcon size={13} />}
                {k.delta} vs. mês anterior
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
          {/* Funil bars */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 14, padding: 24 }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Funil de vendas</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginBottom: 24 }}>Conversão entre etapas</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {ETAPAS.map(e => {
                const count = clients.filter(c => c.etapa === e.label).length
                const valor = clients.filter(c => c.etapa === e.label).reduce((s,c) => s+(c.valor??0), 0)
                const pct   = Math.max(8, Math.round((count / maxCount) * 100))
                return (
                  <div key={e.label}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13.5, color: '#d4cfc5', fontWeight: 500 }}>{e.label}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>{count}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{valor > 0 ? formatCurrency(valor) : '—'}</span>
                      </span>
                    </div>
                    <div style={{ height: 34, background: '#1a181c', borderRadius: 8, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${pct}%`, background: e.bg, borderRadius: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 12,
                      }}>
                        {e.conv && <span style={{ fontSize: 11, color: 'rgba(26,20,8,0.7)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{e.conv}</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Mini bar chart */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 14, padding: 22 }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15, marginBottom: 18 }}>Quantidade por etapa</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 150 }}>
                {ETAPAS.map(e => {
                  const count = clients.filter(c => c.etapa === e.label).length
                  const h = Math.max(6, Math.round((count / maxCount) * 130))
                  return (
                    <div key={e.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>{count}</div>
                      <div style={{ width: '100%', height: h, background: e.bg, borderRadius: '6px 6px 2px 2px', minHeight: 6 }} />
                      <div style={{ fontSize: 10, color: 'var(--text-dim)', textAlign: 'center' }}>{e.label.substring(0,4)}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Highlight */}
            <div style={{
              background: 'linear-gradient(135deg, #1a160c, #131315)',
              border: '1px solid rgba(217,168,44,0.2)', borderRadius: 14, padding: 22,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <TrophyIcon size={22} color="var(--gold)" weight="fill" />
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15 }}>Destaque do mês</div>
              </div>
              <div style={{ fontSize: 13.5, color: '#c8c3b9', lineHeight: 1.55 }}>
                A etapa de <strong style={{ color: 'var(--gold-light)' }}>Negociação</strong> teve a maior evolução:{' '}
                <strong style={{ color: 'var(--gold-light)' }}>+34%</strong> de oportunidades em relação ao mês anterior.
                Mantenha o ritmo de follow-ups.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
