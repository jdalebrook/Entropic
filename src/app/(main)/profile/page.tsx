'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Avatar, { AVATAR_EYES, AVATAR_MOUTHS, AVATAR_COLORS, type AvatarOptions } from '@/components/Avatar'
import type { Intention } from '@/lib/types'
import { INTENTION_LABELS } from '@/lib/types'

type Profile = {
  name: string
  huella: string
  city: string
  avatar_seed: string
  avatar_options: AvatarOptions | null
  intention: Intention
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [intention, setIntention] = useState<Intention>(2)
  const [saving, setSaving] = useState(false)
  const [showAvatarEditor, setShowAvatarEditor] = useState(false)
  const [draftOptions, setDraftOptions] = useState<AvatarOptions>({})
  const [draftSeed, setDraftSeed] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data)
        setIntention(data.intention as Intention)
        setDraftOptions(data.avatar_options ?? {})
        setDraftSeed(data.avatar_seed)
      }
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

  async function saveAvatar() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({
        avatar_seed: draftSeed,
        avatar_options: draftOptions,
      }).eq('id', user.id)
      setProfile(prev => prev ? { ...prev, avatar_seed: draftSeed, avatar_options: draftOptions } : prev)
    }
    setSaving(false)
    setShowAvatarEditor(false)
  }

  function randomize() {
    setDraftSeed(Math.random().toString(36).slice(2, 10))
    setDraftOptions({
      eyes: AVATAR_EYES[Math.floor(Math.random() * AVATAR_EYES.length)],
      mouth: AVATAR_MOUTHS[Math.floor(Math.random() * AVATAR_MOUTHS.length)],
      backgroundColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    })
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
        <button
          onClick={() => router.push('/home')}
          className="text-e-faint hover:text-e-muted transition-colors p-3 -ml-3 rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          ←
        </button>
        <h1 className="text-e-text font-light">Tu perfil</h1>
      </header>

      <div className="flex flex-col items-center gap-3">
        <button
          onClick={() => { setDraftOptions(profile.avatar_options ?? {}); setDraftSeed(profile.avatar_seed); setShowAvatarEditor(true) }}
          className="relative group"
          title="Personalizar avatar"
        >
          <Avatar seed={profile.avatar_seed} size={80} options={profile.avatar_options ?? undefined} />
          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-xs">Editar</span>
          </div>
        </button>
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
          type="range" min={0} max={3} step={1} value={intention}
          onChange={e => updateIntention(parseInt(e.target.value) as Intention)}
          className="w-full"
        />
        <p className="text-center text-e-primary text-sm font-medium">
          {INTENTION_LABELS[intention]} {saving && <span className="text-e-faint">·</span>}
        </p>
      </div>

      <button onClick={signOut} className="mt-auto text-e-faint text-sm text-center hover:text-e-muted transition-colors">
        Cerrar sesión
      </button>

      {/* Avatar editor modal */}
      {showAvatarEditor && (
        <div className="fixed inset-0 z-20 flex items-end" style={{ backgroundColor: 'var(--e-overlay)' }}>
          <div className="w-full bg-e-surface border-t border-e-border rounded-t-2xl px-6 py-6 flex flex-col gap-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <p className="text-e-text font-light">Tu avatar</p>
              <button onClick={() => setShowAvatarEditor(false)} className="text-e-faint hover:text-e-muted p-2 -mr-2">✕</button>
            </div>

            <div className="flex justify-center">
              <Avatar seed={draftSeed} size={96} options={draftOptions} />
            </div>

            <button onClick={randomize} className="w-full border border-e-border rounded-xl py-2.5 text-e-muted text-sm hover:border-e-focus/50 transition-colors">
              Aleatorio
            </button>

            <div className="flex flex-col gap-2">
              <p className="text-e-faint text-xs uppercase tracking-widest">Ojos</p>
              <div className="flex flex-wrap gap-2">
                {AVATAR_EYES.map(eye => (
                  <button
                    key={eye}
                    onClick={() => setDraftOptions(o => ({ ...o, eyes: eye }))}
                    className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                      draftOptions.eyes === eye
                        ? 'border-e-primary bg-e-primary-dim text-e-primary'
                        : 'border-e-border text-e-muted hover:border-e-focus/50'
                    }`}
                  >
                    {eye}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-e-faint text-xs uppercase tracking-widest">Boca</p>
              <div className="flex flex-wrap gap-2">
                {AVATAR_MOUTHS.map(mouth => (
                  <button
                    key={mouth}
                    onClick={() => setDraftOptions(o => ({ ...o, mouth }))}
                    className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                      draftOptions.mouth === mouth
                        ? 'border-e-primary bg-e-primary-dim text-e-primary'
                        : 'border-e-border text-e-muted hover:border-e-focus/50'
                    }`}
                  >
                    {mouth}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-e-faint text-xs uppercase tracking-widest">Fondo</p>
              <div className="flex gap-3 flex-wrap">
                {AVATAR_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setDraftOptions(o => ({ ...o, backgroundColor: color }))}
                    style={{ backgroundColor: `#${color}` }}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      draftOptions.backgroundColor === color ? 'border-e-primary scale-110' : 'border-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={saveAvatar}
              disabled={saving}
              className="w-full bg-e-primary text-e-on-primary rounded-xl py-3 font-medium hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {saving ? 'Guardando…' : 'Guardar avatar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}