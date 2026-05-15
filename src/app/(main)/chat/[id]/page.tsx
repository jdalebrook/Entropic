import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ChatView from './ChatView'

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

  const partnerId = connection.user_a === user.id ? connection.user_b : connection.user_a

  const { data: partner } = await supabase
    .from('profiles')
    .select('id, name, huella, intention, avatar_seed')
    .eq('id', partnerId)
    .single()

  if (!partner) notFound()

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('connection_id', id)
    .order('created_at', { ascending: true })

  return (
    <ChatView
      connectionId={id}
      userId={user.id}
      partner={partner}
      initialMessages={messages ?? []}
      isClosed={connection.status === 'closed'}
    />
  )
}
