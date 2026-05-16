'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function VerifyForm() {
  const router = useRouter()
  const params = useSearchParams()
  const email = params.get('email') ?? ''

  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!email) router.replace('/login')
  }, [email, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: err } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    })

    if (err) {
      setLoading(false)
      setError('Código incorrecto o caducado. Inténtalo de nuevo.')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    router.replace(profile ? '/home' : '/onboarding')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="otp" className="text-e-muted text-sm">
          Código de acceso
        </label>
        <p className="text-e-faint text-xs mb-2">
          Enviado a {email}
        </p>
        <input
          id="otp"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="000000"
          maxLength={6}
          value={otp}
          onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
          required
          className="bg-e-input border border-e-border rounded-lg px-4 py-3 text-e-text text-center text-2xl tracking-widest placeholder-e-faint focus:outline-none focus:border-e-focus transition-colors"
        />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading || otp.length !== 6}
        className="w-full bg-e-primary hover:opacity-90 disabled:bg-e-disabled disabled:text-e-disabled-text text-e-on-primary rounded-lg py-3 font-medium transition-all"
      >
        {loading ? 'Verificando…' : 'Entrar'}
      </button>

      <button
        type="button"
        onClick={() => router.replace('/login')}
        className="text-e-faint text-sm text-center hover:text-e-muted transition-colors"
      >
        Cambiar correo
      </button>
    </form>
  )
}
