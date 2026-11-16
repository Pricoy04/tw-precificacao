'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { formatCurrency, formatDate, PROPOSAL_STATUS } from '@/lib/utils'
import {
  FloppyDiskIcon, TrashIcon, ArrowLeftIcon,
  PencilSimpleIcon, EyeIcon,
} from '@phosphor-icons/react'

const STATUS_OPTIONS = ['rascunho', 'enviada', 'aceita', 'recusada']

export default function EditarPropostaPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  const [view, setView]         = useState<'edit' | 'preview'>('edit')
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  const [error, setError]       = useState('')

  const [empresa, setEmpresa]     = useState('')
  const [cnpj, setCnpj]           = useState('')
  const [contato, setContato]     = useState('')
  const [cargo, setCargo]         = useState('')
  const [prazo, setPrazo]         = useState('')
  const [validade, setValidade]   = useState('')
  const [condicoes, setCondicoes] = useState('')
  const [desconto, setDesconto]   = useState(0)
  const [total, setTotal]         = useState(0)
  const [status, setStatus]       = useState('rascunho')
  const [numero, setNumero]       = useState('')
  const [createdAt, setCreatedAt] = useState('')
  const [services, setServices]   = useState<{ nome: string; descricao: string; valor: number }[]>([])

  useEffect(() => {
    fetch(`/api/proposals/${id}`)
      .then(r => r.json())
      .then(data => {
        setEmpresa(data.empresa ?? '')
        setCnpj(data.cnpj ?? '')
        setContato(data.contato ?? '')
        setCargo(data.cargo ?? '')
        setPrazo(data.prazo ?? '')
        setValidade(data.validade ?? '')
        setCondicoes(data.condicoes ?? '')
        setDesconto(data.desconto ?? 0)
        setTotal(data.total ?? 0)
        setStatus(data.status ?? 'rascunho')
        setNumero(data.numero ?? '')
        setCreatedAt(data.created_at ?? '')
        setServices(data.proposal_services ?? [])
        setLoading(false)
      })
      .catch(() => { setError('Erro ao carregar proposta.'); setLoading(false) })
  }, [id])

  async function handleSave() {
    setSaving(true)
    setError('')
    const subtotalAtual = services.reduce((s, svc) => s + (svc.valor ?? 0), 0)
    const totalParaSalvar = subtotalAtual > 0 ? subtotalAtual - subtotalAtual * (desconto / 100) : total
    try {
      const res = await fetch(`/api/proposals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresa, cnpj, contato, cargo, prazo, validade, condicoes, desconto, total: totalParaSalvar, status }),
      })
      if (!res.ok) { setError('Erro ao salvar.'); return }
      router.push('/propostas')
      router.refresh()
    } catch {
      setError('Não foi possível conectar ao servidor.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirmDel) { setConfirmDel(true); return }
    setDeleting(true)
    setError('')
    try {
      const res = await fetch(`/api/proposals/${id}`, { method: 'DELETE' })
      if (!res.ok) { setError('Erro ao excluir a proposta.'); setConfirmDel(false); return }
      router.push('/propostas')
      router.refresh()
    } catch {
      setError('Não foi possível conectar ao servidor.')
      setConfirmDel(false)
    } finally {
      setDeleting(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-input)',
    borderRadius: 9, padding: '11px 14px', fontSize: 13.5,
    color: 'var(--text-primary)', fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block',
  }

  if (loading) return (
    <>
      <Header title="Proposta" subtitle="Carregando..." />
      <div style={{ padding: 28, color: 'var(--text-muted)' }}>Carregando proposta...</div>
    </>
  )

  const sc = PROPOSAL_STATUS[status] ?? { color: 'var(--text-muted)', bg: 'rgba(138,133,124,0.12)' }
  const subtotal = services.reduce((s, svc) => s + (svc.valor ?? 0), 0)
  const descontoVal = subtotal > 0 ? subtotal * (desconto / 100) : 0
  const totalCalc = subtotal - descontoVal

  return (
    <>
      <Header title={`Proposta ${numero || ''}`} subtitle={empresa || 'Proposta'} />
      <div style={{ flex: 1, overflowY: 'auto', padding: 28 }} className="animate-fade">
        <div style={{ maxWidth: 860, margin: '0 auto' }}>

          {/* Top bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <button onClick={() => router.back()} style={{
              display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none',
              color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, padding: 0,
            }}>
              <ArrowLeftIcon size={15} /> Voltar às propostas
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* View toggle */}
              <div style={{ display: 'flex', background: 'var(--bg-card)', border: '1px solid var(--border-input)', borderRadius: 9, overflow: 'hidden' }}>
                {([
                  { id: 'edit',    Icon: PencilSimpleIcon, label: 'Editar' },
                  { id: 'preview', Icon: EyeIcon,          label: 'Prévia' },
                ] as const).map(({ id: vid, Icon, label }) => (
                  <button key={vid} onClick={() => setView(vid)} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px',
                    border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 600,
                    background: view === vid ? 'rgba(217,168,44,0.15)' : 'transparent',
                    color: view === vid ? 'var(--gold)' : 'var(--text-secondary)',
                  }}>
                    <Icon size={14} />
                    {label}
                  </button>
                ))}
              </div>

              <span style={{ fontSize: 12, fontWeight: 600, color: sc.color, background: sc.bg, padding: '5px 14px', borderRadius: 20 }}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(196,117,106,0.12)', border: '1px solid rgba(196,117,106,0.3)', borderRadius: 9, padding: '10px 14px', fontSize: 13, color: '#c4756a', marginBottom: 20 }}>
              {error}
            </div>
          )}

          {/* ── EDIT MODE ── */}
          {view === 'edit' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Dados do cliente */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 14, padding: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--text-dim)', marginBottom: 16 }}>DADOS DO CLIENTE</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Empresa</label>
                    <input style={inputStyle} value={empresa} onChange={e => setEmpresa(e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>CNPJ</label>
                    <input style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }} value={cnpj} onChange={e => setCnpj(e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Contato</label>
                    <input style={inputStyle} value={contato} onChange={e => setContato(e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Cargo</label>
                    <input style={inputStyle} value={cargo} onChange={e => setCargo(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Prazos e condições */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 14, padding: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--text-dim)', marginBottom: 16 }}>PRAZOS E CONDIÇÕES</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Prazo de execução</label>
                    <input style={inputStyle} value={prazo} onChange={e => setPrazo(e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Validade</label>
                    <input style={inputStyle} value={validade} onChange={e => setValidade(e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Desconto (%)</label>
                    <input
                      style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }}
                      type="number" min="0" max="100" value={desconto}
                      onChange={e => setDesconto(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Condições de pagamento</label>
                    <input style={inputStyle} value={condicoes} onChange={e => setCondicoes(e.target.value)} placeholder="Ex: 50% na assinatura, 50% na entrega" />
                  </div>
                </div>
              </div>

              {/* Status + Total */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 14, padding: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--text-dim)', marginBottom: 16 }}>STATUS E VALOR</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Status</label>
                    <select style={{ ...inputStyle, cursor: 'pointer' }} value={status} onChange={e => setStatus(e.target.value)}>
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Valor total (R$)</label>
                    {subtotal > 0 ? (
                      <div style={{ ...inputStyle, fontFamily: 'var(--font-mono)', color: 'var(--gold-light)', display: 'flex', alignItems: 'center' }}>
                        {formatCurrency(totalCalc)}
                      </div>
                    ) : (
                      <input style={{ ...inputStyle, fontFamily: 'var(--font-mono)', color: 'var(--gold-light)' }}
                        type="number" min="0" value={total} onChange={e => setTotal(Math.max(0, Number(e.target.value) || 0))} />
                    )}
                    {subtotal > 0 && (
                      <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 5 }}>
                        Calculado a partir do subtotal dos serviços e do desconto
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Serviços (somente leitura) */}
              {services.length > 0 && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 14, padding: 24 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--text-dim)', marginBottom: 16 }}>SERVIÇOS DO ESCOPO</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {services.map((s: any, i: number) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-input)', borderRadius: 9 }}>
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>{s.nome}</div>
                          {s.descricao && <div style={{ fontSize: 11.5, color: 'var(--text-dim)', marginTop: 2 }}>{s.descricao}</div>}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13.5, color: 'var(--gold-light)', fontWeight: 500 }}>
                          {formatCurrency(s.valor)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
                <button onClick={handleDelete} disabled={deleting} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '11px 20px', borderRadius: 9, fontSize: 13.5, fontWeight: 600,
                  background: confirmDel ? 'rgba(196,117,106,0.2)' : 'transparent',
                  border: `1px solid ${confirmDel ? 'rgba(196,117,106,0.5)' : 'var(--border-input)'}`,
                  color: confirmDel ? '#c4756a' : 'var(--text-secondary)', cursor: 'pointer',
                }}>
                  <TrashIcon size={16} />
                  {deleting ? 'Excluindo...' : confirmDel ? 'Confirmar exclusão' : 'Excluir proposta'}
                </button>
                {confirmDel && (
                  <button onClick={() => setConfirmDel(false)} style={{
                    padding: '11px 18px', borderRadius: 9, fontSize: 13.5, fontWeight: 600,
                    background: 'transparent', border: '1px solid var(--border-input)',
                    color: 'var(--text-secondary)', cursor: 'pointer',
                  }}>
                    Cancelar
                  </button>
                )}
                <button onClick={handleSave} disabled={saving} style={{
                  marginLeft: 'auto',
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '11px 28px', borderRadius: 9, fontSize: 13.5, fontWeight: 700,
                  background: 'var(--gold-grad)', border: 'none',
                  color: '#1a1408', cursor: saving ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-heading)', opacity: saving ? 0.7 : 1,
                }}>
                  <FloppyDiskIcon size={16} weight="bold" />
                  {saving ? 'Salvando...' : 'Salvar alterações'}
                </button>
              </div>
            </div>
          )}

          {/* ── PREVIEW MODE ── */}
          {view === 'preview' && (
            <ProposalPreview
              numero={numero}
              empresa={empresa}
              cnpj={cnpj}
              contato={contato}
              cargo={cargo}
              prazo={prazo}
              validade={validade}
              condicoes={condicoes}
              desconto={desconto}
              descontoVal={descontoVal}
              subtotal={subtotal}
              totalCalc={subtotal > 0 ? totalCalc : total}
              status={status}
              services={services}
              createdAt={createdAt}
            />
          )}
        </div>
      </div>
    </>
  )
}

/* ── PROPOSAL PREVIEW ────────────────────────────── */
function ProposalPreview({
  numero, empresa, cnpj, contato, cargo,
  prazo, validade, condicoes, desconto, descontoVal,
  subtotal, totalCalc, status, services, createdAt,
}: {
  numero: string; empresa: string; cnpj: string; contato: string; cargo: string;
  prazo: string; validade: string; condicoes: string; desconto: number;
  descontoVal: number; subtotal: number; totalCalc: number; status: string;
  services: { nome: string; descricao: string; valor: number }[];
  createdAt: string;
}) {
  return (
    <div style={{
      background: '#0f0e10',
      border: '1px solid rgba(217,168,44,0.2)',
      borderRadius: 16,
      overflow: 'hidden',
      fontFamily: 'var(--font-body)',
    }}>
      {/* Top gold bar */}
      <div style={{ height: 3, background: 'linear-gradient(90deg, #e3b53f, #cf9a1f, #e3b53f)' }} />

      {/* Header */}
      <div style={{
        padding: '32px 40px 28px',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(217,168,44,0.12)',
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20, color: 'var(--gold)', letterSpacing: '0.06em' }}>
            TW CONSULTORIA
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-dim)', letterSpacing: '0.1em', marginTop: 3 }}>
            EMPRESARIAL
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.05em' }}>
            {numero}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-dim)', marginTop: 4 }}>
            PROPOSTA COMERCIAL
          </div>
          {createdAt && (
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 3, fontFamily: 'var(--font-mono)' }}>
              Emitida em {formatDate(createdAt)}
            </div>
          )}
        </div>
      </div>

      {/* Client block */}
      <div style={{ padding: '28px 40px', borderBottom: '1px solid rgba(217,168,44,0.08)' }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--text-dim)', marginBottom: 16, textTransform: 'uppercase' }}>
          Preparada para
        </div>
        <div style={{
          background: 'rgba(217,168,44,0.04)',
          border: '1px solid rgba(217,168,44,0.12)',
          borderRadius: 12, padding: '20px 24px',
          display: 'flex', gap: 40, flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>{empresa || '—'}</div>
            {cnpj && <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>CNPJ: {cnpj}</div>}
          </div>
          {(contato || cargo) && (
            <div style={{ borderLeft: '1px solid rgba(217,168,44,0.15)', paddingLeft: 32 }}>
              {contato && <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', fontWeight: 500 }}>{contato}</div>}
              {cargo && <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 3 }}>{cargo}</div>}
            </div>
          )}
        </div>
      </div>

      {/* Services */}
      {services.length > 0 && (
        <div style={{ padding: '28px 40px', borderBottom: '1px solid rgba(217,168,44,0.08)' }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--text-dim)', marginBottom: 16, textTransform: 'uppercase' }}>
            Escopo de Serviços
          </div>

          {/* Header row */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr auto',
            gap: 20, padding: '8px 0',
            borderBottom: '1px solid rgba(217,168,44,0.15)',
            fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em',
            color: 'var(--text-dim)', textTransform: 'uppercase',
          }}>
            <div>Serviço / Descrição</div>
            <div style={{ textAlign: 'right' }}>Valor</div>
          </div>

          {services.map((s, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '1fr auto',
              gap: 20, padding: '14px 0',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{s.nome}</div>
                {s.descricao && <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 3 }}>{s.descricao}</div>}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500, textAlign: 'right', whiteSpace: 'nowrap' }}>
                {formatCurrency(s.valor)}
              </div>
            </div>
          ))}

          {/* Subtotals */}
          <div style={{ marginTop: 12, paddingTop: 16, borderTop: '1px solid rgba(217,168,44,0.2)' }}>
            {desconto > 0 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12.5, color: 'var(--text-dim)' }}>Subtotal</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-secondary)' }}>{formatCurrency(subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 12.5, color: '#7fb38a' }}>Desconto ({desconto}%)</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#7fb38a' }}>− {formatCurrency(descontoVal)}</span>
                </div>
              </>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', letterSpacing: '0.05em' }}>
                TOTAL DO INVESTIMENTO
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: 'var(--gold)' }}>
                {formatCurrency(totalCalc)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Conditions */}
      {(prazo || validade || condicoes) && (
        <div style={{ padding: '28px 40px', borderBottom: '1px solid rgba(217,168,44,0.08)' }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--text-dim)', marginBottom: 16, textTransform: 'uppercase' }}>
            Prazos e Condições
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {prazo && (
              <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
                <span style={{ fontSize: 11.5, color: 'var(--text-dim)', minWidth: 160 }}>Prazo de execução</span>
                <span style={{ fontSize: 13.5, color: 'var(--text-primary)', fontWeight: 500 }}>{prazo}</span>
              </div>
            )}
            {validade && (
              <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
                <span style={{ fontSize: 11.5, color: 'var(--text-dim)', minWidth: 160 }}>Validade da proposta</span>
                <span style={{ fontSize: 13.5, color: 'var(--text-primary)', fontWeight: 500 }}>{validade}</span>
              </div>
            )}
            {condicoes && (
              <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
                <span style={{ fontSize: 11.5, color: 'var(--text-dim)', minWidth: 160 }}>Condições de pagamento</span>
                <span style={{ fontSize: 13.5, color: 'var(--text-primary)', fontWeight: 500 }}>{condicoes}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        padding: '20px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(217,168,44,0.03)',
      }}>
        <div style={{ fontSize: 11.5, color: 'var(--text-dim)' }}>
          TW Consultoria Empresarial — Gestão Estratégica de Precificação
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {validade && (
            <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>Válida por {validade}</span>
          )}
          <span style={{
            fontSize: 11, fontWeight: 600,
            color: PROPOSAL_STATUS[status]?.color ?? 'var(--text-muted)',
            background: PROPOSAL_STATUS[status]?.bg ?? 'rgba(138,133,124,0.12)',
            padding: '3px 10px', borderRadius: 20,
          }}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      </div>

      {/* Bottom gold bar */}
      <div style={{ height: 3, background: 'linear-gradient(90deg, #e3b53f, #cf9a1f, #e3b53f)' }} />
    </div>
  )
}
