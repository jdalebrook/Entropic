'use client'

import { useRouter } from 'next/navigation'

export default function BackButton({ href = '/home', label = 'Inicio' }: { href?: string; label?: string }) {
  const router = useRouter()
  return (
    <button
      onClick={() => router.push(href)}
      className="flex items-center gap-2 bg-e-surface border border-e-border rounded-2xl px-4 py-2.5 text-e-muted hover:text-e-text hover:border-e-focus/40 transition-colors text-sm"
    >
      <span className="text-base leading-none">‹</span>
      <span>{label}</span>
    </button>
  )
}
