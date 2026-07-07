import { use, useEffect, useState } from "react";
import { GuestModal } from "../modal/GuestModal";

interface GuestTabProps {
}

export function GuestsTab({}: GuestTabProps) {
  const [editingGuestId, setEditingGuestId] = useState<number | null>(null);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);

  const openAddGuestModal = () => {
    setEditingGuestId(null);
    setGuestForm({ nome: '', grupo_id: '', novo_grupo: '', restricao: '', eh_crianca: false });
    setIsGuestModalOpen(true);
  };

  const editGuest = (id: number) => {
      const g = allGuests.find((x) => x.id === id);
      if (!g) return;
      setEditingGuestId(id);
      setGuestForm({
        nome: g.nome_completo,
        grupo_id: g.grupo_id ? String(g.grupo_id) : '',
        novo_grupo: '',
        restricao: g.restricao_alimentar || '',
        eh_crianca: g.eh_crianca,
      });
      setIsGuestModalOpen(true);
    };

  const deleteGuest = async (id: number, nome: string) => {
    if (!window.confirm(`Remover "${nome}" da lista?`)) return;
    try {
      await deleteGuestApi(id);
      loadGuests();
      loadOverview();
    } catch {
      alert("Erro ao remover convidado.");
    }
  };

  useEffect(() => {
    if (activeTab === 'guests') loadGuests();
  }, [activeTab]);
  
  return (
    <div className="tab-content animate-fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--lavanda-dark)', marginBottom: '0.25rem' }}>Convidados</h1>
          <p style={{ color: 'var(--texto-suave)' }}>Gerencie sua lista de convidados</p>
        </div>
        <button className="btn-primary" onClick={openAddGuestModal}>+ Adicionar Convidado</button>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input type="text" placeholder="Buscar por nome..." className="form-input" style={{ flex: 1, minWidth: '200px' }} value={guestSearch} onChange={(e) => setGuestSearch(e.target.value)} />
        <select className="form-input" style={{ width: 'auto', minWidth: '160px' }} value={guestFilterStatus} onChange={(e) => setGuestFilterStatus(e.target.value)}>
          <option value="">Todos os status</option>
          <option value="true">Confirmados</option>
          <option value="false">Recusados</option>
          <option value="null">Pendentes</option>
        </select>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(171,147,224,0.1)', borderBottom: '2px solid rgba(171,147,224,0.2)' }}>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--lavanda-dark)' }}>Nome</th>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--lavanda-dark)' }}>Grupo</th>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--lavanda-dark)' }}>Status</th>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--lavanda-dark)' }}>Restrição</th>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--lavanda-dark)' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pageGuests.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--texto-suave)' }}>Nenhum convidado encontrado.</td></tr>
              ) : (
                pageGuests.map((g) => (
                  <tr key={g.id} style={{ transition: 'background 0.15s', borderBottom: '1px solid rgba(171, 147, 224, 0.1)' }}>
                    <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.9rem', color: 'var(--texto)', verticalAlign: 'middle' }}>
                      <strong>{g.nome_completo}</strong>
                      {g.eh_crianca && <span style={{ fontSize: '0.7rem', background: 'var(--lavanda-light)', color: 'var(--lavanda-dark)', padding: '2px 7px', borderRadius: '20px', marginLeft: '4px' }}>criança</span>}
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.9rem', color: 'var(--texto)', verticalAlign: 'middle' }}>{g.nome_grupo || "—"}</td>
                    <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.9rem', color: 'var(--texto)', verticalAlign: 'middle' }}>
                      {g.confirmado === true && <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(173, 235, 179, 0.35)', color: 'var(--menta-dark)' }}>✅ Confirmado</span>}
                      {g.confirmado === false && <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(224, 147, 147, 0.25)', color: '#c0504d' }}>❌ Não vai</span>}
                      {g.confirmado === null && <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(224, 192, 123, 0.3)', color: '#9a7820' }}>⏳ Pendente</span>}
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.9rem', color: 'var(--texto-suave)', verticalAlign: 'middle' }}>{g.restricao_alimentar || "—"}</td>
                    <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.9rem', color: 'var(--texto)', verticalAlign: 'middle', textAlign: 'center' }}>
                      <button onClick={() => editGuest(g.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '4px 8px' }} title="Editar">✏️</button>
                      <button onClick={() => deleteGuest(g.id, g.nome_completo)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '4px 8px' }} title="Remover">🗑️</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderTop: '1px solid rgba(171,147,224,0.15)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--texto-suave)' }}>Exibindo {Math.min(startIdx + 1, filteredGuests.length)}–{Math.min(startIdx + PER_PAGE, filteredGuests.length)} de {filteredGuests.length} convidados</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--lavanda-light)', background: i + 1 === currentPage ? 'var(--lavanda)' : 'white', color: i + 1 === currentPage ? 'white' : 'var(--lavanda-dark)', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'Quicksand', fontWeight: 600 }}>{i + 1}</button>
            ))}
          </div>
        </div>
      </div>

      {isGuestModalOpen && (
        <GuestModal />
      )}
    </div>
  )
}