# 🚀 Como rodar o projeto localmente

## Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (para o banco de dados)
- [Node.js 20+](https://nodejs.org/)

---

## 1. Banco de dados

Suba apenas o PostgreSQL via Docker:

```bash
docker-compose up -d postgres_casamento
```

> O schema (`initial.sql`) é criado automaticamente na primeira vez.

---

## 2. Backend (API Fastify)

```bash
cd backend
cp .env.example .env   # ajuste as variáveis se necessário
npm install
npm run dev
```

A API estará em **http://localhost:8080/api/**

---

## 3. Criar o primeiro usuário admin

Com o banco rodando, execute o script de seed diretamente no PostgreSQL:

```bash
docker exec -i postgres_casamento psql -U noivos_admin -d casamento_db \
  -c "INSERT INTO administradores (username, password_hash) VALUES ('rafael', '<bcrypt-hash>');"
```

> Gere o hash com `node -e "const b=require('bcryptjs');b.hash('SuaSenha123',12).then(console.log)"` dentro da pasta `backend/`.

---

## 4. Frontend (Astro)

```bash
cd frontend
npm install
npm run dev
```

O site estará em **http://localhost:4321**

> O proxy Vite redireciona automaticamente `/api/*` → `localhost:8080`, sem CORS.

---

## Acessar o painel admin

Abra **http://localhost:4321/admin/login** e use as credenciais criadas no passo 3.

---

## Variáveis de ambiente

| Arquivo | Descrição |
|---------|-----------|
| `backend/.env` | Configuração do backend (DB, JWT, CORS) — copie de `.env.example` |
| `frontend/.env` | Configuração do frontend (`PUBLIC_API_URL` vazio = proxy local) |

---

## Produção

### Banco de dados

O PostgreSQL continua rodando em Docker na VPS:

```bash
docker-compose up -d postgres_casamento
```

### Backend (pm2)

O backend Node.js roda diretamente na VPS gerenciado pelo **pm2**:

```bash
cd backend
npm install --omit=dev

# Iniciar (ou reiniciar) com pm2
pm2 start src/server.js --name casamento-api

# Salvar para sobreviver a reboots
pm2 save
pm2 startup
```

Para atualizar após um deploy:

```bash
git pull
cd backend && npm install --omit=dev
pm2 restart casamento-api
```

### Frontend

Deploy automático na **Vercel**. Configure a variável de ambiente:

```
PUBLIC_API_URL=https://seu-backend.com
```
