import { Header } from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ETAPA_COLORS, formatCurrency, getInitials } from '@/lib/utils'
import { CaretRightIcon, UserPlusIcon } from '@phosphor-icons/react/dist/ssr'

const ETAPAS = ['Todos', 'Prospecção', 'Qualificação', 'Proposta', 'Negociação', 'Ganho', 'Perdido']

export default async function CrmPage({ searchParams }: { searchParams: Promise<{ etapa?: string; q?: string }> }) {
  const { etapa = 'Todos', q = '' } = await searchParams
  const supabase = await createClient()

  let query = supabase.from('clients').select('*').order('created_at', { ascending: false })
  if (etapa && etapa !== 'Todos') query = query.eq('etapa', etapa)
  if (q) query = query.ilike('empresa', `%${q}%`)

  const { data: clientsData } = await query
  const clients = clientsData ?? []

  return (
    <>
      <Header title="CRM" subtitle="Gestão de clientes e oportunidades" />
      <div style={{ flex: 1, overflowY: 'auto', padding: 28 }} className="animate-fade">

        {/* Filter bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {ETAPAS.map(e => {
              const active = etapa === e || (!etapa && e === 'Todos')
              return (
                <Link key={e} href={`/crm?etapa=${e}${q ? `&q=${q}` : ''}`} style={{
                  padding: '8px 16px', borderRadius: 9, fontSize: 13, fontWeight: active ? 600 : 500,
                  border: active ? '1px solid rgba(217,168,44,0.3)' : '1px solid var(--border-input)',
                  background: active ? 'rgba(217,168,44,0.12)' : 'var(--bg-card)',
                  color: active ? 'var(--gold-light)' : 'var(--text-secondary)',
                  textDecoration: 'none',
                }}>{e}</Link>
              )
            })}
          </div>
          <Link href="/crm/novo" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--bg-card)', border: '1px solid var(--border-input)',
            color: 'var(--text-primary)', borderRadius: 9, padding: '9px 16px',
            fontSize: 13, fontWeight: 600, textDecoration: 'none',
          }}>
            <UserPlusIcon size={16} color="var(--gold)" />
            Novo cliente
          </Link>
        </div>

        {/* Table */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '2.4fr 1.3fr 1.1fr 1fr 1.2fr 40px',
            gap: 14, padding: '14px 20px', borderBottom: '1px solid var(--border-card)',
            fontSize: 11.5, letterSpacing: '0.05em', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase',
          }}>
            <div>Empresa</div><div>Segmento</div><div>Etapa</div><div>Valor</div><div>Responsável</div><div />
          </div>

          {clients.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: 14 }}>
              Nenhum cliente encontrado
            </div>
          ) : clients.map((c: any) => {
            const ec = ETAPA_COLORS[c.etapa] ?? { color: 'var(--text-muted)', bg: 'rgba(138,133,124,0.12)' }
            return (
              <Link key={c.id} href={`/crm/${c.id}`} style={{
                display: 'grid', gridTemplateColumns: '2.4fr 1.3fr 1.1fr 1fr 1.2fr 40px',
                gap: 14, padding: '15px 20px', borderBottom: '1px solid #1a181c',
                alignItems: 'center', textDecoration: 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <div style={{
                    width: 38, height: 38, flexShrink: 0, borderRadius: 10,
                    background: 'linear-gradient(135deg, #2a2620, #1a1812)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--gold)', fontSize: 13,
                    boxShadow: 'inset 0 0 0 1px rgba(217,168,44,0.18)',
                  }}>{getInitials(c.empresa)}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.empresa}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{c.contato}</div>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{c.segmento}</div>
                <div>
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: ec.color, background: ec.bg, padding: '4px 11px', borderRadius: 20 }}>
                    {c.etapa}
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13.5, color: 'var(--text-primary)', fontWeight: 500 }}>
                  {c.valor ? formatCurrency(c.valor) : '—'}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{c.responsavel}</div>
                <div style={{ textAlign: 'right' }}>
                  <CaretRightIcon size={16} color="#4f4b44" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
