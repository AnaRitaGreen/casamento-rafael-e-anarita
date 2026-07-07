import { api } from '../lib/axios'

// ── Tipos ─────────────────────────────────────────────────────── //

export interface Presente {
  id: number
  nome: string
  descricao?: string
  preco: number
  imagem_url?: string
  reservado: boolean
  reservado_por?: string
}

export interface PresentesListResponse {
  presentes: Presente[]
}

export interface ReservaPayload {
  nome: string
}

// ── Endpoints ─────────────────────────────────────────────────── //

/**
 * Retorna a lista completa de presentes.
 * GET /api/presentes
 */
export async function getPresentes(): Promise<Presente[]> {
  const { data } = await api.get<PresentesListResponse>('/api/presentes')
  return data.presentes ?? []
}

/**
 * Reserva um presente em nome de alguém.
 * POST /api/presentes/:id/reservar
 */
export async function reservarPresente(id: number, payload: ReservaPayload): Promise<void> {
  await api.post(`/api/presentes/${id}/reservar`, payload)
}
