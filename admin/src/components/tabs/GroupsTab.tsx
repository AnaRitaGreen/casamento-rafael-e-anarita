import { useState, useEffect } from 'react'
import {
  getAdminGroups,
  createGroup,
  updateGroup,
  deleteGroup as deleteGroupApi,
  type AdminGroup,
} from '../../services/adminService'
import { useNavigate } from 'react-router-dom'

// ── Inline Modal ─────────────────────────────────────────────────────────── //

interface GroupModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  editing: AdminGroup | null
}

function GroupModal({ isOpen, onClose, onSave, editing }: GroupModalProps) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setName(editing?.name ?? '')
      setSlug(editing?.slug ?? '')
      setError('')
    }
  }, [isOpen, editing])

  // Auto-gera slug enquanto o usuário digita o nome (só quando não editando)
  const handleNameChange = (val: string) => {
    setName(val)
    if (!editing) {
      setSlug(
        val
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .toLowerCase().trim()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
      )
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError('')
    try {
      if (editing) {
        await updateGroup(editing.id, { name: name.trim(), slug: slug.trim() || undefined })
      } else {
        await createGroup({ name: name.trim(), slug: slug.trim() || undefined })
      }
      onSave()
    } catch (err: any) {
      const msg = err?.response?.data?.message
      setError(msg ?? 'Erro ao salvar grupo.')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '2rem', margin: '1rem', animation: 'fadeInUp 0.3s ease' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--lavanda-dark)', marginBottom: '1.5rem' }}>
          {editing ? 'Editar Grupo' : 'Novo Grupo'}
        </h2>

        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '1.1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--texto-suave)', marginBottom: '0.35rem' }}>
              Nome do Grupo *
            </label>
            <input
              type="text"
              className="form-input"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ex: Família Silva"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--texto-suave)', marginBottom: '0.35rem' }}>
              Slug (URL personalizada)
            </label>
            <input
              type="text"
              className="form-input"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="familia-silva"
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--texto-suave)', marginTop: '0.3rem' }}>
              Link do convite: <strong>/nome-do-slug</strong>
            </p>
          </div>

          {error && (
            <div style={{ background: 'rgba(224,147,147,0.2)', border: '1px solid rgba(224,147,147,0.5)', borderRadius: '10px', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#c0504d' }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={saving}>
              {saving ? 'Salvando...' : '💾 Salvar'}
            </button>
            <button type="button" className="btn-outline" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── GroupsTab ────────────────────────────────────────────────────────────── //

export function GroupsTab() {
  const [groups, setGroups] = useState<AdminGroup[]>([])
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<AdminGroup | null>(null)
  const navigate = useNavigate()

  useEffect(() => { loadGroups() }, [])

  const loadGroups = async () => {
    try {
      const data = await getAdminGroups()
      setGroups(data)
    } catch (err: any) {
      if (err?.response?.status === 401) navigate('/admin/login')
    }
  }

  const handleDelete = async (group: AdminGroup) => {
    if (!window.confirm(`Remover o grupo "${group.name}"?\n\nSó é possível remover grupos sem convidados.`)) return
    try {
      await deleteGroupApi(group.id)
      loadGroups()
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Erro ao remover grupo.'
      alert(msg)
    }
  }

  const openEdit = (group: AdminGroup) => {
    setEditing(group)
    setIsModalOpen(true)
  }

  const openNew = () => {
    setEditing(null)
    setIsModalOpen(true)
  }

  const filtered = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.slug.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="tab-content animate-fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--lavanda-dark)', marginBottom: '0.25rem' }}>Grupos</h1>
          <p style={{ color: 'var(--texto-suave)' }}>Gerencie os grupos familiares de convidados</p>
        </div>
        <button className="btn-primary" onClick={openNew}>+ Novo Grupo</button>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Buscar por nome ou slug..."
          className="form-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: '360px', width: '100%' }}
        />
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(171,147,224,0.1)', borderBottom: '2px solid rgba(171,147,224,0.2)' }}>
                <th className="guests-th">Nome</th>
                <th className="guests-th">Slug (URL)</th>
                <th className="guests-th">Link do Convite</th>
                <th className="guests-th">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--texto-suave)' }}>
                    Nenhum grupo encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((g) => (
                  <tr key={g.id} style={{ borderBottom: '1px solid rgba(171,147,224,0.1)', transition: 'background 0.15s' }}>
                    <td className="guests-td">
                      <strong>{g.name}</strong>
                    </td>
                    <td className="guests-td">
                      <code style={{ background: 'rgba(171,147,224,0.08)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.82rem' }}>
                        {g.slug}
                      </code>
                    </td>
                    <td className="guests-td">
                      <a
                        href={`https://convite-casamento.digital/${g.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--lavanda-dark)', fontSize: '0.82rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        🔗 /{g.slug}
                      </a>
                    </td>
                    <td className="guests-td">
                      <button
                        onClick={() => openEdit(g)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '4px 8px' }}
                        title="Editar"
                      >✏️</button>
                      <button
                        onClick={() => handleDelete(g)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '4px 8px' }}
                        title="Remover"
                      >🗑️</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid rgba(171,147,224,0.15)', fontSize: '0.85rem', color: 'var(--texto-suave)' }}>
          {filtered.length} grupo{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      <GroupModal
        isOpen={isModalOpen}
        editing={editing}
        onClose={() => setIsModalOpen(false)}
        onSave={() => {
          setIsModalOpen(false)
          loadGroups()
        }}
      />
    </div>
  )
}
