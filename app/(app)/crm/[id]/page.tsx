import { Header } from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ETAPA_COLORS, formatCurrency } from '@/lib/utils'
import {
  ArrowLeftIcon, FilePlusIcon, PhoneIcon, EnvelopeIcon,
} from '@phosphor-icons/react/dist/ssr'

export default async function ClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [clientRes, activitiesRes] = await Promise.all([
    supabase.from('clients').select('*').eq('id', id).single(),
    supabase.from('client_activities').select('*').eq('client_id', id).order('created_at', { ascending: false }),
  ])

  if (clientRes.error) notFound()
  const client = clientRes.data
  const activities = activitiesRes.data ?? []
  const ec = ETAPA_COLORS[client.etapa] ?? { color: 'var(--text-muted)', bg: 'rgba(138,133,124,0.12)' }
  const initials = client.empresa.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <>
      <Header title={client.empresa} subtitle={`${client.segmento} · ${client.cidade ?? ''}`} />
      <div style={{ flex: 1, overflowY: 'auto', padding: 28 }} className="animate-fade">

        <Link href="/crm" style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          color: 'var(--text-muted)', fontSize: 13, marginBottom: 18, textDecoration: 'none',
        }}>
          <ArrowLeftIcon size={15} /> Voltar para o CRM
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, maxWidth: 1080 }}>
          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Header card */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 14, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{
                  width: 60, height: 60, flexShrink: 0, borderRadius: 14,
                  background: 'linear-gradient(135deg, #2a2620, #1a1812)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--gold)', fontSize: 20,
                  boxShadow: 'inset 0 0 0 1px rgba(217,168,44,0.2)',
                }}>{initials}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 21 }}>{client.empresa}</div>
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: ec.color, background: ec.bg, padding: '4px 12px', borderRadius: 20 }}>
                      {client.etapa}
                    </span>
                  </div>
                  <div style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 4 }}>
                    {client.segmento} · {client.cidade}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--border-card)', borderRadius: 11, overflow: 'hidden', marginTop: 22 }}>
                {[
                  { label: 'Contato', value: client.contato, sub: client.cargo },
                  { label: 'Telefone', value: client.telefone, mono: true },
                  { label: 'E-mail', value: client.email, small: true },
                  { label: 'Origem', value: client.origem },
                ].map(f => (
                  <div key={f.label} style={{ background: 'var(--bg-card-alt)', padding: '14px 16px' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }}>{f.label}</div>
                    <div style={{ fontSize: f.small ? 12.5 : 13.5, color: 'var(--text-primary)', fontWeight: 500, fontFamily: f.mono ? 'var(--font-mono)' : undefined, wordBreak: 'break-all' }}>
                      {f.value ?? '—'}
                    </div>
                    {f.sub && <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{f.sub}</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* History */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 14, padding: 24 }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 16, marginBottom: 20 }}>Histórico do relacionamento</div>
              {activities.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--text-dim)', textAlign: 'center', padding: '16px 0' }}>Nenhuma atividade registrada</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {activities.map((h: any, idx: number) => (
                    <div key={h.id} style={{ display: 'flex', gap: 14 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                          {h.icon ?? '📌'}
                        </div>
                        {idx < activities.length - 1 && <div style={{ flex: 1, width: 1, background: 'var(--border-input)', minHeight: 14 }} />}
                      </div>
                      <div style={{ paddingBottom: 22, paddingTop: 6 }}>
                        <div style={{ fontSize: 13.5, color: '#d4cfc5' }}>{h.text}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--text-dim)', marginTop: 3 }}>
                          {new Date(h.created_at).toLocaleString('pt-BR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Value card */}
            <div style={{
              background: 'linear-gradient(135deg, #1a160c, #131315)',
              border: '1px solid rgba(217,168,44,0.22)', borderRadius: 14, padding: 22,
            }}>
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Valor da oportunidade</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 30, color: 'var(--gold-light)', marginTop: 8 }}>
                {client.valor ? formatCurrency(client.valor) : '—'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(217,168,44,0.15)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Score de fit</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 17, color: 'var(--text-primary)', fontWeight: 600 }}>{client.score ?? '—'}/100</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Responsável</div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{client.responsavel}</div>
                </div>
              </div>
            </div>

            {/* CTA proposta */}
            <Link href={`/propostas/nova?clienteId=${client.id}`} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
              background: 'var(--gold-grad)', color: '#1a1408',
              border: 'none', borderRadius: 11, padding: 14,
              fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-heading)',
              textDecoration: 'none', boxShadow: '0 5px 16px rgba(217,168,44,0.2)',
            }}>
              <FilePlusIcon size={17} />
              Montar proposta
            </Link>

            {/* Contact buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <a href={`tel:${client.telefone}`} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                background: 'var(--bg-card)', border: '1px solid var(--border-input)',
                color: 'var(--text-primary)', borderRadius: 11, padding: 13, fontSize: 13, fontWeight: 600, textDecoration: 'none',
              }}>
                <PhoneIcon size={16} color="var(--gold)" /> Ligar
              </a>
              <a href={`mailto:${client.email}`} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                background: 'var(--bg-card)', border: '1px solid var(--border-input)',
                color: 'var(--text-primary)', borderRadius: 11, padding: 13, fontSize: 13, fontWeight: 600, textDecoration: 'none',
              }}>
                <EnvelopeIcon size={16} color="var(--gold)" /> E-mail
              </a>
            </div>

            {/* Advance stage */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 14, padding: 20 }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Avançar etapa</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'var(--bg-card-alt)', border: '1px solid var(--border-input)',
                  color: '#d4cfc5', borderRadius: 9, padding: '11px 14px', fontSize: 13, cursor: 'pointer',
                }}>
                  Marcar como ganho <span style={{ color: 'var(--green)' }}>✓</span>
                </button>
                <button style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'var(--bg-card-alt)', border: '1px solid var(--border-input)',
                  color: '#d4cfc5', borderRadius: 9, padding: '11px 14px', fontSize: 13, cursor: 'pointer',
                }}>
                  Agendar reunião <span>📅</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
