'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    })
    setLoading(false)

    if (err) {
      setError('No pudimos enviar el código. Comprueba el correo e inténtalo de nuevo.')
      return
    }

    router.push(`/verify?email=${encodeURIComponent(email.trim())}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-e-muted text-sm">
          Tu correo electrónico
        </label>
        <input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="bg-e-input border border-e-border rounded-lg px-4 py-3 text-e-text placeholder-e-faint focus:outline-none focus:border-e-focus transition-colors"
        />
        <p className="text-e-faint text-xs mt-1">
          Recibirás un código de acceso. Sin contraseñas.
        </p>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading || !email.includes('@')}
        className="w-full bg-e-primary hover:opacity-90 disabled:bg-e-disabled disabled:text-e-disabled-text text-e-on-primary rounded-lg py-3 font-medium transition-all"
      >
        {loading ? 'Enviando…' : 'Continuar'}
      </button>
    </form>
  )
}
