'use client'

import { BellIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
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

      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'var(--bg-input)', border: '1px solid var(--border-input)',
        borderRadius: 10, padding: '0 13px', width: 280,
      }}>
        <MagnifyingGlassIcon size={16} color="var(--text-dim)" />
        <input
          placeholder="Buscar cliente, proposta..."
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: 'var(--text-primary)', fontSize: 13.5, padding: '10px 0',
          }}
        />
      </div>

      <button style={{
        position: 'relative', width: 40, height: 40, borderRadius: 10,
        background: 'var(--bg-input)', border: '1px solid var(--border-input)',
        color: 'var(--text-secondary)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <BellIcon size={18} />
        <span style={{
          position: 'absolute', top: 9, right: 10,
          width: 7, height: 7, borderRadius: '50%', background: 'var(--gold)',
        }} />
      </button>
    </header>
  )
}
