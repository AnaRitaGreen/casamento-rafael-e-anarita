import { exportGuestsCSV } from "../../services/adminService";

export function ExportTab() {
  const exportCSVData = async (type: string) => {
    try {
      const blob = await exportGuestsCSV(type === "confirmed");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `convidados_${type}_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
    } catch {
      alert("Erro ao exportar. Verifique se o backend está rodando.");
    }
  };

  return (
    <div className="tab-content animate-fade-up">
      <h1 style={{ fontSize: '2.5rem', color: 'var(--lavanda-dark)', marginBottom: '0.25rem' }}>Exportar Lista</h1>
      <p style={{ color: 'var(--texto-suave)', marginBottom: '2rem' }}>Baixe a lista de convidados para compartilhar com o cerimonial</p>
      <div style={{ display: 'grid', gap: '1.25rem', maxWidth: '480px' }}>
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.5rem', color: 'var(--lavanda-dark)', marginBottom: '0.5rem' }}>📊 Lista Completa (CSV)</h3>
          <p style={{ color: 'var(--texto-suave)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>Todos os convidados com nome, grupo, status e restrições alimentares.</p>
          <button className="btn-primary" onClick={() => exportCSVData('all')} style={{ width: '100%', justifyContent: 'center' }}>⬇️ Baixar CSV Completo</button>
        </div>
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.5rem', color: 'var(--menta-dark)', marginBottom: '0.5rem' }}>✅ Apenas Confirmados (CSV)</h3>
          <p style={{ color: 'var(--texto-suave)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>Somente os convidados que confirmaram presença.</p>
          <button className="btn-outline" onClick={() => exportCSVData('confirmed')} style={{ width: '100%', justifyContent: 'center', borderColor: 'var(--menta)', color: 'var(--menta-dark)' }}>⬇️ Baixar Confirmados</button>
        </div>
      </div>
    </div>
  )
}