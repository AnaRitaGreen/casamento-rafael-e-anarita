import { useState } from "react";
import { createGuest, updateGuest } from "../../services/adminService";

interface GuestModalProps {
  editingGuestId: number | null;
}

export function GuestModal({
  editingGuestId
}: GuestModalProps) {
  const [guestForm, setGuestForm] = useState({ nome: '', grupo_id: '', novo_grupo: '', restricao: '', eh_crianca: false });

  const saveGuest = async (e: React.FormEvent) => {
      e.preventDefault();
      const payload = {
        nome_completo: guestForm.nome,
        grupo_id: guestForm.grupo_id ? Number(guestForm.grupo_id) : null,
        nome_grupo_novo: guestForm.novo_grupo || null,
        restricao_alimentar: guestForm.restricao || null,
        eh_crianca: guestForm.eh_crianca,
      };
  
      try {
        if (editingGuestId) await updateGuest(editingGuestId, payload);
        else await createGuest(payload);
        setIsGuestModalOpen(false);
        loadGuests();
        loadOverview();
      } catch {
        alert("Erro ao salvar convidado.");
      }
    };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={(e) => { if(e.target === e.currentTarget) setIsGuestModalOpen(false) }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '2rem', margin: '1rem', animation: 'fadeInUp 0.3s ease' }}>
        <h2 style={{ fontSize: '2rem', color: 'var(--lavanda-dark)', marginBottom: '1.5rem' }}>{editingGuestId ? 'Editar Convidado' : 'Adicionar Convidado'}</h2>
        <form onSubmit={saveGuest}>
          <div style={{ marginBottom: '1.1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--texto-suave)', marginBottom: '0.35rem' }}>Nome Completo *</label>
            <input type="text" className="form-input" required value={guestForm.nome} onChange={e => setGuestForm({...guestForm, nome: e.target.value})} />
          </div>
          <div style={{ marginBottom: '1.1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--texto-suave)', marginBottom: '0.35rem' }}>Grupo Familiar</label>
            <select className="form-input" value={guestForm.grupo_id} onChange={e => setGuestForm({...guestForm, grupo_id: e.target.value})}>
              <option value="">— Sem grupo / criar novo —</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.nome_grupo}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '1.1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--texto-suave)', marginBottom: '0.35rem' }}>Nome do Novo Grupo (se criar)</label>
            <input type="text" className="form-input" value={guestForm.novo_grupo} onChange={e => setGuestForm({...guestForm, novo_grupo: e.target.value})} />
          </div>
          <div style={{ marginBottom: '1.1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--texto-suave)', marginBottom: '0.35rem' }}>Restrição Alimentar</label>
            <input type="text" className="form-input" value={guestForm.restricao} onChange={e => setGuestForm({...guestForm, restricao: e.target.value})} />
          </div>
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input type="checkbox" id="g-crianca" style={{ width: '18px', height: '18px', accentColor: 'var(--lavanda-dark)' }} checked={guestForm.eh_crianca} onChange={e => setGuestForm({...guestForm, eh_crianca: e.target.checked})} />
            <label htmlFor="g-crianca" style={{ fontSize: '0.9rem', color: 'var(--texto)', cursor: 'pointer' }}>É criança?</label>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>💾 Salvar</button>
            <button type="button" className="btn-outline" onClick={() => setIsGuestModalOpen(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  )
}