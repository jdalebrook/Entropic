'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Avatar, { type AvatarOptions } from '@/components/Avatar'
import IntentionBadge from '@/components/IntentionBadge'
import type { Intention } from '@/lib/types'

interface Props {
  connectionId: string
  name: string
  huella: string
  intention: Intention
  avatarSeed: string
  avatarOptions?: AvatarOptions
  label: string
  closedByMe: boolean
  isUserA: boolean
  hasUnread: boolean
}

export default function HomeConnectionCard({
  connectionId, name, huella, intention, avatarSeed, avatarOptions, label, closedByMe, isUserA, hasUnread,
}: Props) {
  const router = useRouter()
  const [undoing, setUndoing] = useState(false)

  async function undoClose(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setUndoing(true)
    const supabase = createClient()
    if (isUserA) {
      await supabase.from('connections').update({ closed_reason_a: null }).eq('id', connectionId)
    } else {
      await supabase.from('connections').update({ closed_reason_b: null }).eq('id', connectionId)
    }
    window.location.reload()
  }

  return (
    <div
      onClick={() => router.push(`/chat/${connectionId}`)}
      className="bg-e-surface border border-e-border rounded-2xl p-4 flex flex-col gap-3 hover:border-e-focus/40 transition-colors cursor-pointer"
    >
      <div className="flex gap-4 items-start">
        <div className="relative">
          <Avatar seed={avatarSeed} size={48} options={avatarOptions} />
          {hasUnread && (
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-e-primary rounded-full border-2 border-e-bg" />
          )}
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-e-text font-medium">{name}</span>
            <span className="text-xs text-e-faint bg-e-input rounded-full px-2 py-0.5">{label}</span>
          </div>
          <p className="text-e-muted text-sm leading-snug line-clamp-2">"{huella}"</p>
          <IntentionBadge intention={intention} small />
        </div>
      </div>

      {closedByMe && (
        <div className="flex items-center justify-between pt-2 border-t border-e-border">
          <span className="text-e-faint text-xs">Cerraste esta conexión</span>
          <button
            onClick={undoClose}
            disabled={undoing}
            className="text-e-primary text-xs hover:opacity-70 transition-opacity disabled:opacity-40"
          >
            {undoing ? '…' : 'Deshacer'}
          </button>
        </div>
      )}
    </div>
  )
}