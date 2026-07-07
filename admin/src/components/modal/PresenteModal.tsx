import React, { useState, useEffect } from "react";
import { createPresente, updatePresente } from "../../services/adminService";

interface PresenteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingPresenteId: string | null;
  initialData?: {
    title: string;
    description: string;
    value: number;
    image: string;
  };
}

export function PresenteModal({
  isOpen,
  onClose,
  onSave,
  editingPresenteId,
  initialData
}: PresenteModalProps) {
  const [presenteForm, setPresenteForm] = useState({ title: '', description: '', value: '', image: '' });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setPresenteForm({
          title: initialData.title,
          description: initialData.description,
          value: String(initialData.value),
          image: initialData.image
        });
      } else {
        setPresenteForm({ title: '', description: '', value: '', image: '' });
      }
    }
  }, [isOpen, initialData]);

  const savePresente = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: presenteForm.title,
      description: presenteForm.description || undefined,
      value: Number(presenteForm.value),
      image: presenteForm.image || undefined,
    };

    try {
      if (editingPresenteId) await updatePresente(editingPresenteId, payload);
      else await createPresente(payload);
      onSave();
    } catch {
      alert("Erro ao salvar presente.");
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1001, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={(e) => { if(e.target === e.currentTarget) onClose() }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '2rem', margin: '1rem', animation: 'fadeInUp 0.3s ease', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--lavanda-dark)', marginBottom: '1.5rem' }}>{editingPresenteId ? 'Editar Presente' : 'Adicionar Presente'}</h2>
        <form onSubmit={savePresente} style={{ display: 'grid', gap: '0.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--texto-suave)', marginBottom: '0.35rem' }}>Nome *</label>
            <input type="text" className="form-input" required value={presenteForm.title} onChange={e => setPresenteForm({...presenteForm, title: e.target.value})} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--texto-suave)', marginBottom: '0.35rem' }}>Descrição</label>
            <input type="text" className="form-input" value={presenteForm.description} onChange={e => setPresenteForm({...presenteForm, description: e.target.value})} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--texto-suave)', marginBottom: '0.35rem' }}>Preço (R$) *</label>
            <input type="number" step="0.01" min="0" className="form-input" required value={presenteForm.value} onChange={e => setPresenteForm({...presenteForm, value: e.target.value})} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--texto-suave)', marginBottom: '0.35rem' }}>URL da Imagem (opcional)</label>
            <input type="url" className="form-input" value={presenteForm.image} onChange={e => setPresenteForm({...presenteForm, image: e.target.value})} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" className="btn-outline" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Cancelar</button>
            <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>💾 Salvar</button>
          </div>
        </form>
      </div>
    </div>
  )
}