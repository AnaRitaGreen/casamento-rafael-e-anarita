import { api } from '../lib/axios'

// ── Tipos ─────────────────────────────────────────────────────── //

export interface GuestMember {
  id: number
  nome_completo: string
  eh_crianca: boolean
}

export interface GuestGroup {
  grupo_id: number
  nome_grupo: string
  members: GuestMember[]
}

export interface RsvpPayload {
  grupo_id: number
  confirmados: number[]
  restricao_alimentar?: string
  mensagem?: string
  recusado?: boolean
}

// ── Endpoints ─────────────────────────────────────────────────── //

/**
 * Busca um grupo de convidados pelo nome.
 * GET /guests/search?name=...
 */
export async function searchGuest(name: string): Promise<GuestGroup> {
  const { data } = await api.get<GuestGroup>('/guests/search', {
    params: { name },
  })
  return data
}

/**
 * Confirma ou recusa a presença de um grupo de convidados.
 * POST /rsvp
 */
export async function submitRsvp(payload: RsvpPayload): Promise<void> {
  await api.post('/rsvp', payload)
}
