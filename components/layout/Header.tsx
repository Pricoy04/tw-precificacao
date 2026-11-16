'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BellIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import { ETAPA_COLORS, PROPOSAL_STATUS } from '@/lib/utils'

interface HeaderProps {
  title: string
  subtitle?: string
}

type ClientHit = { id: string; empresa: string; etapa: string }
type ProposalHit = { id: string; numero: string; empresa: string; status: string }
type Activity = {
  id: string; type: string; icon: string; color: string; text: string
  created_at: string; client_id: string | null; clients?: { empresa: string } | null
}

const LAST_SEEN_KEY = 'tw_last_seen_activity'

function timeAgo(iso: string) {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (min < 1) return 'agora'
  if (min < 60) return `${min}min`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

export function Header({ title, subtitle }: HeaderProps) {
  const router = useRouter()

  // ── Busca ──────────────────────────────────────────
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState<{ clients: ClientHit[]; proposals: ProposalHit[] }>({ clients: [], proposals: [] })
  const [searchOpen, setSearchOpen] = useState(false)
  const [searching, setSearching]   = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const term = query.trim()
    const t = setTimeout(() => {
      if (term.length < 2) {
        setResults({ clients: [], proposals: [] })
        setSearchOpen(false)
        return
      }
      setSearching(true)
      fetch(`/api/search?q=${encodeURIComponent(term)}`)
        .then(r => r.json())
        .then(data => { setResults(data); setSearchOpen(true) })
        .catch(() => setResults({ clients: [], proposals: [] }))
        .finally(() => setSearching(false))
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  function goTo(path: string) {
    setSearchOpen(false)
    setQuery('')
    router.push(path)
  }

  // ── Notificações ───────────────────────────────────
  const [activities, setActivities] = useState<Activity[]>([])
  const [notifOpen, setNotifOpen]   = useState(false)
  const [hasUnread, setHasUnread]   = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/activities')
      .then(r => r.json())
      .then((data: Activity[]) => {
        const list = Array.isArray(data) ? data : []
        setActivities(list)
        const latest = list[0]?.created_at
        if (latest) {
          let lastSeen: string | null = null
          try { lastSeen = localStorage.getItem(LAST_SEEN_KEY) } catch {}
          setHasUnread(!lastSeen || new Date(latest) > new Date(lastSeen))
        }
      })
      .catch(() => {})
  }, [])

  function toggleNotif() {
    setNotifOpen(open => {
      const next = !open
      if (next && activities[0]) {
        try { localStorage.setItem(LAST_SEEN_KEY, activities[0].created_at) } catch {}
        setHasUnread(false)
      }
      return next
    })
  }

  // ── Fechar ao clicar fora ──────────────────────────
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const hasResults = results.clients.length > 0 || results.proposals.length > 0

  return (
    <header style={{
      height: 68,
      flexShrink: 0,
      borderBottom: '1px solid var(--border)',
      background: 'rgba(11,11,12,0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 20,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17, color: 'var(--text-primary)' }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{subtitle}</div>
        )}
      </div>

      {/* Busca */}
      <div ref={searchRef} style={{ position: 'relative', width: 280 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--bg-input)', border: '1px solid var(--border-input)',
          borderRadius: 10, padding: '0 13px',
        }}>
          <MagnifyingGlassIcon size={16} color="var(--text-dim)" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => { if (hasResults) setSearchOpen(true) }}
            placeholder="Buscar cliente, proposta..."
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: 13.5, padding: '10px 0',
            }}
          />
        </div>

        {searchOpen && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
            background: 'var(--bg-card)', border: '1px solid var(--border-card)',
            borderRadius: 12, boxShadow: '0 16px 32px rgba(0,0,0,0.45)',
            maxHeight: 360, overflowY: 'auto', zIndex: 30, padding: 6,
          }}>
            {searching && (
              <div style={{ padding: '12px 10px', fontSize: 12.5, color: 'var(--text-dim)' }}>Buscando...</div>
            )}
            {!searching && !hasResults && (
              <div style={{ padding: '12px 10px', fontSize: 12.5, color: 'var(--text-dim)' }}>
                Nenhum resultado para &quot;{query}&quot;
              </div>
            )}
            {!searching && results.clients.length > 0 && (
              <div style={{ marginBottom: 4 }}>
                <div style={groupLabel}>CLIENTES</div>
                {results.clients.map(c => {
                  const ec = ETAPA_COLORS[c.etapa] ?? { color: 'var(--text-muted)', bg: 'rgba(138,133,124,0.12)' }
                  return (
                    <button key={c.id} onClick={() => goTo(`/crm/${c.id}`)} style={resultRow}>
                      <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.empresa}</span>
                      <span style={{ fontSize: 10.5, fontWeight: 600, color: ec.color, background: ec.bg, padding: '2px 8px', borderRadius: 20, flexShrink: 0 }}>{c.etapa}</span>
                    </button>
                  )
                })}
              </div>
            )}
            {!searching && results.proposals.length > 0 && (
              <div>
                <div style={groupLabel}>PROPOSTAS</div>
                {results.proposals.map(p => {
                  const sc = PROPOSAL_STATUS[p.status] ?? { color: 'var(--text-muted)', bg: 'rgba(138,133,124,0.12)' }
                  return (
                    <button key={p.id} onClick={() => goTo(`/propostas/${p.id}`)} style={resultRow}>
                      <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold)' }}>{p.numero}</span> · {p.empresa}
                      </span>
                      <span style={{ fontSize: 10.5, fontWeight: 600, color: sc.color, background: sc.bg, padding: '2px 8px', borderRadius: 20, flexShrink: 0 }}>
                        {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notificações */}
      <div ref={notifRef} style={{ position: 'relative' }}>
        <button onClick={toggleNotif} style={{
          position: 'relative', width: 40, height: 40, borderRadius: 10,
          background: 'var(--bg-input)', border: '1px solid var(--border-input)',
          color: 'var(--text-secondary)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <BellIcon size={18} />
          {hasUnread && (
            <span style={{
              position: 'absolute', top: 9, right: 10,
              width: 7, height: 7, borderRadius: '50%', background: 'var(--gold)',
            }} />
          )}
        </button>

        {notifOpen && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 320,
            background: 'var(--bg-card)', border: '1px solid var(--border-card)',
            borderRadius: 12, boxShadow: '0 16px 32px rgba(0,0,0,0.45)',
            maxHeight: 400, overflowY: 'auto', zIndex: 30,
          }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-card)', fontSize: 12.5, fontWeight: 700, color: 'var(--text-secondary)' }}>
              Atividade recente
            </div>
            {activities.length === 0 ? (
              <div style={{ padding: '20px 14px', fontSize: 12.5, color: 'var(--text-dim)', textAlign: 'center' }}>
                Nenhuma atividade ainda
              </div>
            ) : activities.map(a => (
              <button
                key={a.id}
                onClick={() => a.client_id && goTo(`/crm/${a.client_id}`)}
                style={{
                  display: 'flex', gap: 11, width: '100%', textAlign: 'left',
                  padding: '11px 14px', background: 'none', border: 'none',
                  borderBottom: '1px solid #1a181c', cursor: a.client_id ? 'pointer' : 'default',
                }}
              >
                <div style={{
                  width: 30, height: 30, flexShrink: 0, borderRadius: 8,
                  background: `${a.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                }}>
                  {a.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, color: '#d4cfc5', lineHeight: 1.35 }}>{a.text}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>
                    {a.clients?.empresa ? `${a.clients.empresa} · ` : ''}{timeAgo(a.created_at)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}

const groupLabel: React.CSSProperties = {
  fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-dim)',
  padding: '8px 10px 4px',
}

const resultRow: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
  width: '100%', textAlign: 'left', padding: '9px 10px', borderRadius: 8,
  background: 'none', border: 'none', cursor: 'pointer',
}
