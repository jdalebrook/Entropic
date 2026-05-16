'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Intention } from '@/lib/types'
import { INTENTION_LABELS } from '@/lib/types'

export default function SearchingState({
  userId,
  currentIntention,
}: {
  userId: string
  currentIntention: Intention
}) {
  const router = useRouter()
  const [status, setStatus] = useState<'searching' | 'not-found'>('searching')
  const [intention, setIntention] = useState(currentIntention)
  const [saving, setSaving] = useState(false)

  useEffect(() => { tryMatch() }, [])

  async function tryMatch() {
    setStatus('searching')
    const supabase = createClient()
    const { data } = await supabase.rpc('try_match', { p_user_id: userId })
    if (data) {
      router.refresh()
    } else {
      setStatus('not-found')
    }
  }

  async function handleIntentionChange(val: Intention) {
    setIntention(val)
    setSaving(true)
    const supabase = createClient()
    await supabase.from('profiles').update({ intention: val }).eq('id', userId)
    setSaving(false)
    tryMatch()
  }

  if (status === 'searching') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
        <div className="w-16 h-16 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center animate-pulse">
          <span className="text-stone-500 text-2xl">○</span>
        </div>
        <p className="text-stone-300 font-light">Buscando tu conexión…</p>
        <p className="text-stone-600 text-sm">Un momento.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
      <div className="w-16 h-16 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center">
        <span className="text-stone-500 text-2xl">○</span>
      </div>

      <div>
        <p className="text-stone-300 font-light">Nadie disponible ahora</p>
        <p className="text-stone-600 text-sm max-w-xs mt-1">
          Cambia lo que buscas para ampliar las posibilidades.
        </p>
      </div>

      <div className="w-full max-w-xs flex flex-col gap-3">
        <p className="text-stone-500 text-xs uppercase tracking-widest">¿Qué te trae hoy?</p>
        <div className="flex justify-between text-xs text-stone-500 px-1">
          <span>Escuchar</span>
          <span>Conectar</span>
        </div>
        <input
          type="range"
          min={0}
          max={3}
          step={1}
          value={intention}
          onChange={e => handleIntentionChange(parseInt(e.target.value) as Intention)}
          disabled={saving}
          className="w-full accent-amber-600"
        />
        <p className="text-center text-amber-500 text-sm font-medium">
          {INTENTION_LABELS[intention]}
        </p>
      </div>

      <button
        onClick={tryMatch}
        className="text-stone-500 text-sm hover:text-stone-300 transition-colors"
      >
        Buscar de nuevo
      </button>
    </div>
  )
}