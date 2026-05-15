// Deterministic avatar using seed — no images needed, no storage
export default function Avatar({ seed, size = 40 }: { seed: string; size?: number }) {
  const colors = [
    ['#78350f', '#fbbf24'],
    ['#1e3a5f', '#60a5fa'],
    ['#3b1d5c', '#c084fc'],
    ['#1a3a2a', '#4ade80'],
    ['#4a1a1a', '#f87171'],
  ]
  const idx = seed.charCodeAt(0) % colors.length
  const [bg, fg] = colors[idx]
  const letter = seed[0]?.toUpperCase() ?? '?'

  return (
    <div
      style={{ width: size, height: size, backgroundColor: bg, flexShrink: 0 }}
      className="rounded-full flex items-center justify-center"
    >
      <span style={{ color: fg, fontSize: size * 0.4, fontWeight: 500 }}>
        {letter}
      </span>
    </div>
  )
}
