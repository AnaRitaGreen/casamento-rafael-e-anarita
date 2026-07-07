export function OverviewTab() {
  return (
    <div className="tab-content animate-fade-up">
      <h1 style={{ fontSize: '2.5rem', color: 'var(--lavanda-dark)', marginBottom: '0.25rem' }}>Visão Geral</h1>
      <p style={{ color: 'var(--texto-suave)', marginBottom: '2rem' }}>Atualizado em tempo real</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div style={{ padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', background: 'linear-gradient(135deg,var(--lavanda),var(--azul))', color: 'white' }}>
          <div style={{ fontFamily: '"Dancing Script", cursive', fontSize: '3rem', fontWeight: 700, lineHeight: 1, marginBottom: '0.25rem' }}>{loading ? '—' : metrics.total}</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.9, fontWeight: 600 }}>Total de Convidados</div>
        </div>
        <div style={{ padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', background: 'linear-gradient(135deg,var(--menta-dark),#52c77a)', color: 'white' }}>
          <div style={{ fontFamily: '"Dancing Script", cursive', fontSize: '3rem', fontWeight: 700, lineHeight: 1, marginBottom: '0.25rem' }}>{loading ? '—' : metrics.confirmed}</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.9, fontWeight: 600 }}>Confirmados ✅</div>
        </div>
        <div style={{ padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', background: 'linear-gradient(135deg,#e07b7b,#d45f5f)', color: 'white' }}>
          <div style={{ fontFamily: '"Dancing Script", cursive', fontSize: '3rem', fontWeight: 700, lineHeight: 1, marginBottom: '0.25rem' }}>{loading ? '—' : metrics.declined}</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.9, fontWeight: 600 }}>Não vão ❌</div>
        </div>
        <div style={{ padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', background: 'linear-gradient(135deg,#e0c07b,#c9a840)', color: 'white' }}>
          <div style={{ fontFamily: '"Dancing Script", cursive', fontSize: '3rem', fontWeight: 700, lineHeight: 1, marginBottom: '0.25rem' }}>{loading ? '—' : metrics.pending}</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.9, fontWeight: 600 }}>Pendentes ⏳</div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--texto)' }}>Progresso de Confirmações</span>
          <span style={{ color: 'var(--lavanda-dark)', fontWeight: 700 }}>{metrics.pct}%</span>
        </div>
        <div style={{ background: '#ede8f5', borderRadius: '50px', height: '12px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${metrics.pct}%`, background: 'linear-gradient(90deg,var(--lavanda),var(--menta))', borderRadius: '50px', transition: 'width 1s ease' }}></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--texto-suave)' }}>
          <span>{metrics.confirmed} confirmados</span>
          <span>de {metrics.total} convidados</span>
        </div>
      </div>

      {loading && <div style={{ textAlign: 'center', color: 'var(--texto-suave)', padding: '2rem' }}>Carregando dados... 💜</div>}
    </div>
  )
}