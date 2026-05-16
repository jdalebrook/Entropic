'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Avatar from '@/components/Avatar'
import type { Intention } from '@/lib/types'
import { INTENTION_LABELS } from '@/lib/types'

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<{ name: string; huella: string; city: string; avatar_seed: string; intention: Intention } | null>(null)
  const [intention, setIntention] = useState<Intention>(2)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) { setProfile(data); setIntention(data.intention as Intention) }
    }
    load()
  }, [router])

  async function updateIntention(val: Intention) {
    setIntention(val)
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) await supabase.from('profiles').update({ intention: val }).eq('id', user.id)
    setSaving(false)
  }

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (!profile) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-e-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex flex-col flex-1 px-6 py-8 gap-8">
      <header className="flex items-center gap-3">
        <button onClick={() => router.push('/home')} className="text-e-faint hover:text-e-muted transition-colors">
          ←
        </button>
        <h1 className="text-e-text font-light">Tu perfil</h1>
      </header>

      <div className="flex flex-col items-center gap-3">
        <Avatar seed={profile.avatar_seed} size={72} />
        <p className="text-e-text text-xl font-light">{profile.name}</p>
        <p className="text-e-muted text-sm">{profile.city}</p>
      </div>

      <div className="bg-e-surface border border-e-border rounded-2xl p-4">
        <p className="text-e-faint text-xs mb-2">Tu huella</p>
        <p className="text-e-text-2 text-sm leading-relaxed italic">"{profile.huella}"</p>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-e-faint text-xs uppercase tracking-widest">¿Qué te trae hoy?</p>
        <div className="flex justify-between text-xs text-e-faint px-1">
          <span>Escuchar</span>
          <span>Conectar</span>
        </div>
        <input
          type="range"
          min={0}
          max={3}
          step={1}
          value={intention}
          onChange={e => updateIntention(parseInt(e.target.value) as Intention)}
          className="w-full"
        />
        <p className="text-center text-e-primary text-sm font-medium">
          {INTENTION_LABELS[intention]} {saving && <span className="text-e-faint">·</span>}
        </p>
      </div>

      <button
        onClick={signOut}
        className="mt-auto text-e-faint text-sm text-center hover:text-e-muted transition-colors"
      >
        Cerrar sesión
      </button>
    </div>
  )
}
