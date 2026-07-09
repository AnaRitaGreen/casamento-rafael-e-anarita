import React, { useState, useEffect } from "react";
import { createGuest, updateGuest, getAdminGroups, type AdminGroup } from "../../services/adminService";

interface GuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingGuestId: string | null;
  initialData?: {
    name: string;
    group_id: string;
    group_name: string;
    is_child: boolean;
  };
}

export function GuestModal({
  isOpen,
  onClose,
  onSave,
  editingGuestId,
  initialData
}: GuestModalProps) {
  const [guestForm, setGuestForm] = useState({ name: '', group_id: '', group_name: '', is_child: false });
  const [groups, setGroups] = useState<AdminGroup[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setGuestForm(initialData);
      } else {
        setGuestForm({ name: '', group_id: '', group_name: '', is_child: false });
      }
      loadGroups();
    }
  }, [isOpen, initialData]);

  const loadGroups = async () => {
    try {
      const data = await getAdminGroups();
      setGroups(data);
    } catch {}
  };

  const saveGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: guestForm.name,
      group_id: guestForm.group_id || undefined,
      group_name: guestForm.group_name || undefined,
      is_child: guestForm.is_child,
    };

    try {
      if (editingGuestId) await updateGuest(editingGuestId, payload);
      else await createGuest(payload);
      onSave();
    } catch {
      alert("Erro ao salvar convidado.");
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '2rem', margin: '1rem', animation: 'fadeInUp 0.3s ease' }}>
        <h2 style={{ fontSize: '2rem', color: 'var(--lavanda-dark)', marginBottom: '1.5rem' }}>{editingGuestId ? 'Editar Convidado' : 'Adicionar Convidado'}</h2>
        <form onSubmit={saveGuest}>
          <div style={{ marginBottom: '1.1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--texto-suave)', marginBottom: '0.35rem' }}>Nome Completo *</label>
            <input type="text" className="form-input" required value={guestForm.name} onChange={e => setGuestForm({ ...guestForm, name: e.target.value })} />
          </div>
          <div style={{ marginBottom: '1.1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--texto-suave)', marginBottom: '0.35rem' }}>Grupo Familiar</label>
            <select className="form-input" value={guestForm.group_id} onChange={e => setGuestForm({ ...guestForm, group_id: e.target.value })}>
              <option value="">— Sem grupo / criar novo —</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '1.1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--texto-suave)', marginBottom: '0.35rem' }}>Nome do Novo Grupo (se criar)</label>
            <input type="text" className="form-input" value={guestForm.group_name} onChange={e => setGuestForm({ ...guestForm, group_name: e.target.value })} />
          </div>
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input type="checkbox" id="g-crianca" style={{ width: '18px', height: '18px', accentColor: 'var(--lavanda-dark)' }} checked={guestForm.is_child} onChange={e => setGuestForm({ ...guestForm, is_child: e.target.checked })} />
            <label htmlFor="g-crianca" style={{ fontSize: '0.9rem', color: 'var(--texto)', cursor: 'pointer' }}>É criança?</label>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>💾 Salvar</button>
            <button type="button" className="btn-outline" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  )
}