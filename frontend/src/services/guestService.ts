import { api } from '../lib/axios'

// ── Tipos ─────────────────────────────────────────────────────── //

export interface Guest {
  id: string
  group_id: string
  name: string
  is_child: boolean
  rsvp_status: 'pending' | 'attending' | 'declined'
  rsvp_responded_at: string | null
}

export interface Group {
  id: string
  name: string
  slug: string
}

export interface GroupWithGuests {
  group: Group
  guests: Guest[]
}

export interface RsvpPayload {
  group_id: string
  declined?: boolean
  confirmed: string[]
  message?: string
}

// ── Endpoints ─────────────────────────────────────────────────── //

/**
 * Busca grupo e convidados pelo slug.
 * GET /api/convidados/:slug
 */
export async function getGroupBySlug(slug: string): Promise<GroupWithGuests> {
  const { data } = await api.get<GroupWithGuests>(`/api/convidados/${slug}`)
  return data
}

/**
 * Confirma ou recusa presença do grupo.
 * POST /api/rsvp
 */
export async function submitRsvp(payload: RsvpPayload): Promise<void> {
  await api.post('/api/rsvp', payload)
}
