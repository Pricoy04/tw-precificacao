'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { ArrowLeftIcon, UserPlusIcon } from '@phosphor-icons/react'
import { ETAPAS } from '@/lib/utils'

const SEGMENTOS = ['Contabilidade', 'Advocacia', 'Consultoria', 'Saúde', 'Educação', 'Tecnologia', 'Varejo', 'Indústria', 'Serviços', 'Outros']
const ORIGENS = ['Indicação', 'LinkedIn', 'Instagram', 'Site', 'Evento', 'Cold Outreach', 'Outros']

const field: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg-input)',
  border: '1px solid var(--border-input)',
  borderRadius: 9,
  padding: '11px 14px',
  fontSize: 13.5,
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-body)',
  outline: 'none',
  boxSizing: 'border-box',
}

const label: React.CSSProperties = {
  fontSize: 12.5,
  fontWeight: 600,
  color: 'var(--text-secondary)',
  marginBottom: 6,
  display: 'block',
}

export default function NovoClientePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [responsaveis, setResponsaveis] = useState<{ id: string; name: string }[]>([])

  const [form, setForm] = useState({
    empresa: '',
    segmento: '',
    etapa: 'Prospecção',
    contato: '',
    cargo: '',
    email: '',
    telefone: '',
    cidade: '',
    responsavel: '',
    origem: 'Indicação',
    valor: '',
  })

  useEffect(() => {
    fetch('/api/profiles')
      .then(r => r.json())
      .then((data: { id: string; name: string }[]) => {
        const list = Array.isArray(data) ? data.filter(p => p.name) : []
        setResponsaveis(list)
        if (list.length > 0) set('responsavel', list[0].name)
      })
      .catch(() => {})
  }, [])

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.empresa.trim()) { setError('Nome da empresa é obrigatório.'); return }
    if (!form.segmento) { setError('Segmento é obrigatório.'); return }
    if (!form.responsavel) { setError('Responsável é obrigatório.'); return }

    setLoading(true)
    setError('')

    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        valor: form.valor ? Number(form.valor) : null,
      }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Erro ao salvar cliente.')
      setLoading(false)
      return
    }

    router.push('/crm')
    router.refresh()
  }

  return (
    <>
      <Header title="Novo Cliente" subtitle="Cadastrar oportunidade no CRM" />
      <div style={{ flex: 1, overflowY: 'auto', padding: 28 }} className="animate-fade">

        <div style={{ maxWidth: 760, margin: '0 auto' }}>

          {/* Back */}
          <button onClick={() => router.back()} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'none', border: 'none', color: 'var(--text-secondary)',
            cursor: 'pointer', fontSize: 13, marginBottom: 24, padding: 0,
          }}>
            <ArrowLeftIcon size={15} /> Voltar ao CRM
          </button>

          <form onSubmit={handleSubmit}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 14, padding: 28, display: 'flex', flexDirection: 'column', gap: 0 }}>

              {/* Section: Empresa */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--text-dim)', marginBottom: 16 }}>
                  DADOS DA EMPRESA
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={label}>Nome da empresa *</label>
                    <input style={field} placeholder="Ex: Advocacia Silva & Associados" value={form.empresa} onChange={e => set('empresa', e.target.value)} />
                  </div>
                  <div>
                    <label style={label}>Segmento *</label>
                    <select style={field} value={form.segmento} onChange={e => set('segmento', e.target.value)}>
                      <option value="">Selecione</option>
                      {SEGMENTOS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={label}>Cidade</label>
                    <input style={field} placeholder="Ex: São Paulo" value={form.cidade} onChange={e => set('cidade', e.target.value)} />
                  </div>
                </div>
              </div>

              <div style={{ height: 1, background: 'var(--border-card)', marginBottom: 24 }} />

              {/* Section: Contato */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--text-dim)', marginBottom: 16 }}>
                  CONTATO PRINCIPAL
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={label}>Nome do contato</label>
                    <input style={field} placeholder="Ex: João Silva" value={form.contato} onChange={e => set('contato', e.target.value)} />
                  </div>
                  <div>
                    <label style={label}>Cargo</label>
                    <input style={field} placeholder="Ex: Sócio-diretor" value={form.cargo} onChange={e => set('cargo', e.target.value)} />
                  </div>
                  <div>
                    <label style={label}>E-mail</label>
                    <input style={field} type="email" placeholder="Ex: joao@empresa.com.br" value={form.email} onChange={e => set('email', e.target.value)} />
                  </div>
                  <div>
                    <label style={label}>Telefone</label>
                    <input style={field} placeholder="Ex: (11) 99999-9999" value={form.telefone} onChange={e => set('telefone', e.target.value)} />
                  </div>
                </div>
              </div>

              <div style={{ height: 1, background: 'var(--border-card)', marginBottom: 24 }} />

              {/* Section: Oportunidade */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--text-dim)', marginBottom: 16 }}>
                  OPORTUNIDADE
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={label}>Etapa</label>
                    <select style={field} value={form.etapa} onChange={e => set('etapa', e.target.value)}>
                      {ETAPAS.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={label}>Responsável *</label>
                    <select style={field} value={form.responsavel} onChange={e => set('responsavel', e.target.value)}>
                      {responsaveis.length === 0
                        ? <option value="">Nenhum sócio cadastrado</option>
                        : responsaveis.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={label}>Origem</label>
                    <select style={field} value={form.origem} onChange={e => set('origem', e.target.value)}>
                      {ORIGENS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={label}>Valor estimado (R$) — sem pontos</label>
                    <input
                      style={{ ...field, fontFamily: 'var(--font-mono)' }}
                      type="number" min="0" step="0.01"
                      placeholder="Ex: 5000"
                      value={form.valor}
                      onChange={e => set('valor', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div style={{ background: 'rgba(196,117,106,0.12)', border: '1px solid rgba(196,117,106,0.3)', borderRadius: 9, padding: '10px 14px', fontSize: 13, color: '#c4756a', marginBottom: 20 }}>
                  {error}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => router.back()} style={{
                  padding: '11px 22px', borderRadius: 9, fontSize: 13.5, fontWeight: 600,
                  background: 'transparent', border: '1px solid var(--border-input)',
                  color: 'var(--text-secondary)', cursor: 'pointer',
                }}>
                  Cancelar
                </button>
                <button type="submit" disabled={loading} style={{
                  padding: '11px 28px', borderRadius: 9, fontSize: 13.5, fontWeight: 700,
                  background: 'var(--gold-grad)', border: 'none',
                  color: '#1a1408', cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-heading)', opacity: loading ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <UserPlusIcon size={16} weight="bold" />
                  {loading ? 'Salvando...' : 'Cadastrar cliente'}
                </button>
              </div>

            </div>
          </form>

        </div>
      </div>
    </>
  )
}
