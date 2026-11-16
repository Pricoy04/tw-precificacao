import { Header } from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/server'
import { ETAPAS, ETAPA_COLORS, formatCurrency } from '@/lib/utils'
import { TrophyIcon } from '@phosphor-icons/react/dist/ssr'

// Preenchimento das barras do funil — mais saturado que o badge pequeno
// usado no Kanban (ETAPA_COLORS.bg), pra dar peso visual às barras grandes.
const BAR_BG: Record<string, string> = {
  'Prospecção':   'rgba(106,158,196,0.5)',
  'Qualificação': 'rgba(168,143,196,0.5)',
  'Proposta':     'rgba(217,168,44,0.5)',
  'Enviada':      'rgba(95,168,163,0.5)',
  'Negociação':   'rgba(196,160,106,0.55)',
  'Ganho':        'rgba(127,179,138,0.7)',
  'Perdido':      'rgba(196,117,106,0.55)',
}

const REGRAS = [
  { etapa: 'Enviada',    desc: 'Automático quando a proposta é marcada como enviada' },
  { etapa: 'Negociação', desc: 'Movida manualmente no CRM ao iniciar a negociação' },
  { etapa: 'Ganho',      desc: 'Automático quando a proposta é marcada como aceita' },
  { etapa: 'Perdido',    desc: 'Automático quando a proposta é marcada como recusada' },
]

export default async function FunilPage() {
  const supabase = await createClient()

  const { data: clientsData } = await supabase.from('clients').select('id, etapa, valor')
  const clients = clientsData ?? []

  // Mesma etapa que aparece no Kanban do CRM — única fonte de verdade do pipeline
  const stages = ETAPAS.map(label => {
    const items = clients.filter(c => c.etapa === label)
    return {
      label,
      count: items.length,
      valor: items.reduce((s, c) => s + (c.valor ?? 0), 0),
      ...ETAPA_COLORS[label],
    }
  }).map((s, i, arr) => ({
    ...s,
    conv: i === 0 ? null : arr[i - 1].count > 0 ? `${Math.round((s.count / arr[i - 1].count) * 100)}%` : '—',
  }))

  const maxCount = Math.max(...stages.map(s => s.count), 1)
  const byLabel = (label: string) => stages.find(s => s.label === label)

  const prospCount  = byLabel('Prospecção')?.count ?? 0
  const negocCount  = byLabel('Negociação')?.count ?? 0
  const ganhoCount  = byLabel('Ganho')?.count ?? 0
  const perdidoCount = byLabel('Perdido')?.count ?? 0

  // Receita ainda em jogo: tudo que não terminou em Ganho ou Perdido
  const openValor = stages.filter(s => s.label !== 'Ganho' && s.label !== 'Perdido').reduce((s, e) => s + e.valor, 0)

  // Taxa de conversão: dos negócios já decididos, quantos foram ganhos
  const decided  = ganhoCount + perdidoCount
  const taxaConv = decided > 0 ? `${Math.round((ganhoCount / decided) * 100)}%` : '0%'

  const kpis = [
    { label: 'Em prospecção',     value: String(prospCount) },
    { label: 'Em negociação',     value: String(negocCount) },
    { label: 'Receita em aberto', value: formatCurrency(openValor) },
    { label: 'Taxa de conversão', value: taxaConv },
  ]

  return (
    <>
      <Header title="Funil de Vendas" subtitle="Visão geral das oportunidades" />
      <div style={{ flex: 1, overflowY: 'auto', padding: 28 }} className="animate-fade">

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 16 }}>
          {kpis.map(k => (
            <div key={k.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 14, padding: 18 }}>
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{k.label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 24, color: 'var(--text-primary)', marginTop: 10 }}>{k.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>

          {/* Funil bars */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 14, padding: 24 }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Funil de vendas</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginBottom: 8 }}>Baseado na etapa de cada cliente no CRM</div>

            {/* Legenda da lógica */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              {[
                { label: 'Proposta enviada → Enviada', color: ETAPA_COLORS['Enviada'].color },
                { label: 'Proposta aceita → Ganho', color: '#7fb38a' },
                { label: 'Proposta recusada → Perdido', color: '#c4756a' },
              ].map(l => (
                <span key={l.label} style={{ fontSize: 10.5, color: l.color, background: `${l.color}18`, border: `1px solid ${l.color}30`, padding: '3px 9px', borderRadius: 20 }}>
                  {l.label}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {stages.map(e => {
                const pct = Math.max(6, Math.round((e.count / maxCount) * 100))
                return (
                  <div key={e.label}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13.5, color: '#d4cfc5', fontWeight: 500 }}>{e.label}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>{e.count}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', minWidth: 80, textAlign: 'right' }}>
                          {e.valor > 0 ? formatCurrency(e.valor) : '—'}
                        </span>
                      </span>
                    </div>
                    <div style={{ height: 34, background: '#1a181c', borderRadius: 8, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${pct}%`, background: BAR_BG[e.label], borderRadius: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 12,
                        transition: 'width 0.3s ease',
                      }}>
                        {e.conv && e.conv !== '—' && (
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                            {e.conv}
                          </span>
                        )}
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
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15, marginBottom: 18 }}>Distribuição por etapa</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 130 }}>
                {stages.map(e => {
                  const h = Math.max(6, Math.round((e.count / maxCount) * 110))
                  return (
                    <div key={e.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: e.color, fontWeight: 600 }}>{e.count}</div>
                      <div style={{ width: '100%', height: h, background: BAR_BG[e.label], borderRadius: '5px 5px 2px 2px', minHeight: 6 }} />
                      <div style={{ fontSize: 9, color: 'var(--text-dim)', textAlign: 'center', lineHeight: 1.2 }}>{e.label.substring(0, 5)}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Resumo das regras */}
            <div style={{
              background: 'linear-gradient(135deg, #1a160c, #131315)',
              border: '1px solid rgba(217,168,44,0.2)', borderRadius: 14, padding: 22,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <TrophyIcon size={22} color="var(--gold)" weight="fill" />
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15 }}>Regras do funil</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {REGRAS.map(r => (
                  <div key={r.etapa} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{
                      fontSize: 10.5, fontWeight: 700, color: ETAPA_COLORS[r.etapa]?.color ?? 'var(--gold)',
                      background: `${ETAPA_COLORS[r.etapa]?.color ?? 'var(--gold)'}18`,
                      border: `1px solid ${ETAPA_COLORS[r.etapa]?.color ?? 'var(--gold)'}30`,
                      padding: '2px 8px', borderRadius: 20, whiteSpace: 'nowrap', marginTop: 1,
                    }}>{r.etapa}</span>
                    <span style={{ fontSize: 12, color: '#c8c3b9', lineHeight: 1.5 }}>{r.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
