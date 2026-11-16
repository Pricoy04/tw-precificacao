'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { MagnifyingGlassIcon, ListIcon, SquaresFourIcon, UserPlusIcon, CurrencyCircleDollarIcon } from '@phosphor-icons/react'
import { formatCurrency, ETAPAS, ETAPA_COLORS, getInitials } from '@/lib/utils'

const COL_COLORS: Record<string, { header: string; border: string; tag: string }> = {
  'Prospecção':   { header: 'rgba(106,158,196,0.12)', border: 'rgba(106,158,196,0.3)',  tag: '#6a9ec4' },
  'Qualificação': { header: 'rgba(168,143,196,0.12)', border: 'rgba(168,143,196,0.3)',  tag: '#a88fc4' },
  'Proposta':     { header: 'rgba(217,168,44,0.12)',  border: 'rgba(217,168,44,0.3)',   tag: '#d9a82c' },
  'Enviada':      { header: 'rgba(95,168,163,0.12)',  border: 'rgba(95,168,163,0.3)',   tag: '#5fa8a3' },
  'Negociação':   { header: 'rgba(196,160,106,0.12)', border: 'rgba(196,160,106,0.3)',  tag: '#c4a06a' },
  'Ganho':        { header: 'rgba(127,179,138,0.15)', border: 'rgba(127,179,138,0.35)', tag: '#7fb38a' },
  'Perdido':      { header: 'rgba(196,117,106,0.12)', border: 'rgba(196,117,106,0.3)',  tag: '#c4756a' },
}

type Client = {
  id: string; empresa: string; segmento: string; contato: string;
  etapa: string; valor: number | null; responsavel: string; origem: string; created_at: string
}

export function KanbanBoard({ clients: initial }: { clients: Client[] }) {
  const [view, setView]     = useState<'kanban' | 'table'>('kanban')
  const [search, setSearch] = useState('')

  const clients = useMemo(() =>
    initial.filter(c =>
      !search || c.empresa?.toLowerCase().includes(search.toLowerCase()) ||
      c.contato?.toLowerCase().includes(search.toLowerCase()) ||
      c.responsavel?.toLowerCase().includes(search.toLowerCase())
    ), [initial, search])

  const totalValue = clients.reduce((s, c) => s + (c.valor ?? 0), 0)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px',
        borderBottom: '1px solid var(--border)', flexShrink: 0, flexWrap: 'wrap',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 340 }}>
          <MagnifyingGlassIcon size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar empresa, contato..."
            style={{
              width: '100%', paddingLeft: 34, padding: '9px 13px 9px 34px',
              background: 'var(--bg-card)', border: '1px solid var(--border-input)',
              borderRadius: 9, fontSize: 13, color: 'var(--text-primary)',
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        <span style={{ fontSize: 12.5, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
          {clients.length} deal{clients.length !== 1 ? 's' : ''}
        </span>
        <span style={{ fontSize: 12.5, color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>
          {formatCurrency(totalValue)}
        </span>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {/* View toggle */}
          <div style={{ display: 'flex', background: 'var(--bg-card)', border: '1px solid var(--border-input)', borderRadius: 9, overflow: 'hidden' }}>
            {[
              { id: 'kanban', Icon: SquaresFourIcon, label: 'Kanban' },
              { id: 'table',  Icon: ListIcon,         label: 'Lista' },
            ].map(({ id, Icon, label }) => (
              <button key={id} onClick={() => setView(id as 'kanban' | 'table')} title={label} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px', border: 'none', cursor: 'pointer',
                background: view === id ? 'rgba(217,168,44,0.15)' : 'transparent',
                color: view === id ? 'var(--gold)' : 'var(--text-secondary)',
                fontSize: 12.5, fontWeight: 600,
              }}>
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          <Link href="/crm/novo" style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: 'var(--gold-grad)', border: 'none', color: '#1a1408',
            borderRadius: 9, padding: '8px 16px', fontSize: 13, fontWeight: 700,
            textDecoration: 'none', fontFamily: 'var(--font-heading)',
          }}>
            <UserPlusIcon size={15} weight="bold" />
            Novo cliente
          </Link>
        </div>
      </div>

      {/* Content */}
      {view === 'kanban' ? (
        <KanbanView clients={clients} />
      ) : (
        <TableView clients={clients} />
      )}
    </div>
  )
}

/* ── KANBAN ─────────────────────────────────────────── */
function KanbanView({ clients }: { clients: Client[] }) {
  return (
    <div style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden', display: 'flex', padding: '16px 20px', gap: 12 }}>
      {ETAPAS.map(etapa => {
        const cols   = COL_COLORS[etapa]
        const items  = clients.filter(c => c.etapa === etapa)
        const total  = items.reduce((s, c) => s + (c.valor ?? 0), 0)

        return (
          <div key={etapa} style={{
            width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column',
            background: 'var(--bg-card)', border: `1px solid ${cols.border}`,
            borderRadius: 14, overflow: 'hidden',
          }}>
            {/* Column header */}
            <div style={{ padding: '12px 14px', background: cols.header, borderBottom: `1px solid ${cols.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: cols.tag, textTransform: 'uppercase' }}>
                  {etapa}
                </span>
                <span style={{
                  fontSize: 11.5, fontWeight: 700, color: cols.tag,
                  background: `${cols.tag}22`, border: `1px solid ${cols.tag}44`,
                  padding: '2px 8px', borderRadius: 20,
                }}>
                  {items.length}
                </span>
              </div>
              {total > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
                  <CurrencyCircleDollarIcon size={13} color={cols.tag} />
                  <span style={{ fontSize: 11.5, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                    {formatCurrency(total)}
                  </span>
                </div>
              )}
            </div>

            {/* Cards */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-dim)', fontSize: 12 }}>
                  Nenhum cliente
                </div>
              ) : items.map(c => (
                <KanbanCard key={c.id} client={c} tagColor={cols.tag} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function KanbanCard({ client: c, tagColor }: { client: Client; tagColor: string }) {
  return (
    <Link href={`/crm/${c.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'var(--bg-input)', border: '1px solid var(--border-input)',
        borderRadius: 11, padding: '13px 14px', cursor: 'pointer',
        transition: 'border-color 0.15s',
      }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = tagColor + '66')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-input)')}
      >
        {/* Tags */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 9 }}>
          {c.segmento && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: tagColor,
              background: `${tagColor}18`, border: `1px solid ${tagColor}30`,
              padding: '2px 7px', borderRadius: 5, letterSpacing: '0.04em',
            }}>{c.segmento}</span>
          )}
          {c.origem && (
            <span style={{
              fontSize: 10, fontWeight: 600, color: 'var(--text-dim)',
              background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-input)',
              padding: '2px 7px', borderRadius: 5,
            }}>{c.origem}</span>
          )}
        </div>

        {/* Company name */}
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.25, marginBottom: 8 }}>
          {c.empresa}
        </div>

        {/* Value */}
        {c.valor != null && c.valor > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
            <CurrencyCircleDollarIcon size={13} color="var(--text-dim)" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: '#c8c3b9', fontWeight: 500 }}>
              {formatCurrency(c.valor)}
            </span>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, paddingTop: 10, borderTop: '1px solid var(--border-input)' }}>
          <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
            {c.contato || '—'}
          </span>
          {c.responsavel && (
            <div title={c.responsavel} style={{
              width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #2a2620, #1a1812)',
              border: '1px solid rgba(217,168,44,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 700, color: 'var(--gold)',
            }}>
              {getInitials(c.responsavel)}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

/* ── TABLE ──────────────────────────────────────────── */
function TableView({ clients }: { clients: Client[] }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px' }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 14, overflow: 'hidden', marginTop: 16 }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '2.4fr 1.3fr 1.1fr 1fr 1.2fr',
          gap: 14, padding: '13px 20px', borderBottom: '1px solid var(--border-card)',
          fontSize: 11.5, letterSpacing: '0.05em', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase',
        }}>
          <div>Empresa</div><div>Segmento</div><div>Etapa</div><div>Valor</div><div>Responsável</div>
        </div>
        {clients.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: 14 }}>
            Nenhum cliente encontrado
          </div>
        ) : clients.map(c => {
          const ec = ETAPA_COLORS[c.etapa] ?? { color: 'var(--text-muted)', bg: 'rgba(138,133,124,0.12)' }
          return (
            <Link key={c.id} href={`/crm/${c.id}`} style={{
              display: 'grid', gridTemplateColumns: '2.4fr 1.3fr 1.1fr 1fr 1.2fr',
              gap: 14, padding: '14px 20px', borderBottom: '1px solid #1a181c',
              alignItems: 'center', textDecoration: 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                <div style={{
                  width: 36, height: 36, flexShrink: 0, borderRadius: 9,
                  background: 'linear-gradient(135deg, #2a2620, #1a1812)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--gold)', fontSize: 12,
                  boxShadow: 'inset 0 0 0 1px rgba(217,168,44,0.18)',
                }}>{getInitials(c.empresa)}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.empresa}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-dim)' }}>{c.contato}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{c.segmento}</div>
              <div><span style={{ fontSize: 11.5, fontWeight: 600, color: ec.color, background: ec.bg, padding: '4px 11px', borderRadius: 20 }}>{c.etapa}</span></div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13.5, color: 'var(--text-primary)' }}>{c.valor ? formatCurrency(c.valor) : '—'}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{c.responsavel}</div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
