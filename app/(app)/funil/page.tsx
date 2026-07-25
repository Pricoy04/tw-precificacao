import { Header } from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { TrophyIcon, ArrowUpIcon, ArrowDownIcon } from '@phosphor-icons/react/dist/ssr'

const STAGE_CONFIG = [
  { label: 'Prospecção',  bg: 'rgba(106,158,196,0.5)',  color: '#6a9ec4' },
  { label: 'Qualificação',bg: 'rgba(168,143,196,0.5)',  color: '#a88fc4' },
  { label: 'Negociação',  bg: 'rgba(196,160,106,0.55)', color: '#c4a06a' },
  { label: 'Ganho',       bg: 'rgba(127,179,138,0.7)',  color: '#7fb38a' },
  { label: 'Perdido',     bg: 'rgba(196,117,106,0.55)', color: '#c4756a' },
]

export default async function FunilPage() {
  const supabase = await createClient()

  const [clientsRes, proposalsRes] = await Promise.all([
    supabase.from('clients').select('id, etapa, valor'),
    supabase.from('proposals').select('id, client_id, total, status'),
  ])

  const clients   = clientsRes.data ?? []
  const proposals = proposalsRes.data ?? []

  // IDs de clientes que já têm alguma proposta
  const clientsWithProposal = new Set(proposals.map(p => p.client_id).filter(Boolean))

  // Prospecção: clientes sem nenhuma proposta
  const prospCount = clients.filter(c => !clientsWithProposal.has(c.id)).length
  const prospValor = clients.filter(c => !clientsWithProposal.has(c.id)).reduce((s, c) => s + (c.valor ?? 0), 0)

  // Qualificação: clientes que TÊM proposta (a proposta montada os qualifica)
  const qualifCount = clientsWithProposal.size
  const qualifValor = proposals.reduce((s, p) => s + (p.total ?? 0), 0)

  // Negociação: toda proposta criada vai para negociação (rascunho + enviada)
  const negocProps  = proposals.filter(p => p.status === 'rascunho' || p.status === 'enviada')
  const negocCount  = negocProps.length
  const negocValor  = negocProps.reduce((s, p) => s + (p.total ?? 0), 0)

  // Ganho: propostas aceitas
  const ganhoProps  = proposals.filter(p => p.status === 'aceita')
  const ganhoCount  = ganhoProps.length
  const ganhoValor  = ganhoProps.reduce((s, p) => s + (p.total ?? 0), 0)

  // Perdido: propostas recusadas (única saída de Negociação por perda)
  const perdidoProps = proposals.filter(p => p.status === 'recusada')
  const perdidoCount = perdidoProps.length
  const perdidoValor = perdidoProps.reduce((s, p) => s + (p.total ?? 0), 0)

  const stages = [
    { ...STAGE_CONFIG[0], count: prospCount,   valor: prospValor,   conv: null },
    { ...STAGE_CONFIG[1], count: qualifCount,  valor: qualifValor,  conv: prospCount > 0 ? `${Math.round((qualifCount / (prospCount + qualifCount)) * 100)}%` : '—' },
    { ...STAGE_CONFIG[2], count: negocCount,   valor: negocValor,   conv: qualifCount > 0 ? `${Math.round((negocCount / qualifCount) * 100)}%` : '100%' },
    { ...STAGE_CONFIG[3], count: ganhoCount,   valor: ganhoValor,   conv: negocCount + ganhoCount > 0 ? `${Math.round((ganhoCount / (negocCount + ganhoCount + perdidoCount)) * 100)}%` : '—' },
    { ...STAGE_CONFIG[4], count: perdidoCount, valor: perdidoValor, conv: negocCount + perdidoCount > 0 ? `${Math.round((perdidoCount / (negocCount + ganhoCount + perdidoCount)) * 100)}%` : '—' },
  ]

  const maxCount = Math.max(...stages.map(s => s.count), 1)

  // KPIs
  const totalAberto = negocValor
  const ticket = ganhoCount > 0 ? ganhoValor / ganhoCount : 0
  const taxaConv = proposals.length > 0 ? `${Math.round((ganhoCount / proposals.length) * 100)}%` : '0%'

  const kpis = [
    { label: 'Em prospecção',     value: String(prospCount),          delta: null },
    { label: 'Em negociação',     value: String(negocCount),          delta: null },
    { label: 'Receita em aberto', value: formatCurrency(totalAberto), delta: null },
    { label: 'Taxa de conversão', value: taxaConv,                    delta: null },
  ]

  // Destaque: etapa com mais oportunidades ativas
  const destaqueStage = stages.slice(0, 3).reduce((a, b) => a.count >= b.count ? a : b)

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
            <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginBottom: 8 }}>Baseado em propostas criadas</div>

            {/* Legenda da lógica */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              {[
                { label: 'Proposta criada → Negociação', color: 'var(--gold)' },
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
                        height: '100%', width: `${pct}%`, background: e.bg, borderRadius: 8,
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
                      <div style={{ width: '100%', height: h, background: e.bg, borderRadius: '5px 5px 2px 2px', minHeight: 6 }} />
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
                {[
                  { etapa: 'Qualificação', desc: 'Quando uma proposta é criada para o lead' },
                  { etapa: 'Negociação', desc: 'Toda proposta criada entra automaticamente' },
                  { etapa: 'Ganho', desc: 'Proposta marcada como aceita' },
                  { etapa: 'Perdido', desc: 'Proposta marcada como recusada' },
                ].map(r => (
                  <div key={r.etapa} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{
                      fontSize: 10.5, fontWeight: 700, color: STAGE_CONFIG.find(s => s.label === r.etapa)?.color ?? 'var(--gold)',
                      background: `${STAGE_CONFIG.find(s => s.label === r.etapa)?.color ?? 'var(--gold)'}18`,
                      border: `1px solid ${STAGE_CONFIG.find(s => s.label === r.etapa)?.color ?? 'var(--gold)'}30`,
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
