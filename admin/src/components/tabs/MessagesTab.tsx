export function MessagesTab() {
  return (
    <div className="tab-content animate-fade-up">
      <h1 style={{ fontSize: '2.5rem', color: 'var(--lavanda-dark)', marginBottom: '0.25rem' }}>Mensagens</h1>
      <p style={{ color: 'var(--texto-suave)', marginBottom: '2rem' }}>Mensagens carinhosas dos seus convidados</p>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {messagesLoading && <p style={{ color: 'var(--texto-suave)', textAlign: 'center', padding: '2rem' }}>Carregando mensagens... 💜</p>}
        {!messagesLoading && messages.length === 0 && <p style={{ color: 'var(--texto-suave)', textAlign: 'center', padding: '2rem' }}>Nenhuma mensagem ainda. 💜</p>}
        {messages.map((m, idx) => (
          <div key={idx} className="glass-card" style={{ padding: '1.5rem' }}>
            <p style={{ fontWeight: 700, color: 'var(--lavanda-dark)', marginBottom: '0.25rem' }}>{m.nome}</p>
            <p style={{ color: 'var(--texto-suave)', fontStyle: 'italic', fontSize: '0.9rem', marginBottom: '0.75rem' }}>"{m.mensagem}"</p>
            <p style={{ fontSize: '0.75rem', color: '#b0a8c8' }}>{new Date(m.data).toLocaleDateString('pt-BR')}</p>
          </div>
        ))}
      </div>
    </div>
  )
}