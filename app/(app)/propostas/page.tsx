import { Header } from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, PROPOSAL_STATUS } from '@/lib/utils'
import Link from 'next/link'
import { PropostasActions } from '@/components/propostas/PropostasActions'

export default async function PropostasPage() {
  const supabase = await createClient()
  const { data: proposalsData } = await supabase
    .from('proposals')
    .select('*, clients(empresa)')
    .order('created_at', { ascending: false })
  const proposals = proposalsData ?? []

  const total   = proposals.length
  const aceitas = proposals.filter(p => p.status === 'aceita').length
  const analise = proposals.filter(p => p.status === 'enviada').length
  const taxa    = total > 0 ? `${((aceitas / total) * 100).toFixed(1)}%` : '0%'

  const kpis = [
    { label: 'Total enviadas', value: String(total) },
    { label: 'Aceitas', value: String(aceitas), color: 'var(--green)' },
    { label: 'Em análise', value: String(analise), color: 'var(--gold)' },
    { label: 'Taxa de aceite', value: taxa },
  ]

  const cols = '0.7fr 1.8fr 1.4fr 1fr 1fr 1fr 100px'

  return (
    <>
      <Header title="Propostas" subtitle="Histórico e acompanhamento" />
      <div style={{ flex: 1, overflowY: 'auto', padding: 28 }} className="animate-fade">

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
          {kpis.map(k => (
            <div key={k.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{k.label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 600, marginTop: 6, color: k.color ?? 'var(--text-primary)' }}>
                {k.value}
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: cols,
            gap: 14, padding: '14px 20px', borderBottom: '1px solid var(--border-card)',
            fontSize: 11.5, letterSpacing: '0.05em', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase',
          }}>
            <div>Nº</div><div>Cliente</div><div>Serviços</div><div>Valor</div><div>Data</div><div>Status</div><div>Ações</div>
          </div>

          {proposals.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: 14 }}>
              Nenhuma proposta encontrada
            </div>
          ) : proposals.map((p: any) => {
            const sc = PROPOSAL_STATUS[p.status] ?? { color: 'var(--text-muted)', bg: 'rgba(138,133,124,0.12)' }
            return (
              <div key={p.id} style={{
                display: 'grid', gridTemplateColumns: cols,
                gap: 14, padding: '15px 20px', borderBottom: '1px solid #1a181c', alignItems: 'center',
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--gold)', fontWeight: 500 }}>{p.numero}</div>
                <div style={{ fontSize: 13.5, color: 'var(--text-primary)', fontWeight: 600 }}>{p.clients?.empresa ?? p.empresa}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{p.prazo ?? '—'}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13.5, color: 'var(--text-primary)' }}>{p.total ? formatCurrency(p.total) : '—'}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--text-muted)' }}>{formatDate(p.created_at)}</div>
                <div>
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: sc.color, background: sc.bg, padding: '4px 12px', borderRadius: 20 }}>
                    {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                  </span>
                </div>
                <PropostasActions id={p.id} />
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
