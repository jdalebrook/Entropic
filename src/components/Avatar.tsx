export default function Avatar({ seed, size = 40 }: { seed: string; size?: number }) {
  const palettes = [
    ['#1A2535', '#8FAFD9'],
    ['#1A2A20', '#9DC6B0'],
    ['#25203A', '#B8A6D9'],
    ['#2A2018', '#C8B87A'],
    ['#2A1E22', '#D4AFCA'],
  ]
  const [bg, fg] = palettes[seed.charCodeAt(0) % palettes.length]
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