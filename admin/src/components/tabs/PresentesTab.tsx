import { useState } from "react";
import { PresenteModal } from "../modal/PresenteModal";
import { liberarReservaPresente, type AdminPresentePayload } from "../../services/adminService";

interface PresentesTabProps {

}

export function PresentesTab({}: PresentesTabProps) {
  const [isPresenteModalOpen, setIsPresenteModalOpen] = useState(false);
  const [editingPresenteId, setEditingPresenteId] = useState<number | null>(null);
  const [presenteForm, setPresenteForm] = useState({} as AdminPresentePayload);

  const openAddPresenteModal = () => {
    setEditingPresenteId(null);
    setPresenteForm({ title: '', description: '', value: 0, image: '' });
    setIsPresenteModalOpen(true);
  };

  const editPresente = (id: number) => {
    const p = presentes.find((x) => x.id === id);
    if (!p) return;
    setEditingPresenteId(id);
    setPresenteForm({ title: p.title, description: p.description || '', value: p.value, image: p.image || '' });
    setIsPresenteModalOpen(true);
  };

  const deletePresente = async (id: number, nome: string) => {
    if (!window.confirm(`Remover "${nome}" da lista?`)) return;
    try {
      await deletePresenteApi(id);
      loadPresentes();
    } catch {
      alert("Erro ao remover presente.");
    }
  };

  const liberarReserva = async (id: number) => {
    if (!window.confirm("Liberar a reserva desse presente? Ele voltará a ficar disponível.")) return;
    try {
      await liberarReservaPresente(id);
      loadPresentes();
    } catch {
      alert("Erro ao liberar reserva.");
    }
  };

  return (
    <div className="tab-content animate-fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--lavanda-dark)', marginBottom: '0.25rem' }}>Presentes</h1>
          <p style={{ color: 'var(--texto-suave)' }}>Gerencie a lista de casamento</p>
        </div>
        <button className="btn-primary" onClick={openAddPresenteModal}>+ Adicionar Presente</button>
      </div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div style={{ background: 'linear-gradient(135deg,var(--lavanda),var(--azul))', color: 'white', borderRadius: '14px', padding: '1rem 1.5rem', flex: 1, minWidth: '120px' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{presentesMetrics.total}</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>Total</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg,var(--menta-dark),#52c77a)', color: 'white', borderRadius: '14px', padding: '1rem 1.5rem', flex: 1, minWidth: '120px' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{presentesMetrics.reservados}</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>Reservados ✅</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg,#e0c07b,#c9a840)', color: 'white', borderRadius: '14px', padding: '1rem 1.5rem', flex: 1, minWidth: '120px' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{presentesMetrics.disponiveis}</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>Disponíveis</div>
        </div>
      </div>
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(171,147,224,0.1)', borderBottom: '2px solid rgba(171,147,224,0.2)' }}>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--lavanda-dark)' }}>Presente</th>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--lavanda-dark)' }}>Preço</th>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--lavanda-dark)' }}>Status</th>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--lavanda-dark)' }}>Quem Reservou</th>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--lavanda-dark)' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {presentesLoading && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--texto-suave)' }}>Carregando... 💜</td></tr>}
              {!presentesLoading && presentes.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--texto-suave)' }}>Nenhum presente cadastrado ainda.</td></tr>}
              {presentes.map(p => (
                <tr key={p.id} style={{ transition: 'background 0.15s', borderBottom: '1px solid rgba(171,147,224,0.1)' }}>
                  <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.9rem', color: 'var(--texto)', verticalAlign: 'middle' }}>
                    <strong>{p.nome}</strong><br/><span style={{ fontSize: '0.8rem', color: 'var(--texto-suave)' }}>{p.descricao}</span>
                  </td>
                  <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.9rem', color: 'var(--lavanda-dark)', verticalAlign: 'middle', fontWeight: 700 }}>
                    {Number(p.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </td>
                  <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.9rem', verticalAlign: 'middle' }}>
                    {p.reservado ? <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(173, 235, 179, 0.35)', color: 'var(--menta-dark)' }}>✅ Reservado</span> : <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(224, 192, 123, 0.3)', color: '#9a7820' }}>⬜ Disponível</span>}
                  </td>
                  <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.85rem', color: 'var(--texto-suave)', verticalAlign: 'middle' }}>{p.reservado_por || '—'}</td>
                  <td style={{ padding: '0.875rem 1.25rem', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <button onClick={() => editPresente(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '4px 6px' }} title="Editar">✏️</button>
                    {p.reservado && <button onClick={() => liberarReserva(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '4px 6px' }} title="Liberar reserva">🔓</button>}
                    <button onClick={() => deletePresente(p.id, p.nome)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '4px 6px' }} title="Remover">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isPresenteModalOpen && (
        <PresenteModal 
          editingPresenteId={editingPresenteId}
          presenteForm={presenteForm}
          setPresenteForm={setPresenteForm}
          loadPresentes={loadPresentes}
          setIsPresenteModalOpen={setIsPresenteModalOpen}
        />
      )}
    </div>
  )
}