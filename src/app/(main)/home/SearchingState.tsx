'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Intention } from '@/lib/types'
import { INTENTION_LABELS } from '@/lib/types'

const SCOPE_LABELS = ['Mi ciudad', 'Toda España', 'Sin límites']

export default function SearchingState({
  userId,
  currentIntention,
  currentScope,
}: {
  userId: string
  currentIntention: Intention
  currentScope: number
}) {
  const [status, setStatus] = useState<'searching' | 'not-found'>('searching')
  const [intention, setIntention] = useState(currentIntention)
  const [scope, setScope] = useState(currentScope)
  const [saving, setSaving] = useState(false)

  useEffect(() => { tryMatch() }, [])

  async function tryMatch() {
    setStatus('searching')
    const supabase = createClient()
    const { data } = await (supabase as any).rpc('try_match', { p_user_id: userId })
    if (data) {
      window.location.reload()
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

  async function handleScopeChange(val: number) {
    setScope(val)
    setSaving(true)
    const supabase = createClient()
    await supabase.from('profiles').update({ search_scope: val }).eq('id', userId)
    setSaving(false)
    tryMatch()
  }

  if (status === 'searching') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
        <div className="w-16 h-16 rounded-full bg-e-surface border border-e-border flex items-center justify-center animate-pulse">
          <span className="text-e-faint text-2xl">○</span>
        </div>
        <p className="text-e-text-2 font-light">Buscando tu conexión…</p>
        <p className="text-e-faint text-sm">Un momento.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
      <div className="w-16 h-16 rounded-full bg-e-surface border border-e-border flex items-center justify-center">
        <span className="text-e-faint text-2xl">○</span>
      </div>

      <div>
        <p className="text-e-text-2 font-light">Nadie disponible ahora</p>
        <p className="text-e-faint text-sm max-w-xs mt-1">
          Ajusta lo que buscas para ampliar las posibilidades.
        </p>
      </div>

      <div className="w-full max-w-xs flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <p className="text-e-faint text-xs uppercase tracking-widest">¿Qué te trae hoy?</p>
          <div className="flex justify-between text-xs text-e-faint px-1">
            <span>Escuchar</span>
            <span>Conectar</span>
          </div>
          <input
            type="range" min={0} max={3} step={1} value={intention}
            onChange={e => handleIntentionChange(parseInt(e.target.value) as Intention)}
            disabled={saving}
            className="w-full"
          />
          <p className="text-center text-e-primary text-sm font-medium">
            {INTENTION_LABELS[intention]}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-e-faint text-xs uppercase tracking-widest">Área de búsqueda</p>
          <div className="grid grid-cols-3 gap-2">
            {SCOPE_LABELS.map((label, i) => (
              <button
                key={i}
                onClick={() => handleScopeChange(i)}
                disabled={saving}
                className={`py-2 px-2 rounded-lg border text-xs transition-colors ${
                  scope === i
                    ? 'border-e-primary bg-e-primary-dim text-e-primary'
                    : 'border-e-border text-e-muted hover:border-e-focus/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={tryMatch}
        disabled={saving}
        className="text-e-faint text-sm hover:text-e-muted transition-colors"
      >
        Buscar de nuevo
      </button>
    </div>
  )
}