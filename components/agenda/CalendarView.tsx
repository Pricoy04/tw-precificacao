'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react'

const HOUR_H  = 64   // px per hour
const START_H = 6    // 6am
const END_H   = 22   // 10pm
const HOURS   = Array.from({ length: END_H - START_H + 1 }, (_, i) => START_H + i)
const DAYS_BR = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']

const TYPE_CFG: Record<string, { bg: string; border: string; text: string }> = {
  'Reunião':  { bg: 'rgba(217,168,44,0.22)',  border: '#d9a82c', text: '#f4d98a' },
  'Ligação':  { bg: 'rgba(106,158,196,0.22)', border: '#6a9ec4', text: '#a8d0e8' },
  'E-mail':   { bg: 'rgba(168,143,196,0.22)', border: '#a88fc4', text: '#cbb8e0' },
  'Proposta': { bg: 'rgba(127,179,138,0.22)', border: '#7fb38a', text: '#a8d4b0' },
  'Visita':   { bg: 'rgba(196,160,106,0.22)', border: '#c4a06a', text: '#ddc4a0' },
  'Outro':    { bg: 'rgba(138,133,124,0.22)', border: '#6e6a62', text: '#a8a39a' },
}
const TYPES = Object.keys(TYPE_CFG)

function getWeekStart(d: Date) {
  const day = new Date(d)
  day.setHours(0, 0, 0, 0)
  day.setDate(day.getDate() - day.getDay()) // Sunday
  return day
}

function addDays(d: Date, n: number) {
  const r = new Date(d); r.setDate(r.getDate() + n); return r
}

function toISO(d: Date) {
  return d.toISOString().split('T')[0]
}

function parseTime(t: string): { h: number; m: number } {
  const [h, m] = (t ?? '09:00').split(':').map(Number)
  return { h: h || 9, m: m || 0 }
}

function topPx(time: string) {
  const { h, m } = parseTime(time)
  return Math.max(0, (h + m / 60 - START_H) * HOUR_H)
}

type Task = { id: string; title: string; time: string; type: string; date: string; clients?: { empresa: string } | null }
type Client = { id: string; empresa: string }

interface ModalState {
  open: boolean
  task: Partial<Task> | null
  date: string
  time: string
  isNew: boolean
}

export function CalendarView({ clients }: { clients: Client[] }) {
  const now       = new Date()
  const [weekStart, setWeekStart] = useState(() => getWeekStart(now))
  const [tasks, setTasks]         = useState<Task[]>([])
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState<ModalState>({ open: false, task: null, date: '', time: '09:00', isNew: true })
  const [saving, setSaving]       = useState(false)
  const [timeLine, setTimeLine]   = useState(0)
  const gridRef = useRef<HTMLDivElement>(null)

  const weekEnd   = addDays(weekStart, 6)
  const weekDays  = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const monthLabel = weekStart.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  // Current time line
  useEffect(() => {
    function update() {
      const n = new Date()
      setTimeLine((n.getHours() + n.getMinutes() / 60 - START_H) * HOUR_H)
    }
    update()
    const id = setInterval(update, 60000)
    return () => clearInterval(id)
  }, [])

  // Scroll to 8am on mount
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.scrollTop = (8 - START_H) * HOUR_H - 20
    }
  }, [])

  const loadTasks = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/tasks?from=${toISO(weekStart)}&to=${toISO(weekEnd)}`)
    const data = await res.json()
    setTasks(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [weekStart])

  useEffect(() => { loadTasks() }, [loadTasks])

  function prevWeek() { setWeekStart(d => addDays(d, -7)) }
  function nextWeek() { setWeekStart(d => addDays(d, +7)) }
  function goToday()  { setWeekStart(getWeekStart(new Date())) }

  function openCreate(date: string, hour: number) {
    setModal({ open: true, isNew: true, task: { type: 'Reunião', title: '' }, date, time: `${String(hour).padStart(2,'0')}:00` })
  }

  function openEdit(task: Task) {
    setModal({ open: true, isNew: false, task: { ...task }, date: task.date, time: task.time })
  }

  function closeModal() { setModal(m => ({ ...m, open: false })) }

  async function handleSave() {
    if (!modal.task?.title?.trim()) return
    setSaving(true)
    const body = { title: modal.task.title, type: modal.task.type, date: modal.date, time: modal.time, client_id: (modal.task as any).client_id ?? null }
    if (modal.isNew) {
      await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    } else {
      await fetch(`/api/tasks/${modal.task!.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    }
    setSaving(false)
    closeModal()
    loadTasks()
  }

  async function handleDelete() {
    if (!modal.task?.id) return
    setSaving(true)
    await fetch(`/api/tasks/${modal.task.id}`, { method: 'DELETE' })
    setSaving(false)
    closeModal()
    loadTasks()
  }

  function isToday(d: Date) {
    return toISO(d) === toISO(now)
  }

  const todayColIndex = weekDays.findIndex(d => isToday(d))
  const showTimeLine  = todayColIndex >= 0 && timeLine >= 0 && timeLine <= END_H * HOUR_H

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-page)' }}>

      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px',
        borderBottom: '1px solid var(--border)', flexShrink: 0,
        background: 'var(--bg-sidebar)',
      }}>
        <button onClick={goToday} style={{
          padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          background: 'transparent', border: '1px solid var(--border-input)', color: 'var(--text-primary)',
        }}>Hoje</button>

        <div style={{ display: 'flex', gap: 2 }}>
          <button onClick={prevWeek} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border-input)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CaretLeftIcon size={15} />
          </button>
          <button onClick={nextWeek} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border-input)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CaretRightIcon size={15} />
          </button>
        </div>

        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17, textTransform: 'capitalize', color: 'var(--text-primary)' }}>
          {monthLabel}
        </span>

        {loading && <span style={{ fontSize: 11, color: 'var(--text-dim)', marginLeft: 4 }}>carregando...</span>}
      </div>

      {/* Calendar grid */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* Day headers */}
        <div style={{ display: 'flex', flexShrink: 0, borderBottom: '1px solid var(--border)', background: 'var(--bg-sidebar)' }}>
          <div style={{ width: 52, flexShrink: 0 }} />
          {weekDays.map((d, i) => {
            const today = isToday(d)
            return (
              <div key={i} style={{ flex: 1, textAlign: 'center', padding: '10px 0' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: today ? 'var(--gold)' : 'var(--text-dim)', letterSpacing: '0.1em' }}>
                  {DAYS_BR[d.getDay()]}
                </div>
                <div style={{
                  fontSize: 20, fontWeight: 700, marginTop: 2,
                  color: today ? '#1a1408' : 'var(--text-primary)',
                  background: today ? 'var(--gold)' : 'transparent',
                  width: 36, height: 36, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '2px auto 0',
                }}>
                  {d.getDate()}
                </div>
              </div>
            )
          })}
        </div>

        {/* Scrollable time grid */}
        <div ref={gridRef} style={{ flex: 1, overflowY: 'auto', display: 'flex' }}>

          {/* Time labels */}
          <div style={{ width: 52, flexShrink: 0, position: 'relative' }}>
            {HOURS.map(h => (
              <div key={h} style={{ height: HOUR_H, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', paddingRight: 10, paddingTop: 2 }}>
                <span style={{ fontSize: 10.5, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginTop: -6 }}>
                  {h === 12 ? '12 PM' : h > 12 ? `${h-12} PM` : `${h} AM`}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
            {weekDays.map((d, colIdx) => {
              const dayStr = toISO(d)
              const dayTasks = tasks.filter(t => t.date === dayStr)
              const today = isToday(d)

              return (
                <div key={colIdx} style={{
                  flex: 1, borderLeft: '1px solid var(--border)',
                  position: 'relative', cursor: 'pointer',
                  background: today ? 'rgba(217,168,44,0.02)' : 'transparent',
                }}>
                  {/* Hour lines */}
                  {HOURS.map(h => (
                    <div key={h} onClick={() => openCreate(dayStr, h)} style={{
                      height: HOUR_H, borderBottom: '1px solid rgba(255,255,255,0.04)',
                      position: 'relative',
                    }}>
                      <div style={{
                        position: 'absolute', top: '50%', left: 0, right: 0,
                        height: 1, background: 'rgba(255,255,255,0.02)',
                      }} />
                    </div>
                  ))}

                  {/* Events */}
                  {dayTasks.map(task => {
                    const cfg = TYPE_CFG[task.type] ?? TYPE_CFG['Outro']
                    const top = topPx(task.time)
                    return (
                      <div key={task.id} onClick={e => { e.stopPropagation(); openEdit(task) }}
                        style={{
                          position: 'absolute', left: 3, right: 3,
                          top, height: 52,
                          background: cfg.bg, border: `1px solid ${cfg.border}`,
                          borderLeft: `3px solid ${cfg.border}`,
                          borderRadius: 7, padding: '5px 8px',
                          cursor: 'pointer', zIndex: 2, overflow: 'hidden',
                        }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: cfg.text, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {task.title}
                        </div>
                        <div style={{ fontSize: 10.5, color: cfg.text, opacity: 0.75, marginTop: 2 }}>
                          {task.time} · {task.type}
                        </div>
                        {task.clients?.empresa && (
                          <div style={{ fontSize: 10, color: cfg.text, opacity: 0.6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {task.clients.empresa}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}

            {/* Current time line */}
            {showTimeLine && (
              <div style={{
                position: 'absolute',
                top: timeLine,
                left: `calc(${todayColIndex} * (100% / 7))`,
                width: `calc(100% / 7)`,
                height: 2,
                background: '#ea4335',
                zIndex: 10,
                pointerEvents: 'none',
              }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ea4335', marginTop: -4, marginLeft: -4 }} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal.open && (
        <div onClick={closeModal} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-card)',
            borderRadius: 16, padding: 28, width: 420, boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
          }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17, marginBottom: 22, color: 'var(--text-primary)' }}>
              {modal.isNew ? 'Novo compromisso' : 'Editar compromisso'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={lblStyle}>Título *</label>
                <input autoFocus style={inputStyle}
                  placeholder="Ex: Reunião de alinhamento"
                  value={modal.task?.title ?? ''}
                  onChange={e => setModal(m => ({ ...m, task: { ...m.task, title: e.target.value } }))}
                  onKeyDown={e => e.key === 'Enter' && handleSave()}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={lblStyle}>Data</label>
                  <input type="date" style={inputStyle} value={modal.date}
                    onChange={e => setModal(m => ({ ...m, date: e.target.value }))} />
                </div>
                <div>
                  <label style={lblStyle}>Horário</label>
                  <input type="time" style={inputStyle} value={modal.time}
                    onChange={e => setModal(m => ({ ...m, time: e.target.value }))} />
                </div>
              </div>

              <div>
                <label style={lblStyle}>Tipo</label>
                <select style={inputStyle}
                  value={modal.task?.type ?? 'Reunião'}
                  onChange={e => setModal(m => ({ ...m, task: { ...m.task, type: e.target.value } }))}>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label style={lblStyle}>Cliente (opcional)</label>
                <select style={inputStyle}
                  value={(modal.task as any)?.client_id ?? ''}
                  onChange={e => setModal(m => ({ ...m, task: { ...m.task, client_id: e.target.value || null } as any }))}>
                  <option value="">Sem cliente</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.empresa}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'space-between' }}>
              {!modal.isNew && (
                <button onClick={handleDelete} disabled={saving} style={{
                  padding: '10px 16px', borderRadius: 9, fontSize: 13, fontWeight: 600,
                  background: 'rgba(196,117,106,0.12)', border: '1px solid rgba(196,117,106,0.3)',
                  color: '#c4756a', cursor: 'pointer',
                }}>Excluir</button>
              )}
              <div style={{ display: 'flex', gap: 10, marginLeft: 'auto' }}>
                <button onClick={closeModal} style={{
                  padding: '10px 18px', borderRadius: 9, fontSize: 13, fontWeight: 600,
                  background: 'transparent', border: '1px solid var(--border-input)',
                  color: 'var(--text-secondary)', cursor: 'pointer',
                }}>Cancelar</button>
                <button onClick={handleSave} disabled={saving || !modal.task?.title?.trim()} style={{
                  padding: '10px 22px', borderRadius: 9, fontSize: 13, fontWeight: 700,
                  background: 'var(--gold-grad)', border: 'none', color: '#1a1408',
                  cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-heading)',
                  opacity: saving ? 0.7 : 1,
                }}>{saving ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-input)',
  borderRadius: 9, padding: '10px 13px', fontSize: 13.5, color: 'var(--text-primary)',
  fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box',
}
const lblStyle: React.CSSProperties = {
  display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6,
}
