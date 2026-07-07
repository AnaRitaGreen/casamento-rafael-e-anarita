import { api } from '../lib/axios'

// ── Tipos ─────────────────────────────────────────────────────── //

export interface AdminGuest {
  id: number
  nome_completo: string
  grupo_id: number | null
  nome_grupo: string | null
  confirmado: boolean | null
  restricao_alimentar: string | null
  mensagem: string | null
  eh_crianca: boolean
}

export interface AdminGuestPayload {
  nome_completo: string
  grupo_id: number | null
  nome_grupo_novo: string | null
  restricao_alimentar: string | null
  eh_crianca: boolean
}

export interface AdminGroup {
  id: number
  nome_grupo: string
}

export interface AdminMessage {
  nome: string
  mensagem: string
  data: string
}

export interface AdminPresente {
  id: number
  title: string
  description: string
  value: number
  image: string
  // reservado: boolean
  // reservado_por: string | null
}

export interface AdminPresentePayload {
  title: string
  description: string
  image: string
  value: number
}

// ── Auth ───────────────────────────────────────────────────────── //

/**
 * Realiza o login no painel administrativo.
 * POST /api/admin/login
 */
export async function adminLogin(username: string, password: string): Promise<void> {
  await api.post('/api/admin/login', { username, password }, { withCredentials: true })
}

/**
 * Realiza o logout do painel administrativo.
 * POST /api/admin/logout
 */
export async function adminLogout(): Promise<void> {
  await api.post('/api/admin/logout', {}, { withCredentials: true })
}

// ── Convidados ─────────────────────────────────────────────────── //

/**
 * Retorna todos os convidados.
 * GET /api/admin/guests
 */
export async function getAdminGuests(): Promise<AdminGuest[]> {
  const { data } = await api.get<{ guests: AdminGuest[] }>(
    '/api/admin/guests',
    { params: { per_page: 1000, page: 1 }, withCredentials: true }
  )
  return data.guests ?? []
}

/**
 * Cria um novo convidado.
 * POST /api/admin/guests
 */
export async function createGuest(payload: AdminGuestPayload): Promise<void> {
  await api.post('/api/admin/guests', payload, { withCredentials: true })
}

/**
 * Atualiza um convidado existente.
 * PUT /api/admin/guests/:id
 */
export async function updateGuest(id: number, payload: AdminGuestPayload): Promise<void> {
  await api.put(`/api/admin/guests/${id}`, payload, { withCredentials: true })
}

/**
 * Remove um convidado.
 * DELETE /api/admin/guests/:id
 */
export async function deleteGuest(id: number): Promise<void> {
  await api.delete(`/api/admin/guests/${id}`, { withCredentials: true })
}

// ── Grupos ────────────────────────────────────────────────────── //

/**
 * Retorna todos os grupos de convidados.
 * GET /api/admin/groups
 */
export async function getAdminGroups(): Promise<AdminGroup[]> {
  const { data } = await api.get<{ groups: AdminGroup[] }>(
    '/api/admin/groups',
    { withCredentials: true }
  )
  return data.groups ?? []
}

// ── Mensagens ─────────────────────────────────────────────────── //

/**
 * Retorna todas as mensagens dos convidados.
 * GET /api/admin/messages
 */
export async function getAdminMessages(): Promise<AdminMessage[]> {
  const { data } = await api.get<{ messages: AdminMessage[] }>(
    '/api/admin/messages',
    { withCredentials: true }
  )
  return data.messages ?? []
}

// ── Exportação ────────────────────────────────────────────────── //

/**
 * Retorna o CSV de convidados como Blob para download.
 * GET /api/admin/export/csv
 */
export async function exportGuestsCSV(onlyConfirmed = false): Promise<Blob> {
  const params = onlyConfirmed ? { status: 'confirmed' } : {}
  const { data } = await api.get<Blob>('/api/admin/export/csv', {
    params,
    responseType: 'blob',
    withCredentials: true,
  })
  return data
}

// ── Presentes (Admin) ─────────────────────────────────────────── //

/**
 * Retorna todos os presentes (visão admin).
 * GET /api/admin/presentes
 */
export async function getAdminPresentes(): Promise<AdminPresente[]> {
  const { data } = await api.get<{ presentes: AdminPresente[] }>(
    '/api/admin/presentes',
    { withCredentials: true }
  )
  return data.presentes ?? []
}

/**
 * Cria um novo presente.
 * POST /api/admin/presentes
 */
export async function createPresente(payload: AdminPresentePayload): Promise<void> {
  await api.post('/api/admin/presentes', payload, { withCredentials: true })
}

/**
 * Atualiza um presente existente.
 * PUT /api/admin/presentes/:id
 */
export async function updatePresente(id: number, payload: AdminPresentePayload): Promise<void> {
  await api.put(`/api/admin/presentes/${id}`, payload, { withCredentials: true })
}

/**
 * Remove um presente.
 * DELETE /api/admin/presentes/:id
 */
export async function deletePresente(id: number): Promise<void> {
  await api.delete(`/api/admin/presentes/${id}`, { withCredentials: true })
}

/**
 * Libera a reserva de um presente, tornando-o disponível novamente.
 * POST /api/admin/presentes/:id/liberar
 */
export async function liberarReservaPresente(id: number): Promise<void> {
  await api.post(`/api/admin/presentes/${id}/liberar`, {}, { withCredentials: true })
}
