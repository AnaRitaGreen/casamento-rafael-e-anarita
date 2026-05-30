-- Tabela de Grupos (para juntar famílias/casais no mesmo convite)
CREATE TABLE grupos (
    id SERIAL PRIMARY KEY,
    nome_grupo VARCHAR(100) NOT NULL -- Ex: "Família Silva", "Pedro & Par"
);

-- Tabela de Convidados
CREATE TABLE convidados (
    id SERIAL PRIMARY KEY,
    grupo_id INT REFERENCES grupos(id) ON DELETE CASCADE,
    nome_completo VARCHAR(150) NOT NULL,
    confirmado BOOLEAN DEFAULT NULL, -- NULL = Pendente, TRUE = Vai, FALSE = Não vai
    data_confirmacao TIMESTAMP,
    restricao_alimentar VARCHAR(255),
    eh_crianca BOOLEAN DEFAULT FALSE
);

-- Tabela de Mensagens dos Convidados (enviadas pelo formulário RSVP)
CREATE TABLE mensagens (
    id SERIAL PRIMARY KEY,
    grupo_id INT REFERENCES grupos(id) ON DELETE CASCADE,
    nome VARCHAR(150) NOT NULL,
    mensagem TEXT NOT NULL,
    data TIMESTAMP DEFAULT NOW()
);

-- Tabela de Usuários Admin (Para você acessar o Dashboard)
CREATE TABLE administradores (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);