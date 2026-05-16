'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Gender, Orientation, Intention } from '@/lib/types'
import { INTENTION_LABELS } from '@/lib/types'

const HUELLA_PROMPTS = [
  '¿Qué tipo de silencio te gusta compartir?',
  '¿Qué cosa pequeña te cambia el día?',
  '¿Qué buscas que no tiene nombre?',
]

const CURRENT_YEAR = new Date().getFullYear()

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [city, setCity] = useState('')
  const [gender, setGender] = useState<Gender | ''>('')
  const [orientation, setOrientation] = useState<Orientation | ''>('')
  const [huella, setHuella] = useState('')
  const [intention, setIntention] = useState<Intention>(2)
  const [promptIndex] = useState(() => Math.floor(Math.random() * HUELLA_PROMPTS.length))

  async function handleFinish() {
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/login'); return }

    const { data: authUser } = await supabase.auth.getUser()
    const email = authUser.user?.email ?? ''

    const avatarSeed = Math.random().toString(36).slice(2, 10)
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    const { error: err } = await supabase.from('profiles').insert({
      id: user.id,
      email,
      name: name.trim(),
      birth_year: parseInt(birthYear),
      city: city.trim(),
      gender: gender as Gender,
      orientation: orientation as Orientation,
      huella: huella.trim(),
      intention,
      avatar_seed: avatarSeed,
      timezone,
      search_enabled: true,
      is_active: true,
    })

    setLoading(false)

    if (err) {
      setError('Algo salió mal. Inténtalo de nuevo.')
      return
    }

    router.replace('/home')
  }

  return (
    <div className="flex flex-col flex-1 px-6 py-10 gap-8">
      <div className="flex gap-1">
        {[1, 2, 3].map(s => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? 'bg-amber-600' : 'bg-stone-800'}`}
          />
        ))}
      </div>

      {step === 1 && (
        <form className="flex flex-col gap-6" onSubmit={e => { e.preventDefault(); setStep(2) }}>
          <div>
            <h2 className="text-xl font-light text-stone-100">¿Cómo te llamamos?</h2>
            <p className="text-stone-500 text-sm mt-1">No tiene que ser tu nombre real.</p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-stone-400 text-sm">Nombre</label>
              <input
                type="text"
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Cómo quieres que te llamemos"
                className="bg-stone-800 border border-stone-700 rounded-lg px-4 py-3 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-600 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-stone-400 text-sm">Año de nacimiento</label>
              <input
                type="number"
                inputMode="numeric"
                min={1940}
                max={CURRENT_YEAR - 18}
                value={birthYear}
                onChange={e => setBirthYear(e.target.value)}
                placeholder="1990"
                className="bg-stone-800 border border-stone-700 rounded-lg px-4 py-3 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-600 transition-colors"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={name.trim().length < 2 || !birthYear || parseInt(birthYear) > CURRENT_YEAR - 18}
            className="w-full bg-amber-700 hover:bg-amber-600 disabled:bg-stone-800 disabled:text-stone-600 text-stone-100 rounded-lg py-3 font-medium transition-colors mt-auto"
          >
            Continuar
          </button>
        </form>
      )}

      {step === 2 && (
        <form className="flex flex-col gap-6" onSubmit={e => { e.preventDefault(); setStep(3) }}>
          <div>
            <h2 className="text-xl font-light text-stone-100">Un poco más</h2>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-stone-400 text-sm">Ciudad (aproximada)</label>
              <input
                type="text"
                autoFocus
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="Madrid, Barcelona…"
                className="bg-stone-800 border border-stone-700 rounded-lg px-4 py-3 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-600 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-stone-400 text-sm">Me identifico como</label>
              <div className="grid grid-cols-2 gap-2">
                {(['hombre', 'mujer', 'no-binario', 'prefiero-no-decir'] as Gender[]).map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-2 px-3 rounded-lg border text-sm transition-colors capitalize ${
                      gender === g
                        ? 'border-amber-600 bg-amber-900/30 text-amber-400'
                        : 'border-stone-700 text-stone-400 hover:border-stone-500'
                    }`}
                  >
                    {g === 'prefiero-no-decir' ? 'Prefiero no decir' : g === 'no-binario' ? 'No binario' : g.charAt(0).toUpperCase() + g.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-stone-400 text-sm">Me interesan</label>
              <div className="grid grid-cols-2 gap-2">
                {(['hetero', 'gay', 'lesbiana', 'bisexual', 'pansexual', 'prefiero-no-decir'] as Orientation[]).map(o => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => setOrientation(o)}
                    className={`py-2 px-3 rounded-lg border text-sm transition-colors ${
                      orientation === o
                        ? 'border-amber-600 bg-amber-900/30 text-amber-400'
                        : 'border-stone-700 text-stone-400 hover:border-stone-500'
                    }`}
                  >
                    {o === 'prefiero-no-decir' ? 'Prefiero no decir' : o.charAt(0).toUpperCase() + o.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={!city.trim() || !gender || !orientation}
            className="w-full bg-amber-700 hover:bg-amber-600 disabled:bg-stone-800 disabled:text-stone-600 text-stone-100 rounded-lg py-3 font-medium transition-colors mt-auto"
          >
            Continuar
          </button>
        </form>
      )}

      {step === 3 && (
        <form className="flex flex-col gap-6" onSubmit={e => { e.preventDefault(); handleFinish() }}>
          <div>
            <h2 className="text-xl font-light text-stone-100">Tu huella</h2>
            <p className="text-stone-500 text-sm mt-1">
              Una frase que te define. Será lo primero que alguien lea de ti.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-stone-400 text-sm">
                {HUELLA_PROMPTS[promptIndex]}
              </label>
              <textarea
                autoFocus
                rows={3}
                value={huella}
                onChange={e => setHuella(e.target.value)}
                maxLength={200}
                placeholder="Escribe lo que se te venga a la mente…"
                className="bg-stone-800 border border-stone-700 rounded-lg px-4 py-3 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-600 transition-colors resize-none"
              />
              <p className="text-stone-600 text-xs text-right">{huella.length}/200</p>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-stone-400 text-sm">¿Qué te trae hoy?</label>
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
                onChange={e => setIntention(parseInt(e.target.value) as Intention)}
                className="w-full accent-amber-600"
              />
              <p className="text-center text-amber-500 text-sm font-medium">
                {INTENTION_LABELS[intention]}
              </p>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading || huella.trim().length < 10}
            className="w-full bg-amber-700 hover:bg-amber-600 disabled:bg-stone-800 disabled:text-stone-600 text-stone-100 rounded-lg py-3 font-medium transition-colors mt-auto"
          >
            {loading ? 'Guardando…' : 'Empezar la aventura'}
          </button>
        </form>
      )}
    </div>
  )
}
