'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react'

export function PropostasActions({ id }: { id: string }) {
  const router = useRouter()
  const [confirm, setConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm) { setConfirm(true); return }
    setDeleting(true)
    await fetch(`/api/proposals/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  function handleCancel(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setConfirm(false)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={e => e.preventDefault()}>
      {confirm ? (
        <>
          <button onClick={handleDelete} disabled={deleting} title="Confirmar exclusão" style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 10px', borderRadius: 7, cursor: 'pointer',
            background: 'rgba(196,117,106,0.15)', border: '1px solid rgba(196,117,106,0.4)',
            color: '#c4756a', fontSize: 11.5, fontWeight: 600,
          }}>
            <TrashIcon size={14} />
            {deleting ? '...' : 'Confirmar'}
          </button>
          <button onClick={handleCancel} title="Cancelar" style={{
            padding: '5px 8px', borderRadius: 7, cursor: 'pointer',
            background: 'transparent', border: '1px solid var(--border-input)',
            color: 'var(--text-dim)', fontSize: 11.5,
          }}>
            ✕
          </button>
        </>
      ) : (
        <>
          <Link href={`/propostas/${id}`} title="Editar proposta" onClick={e => e.stopPropagation()} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, borderRadius: 8,
            background: 'transparent', border: '1px solid var(--border-input)',
            color: 'var(--text-secondary)',
          }}>
            <PencilSimpleIcon size={15} />
          </Link>
          <button onClick={handleDelete} title="Excluir proposta" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, borderRadius: 8, cursor: 'pointer',
            background: 'transparent', border: '1px solid var(--border-input)',
            color: 'var(--text-secondary)',
          }}>
            <TrashIcon size={15} />
          </button>
        </>
      )}
    </div>
  )
}
