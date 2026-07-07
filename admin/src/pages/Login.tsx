import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../services/adminService';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      await adminLogin(username, password);
      navigate('/dashboard');
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setErrorMsg('❌ Usuário ou senha incorretos.');
      } else {
        setErrorMsg('⚠️ Servidor indisponível. Verifique a conexão.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, var(--lavanda-light) 0%, var(--creme) 50%, var(--azul-light) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
      }}
    >
      <div
        className="glass-card animate-fade-up"
        style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1
            style={{ fontSize: '2.2rem', color: 'var(--lavanda-dark)', margin: '0.75rem 0 0.25rem' }}
          >
            Painel dos Noivos
          </h1>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label
              htmlFor="username"
              style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--texto-suave)', marginBottom: '0.4rem' }}
            >
              Usuário
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-input"
              placeholder="seu usuário"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <label
              htmlFor="password"
              style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--texto-suave)', marginBottom: '0.4rem' }}
            >
              Senha
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className="form-input"
                placeholder="••••••••"
                autoComplete="current-password"
                required
                style={{ paddingRight: '3rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--texto-suave)', fontSize: '1.1rem' }}
                aria-label="Mostrar/ocultar senha"
              >
                👁
              </button>
            </div>
          </div>

          {errorMsg && (
            <div
              style={{ display: 'block', padding: '0.75rem 1rem', background: 'rgba(224,147,147,0.15)', borderRadius: '10px', border: '1px solid rgba(224,147,147,0.4)', color: '#c0504d', fontSize: '0.9rem', marginBottom: '1rem' }}
            >
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', fontSize: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar no Painel'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <a
            href="/"
            style={{ color: 'var(--lavanda-dark)', fontSize: '0.85rem', textDecoration: 'none', opacity: 0.7 }}
          >
            ← Voltar ao site
          </a>
        </p>
      </div>
    </div>
  );
}
