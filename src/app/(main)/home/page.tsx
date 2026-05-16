import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import IntentionBadge from '@/components/IntentionBadge'
import Avatar from '@/components/Avatar'
import SearchingState from './SearchingState'
import HomeConnectionCard from '@/components/HomeConnectionCard'
import type { Intention } from '@/lib/types'

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
    .select('id, status, is_primary_for_a, is_primary_for_b, user_a, user_b, matched_at, closed_reason_a, closed_reason_b')
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .eq('status', 'active')
    .order('matched_at', { ascending: false })

  const enriched = await Promise.all(
    (connections ?? []).map(async conn => {
      const isUserA = conn.user_a === user.id
      const partnerId = isUserA ? conn.user_b : conn.user_a
      const isPrimary = isUserA ? conn.is_primary_for_a : conn.is_primary_for_b
      const myReason = isUserA ? conn.closed_reason_a : conn.closed_reason_b
      const { data: partner } = await supabase
        .from('profiles')
        .select('id, name, huella, intention, avatar_seed, avatar_options')
        .eq('id', partnerId)
        .single()
      return { ...conn, partner, isPrimary, isUserA, closedByMe: !!myReason }
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
          <Avatar seed={profile.avatar_seed} size={36} options={profile.avatar_options ?? undefined} />
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
          currentScope={(profile as any).search_scope ?? 1}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-e-faint text-xs uppercase tracking-widest">
            {enriched.length === 1 ? 'Tu conexión' : 'Tus conexiones'}
          </p>

          {primary && primary.partner && (
            <HomeConnectionCard
              connectionId={primary.id}
              name={primary.partner.name}
              huella={primary.partner.huella}
              intention={primary.partner.intention as Intention}
              avatarSeed={primary.partner.avatar_seed}
              avatarOptions={primary.partner.avatar_options ?? undefined}
              label="Principal"
              closedByMe={primary.closedByMe}
              isUserA={primary.isUserA}
            />
          )}

          {secondary && secondary.partner && (
            <HomeConnectionCard
              connectionId={secondary.id}
              name={secondary.partner.name}
              huella={secondary.partner.huella}
              intention={secondary.partner.intention as Intention}
              avatarSeed={secondary.partner.avatar_seed}
              avatarOptions={secondary.partner.avatar_options ?? undefined}
              label="Secundaria"
              closedByMe={secondary.closedByMe}
              isUserA={secondary.isUserA}
            />
          )}
        </div>
      )}
    </div>
  )
}