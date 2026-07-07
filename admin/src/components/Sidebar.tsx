import { useNavigate } from "react-router-dom";
import { adminLogout } from "../services/adminService";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({
  activeTab,
  setActiveTab
}: SidebarProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await adminLogout();
    } catch {
      console.error("Erro ao fazer logout. Talvez o backend não esteja rodando.");
    }
    navigate('/login');
  };

  return (
    <aside style={{ width: '260px', background: 'linear-gradient(180deg, var(--lavanda-dark) 0%, #6b50bb 100%)', color: 'white', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <p className="font-cursive" style={{ fontSize: '2rem', color: 'rgba(255,255,255,0.95)' }}>R & A</p>
        <p style={{ fontSize: '0.75rem', opacity: 0.65, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Painel dos Noivos</p>
      </div>
      <nav style={{ flex: 1 }}>
        {[
          { id: 'overview', icon: '📊', label: 'Visão Geral' },
          { id: 'guests', icon: '👥', label: 'Convidados' },
          { id: 'messages', icon: '💌', label: 'Mensagens' },
          { id: 'export', icon: '📥', label: 'Exportar' },
          { id: 'presentes', icon: '🎁', label: 'Presentes' }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`sidebar-link ${activeTab === tab.id ? 'active-link' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '10px', color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.75)', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem', transition: 'all 0.2s ease', cursor: 'pointer', border: 'none', background: activeTab === tab.id ? 'rgba(255,255,255,0.15)' : 'none', width: '100%', textAlign: 'left' }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </nav>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '1.25rem', marginTop: 'auto' }}>
        <a href="/" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', textDecoration: 'none' }}>← Ver Site</a>
        <br />
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.85rem', marginTop: '0.5rem', fontFamily: 'Quicksand', padding: 0 }}>
          🚪 Sair
        </button>
      </div>
    </aside>
  )
}
