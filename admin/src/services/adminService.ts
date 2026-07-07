import { api } from '../lib/axios'

// ── Tipos ─────────────────────────────────────────────────────── //

export interface AdminGuest {
  id: string
  group_id: string | null
  group_name: string | null
  group_slug: string | null
  name: string
  is_child: boolean
  confirmed: boolean | null
  confirmed_at: string | null
  restriction: string | null
}

export interface AdminGuestPayload {
  name: string
  group_id?: string
  group_name?: string
  is_child: boolean
  restriction?: string
}

export interface AdminGroup {
  id: string
  name: string
  slug: string
}

export interface AdminMessage {
  id: string
  group_id: string
  group_name: string
  message: string
  created_at: string
}

export interface AdminPresente {
  id: string
  title: string
  description: string | null
  link: string | null
  image: string | null
  value: number
  reserved: boolean
  reserved_by: string | null
  reserved_at: string | null
}

export interface AdminPresentePayload {
  title: string
  description?: string
  value: number
  image?: string
}

// ── Auth ───────────────────────────────────────────────────────── //

export async function adminLogin(username: string, password: string): Promise<void> {
  await api.post('/api/admin/login', { username, password }, { withCredentials: true })
}

export async function adminLogout(): Promise<void> {
  await api.post('/api/admin/logout', {}, { withCredentials: true })
}

// ── Convidados ─────────────────────────────────────────────────── //

export async function getAdminGuests(): Promise<AdminGuest[]> {
  const { data } = await api.get<{ guests: AdminGuest[] }>(
    '/api/admin/guests',
    { params: { per_page: 1000, page: 1 }, withCredentials: true }
  )
  return data.guests ?? []
}

export async function createGuest(payload: AdminGuestPayload): Promise<void> {
  await api.post('/api/admin/guests', payload, { withCredentials: true })
}

export async function updateGuest(id: string, payload: AdminGuestPayload): Promise<void> {
  await api.put(`/api/admin/guests/${id}`, payload, { withCredentials: true })
}

export async function deleteGuest(id: string): Promise<void> {
  await api.delete(`/api/admin/guests/${id}`, { withCredentials: true })
}

// ── Grupos ────────────────────────────────────────────────────── //

export async function getAdminGroups(): Promise<AdminGroup[]> {
  const { data } = await api.get<{ groups: AdminGroup[] }>(
    '/api/admin/groups',
    { withCredentials: true }
  )
  return data.groups ?? []
}

// ── Mensagens ─────────────────────────────────────────────────── //

export async function getAdminMessages(): Promise<AdminMessage[]> {
  const { data } = await api.get<{ messages: AdminMessage[] }>(
    '/api/admin/messages',
    { withCredentials: true }
  )
  return data.messages ?? []
}

// ── Exportação ────────────────────────────────────────────────── //

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

export async function getAdminPresentes(): Promise<AdminPresente[]> {
  const { data } = await api.get<{ presentes: AdminPresente[] }>(
    '/api/admin/presentes',
    { withCredentials: true }
  )
  return data.presentes ?? []
}

export async function createPresente(payload: AdminPresentePayload): Promise<void> {
  await api.post('/api/admin/presentes', payload, { withCredentials: true })
}

export async function updatePresente(id: string, payload: AdminPresentePayload): Promise<void> {
  await api.put(`/api/admin/presentes/${id}`, payload, { withCredentials: true })
}

export async function deletePresente(id: string): Promise<void> {
  await api.delete(`/api/admin/presentes/${id}`, { withCredentials: true })
}

export async function liberarReservaPresente(id: string): Promise<void> {
  await api.post(`/api/admin/presentes/${id}/liberar`, {}, { withCredentials: true })
}
