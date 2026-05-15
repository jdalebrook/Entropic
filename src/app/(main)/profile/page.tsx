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
      <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex flex-col flex-1 px-6 py-8 gap-8">
      <header className="flex items-center gap-3">
        <button onClick={() => router.push('/home')} className="text-stone-500 hover:text-stone-300 transition-colors">
          ←
        </button>
        <h1 className="text-stone-100 font-light">Tu perfil</h1>
      </header>

      <div className="flex flex-col items-center gap-3">
        <Avatar seed={profile.avatar_seed} size={72} />
        <p className="text-stone-100 text-xl font-light">{profile.name}</p>
        <p className="text-stone-500 text-sm">{profile.city}</p>
      </div>

      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
        <p className="text-stone-500 text-xs mb-2">Tu huella</p>
        <p className="text-stone-300 text-sm leading-relaxed italic">"{profile.huella}"</p>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-stone-500 text-xs uppercase tracking-widest">¿Qué te trae hoy?</p>
        <div className="flex justify-between text-xs text-stone-600 px-1">
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
          className="w-full accent-amber-600"
        />
        <p className="text-center text-amber-500 text-sm font-medium">
          {INTENTION_LABELS[intention]} {saving && <span className="text-stone-600">·</span>}
        </p>
      </div>

      <button
        onClick={signOut}
        className="mt-auto text-stone-600 text-sm text-center hover:text-stone-400 transition-colors"
      >
        Cerrar sesión
      </button>
    </div>
  )
}
