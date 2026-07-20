'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EnvelopeSimpleIcon, LockSimpleIcon, EyeIcon, EyeSlashIcon } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('E-mail ou senha incorretos.')
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1.05fr 0.95fr' }}>
      {/* Left — branding */}
      <div style={{
        position: 'relative',
        background: 'radial-gradient(120% 90% at 30% 20%, #1a160c 0%, #0b0b0c 60%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '56px 60px', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', width: 520, height: 520, right: -160, top: -120,
          background: 'radial-gradient(circle, rgba(217,168,44,0.16), transparent 65%)',
          animation: 'twGlow 6s ease-in-out infinite', pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
          <div style={{
            width: 52, height: 52, borderRadius: 11,
            background: 'linear-gradient(135deg, #2a2620, #1a1812)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 0 1px rgba(217,168,44,0.25)',
            fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20, color: 'var(--gold)',
          }}>TW</div>
          <div style={{ lineHeight: 1.05 }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18, letterSpacing: '0.04em' }}>
              TW CONSULTORIA
            </div>
            <div style={{ fontSize: 11.5, letterSpacing: '0.32em', color: 'var(--gold)', fontWeight: 600 }}>
              EMPRESARIAL
            </div>
          </div>
        </div>

        <div style={{ position: 'relative', maxWidth: 440 }}>
          <h1 style={{
            fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 40,
            lineHeight: 1.08, letterSpacing: '-0.01em', color: 'var(--text-primary)',
          }}>
            A gestão da sua consultoria em um só lugar.
          </h1>
          <p style={{ margin: '22px 0 0', color: 'var(--text-muted)', fontSize: 15.5, lineHeight: 1.6 }}>
            CRM, funil de vendas, indicadores e a montadora de propostas — feito sob medida para a rotina dos sócios da TW.
          </p>
          <div style={{ display: 'flex', gap: 28, marginTop: 36 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 600, color: 'var(--gold)' }}>+120</div>
              <div style={{ fontSize: 12, color: '#8a857c', marginTop: 2 }}>clientes atendidos</div>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.08)' }} />
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 600, color: 'var(--gold)' }}>24,6%</div>
              <div style={{ fontSize: 12, color: '#8a857c', marginTop: 2 }}>taxa de conversão</div>
            </div>
          </div>
        </div>

        <div style={{ position: 'relative', fontSize: 12, color: 'var(--text-dim)' }}>
          © 2026 TW Consultoria Empresarial · Plataforma interna
        </div>
      </div>

      {/* Right — form */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 40, background: '#0e0e10',
      }}>
        <div style={{ width: '100%', maxWidth: 380, animation: 'twFade 0.6s ease' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 26, color: 'var(--text-primary)' }}>
            Bem-vindo de volta
          </div>
          <p style={{ margin: '8px 0 32px', color: 'var(--text-muted)', fontSize: 14 }}>
            Acesse o painel de gestão da TW.
          </p>

          <form onSubmit={handleLogin}>
            <label style={{ display: 'block', fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 500 }}>
              E-mail corporativo
            </label>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--bg-input)', border: '1px solid var(--border-input)',
              borderRadius: 11, padding: '0 14px', marginBottom: 18,
            }}>
              <EnvelopeSimpleIcon size={18} color="var(--text-dim)" />
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="seu@twconsultoria.com.br"
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  color: 'var(--text-primary)', fontSize: 14, padding: '13px 0',
                }}
              />
            </div>

            <label style={{ display: 'block', fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 500 }}>
              Senha
            </label>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--bg-input)', border: '1px solid var(--border-input)',
              borderRadius: 11, padding: '0 14px', marginBottom: 14,
            }}>
              <LockSimpleIcon size={18} color="var(--text-dim)" />
              <input
                type={showPass ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  color: 'var(--text-primary)', fontSize: 14, padding: '13px 0',
                }}
              />
              <button type="button" onClick={() => setShowPass(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex' }}>
                {showPass ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>

            {error && (
              <div style={{
                background: 'rgba(196,117,106,0.1)', border: '1px solid rgba(196,117,106,0.25)',
                borderRadius: 9, padding: '10px 14px', fontSize: 13, color: '#c4756a', marginBottom: 16,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', background: 'var(--gold-grad)', color: '#1a1408',
                border: 'none', borderRadius: 11, padding: 15, fontSize: 15,
                fontWeight: 700, fontFamily: 'var(--font-heading)', letterSpacing: '0.01em',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 6px 20px rgba(217,168,44,0.22)',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Entrando...' : 'Entrar na plataforma'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 22, fontSize: 12.5, color: 'var(--text-dim)' }}>
            Acesso restrito aos sócios · TW Consultoria
          </div>
        </div>
      </div>
    </div>
  )
}
