'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { formatCurrency } from '@/lib/utils'
import { FloppyDiskIcon, FilePptIcon } from '@phosphor-icons/react'

const DEFAULT_SERVICES = [
  { nome: 'B.P.O. Pricing', desc: 'Gestão e estruturação de precificação' },
  { nome: 'Palestra', desc: 'Apresentação temática para times e líderes' },
  { nome: 'Workshop', desc: 'Treinamento prático com dinâmicas e entregas' },
  { nome: 'Consultoria', desc: 'Acompanhamento estratégico personalizado' },
  { nome: 'Mentoria', desc: 'Sessões individuais com gestores-chave' },
  { nome: 'Diagnóstico Quick Scan', desc: 'Análise rápida de processos e gargalos' },
]

function NovaPropostaInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const clienteId = searchParams.get('clienteId')

  const [empresa, setEmpresa]   = useState('')
  const [cnpj, setCnpj]         = useState('')
  const [contato, setContato]   = useState('')
  const [cargo, setCargo]       = useState('')
  const [prazo, setPrazo]       = useState('3 meses')
  const [validade, setValidade] = useState('15 dias')
  const [condicoes, setCondicoes] = useState('50% na assinatura, 50% na entrega')
  const [desconto, setDesconto] = useState(0)
  const [selected, setSelected] = useState<number[]>([])
  const [customPrices, setCustomPrices] = useState<Record<number, number>>({})
  const [saving, setSaving]     = useState(false)

  useEffect(() => {
    if (clienteId) {
      fetch(`/api/clients/${clienteId}`)
        .then(r => r.json())
        .then(({ client }) => {
          if (client) {
            setEmpresa(client.empresa ?? '')
            setContato(client.contato ?? '')
            setCargo(client.cargo ?? '')
          }
        })
    }
  }, [clienteId])

  function toggle(i: number) {
    setSelected(s => {
      if (s.includes(i)) {
        const next = s.filter(x => x !== i)
        setCustomPrices(p => { const c = { ...p }; delete c[i]; return c })
        return next
      }
      setCustomPrices(p => ({ ...p, [i]: 0 }))
      return [...s, i]
    })
  }

  function getPrice(i: number) {
    return customPrices[i] ?? 0
  }

  const subtotal = selected.reduce((s, i) => s + getPrice(i), 0)
  const descVal  = subtotal * (desconto / 100)
  const total    = subtotal - descVal

  async function handleSave() {
    setSaving(true)
    const services = selected.map(i => ({ nome: DEFAULT_SERVICES[i].nome, desc: DEFAULT_SERVICES[i].desc, valor: getPrice(i) }))
    await fetch('/api/proposals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clienteId ?? null,
        empresa, cnpj, contato, cargo,
        prazo, validade, condicoes, desconto, total,
        status: 'rascunho',
        services,
      }),
    })
    router.push('/propostas')
  }

  async function handleExportPPT() {
    const pptxgen = (await import('pptxgenjs')).default
    const prs = new pptxgen()

    const s1 = prs.addSlide()
    s1.background = { color: '0b0b0c' }
    s1.addText('TW CONSULTORIA', { x: 0.5, y: 0.3, w: 9, fontSize: 11, bold: true, color: 'd9a82c', charSpacing: 4 })
    s1.addText('PROPOSTA COMERCIAL', { x: 0.5, y: 2.5, w: 9, fontSize: 10, bold: true, color: 'd9a82c', charSpacing: 5 })
    s1.addText(empresa || 'Cliente', { x: 0.5, y: 3, w: 9, fontSize: 32, bold: true, color: 'f4f1ea', fontFace: 'Arial' })
    s1.addText(`Aos cuidados de ${contato} · ${cargo}`, { x: 0.5, y: 4.1, w: 9, fontSize: 11, color: '8a857c' })
    s1.addText(`${new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' })} · Válida por ${validade}`, { x: 0.5, y: 5.2, w: 9, fontSize: 10, color: '6e6a62', fontFace: 'Courier New' })

    const s2 = prs.addSlide()
    s2.background = { color: 'f4f1ea' }
    s2.addText('SOBRE A TW', { x: 0.5, y: 0.4, w: 9, fontSize: 9, bold: true, color: 'b8841a', charSpacing: 4 })
    s2.addText('Consultoria que transforma gestão em resultado', { x: 0.5, y: 0.9, w: 9, fontSize: 18, bold: true, color: '1a1812' })
    s2.addText('Há mais de 8 anos a TW Consultoria Empresarial apoia donos de negócios a estruturar processos, finanças e times comerciais. Já são +120 empresas atendidas.', { x: 0.5, y: 1.8, w: 9, fontSize: 11, color: '4a463e', lineSpacingMultiple: 1.4 })
    s2.addText('+120 empresas', { x: 0.5, y: 3.8, w: 2.5, fontSize: 18, bold: true, color: 'b8841a' })
    s2.addText('8 anos de mercado', { x: 3.2, y: 3.8, w: 2.5, fontSize: 18, bold: true, color: 'b8841a' })
    s2.addText('94% satisfação', { x: 6, y: 3.8, w: 2.5, fontSize: 18, bold: true, color: 'b8841a' })

    const s3 = prs.addSlide()
    s3.background = { color: 'f4f1ea' }
    s3.addText('ESCOPO DO TRABALHO', { x: 0.5, y: 0.4, w: 9, fontSize: 9, bold: true, color: 'b8841a', charSpacing: 4 })
    selected.forEach((si, idx) => {
      const svc = DEFAULT_SERVICES[si]
      s3.addText(`• ${svc.nome}`, { x: 0.5, y: 1.2 + idx * 0.6, w: 7, fontSize: 13, bold: true, color: '1a1812' })
      s3.addText(formatCurrency(getPrice(si)), { x: 7.5, y: 1.2 + idx * 0.6, w: 2, fontSize: 11, color: '6e6a62', align: 'right', fontFace: 'Courier New' })
    })

    const s4 = prs.addSlide()
    s4.background = { color: '0b0b0c' }
    s4.addText('INVESTIMENTO', { x: 0.5, y: 0.5, w: 9, fontSize: 9, bold: true, color: 'd9a82c', charSpacing: 4 })
    s4.addText('Valor total do projeto', { x: 0.5, y: 1.5, w: 9, fontSize: 12, color: '8a857c' })
    s4.addText(formatCurrency(total), { x: 0.5, y: 2, w: 7, fontSize: 36, bold: true, color: 'f4d98a', fontFace: 'Courier New' })
    s4.addText('Prazo', { x: 7, y: 2, w: 2.3, fontSize: 10, color: '6e6a62', align: 'right' })
    s4.addText(prazo, { x: 7, y: 2.5, w: 2.3, fontSize: 15, bold: true, color: 'f4f1ea', align: 'right' })
    if (condicoes) s4.addText(condicoes, { x: 0.5, y: 4.5, w: 9, fontSize: 10, color: '6e6a62', italic: true })

    await prs.writeFile({ fileName: `Proposta TW - ${empresa || 'Cliente'}.pptx` })
  }

  const selServices = selected.map(i => ({ ...DEFAULT_SERVICES[i], valor: getPrice(i) }))

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'var(--bg-card-alt)', border: '1px solid var(--border-input)',
    borderRadius: 9, padding: '11px 13px', color: 'var(--text-primary)', fontSize: 13.5, outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <>
      <Header title="Montadora de Propostas" subtitle="Crie e exporte propostas comerciais" />
      <div style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 472px', gap: 24, alignItems: 'start' }} className="animate-fade">

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Step 1 */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 14, padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <StepBadge n={1} />
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15 }}>Dados do cliente</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Empresa', value: empresa, set: setEmpresa, placeholder: 'Nome da empresa' },
                  { label: 'CNPJ', value: cnpj, set: setCnpj, placeholder: '00.000.000/0001-00', mono: true },
                  { label: 'Contato', value: contato, set: setContato, placeholder: 'Nome do responsável' },
                  { label: 'Cargo', value: cargo, set: setCargo, placeholder: 'Cargo / função' },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ display: 'block', fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 6 }}>{f.label}</label>
                    <input value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                      style={{ ...inputStyle, fontFamily: f.mono ? 'var(--font-mono)' : undefined }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2 — Serviços com preço editável */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 14, padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <StepBadge n={2} />
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15 }}>Serviços do escopo</div>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{selected.length} selecionado(s)</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {DEFAULT_SERVICES.map((s, i) => {
                  const active = selected.includes(i)
                  return (
                    <div key={i} style={{
                      borderRadius: 11, overflow: 'hidden',
                      border: `1px solid ${active ? 'rgba(217,168,44,0.35)' : 'var(--border-input)'}`,
                      background: active ? 'rgba(217,168,44,0.07)' : 'var(--bg-card-alt)',
                    }}>
                      <div onClick={() => toggle(i)} style={{
                        display: 'flex', alignItems: 'center', gap: 13,
                        padding: '13px 15px', cursor: 'pointer',
                      }}>
                        <span style={{
                          width: 21, height: 21, flexShrink: 0, borderRadius: 6,
                          border: `1px solid ${active ? 'var(--gold)' : 'var(--border-input)'}`,
                          background: active ? 'var(--gold)' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {active && <span style={{ color: '#1a1408', fontSize: 13, fontWeight: 700 }}>✓</span>}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>{s.nome}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 1 }}>{s.desc}</div>
                        </div>
                        {!active && (
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-dim)' }}>
                            clique para selecionar
                          </div>
                        )}
                      </div>
                      {active && (
                        <div style={{ padding: '0 15px 13px', display: 'flex', alignItems: 'center', gap: 10 }}>
                          <label style={{ fontSize: 11.5, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Valor (R$):</label>
                          <input
                            type="number"
                            value={getPrice(i)}
                            onChange={e => setCustomPrices(p => ({ ...p, [i]: Number(e.target.value) || 0 }))}
                            onClick={e => e.stopPropagation()}
                            style={{
                              ...inputStyle, fontFamily: 'var(--font-mono)', fontSize: 13.5,
                              padding: '8px 12px', width: 160, color: 'var(--gold-light)',
                            }}
                          />
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--gold)', fontWeight: 600 }}>
                            = {formatCurrency(getPrice(i))}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Step 3 — Prazos e condições */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 14, padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <StepBadge n={3} />
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15 }}>Prazos e condições</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 6 }}>Prazo de execução</label>
                  <input value={prazo} onChange={e => setPrazo(e.target.value)} placeholder="Ex: 3 meses" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 6 }}>Validade da proposta</label>
                  <input value={validade} onChange={e => setValidade(e.target.value)} placeholder="Ex: 15 dias" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 6 }}>Desconto (%)</label>
                  <input value={String(desconto)} onChange={e => setDesconto(Number(e.target.value) || 0)} placeholder="0"
                    style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 6 }}>Condições de pagamento</label>
                  <input value={condicoes} onChange={e => setCondicoes(e.target.value)}
                    placeholder="Ex: 50% na assinatura, 50% na entrega" style={inputStyle} />
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div style={{ position: 'sticky', top: 96, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 7 }}>
                👁 Pré-visualização · PPT
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>4 slides</div>
            </div>

            <Slide dark>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 11, letterSpacing: '0.04em' }}>TW CONSULTORIA</div>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: '0.3em', color: 'var(--gold)', fontWeight: 600, marginBottom: 8 }}>PROPOSTA COMERCIAL</div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 21, lineHeight: 1.15 }}>{empresa || 'Nome da Empresa'}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>Aos cuidados de {contato || '—'} · {cargo || '—'}</div>
                </div>
                <div style={{ fontSize: 9.5, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  {new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' })} · Válida por {validade}
                </div>
              </div>
            </Slide>

            <Slide light>
              <div style={{ fontSize: 9, letterSpacing: '0.25em', color: '#b8841a', fontWeight: 700, marginBottom: 8 }}>SOBRE A TW</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, color: '#1a1812', marginBottom: 8 }}>
                Consultoria que transforma gestão em resultado
              </div>
              <p style={{ fontSize: 9.5, lineHeight: 1.55, color: '#4a463e', margin: 0 }}>
                Há mais de 8 anos a TW apoia donos de negócios a estruturar processos, finanças e times comerciais. +120 empresas atendidas.
              </p>
              <div style={{ marginTop: 'auto', display: 'flex', gap: 18, paddingTop: 12, borderTop: '1px solid #d8d3c6' }}>
                {['+120', '8 anos', '94%'].map((v, i) => (
                  <div key={i}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 15, color: '#b8841a' }}>{v}</div>
                    <div style={{ fontSize: 8, color: '#6e6a62' }}>{['empresas','de mercado','satisfação'][i]}</div>
                  </div>
                ))}
              </div>
            </Slide>

            <Slide light>
              <div style={{ fontSize: 9, letterSpacing: '0.25em', color: '#b8841a', fontWeight: 700, marginBottom: 10 }}>ESCOPO DO TRABALHO</div>
              {selServices.length === 0
                ? <div style={{ fontSize: 10, color: '#8a857c' }}>Selecione os serviços ao lado</div>
                : selServices.map(s => (
                  <div key={s.nome} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 7 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#b8841a', flexShrink: 0 }} />
                      <span style={{ fontSize: 10, color: '#1a1812', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.nome}</span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: '#6e6a62', flexShrink: 0 }}>{formatCurrency(s.valor)}</span>
                  </div>
                ))}
            </Slide>

            <Slide dark>
              <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'var(--gold)', fontWeight: 700, marginBottom: 12 }}>INVESTIMENTO</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Valor total do projeto</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 28, color: 'var(--gold-light)', marginTop: 4 }}>
                    {formatCurrency(total)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>Prazo</div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>{prazo}</div>
                </div>
              </div>
              {condicoes && (
                <div style={{ marginTop: 12, fontSize: 9.5, color: 'var(--text-dim)', fontStyle: 'italic' }}>{condicoes}</div>
              )}
            </Slide>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 8 }}>
                <span>Subtotal</span><span style={{ fontFamily: 'var(--font-mono)', color: '#d4cfc5' }}>{formatCurrency(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 10, paddingBottom: 12, borderBottom: '1px solid var(--border-card)' }}>
                <span>Desconto ({desconto}%)</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--red)' }}>–{formatCurrency(descVal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>Total</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 19, color: 'var(--gold-light)' }}>{formatCurrency(total)}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 10 }}>
              <button onClick={handleSave} disabled={saving} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                background: 'var(--bg-card)', border: '1px solid var(--border-input)',
                color: 'var(--text-primary)', borderRadius: 11, padding: 14, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
              }}>
                <FloppyDiskIcon size={16} />
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
              <button onClick={handleExportPPT} disabled={selected.length === 0} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: selected.length === 0 ? 'rgba(217,168,44,0.3)' : 'var(--gold-grad)',
                color: '#1a1408', border: 'none', borderRadius: 11, padding: 14,
                fontWeight: 700, fontSize: 13.5, fontFamily: 'var(--font-heading)',
                cursor: selected.length === 0 ? 'not-allowed' : 'pointer',
                boxShadow: '0 5px 16px rgba(217,168,44,0.2)',
              }}>
                <FilePptIcon size={17} />
                Exportar PPT
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function StepBadge({ n }: { n: number }) {
  return (
    <span style={{
      width: 26, height: 26, borderRadius: 8, background: 'rgba(217,168,44,0.12)',
      color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13,
    }}>{n}</span>
  )
}

function Slide({ children, dark, light }: { children: React.ReactNode; dark?: boolean; light?: boolean }) {
  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', border: '1px solid #2a2825' }}>
      <div style={{
        aspectRatio: '16/9', background: dark ? 'radial-gradient(120% 100% at 80% 10%, #1a160c, #0b0b0c)' : '#f4f1ea',
        padding: 26, display: 'flex', flexDirection: 'column', color: dark ? 'var(--text-primary)' : '#1a1812',
      }}>
        {children}
      </div>
    </div>
  )
}

export default function NovaPropostaPage() {
  return (
    <Suspense fallback={<div style={{ padding: 28, color: 'var(--text-muted)' }}>Carregando...</div>}>
      <NovaPropostaInner />
    </Suspense>
  )
}
