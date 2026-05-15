'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const raw = phone.replace(/\s/g, '')
    const normalized = raw.startsWith('+') ? raw : `+34${raw}`

    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithOtp({
      phone: normalized,
    })
    setLoading(false)

    if (err) {
      setError('No pudimos enviar el código. Comprueba el número e inténtalo de nuevo.')
      return
    }

    router.push(`/verify?phone=${encodeURIComponent(normalized)}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="phone" className="text-stone-400 text-sm">
          Tu número de teléfono
        </label>
        <div className="flex gap-2">
          <span className="flex items-center px-3 bg-stone-800 border border-stone-700 rounded-lg text-stone-300 text-sm">
            +34
          </span>
          <input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="600 000 000"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
            className="flex-1 bg-stone-800 border border-stone-700 rounded-lg px-4 py-3 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-600 transition-colors"
          />
        </div>
        <p className="text-stone-600 text-xs mt-1">
          Recibirás un código por SMS. Solo usamos el teléfono para verificar que eres real.
        </p>
      </div>

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || phone.length < 9}
        className="w-full bg-amber-700 hover:bg-amber-600 disabled:bg-stone-800 disabled:text-stone-600 text-stone-100 rounded-lg py-3 font-medium transition-colors"
      >
        {loading ? 'Enviando…' : 'Continuar'}
      </button>
    </form>
  )
}
