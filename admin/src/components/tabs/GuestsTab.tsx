import { useEffect, useState } from "react";
import { getAdminGuests, deleteGuest as deleteGuestApi, type AdminGuest } from "../../services/adminService";
import { GuestModal } from "../modal/GuestModal";
import { useNavigate } from "react-router-dom";

export function GuestsTab() {
  const [allGuests, setAllGuests] = useState<AdminGuest[]>([]);
  const [filteredGuests, setFilteredGuests] = useState<AdminGuest[]>([]);
  const [guestSearch, setGuestSearch] = useState('');
  const [guestFilterStatus, setGuestFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 15;

  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);
  const [initialGuestData, setInitialGuestData] = useState<any>(undefined);

  const navigate = useNavigate();

  useEffect(() => {
    loadGuests();
  }, []);

  const loadGuests = async () => {
    try {
      const data = await getAdminGuests();
      setAllGuests(data);
      setFilteredGuests(data);
    } catch (err: any) {
      if (err?.response?.status === 401) navigate('/admin/login');
    }
  };

  useEffect(() => {
    const search = guestSearch.toLowerCase();
    const filtered = allGuests.filter((g) => {
      const matchName = g.name.toLowerCase().includes(search);
      const matchStatus = guestFilterStatus === ""
        ? true
        : guestFilterStatus === "null"
          ? g.confirmed === null
          : g.confirmed === (guestFilterStatus === "true");
      return matchName && matchStatus;
    });
    setFilteredGuests(filtered);
    setCurrentPage(1);
  }, [guestSearch, guestFilterStatus, allGuests]);

  const deleteGuest = async (id: string, name: string) => {
    if (!window.confirm(`Remover "${name}" da lista?`)) return;
    try {
      await deleteGuestApi(id);
      loadGuests();
    } catch {
      alert("Erro ao remover convidado.");
    }
  };

  const openAddGuestModal = () => {
    setEditingGuestId(null);
    setInitialGuestData(undefined);
    setIsGuestModalOpen(true);
  };

  const editGuest = (id: string) => {
    const g = allGuests.find((x) => x.id === id);
    if (!g) return;
    setEditingGuestId(id);
    setInitialGuestData({
      name: g.name,
      group_id: g.group_id ? g.group_id : '',
      group_name: '',
      restriction: g.restriction || '',
      is_child: g.is_child,
    });
    setIsGuestModalOpen(true);
  };

  const startIdx = (currentPage - 1) * PER_PAGE;
  const pageGuests = filteredGuests.slice(startIdx, startIdx + PER_PAGE);
  const totalPages = Math.ceil(filteredGuests.length / PER_PAGE);

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
                <th className="guests-th">Nome</th>
                <th className="guests-th">Grupo</th>
                <th className="guests-th">Status</th>
                <th className="guests-th">Restrição</th>
                <th className="guests-th">Ações</th>
              </tr>
            </thead>
            <tbody>
              {pageGuests.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--texto-suave)' }}>Nenhum convidado encontrado.</td></tr>
              ) : (
                pageGuests.map((g) => (
                  <tr key={g.id} style={{ transition: 'background 0.15s', borderBottom: '1px solid rgba(171, 147, 224, 0.1)' }}>
                    <td className="guests-td">
                      <strong>{g.name}</strong>
                      {g.is_child && <span style={{ fontSize: '0.7rem', background: 'var(--lavanda-light)', color: 'var(--lavanda-dark)', padding: '2px 7px', borderRadius: '20px', marginLeft: '4px' }}>criança</span>}
                    </td>
                    <td className="guests-td">{g.group_name || "—"}</td>
                    <td className="guests-td">
                      {g.confirmed === true && <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(173, 235, 179, 0.35)', color: 'var(--menta-dark)' }}>✅ Confirmado</span>}
                      {g.confirmed === false && <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(224, 147, 147, 0.25)', color: '#c0504d' }}>❌ Não vai</span>}
                      {g.confirmed === null && <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(224, 192, 123, 0.3)', color: '#9a7820' }}>⏳ Pendente</span>}
                    </td>
                    <td className="guests-td" >
                      {g.restriction || "—"}
                    </td>
                    <td className="guests-td" >
                      <button onClick={() => editGuest(g.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '4px 8px' }} title="Editar">✏️</button>
                      <button onClick={() => deleteGuest(g.id, g.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '4px 8px' }} title="Remover">🗑️</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 1rem', borderTop: '1px solid rgba(171,147,224,0.15)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--texto-suave)' }}>Exibindo {Math.min(startIdx + 1, filteredGuests.length)}–{Math.min(startIdx + PER_PAGE, filteredGuests.length)} de {filteredGuests.length} convidados</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--lavanda-light)', background: i + 1 === currentPage ? 'var(--lavanda)' : 'white', color: i + 1 === currentPage ? 'white' : 'var(--lavanda-dark)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>{i + 1}</button>
            ))}
          </div>
        </div>
      </div>

      <GuestModal
        isOpen={isGuestModalOpen}
        onClose={() => setIsGuestModalOpen(false)}
        onSave={() => {
          setIsGuestModalOpen(false);
          loadGuests();
        }}
        editingGuestId={editingGuestId}
        initialData={initialGuestData}
      />
    </div>
  );
}