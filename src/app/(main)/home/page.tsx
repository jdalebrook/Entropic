import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import IntentionBadge from '@/components/IntentionBadge'
import Avatar from '@/components/Avatar'
import SearchingState from './SearchingState'
import type { Intention } from '@/lib/types'
import { INTENTION_LABELS } from '@/lib/types'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/onboarding')

  const { data: connections } = await supabase
    .from('connections')
    .select(`id, status, is_primary_for_a, is_primary_for_b, user_a, user_b, matched_at`)
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .eq('status', 'active')
    .order('matched_at', { ascending: false })

  const enriched = await Promise.all(
    (connections ?? []).map(async conn => {
      const partnerId = conn.user_a === user.id ? conn.user_b : conn.user_a
      const isPrimary = conn.user_a === user.id ? conn.is_primary_for_a : conn.is_primary_for_b
      const { data: partner } = await supabase
        .from('profiles')
        .select('id, name, huella, intention, avatar_seed')
        .eq('id', partnerId)
        .single()
      return { ...conn, partner, isPrimary }
    })
  )

  const primary = enriched.find(c => c.isPrimary)
  const secondary = enriched.find(c => !c.isPrimary)

  return (
    <div className="flex flex-col flex-1 px-6 py-8 gap-8">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-e-faint text-xs">Hola,</p>
          <h1 className="text-e-text text-lg font-light">{profile.name}</h1>
        </div>
        <Link href="/profile">
          <Avatar seed={profile.avatar_seed} size={36} />
        </Link>
      </header>

      <section className="flex flex-col gap-2">
        <p className="text-e-faint text-xs uppercase tracking-widest">Hoy te trae</p>
        <Link href="/profile" className="self-start">
          <IntentionBadge intention={profile.intention as Intention} />
        </Link>
      </section>

      {enriched.length === 0 ? (
        <SearchingState
          userId={user.id}
          currentIntention={profile.intention as Intention}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-e-faint text-xs uppercase tracking-widest">
            {enriched.length === 1 ? 'Tu conexión' : 'Tus conexiones'}
          </p>

          {primary && primary.partner && (
            <Link href={`/chat/${primary.id}`}>
              <ConnectionCard
                name={primary.partner.name}
                huella={primary.partner.huella}
                intention={primary.partner.intention as Intention}
                avatarSeed={primary.partner.avatar_seed}
                label="Principal"
              />
            </Link>
          )}

          {secondary && secondary.partner && (
            <Link href={`/chat/${secondary.id}`}>
              <ConnectionCard
                name={secondary.partner.name}
                huella={secondary.partner.huella}
                intention={secondary.partner.intention as Intention}
                avatarSeed={secondary.partner.avatar_seed}
                label="Secundaria"
              />
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

function ConnectionCard({
  name, huella, intention, avatarSeed, label,
}: {
  name: string
  huella: string
  intention: Intention
  avatarSeed: string
  label: string
}) {
  return (
    <div className="bg-e-surface border border-e-border rounded-2xl p-4 flex gap-4 items-start hover:border-e-focus/40 transition-colors">
      <Avatar seed={avatarSeed} size={48} />
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-e-text font-medium">{name}</span>
          <span className="text-xs text-e-faint bg-e-input rounded-full px-2 py-0.5">{label}</span>
        </div>
        <p className="text-e-muted text-sm leading-snug line-clamp-2">"{huella}"</p>
        <IntentionBadge intention={intention} small />
      </div>
    </div>
  )
}