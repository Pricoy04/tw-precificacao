'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import Link from 'next/link'
import { ETAPAS, ETAPA_COLORS, formatCurrency } from '@/lib/utils'
import {
  ArrowLeftIcon, FilePlusIcon, PhoneIcon, EnvelopeIcon,
  PencilSimpleIcon, FloppyDiskIcon, XIcon, TrashIcon,
} from '@phosphor-icons/react'

const SEGMENTOS = ['Indústria', 'Serviços', 'Varejo', 'Tecnologia', 'Saúde', 'Educação', 'Agro', 'Outros']
const ORIGENS   = ['Indicação', 'LinkedIn', 'Site', 'Cold Outreach', 'Evento', 'Parceiro', 'Outros']

export default function ClientePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [client, setClient]       = useState<any>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [editing, setEditing]     = useState(false)
  const [saving, setSaving]       = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  const [error, setError]         = useState('')

  // edit fields
  const [empresa, setEmpresa]       = useState('')
  const [segmento, setSegmento]     = useState('')
  const [cidade, setCidade]         = useState('')
  const [contato, setContato]       = useState('')
  const [cargo, setCargo]           = useState('')
  const [email, setEmail]           = useState('')
  const [telefone, setTelefone]     = useState('')
  const [origem, setOrigem]         = useState('')
  const [etapa, setEtapa]           = useState('')
  const [valor, setValor]           = useState<number | ''>('')
  const [responsavel, setResponsavel] = useState('')
  const [score, setScore]           = useState<number | ''>('')
  const [responsaveis, setResponsaveis] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    fetch('/api/profiles')
      .then(r => r.json())
      .then((data: { id: string; name: string }[]) => setResponsaveis(Array.isArray(data) ? data.filter(p => p.name) : []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch(`/api/clients/${id}`)
      .then(r => r.json())
      .then(({ client: c, activities: a }) => {
        setClient(c)
        setActivities(a ?? [])
        fillForm(c)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  function fillForm(c: any) {
    setEmpresa(c.empresa ?? '')
    setSegmento(c.segmento ?? '')
    setCidade(c.cidade ?? '')
    setContato(c.contato ?? '')
    setCargo(c.cargo ?? '')
    setEmail(c.email ?? '')
    setTelefone(c.telefone ?? '')
    setOrigem(c.origem ?? '')
    setEtapa(c.etapa ?? 'Prospecção')
    setValor(c.valor ?? '')
    setResponsavel(c.responsavel ?? '')
    setScore(c.score ?? '')
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    const res = await fetch(`/api/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        empresa, segmento, cidade, contato, cargo,
        email, telefone, origem, etapa,
        valor: valor === '' ? null : Number(valor),
        responsavel,
        score: score === '' ? null : Number(score),
      }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error ?? 'Erro ao salvar.'); return }
    setClient(data)
    setEditing(false)
  }

  function handleCancel() {
    fillForm(client)
    setEditing(false)
    setError('')
  }

  async function handleDelete() {
    if (!confirmDel) { setConfirmDel(true); return }
    await fetch(`/api/clients/${id}`, { method: 'DELETE' })
    router.push('/crm')
  }

  async function handleEtapa(nova: string) {
    const res = await fetch(`/api/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ etapa: nova }),
    })
    if (res.ok) {
      const data = await res.json()
      setClient(data)
      setEtapa(data.etapa)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-input)',
    borderRadius: 9, padding: '10px 13px', fontSize: 13.5,
    color: 'var(--text-primary)', fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5, display: 'block',
  }

  if (loading) return (
    <>
      <Header title="Cliente" subtitle="Carregando..." />
      <div style={{ padding: 28, color: 'var(--text-muted)' }}>Carregando...</div>
    </>
  )
  if (!client) return (
    <>
      <Header title="Não encontrado" subtitle="" />
      <div style={{ padding: 28 }}><Link href="/crm">← Voltar ao CRM</Link></div>
    </>
  )

  const ec = ETAPA_COLORS[client.etapa] ?? { color: 'var(--text-muted)', bg: 'rgba(138,133,124,0.12)' }
  const initials = client.empresa.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <>
      <Header title={client.empresa} subtitle={`${client.segmento ?? ''} · ${client.cidade ?? ''}`} />
      <div style={{ flex: 1, overflowY: 'auto', padding: 28 }} className="animate-fade">

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <Link href="/crm" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none' }}>
            <ArrowLeftIcon size={15} /> Voltar para o CRM
          </Link>
          <div style={{ display: 'flex', gap: 8 }}>
            {editing ? (
              <>
                <button onClick={handleCancel} style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                  background: 'transparent', border: '1px solid var(--border-input)',
                  borderRadius: 9, color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer',
                }}>
                  <XIcon size={14} /> Cancelar
                </button>
                <button onClick={handleSave} disabled={saving} style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px',
                  background: 'var(--gold-grad)', border: 'none',
                  borderRadius: 9, color: '#1a1408', fontSize: 13, fontWeight: 700,
                  fontFamily: 'var(--font-heading)', cursor: 'pointer',
                }}>
                  <FloppyDiskIcon size={14} weight="bold" />
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(true)} style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                  background: 'var(--bg-card)', border: '1px solid var(--border-input)',
                  borderRadius: 9, color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer',
                }}>
                  <PencilSimpleIcon size={14} /> Editar cliente
                </button>
                <button onClick={handleDelete} style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                  background: confirmDel ? 'rgba(196,117,106,0.15)' : 'transparent',
                  border: `1px solid ${confirmDel ? 'rgba(196,117,106,0.4)' : 'var(--border-input)'}`,
                  borderRadius: 9, color: confirmDel ? '#c4756a' : 'var(--text-muted)', fontSize: 13, cursor: 'pointer',
                }}>
                  <TrashIcon size={14} />
                  {confirmDel ? 'Confirmar exclusão' : ''}
                </button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(196,117,106,0.12)', border: '1px solid rgba(196,117,106,0.3)', borderRadius: 9, padding: '10px 14px', fontSize: 13, color: '#c4756a', marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, maxWidth: 1080 }}>

          {/* ── LEFT ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {editing ? (
              /* EDIT FORM */
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 14, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--text-dim)' }}>DADOS DA EMPRESA</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Empresa *</label>
                    <input style={inputStyle} value={empresa} onChange={e => setEmpresa(e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Segmento</label>
                    <select style={{ ...inputStyle, cursor: 'pointer' }} value={segmento} onChange={e => setSegmento(e.target.value)}>
                      <option value="">Selecionar...</option>
                      {SEGMENTOS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Cidade</label>
                    <input style={inputStyle} value={cidade} onChange={e => setCidade(e.target.value)} />
                  </div>
                </div>

                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--text-dim)', marginTop: 4 }}>CONTATO</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Nome do contato</label>
                    <input style={inputStyle} value={contato} onChange={e => setContato(e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Cargo</label>
                    <input style={inputStyle} value={cargo} onChange={e => setCargo(e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Telefone</label>
                    <input style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }} value={telefone} onChange={e => setTelefone(e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>E-mail</label>
                    <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                </div>

                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--text-dim)', marginTop: 4 }}>OPORTUNIDADE</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Etapa</label>
                    <select style={{ ...inputStyle, cursor: 'pointer' }} value={etapa} onChange={e => setEtapa(e.target.value)}>
                      {ETAPAS.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Valor (R$) — sem pontos</label>
                    <input
                      style={{ ...inputStyle, fontFamily: 'var(--font-mono)', color: 'var(--gold-light)' }}
                      type="number" step="0.01" min="0"
                      value={valor}
                      onChange={e => setValor(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Ex: 6400"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Score (0–100)</label>
                    <input style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }} type="number" min="0" max="100" value={score} onChange={e => setScore(e.target.value === '' ? '' : Number(e.target.value))} />
                  </div>
                  <div>
                    <label style={labelStyle}>Origem</label>
                    <select style={{ ...inputStyle, cursor: 'pointer' }} value={origem} onChange={e => setOrigem(e.target.value)}>
                      <option value="">Selecionar...</option>
                      {ORIGENS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div style={{ gridColumn: '2 / -1' }}>
                    <label style={labelStyle}>Responsável</label>
                    <select style={{ ...inputStyle, cursor: 'pointer' }} value={responsavel} onChange={e => setResponsavel(e.target.value)}>
                      <option value="">Selecionar...</option>
                      {responsavel && !responsaveis.some(r => r.name === responsavel) && (
                        <option value={responsavel}>{responsavel}</option>
                      )}
                      {responsaveis.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              /* READ-ONLY VIEW */
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
                      {client.segmento}{client.cidade ? ` · ${client.cidade}` : ''}
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
            )}

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
                          {new Date(h.created_at).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT ── */}
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
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Mover etapa</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {ETAPAS.filter(e => e !== client.etapa).map(e => {
                  const ec2 = ETAPA_COLORS[e] ?? { color: 'var(--text-muted)', bg: 'transparent' }
                  return (
                    <button key={e} onClick={() => handleEtapa(e)} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: 'var(--bg-card-alt)', border: '1px solid var(--border-input)',
                      color: '#d4cfc5', borderRadius: 9, padding: '10px 14px', fontSize: 13, cursor: 'pointer',
                    }}>
                      <span>Mover para {e}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: ec2.color, background: ec2.bg, padding: '2px 8px', borderRadius: 12 }}>{e}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
