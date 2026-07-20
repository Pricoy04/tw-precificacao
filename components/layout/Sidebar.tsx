'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  ChartBarIcon, UsersIcon, FunnelIcon, FileTextIcon, CalendarIcon,
  PlusIcon, SignOutIcon, HouseIcon,
} from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/',          label: 'Dashboard',  Icon: HouseIcon },
  { href: '/crm',       label: 'CRM',        Icon: UsersIcon },
  { href: '/funil',     label: 'Funil',      Icon: FunnelIcon },
  { href: '/propostas', label: 'Propostas',  Icon: FileTextIcon },
  { href: '/agenda',    label: 'Agenda',     Icon: CalendarIcon },
]

function getInitials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('')

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('name, role')
        .eq('id', user.id)
        .single()

      if (profile?.name) {
        setUserName(profile.name)
        setUserRole(profile.role ?? '')
      } else {
        const emailName = user.email?.split('@')[0] ?? ''
        setUserName(emailName)
        setUserRole('')
      }
    }
    loadUser()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside style={{
      width: 252,
      flexShrink: 0,
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      height: '100vh',
    }}>
      {/* Logo */}
      <div style={{
        padding: '22px 20px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: 10,
          background: 'linear-gradient(135deg, #2a2620, #1a1812)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 0 1px var(--gold-border)',
          fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16, color: 'var(--gold)',
        }}>TW</div>
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 15, letterSpacing: '0.03em' }}>
            TW CONSULTORIA
          </div>
          <div style={{ fontSize: 9.5, letterSpacing: '0.3em', color: 'var(--gold)', fontWeight: 600 }}>
            EMPRESARIAL
          </div>
        </div>
      </div>

      {/* Nova proposta CTA */}
      <div style={{ padding: '18px 14px 8px' }}>
        <Link href="/propostas/nova" style={{
          width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
          background: 'var(--gold-grad)', color: '#1a1408',
          border: 'none', borderRadius: 10, padding: 12,
          fontWeight: 700, fontSize: 13.5, fontFamily: 'var(--font-heading)',
          cursor: 'pointer', boxShadow: '0 5px 16px rgba(217,168,44,0.2)',
          textDecoration: 'none',
        }}>
          <PlusIcon size={16} weight="bold" />
          Nova proposta
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 3, overflowY: 'auto' }}>
        <div style={{ fontSize: 10.5, letterSpacing: '0.16em', color: 'var(--text-dim)', fontWeight: 600, padding: '12px 10px 8px' }}>
          NAVEGAÇÃO
        </div>
        {navItems.map(({ href, label, Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return active ? (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              width: '100%', textAlign: 'left',
              background: 'rgba(217,168,44,0.1)',
              border: '1px solid rgba(217,168,44,0.22)',
              borderRadius: 10, padding: '11px 12px',
              color: 'var(--gold-light)', fontSize: 14, fontWeight: 600,
              position: 'relative', textDecoration: 'none',
            }}>
              <span style={{
                position: 'absolute', left: -14, top: '50%', transform: 'translateY(-50%)',
                width: 3, height: 22, background: 'var(--gold)', borderRadius: '0 3px 3px 0',
              }} />
              <Icon size={19} weight="fill" color="var(--gold)" />
              {label}
            </Link>
          ) : (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              width: '100%', textAlign: 'left',
              background: 'transparent', border: '1px solid transparent',
              borderRadius: 10, padding: '11px 12px',
              color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500,
              textDecoration: 'none',
            }}>
              <Icon size={19} color="var(--text-muted)" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div style={{ padding: 14, borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: 8, borderRadius: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: 'linear-gradient(135deg, #2a2620, #1a1812)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--gold)', fontSize: 14,
            boxShadow: '0 0 0 1px rgba(217,168,44,0.2)',
          }}>{userName ? getInitials(userName) : '…'}</div>
          <div style={{ flex: 1, lineHeight: 1.25, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userName || '…'}
            </div>
            {userRole && <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{userRole}</div>}
          </div>
          <button onClick={handleLogout} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-dim)', display: 'flex', padding: 4,
          }}>
            <SignOutIcon size={17} />
          </button>
        </div>
      </div>
    </aside>
  )
}
