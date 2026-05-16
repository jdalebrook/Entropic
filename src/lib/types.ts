export type Intention = 0 | 1 | 2 | 3
export const INTENTION_LABELS: Record<Intention, string> = {
  0: 'Escuchar',
  1: 'Curiosear',
  2: 'Coquetear',
  3: 'Conectar',
}

export type ConnectionStatus = 'active' | 'closed'
export type MessageType = 'text' | 'guided_question' | 'system' | 'media_request'
export type Gender = 'hombre' | 'mujer' | 'no-binario' | 'prefiero-no-decir'
export type Orientation = 'hetero' | 'gay' | 'lesbiana' | 'bisexual' | 'pansexual' | 'prefiero-no-decir'

export type ClosureReason =
  | 'energia_distinta'
  | 'no_quimica'
  | 'busco_diferente'
  | 'necesito_descansar'

export const CLOSURE_LABELS: Record<ClosureReason, string> = {
  energia_distinta: 'Energía distinta hoy',
  no_quimica: 'No siento química',
  busco_diferente: 'Busco algo diferente',
  necesito_descansar: 'Necesito descansar',
}

export const GUIDED_QUESTIONS = [
  '¿Qué tontería te hace feliz?',
  '¿Qué aprendiste tarde?',
  '¿Qué defecto tuyo te cae bien?',
]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          birth_year: number
          city: string
          huella: string
          gender: Gender
          orientation: Orientation
          intention: Intention
          avatar_seed: string
          avatar_options: Record<string, string>
          timezone: string
          search_scope: number
          search_enabled: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          birth_year: number
          city: string
          huella: string
          gender: Gender
          orientation: Orientation
          intention: Intention
          avatar_seed: string
          timezone?: string
          search_enabled?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string
          name?: string
          birth_year?: number
          city?: string
          huella?: string
          gender?: Gender
          orientation?: Orientation
          intention?: Intention
          avatar_seed?: string
          timezone?: string
          search_enabled?: boolean
          is_active?: boolean
        }
        Relationships: []
      }
      connections: {
        Row: {
          id: string
          user_a: string
          user_b: string
          status: ConnectionStatus
          is_primary_for_a: boolean
          is_primary_for_b: boolean
          matched_at: string
          closed_at: string | null
          closed_reason_a: ClosureReason | null
          closed_reason_b: ClosureReason | null
        }
        Insert: {
          id?: string
          user_a: string
          user_b: string
          status?: ConnectionStatus
          is_primary_for_a?: boolean
          is_primary_for_b?: boolean
          matched_at?: string
          closed_at?: string | null
          closed_reason_a?: ClosureReason | null
          closed_reason_b?: ClosureReason | null
        }
        Update: {
          status?: ConnectionStatus
          is_primary_for_a?: boolean
          is_primary_for_b?: boolean
          closed_at?: string | null
          closed_reason_a?: ClosureReason | null
          closed_reason_b?: ClosureReason | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          connection_id: string
          sender_id: string
          content: string
          type: MessageType
          created_at: string
        }
        Insert: {
          id?: string
          connection_id: string
          sender_id: string
          content: string
          type?: MessageType
          created_at?: string
        }
        Update: Record<string, never>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}