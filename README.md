# 🚀 Como rodar o projeto localmente

## Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (para o banco de dados)
- [Go 1.22+](https://go.dev/dl/)
- [Node.js 18+](https://nodejs.org/)

---

## 1. Banco de dados

Abra o Docker Desktop e então suba o PostgreSQL:

```bash
docker-compose up -d postgres_casamento
```

> O schema (`initial.sql`) é criado automaticamente na primeira vez.

---

## 2. Backend (API Go)

```bash
cd backend
go run ./cmd/main.go
```

A API estará em **http://localhost:8080/api/**

---

## 3. Criar o primeiro usuário admin

Com o banco rodando:

```bash
cd backend
go run ./cmd/create-admin/main.go -username rafael -password SuaSenhaSegura123
```

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
| `backend/.env` | Configuração do backend (DB, JWT, CORS) |
| `frontend/.env` | Configuração do frontend (`PUBLIC_API_URL` vazio = proxy local) |
| `.env` (raiz) | Sobrescreve `JWT_SECRET` e `ALLOWED_ORIGIN` no docker-compose |

### Produção (Vercel + VPS)

No Vercel, configure:
```
PUBLIC_API_URL=https://seu-backend.com
```

No servidor VPS, use docker-compose com:
```bash
JWT_SECRET=chave-forte-aqui docker-compose up -d
```
