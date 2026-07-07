import { useEffect, useState } from "react";
import { getAdminMessages, type AdminMessage } from "../../services/adminService";
import { useNavigate } from "react-router-dom";

export function MessagesTab() {
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setMessagesLoading(true);
    try {
      const msgs = await getAdminMessages();
      setMessages(msgs);
    } catch (err: any) {
      if (err?.response?.status === 401) navigate('/admin/login');
    } finally {
      setMessagesLoading(false);
    }
  };

  return (
    <div className="tab-content animate-fade-up">
      <h1 style={{ fontSize: '2.5rem', color: 'var(--lavanda-dark)', marginBottom: '0.25rem' }}>Mensagens</h1>
      <p style={{ color: 'var(--texto-suave)', marginBottom: '2rem' }}>Mensagens carinhosas dos seus convidados</p>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {messagesLoading && <p style={{ color: 'var(--texto-suave)', textAlign: 'center', padding: '2rem' }}>Carregando mensagens... 💜</p>}
        {!messagesLoading && messages.length === 0 && <p style={{ color: 'var(--texto-suave)', textAlign: 'center', padding: '2rem' }}>Nenhuma mensagem ainda. 💜</p>}
        {messages.map((m) => (
          <div key={m.id} className="glass-card" style={{ padding: '1.5rem' }}>
            <p style={{ fontWeight: 700, color: 'var(--lavanda-dark)', marginBottom: '0.25rem' }}>{m.group_name}</p>
            <p style={{ color: 'var(--texto-suave)', fontStyle: 'italic', fontSize: '0.9rem', marginBottom: '0.75rem' }}>"{m.message}"</p>
            <p style={{ fontSize: '0.75rem', color: '#b0a8c8' }}>{new Date(m.created_at).toLocaleDateString('pt-BR')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}