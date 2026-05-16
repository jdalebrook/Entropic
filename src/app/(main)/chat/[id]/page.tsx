import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import ChatView from './ChatView'
import type { ClosureReason } from '@/lib/types'
import { CLOSURE_LABELS } from '@/lib/types'

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: connection } = await supabase
    .from('connections')
    .select('*')
    .eq('id', id)
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .single()

  if (!connection) notFound()

  const isUserA = connection.user_a === user.id
  const partnerId = isUserA ? connection.user_b : connection.user_a
  const theirReason = (isUserA ? connection.closed_reason_b : connection.closed_reason_a) as ClosureReason | null

  const { data: partner } = await supabase
    .from('profiles')
    .select('id, name, huella, intention, avatar_seed')
    .eq('id', partnerId)
    .single()

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('connection_id', id)
    .order('created_at', { ascending: true })

  // Partner deleted their account — show farewell screen
  if (!partner) {
    return (
      <div className="flex flex-col h-screen">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-e-border bg-e-bg">
          <Link href="/home" className="text-e-faint hover:text-e-muted transition-colors p-2 -ml-2">
            ←
          </Link>
          <span className="text-e-muted text-sm">Conexión cerrada</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-e-surface border border-e-border flex items-center justify-center">
            <span className="text-2xl">○</span>
          </div>
          <p className="text-e-text font-light">Esta persona ya no está en Entropic</p>
          <p className="text-e-muted text-sm max-w-xs">
            Gracias por el tiempo que compartisteis. A veces las conversaciones tienen su propio final.
          </p>
          <Link href="/home" className="mt-4 bg-e-primary text-e-on-primary px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  return (
    <ChatView
      connectionId={id}
      userId={user.id}
      partner={partner}
      initialMessages={messages ?? []}
      isClosed={connection.status === 'closed'}
      theirReason={theirReason}
      theirReasonLabel={theirReason ? CLOSURE_LABELS[theirReason] : null}
    />
  )
}