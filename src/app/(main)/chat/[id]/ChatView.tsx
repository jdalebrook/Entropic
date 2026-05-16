'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Avatar from '@/components/Avatar'
import IntentionBadge from '@/components/IntentionBadge'
import type { Intention, ClosureReason, MessageType } from '@/lib/types'
import { CLOSURE_LABELS, GUIDED_QUESTIONS, INTENTION_LABELS } from '@/lib/types'

interface Message {
  id: string
  connection_id: string
  sender_id: string
  content: string
  type: MessageType
  created_at: string
}

interface Partner {
  id: string
  name: string
  huella: string
  intention: Intention
  avatar_seed: string
}

interface Props {
  connectionId: string
  userId: string
  partner: Partner
  initialMessages: Message[]
  isClosed: boolean
}

export default function ChatView({ connectionId, userId, partner, initialMessages, isClosed }: Props) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [showClosure, setShowClosure] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`chat:${connectionId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `connection_id=eq.${connectionId}` },
        payload => {
          const msg = payload.new as Message
          setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg])
        }
      )
      .subscribe()

    const poll = setInterval(async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('connection_id', connectionId)
        .order('created_at', { ascending: true })
      if (data) setMessages(data as Message[])
    }, 4000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(poll)
    }
  }, [connectionId])

  async function sendMessage(content: string, type: MessageType = 'text') {
    if (!content.trim()) return
    setSending(true)
    const tempId = crypto.randomUUID()
    const temp: Message = { id: tempId, connection_id: connectionId, sender_id: userId, content, type, created_at: new Date().toISOString() }
    setMessages(prev => [...prev, temp])
    setText('')
    const supabase = createClient()
    const { data } = await supabase.from('messages').insert({ connection_id: connectionId, sender_id: userId, content, type }).select().single()
    if (data) setMessages(prev => prev.map(m => m.id === tempId ? data as Message : m))
    setSending(false)
  }

  async function sendGuidedQuestion(q: string) {
    await sendMessage(q, 'guided_question')
  }

  async function closeConnection(reason: ClosureReason) {
    const supabase = createClient()
    const { data: conn } = await supabase
      .from('connections')
      .select('user_a, closed_reason_a, closed_reason_b')
      .eq('id', connectionId)
      .single()

    if (!conn) return

    const isUserA = conn.user_a === userId
    const update = isUserA ? { closed_reason_a: reason } : { closed_reason_b: reason }
    const bothClosed = isUserA ? !!conn.closed_reason_b : !!conn.closed_reason_a

    await supabase.from('connections').update({
      ...update,
      ...(bothClosed ? { status: 'closed', closed_at: new Date().toISOString() } : {}),
    }).eq('id', connectionId)

    await sendMessage(`Ha cerrado esta conexión: "${CLOSURE_LABELS[reason]}"`, 'system')
    router.replace('/home')
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-e-border bg-e-bg">
        <button onClick={() => router.push('/home')} className="text-e-faint hover:text-e-muted transition-colors">
          ←
        </button>
        <Avatar seed={partner.avatar_seed} size={36} />
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-e-text font-medium text-sm">{partner.name}</span>
          <IntentionBadge intention={partner.intention} small />
        </div>
        {!isClosed && (
          <button
            onClick={() => setShowClosure(true)}
            className="text-e-faint hover:text-e-muted text-xs transition-colors"
          >
            Cerrar
          </button>
        )}
      </div>

      {/* Huella */}
      <div className="px-4 py-2 bg-e-surface/60 border-b border-e-border">
        <p className="text-e-faint text-xs italic">"{partner.huella}"</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <p className="text-e-muted text-sm">Acabáis de conectar.</p>
            <p className="text-e-faint text-xs">¿Por dónde empezáis?</p>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              {GUIDED_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => sendGuidedQuestion(q)}
                  className="text-left text-e-muted text-sm bg-e-surface border border-e-border rounded-xl px-4 py-3 hover:border-e-primary/40 hover:text-e-primary transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg => {
          const isOwn = msg.sender_id === userId
          const isSystem = msg.type === 'system'
          const isGuided = msg.type === 'guided_question'

          if (isSystem) {
            return (
              <div key={msg.id} className="text-center text-e-faint text-xs py-1">
                {msg.content}
              </div>
            )
          }

          return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isGuided
                    ? 'bg-e-primary-dim border border-e-primary/30 text-e-primary italic'
                    : isOwn
                    ? 'bg-e-primary text-e-on-primary'
                    : 'bg-e-surface text-e-text-2'
                }`}
              >
                {msg.content}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Closure modal */}
      {showClosure && (
        <div className="absolute inset-0 flex items-end z-10" style={{ backgroundColor: 'var(--e-overlay)' }}>
          <div className="w-full bg-e-surface border-t border-e-border rounded-t-2xl px-6 py-6 flex flex-col gap-4">
            <p className="text-e-text-2 text-center font-light">¿Cómo quieres cerrar esto?</p>
            {(Object.entries(CLOSURE_LABELS) as [ClosureReason, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => closeConnection(key)}
                className="w-full text-left text-e-text-2 bg-e-input hover:bg-e-input/80 border border-e-border rounded-xl px-4 py-3 transition-colors"
              >
                {label}
              </button>
            ))}
            <button
              onClick={() => setShowClosure(false)}
              className="text-e-faint text-sm text-center hover:text-e-muted transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      {!isClosed && (
        <div className="px-4 py-3 border-t border-e-border bg-e-bg flex gap-2">
          <button
            onClick={() => {
              const q = GUIDED_QUESTIONS[Math.floor(Math.random() * GUIDED_QUESTIONS.length)]
              sendGuidedQuestion(q)
            }}
            className="text-e-faint hover:text-e-primary transition-colors text-lg"
            title="Pregunta guiada"
          >
            ✦
          </button>
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(text) } }}
            placeholder="Escribe algo…"
            className="flex-1 bg-e-input border border-e-border rounded-xl px-4 py-2.5 text-e-text placeholder-e-faint focus:outline-none focus:border-e-focus text-sm transition-colors"
          />
          <button
            onClick={() => sendMessage(text)}
            disabled={sending || !text.trim()}
            className="text-e-primary hover:opacity-70 disabled:text-e-faint transition-opacity font-medium text-sm"
          >
            Enviar
          </button>
        </div>
      )}

      {isClosed && (
        <div className="px-4 py-3 border-t border-e-border text-center text-e-faint text-sm">
          Esta conexión está cerrada
        </div>
      )}
    </div>
  )
}