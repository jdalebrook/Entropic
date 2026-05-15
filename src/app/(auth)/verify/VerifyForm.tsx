'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function VerifyForm() {
  const router = useRouter()
  const params = useSearchParams()
  const phone = params.get('phone') ?? ''

  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!phone) router.replace('/login')
  }, [phone, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: err } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: 'sms',
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
        <label htmlFor="otp" className="text-stone-400 text-sm">
          Código de verificación
        </label>
        <p className="text-stone-500 text-xs mb-2">
          Enviado a {phone}
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
          className="bg-stone-800 border border-stone-700 rounded-lg px-4 py-3 text-stone-100 text-center text-2xl tracking-widest placeholder-stone-600 focus:outline-none focus:border-amber-600 transition-colors"
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || otp.length !== 6}
        className="w-full bg-amber-700 hover:bg-amber-600 disabled:bg-stone-800 disabled:text-stone-600 text-stone-100 rounded-lg py-3 font-medium transition-colors"
      >
        {loading ? 'Verificando…' : 'Entrar'}
      </button>

      <button
        type="button"
        onClick={() => router.replace('/login')}
        className="text-stone-500 text-sm text-center hover:text-stone-300 transition-colors"
      >
        Cambiar número
      </button>
    </form>
  )
}
