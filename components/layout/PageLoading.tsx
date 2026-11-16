export function PageLoading() {
  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: 300,
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: '50%',
        border: '3px solid var(--border-input)',
        borderTopColor: 'var(--gold)',
        animation: 'twSpin 0.7s linear infinite',
      }} />
    </div>
  )
}
