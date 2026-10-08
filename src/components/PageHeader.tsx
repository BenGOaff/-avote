export function PageHeader({ kicker, title, lede }: { kicker?: string; title: string; lede?: string }) {
  return (
    <header style={{ paddingTop: 'var(--s6)' }}>
      {kicker && <p className="kicker">{kicker}</p>}
      <h1>{title}</h1>
      {lede && <p className="lede">{lede}</p>}
    </header>
  )
}
