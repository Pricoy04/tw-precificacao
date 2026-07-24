'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { formatCurrency, PROPOSAL_STATUS } from '@/lib/utils'
import { FloppyDiskIcon, TrashIcon, ArrowLeftIcon, FilePptIcon } from '@phosphor-icons/react'

const STATUS_OPTIONS = ['rascunho', 'enviada', 'aceita', 'recusada']

export default function EditarPropostaPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  const [error, setError]       = useState('')

  const [empresa, setEmpresa]   = useState('')
  const [cnpj, setCnpj]         = useState('')
  const [contato, setContato]   = useState('')
  const [cargo, setCargo]       = useState('')
  const [prazo, setPrazo]       = useState('')
  const [validade, setValidade] = useState('')
  const [condicoes, setCondicoes] = useState('')
  const [desconto, setDesconto] = useState(0)
  const [total, setTotal]       = useState(0)
  const [status, setStatus]     = useState('rascunho')
  const [numero, setNumero]     = useState('')
  const [services, setServices] = useState<{ nome: string; desc: string; valor: number }[]>([])

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
        setServices(data.proposal_services ?? [])
        setLoading(false)
      })
      .catch(() => { setError('Erro ao carregar proposta.'); setLoading(false) })
  }, [id])

  async function handleSave() {
    setSaving(true)
    setError('')
    const res = await fetch(`/api/proposals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ empresa, cnpj, contato, cargo, prazo, validade, condicoes, desconto, total, status }),
    })
    setSaving(false)
    if (!res.ok) { setError('Erro ao salvar.'); return }
    router.push('/propostas')
    router.refresh()
  }

  async function handleDelete() {
    if (!confirmDel) { setConfirmDel(true); return }
    setDeleting(true)
    await fetch(`/api/proposals/${id}`, { method: 'DELETE' })
    router.push('/propostas')
    router.refresh()
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

  return (
    <>
      <Header title={`Proposta ${numero || ''}`} subtitle={empresa || 'Editar proposta'} />
      <div style={{ flex: 1, overflowY: 'auto', padding: 28 }} className="animate-fade">
        <div style={{ maxWidth: 820, margin: '0 auto' }}>

          {/* Back + actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <button onClick={() => router.back()} style={{
              display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none',
              color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, padding: 0,
            }}>
              <ArrowLeftIcon size={15} /> Voltar às propostas
            </button>
            <span style={{ fontSize: 12, fontWeight: 600, color: sc.color, background: sc.bg, padding: '5px 14px', borderRadius: 20 }}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>

          {error && (
            <div style={{ background: 'rgba(196,117,106,0.12)', border: '1px solid rgba(196,117,106,0.3)', borderRadius: 9, padding: '10px 14px', fontSize: 13, color: '#c4756a', marginBottom: 20 }}>
              {error}
            </div>
          )}

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
                  <input style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }} type="number" value={desconto} onChange={e => setDesconto(Number(e.target.value) || 0)} />
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
                  <input style={{ ...inputStyle, fontFamily: 'var(--font-mono)', color: 'var(--gold-light)' }}
                    type="number" value={total} onChange={e => setTotal(Number(e.target.value) || 0)} />
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
        </div>
      </div>
    </>
  )
}
